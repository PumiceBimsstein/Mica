module FileFlow exposing
    ( confirmNewDataset
    , exportBackup
    , exportCurrentDataset
    , handleBackupText
    , handleFileText
    , openBackupFile
    , openFile
    , readBackupFile
    , readFile
    , resolveChoice
    , updatePendingName
    , finaliseNewDatasetImport
    , applyImportAndSave
    )

{-| ファイル操作ウィンドウのMsgに対応する、副作用を伴うオーケストレーション。
実際のパース・マージ処理はImport（JSON）・CsvCodec（CSV）へ委譲する。
-}

import CsvCodec
import DatasetAccess
import Dict
import DomainJson
import File exposing (File)
import File.Download
import File.Select
import History
import Import
import Ports
import Json.Decode as Decode
import Json.Encode as Encode
import Storage
import Task
import Types
    exposing
        ( AppendChoice
        , Dataset
        , FieldConfig
        , FileFormat(..)
        , FileFlowMsg(..)
        , Item
        , Model
        , Msg(..)
        , PendingImport
        , ReadMode(..)
        , Value
        )



-- ファイルを選ぶ・読む


openFile : FileFormat -> Cmd Msg
openFile format =
    File.Select.file (acceptFor format) (FileSelected >> FileFlowMsg)


acceptFor : FileFormat -> List String
acceptFor format =
    case format of
        JsonFormat ->
            [ "application/json", ".json" ]

        CsvFormat ->
            [ "text/csv", ".csv" ]


readFile : File -> Cmd Msg
readFile file =
    Task.perform (FileTextLoaded >> FileFlowMsg) (File.toString file)



-- 読み込んだテキストの処理


handleFileText : String -> Model -> ( Model, Cmd Msg )
handleFileText text model =
    case parseRawItems model text of
        Ok rawItems ->
            startImport rawItems model

        Err message ->
            ( { model | importError = Just message, pendingImport = Nothing }, Cmd.none )


parseRawItems : Model -> String -> Result String (List (List ( String, Value )))
parseRawItems model text =
    case model.importFormat of
        JsonFormat ->
            Import.decodeRawItems text
                |> Result.mapError (\_ -> "JSONの形式が正しくありません。")

        CsvFormat ->
            CsvCodec.decodeRawItems (existingDatasetFor model) text


{-| 新規モードでは既存データを参照しない（列の型は列内の値から推測する）。
追加・置き換えでは、対象データセットの既存フィールドの型をCSVの列の型推測に使う。
-}
existingDatasetFor : Model -> Maybe Dataset
existingDatasetFor model =
    if model.readMode == NewDataset then
        Nothing

    else
        DatasetAccess.currentDataset model


startImport : List (List ( String, Value )) -> Model -> ( Model, Cmd Msg )
startImport rawItems model =
    case model.readMode of
        NewDataset ->
            ( { model | pendingImport = Just (newPendingImport rawItems), importError = Nothing }, Cmd.none )

        _ ->
            startExistingDatasetImport rawItems model


newPendingImport : List (List ( String, Value )) -> PendingImport
newPendingImport rawItems =
    { mode = NewDataset, rawItems = rawItems, newKeys = [], nameInput = "" }


startExistingDatasetImport : List (List ( String, Value )) -> Model -> ( Model, Cmd Msg )
startExistingDatasetImport rawItems model =
    case DatasetAccess.currentDataset model of
        Nothing ->
            ( { model | importError = Just "読み込み先のデータがありません。「新規」を選んでください。" }, Cmd.none )

        Just target ->
            resolveOrPrompt rawItems target model


resolveOrPrompt : List (List ( String, Value )) -> Dataset -> Model -> ( Model, Cmd Msg )
resolveOrPrompt rawItems target model =
    let
        newKeys =
            Import.findNewKeys target.fields rawItems

        pending =
            { mode = model.readMode, rawItems = rawItems, newKeys = newKeys, nameInput = "" }
    in
    if List.isEmpty newKeys then
        -- 新プロパティがない場合も UUID の生成を JS ポートへ要求する
        let
            count =
                List.length rawItems
        in
        ( { model | pendingImport = Just pending, importError = Nothing }
        , Ports.generateUuids count
        )

    else
        -- 新プロパティがある場合はモーダルでユーザーの選択（resolveChoice）を待つ
        ( { model | pendingImport = Just pending, importError = Nothing }, Cmd.none )



-- 追加・置き換えインポート解決時：UUID 生成要求を JS ポートへ送る
resolveChoice : AppendChoice -> Model -> ( Model, Cmd Msg )
resolveChoice choice model =
    case ( model.pendingImport, DatasetAccess.currentDataset model ) of
        ( Just pending, Just _ ) ->
            let
                count =
                    List.length pending.rawItems
            in
            -- pendingImport に選択した choice を保持して UUID の生成完了を待つ
            ( { model | pendingImport = Just { pending | mode = pending.mode } }
            , Ports.generateUuids count
            )

        _ ->
            ( { model | pendingImport = Nothing }, Cmd.none )


applyImportAndSave : AppendChoice -> List String -> PendingImport -> Dataset -> Model -> ( Model, Cmd Msg )
applyImportAndSave choice uuids pending target model =
    case Import.applyChoice choice uuids pending target of
        Just updated ->
            save
                { model
                    | datasets = DatasetAccess.replaceDataset updated model.datasets
                    , pendingImport = Nothing
                    , fileModalOpen = False
                }

        Nothing ->
            ( { model | pendingImport = Nothing }, Cmd.none )


save : Model -> ( Model, Cmd Msg )
save model =
    ( model, Storage.save model )



-- 新規データセット名入力・確定

updatePendingName : String -> Model -> Model
updatePendingName text model =
    { model | pendingImport = Maybe.map (setNameInput text) model.pendingImport }


setNameInput : String -> PendingImport -> PendingImport
setNameInput text pending =
    { pending | nameInput = text }


confirmNewDataset : Model -> ( Model, Cmd Msg )
confirmNewDataset model =
    case model.pendingImport of
        Just pending ->
            let
                count =
                    List.length pending.rawItems
            in
            ( model, Ports.generateUuids count )

        Nothing ->
            ( model, Cmd.none )

finaliseNewDatasetImport : List String -> Model -> ( Model, Cmd Msg )
finaliseNewDatasetImport uuids model =
    case model.pendingImport of
        Just pending ->
            let
                newDataset =
                    Import.buildNewDataset (nextDatasetId model) (datasetNameOrDefault pending.nameInput) uuids pending.rawItems
            in
            save
                { model
                    | datasets = model.datasets ++ [ newDataset ]
                    , selectedDatasetId = newDataset.id
                    , pendingImport = Nothing
                    , fileModalOpen = False
                }

        Nothing ->
            ( model, Cmd.none )


nextDatasetId : Model -> String
nextDatasetId model =
    "dataset-" ++ String.fromInt (List.length model.datasets)


datasetNameOrDefault : String -> String
datasetNameOrDefault input =
    if String.isEmpty (String.trim input) then
        "新しいデータ"

    else
        input


-- 書き出し

exportCurrentDataset : Model -> Cmd Msg
exportCurrentDataset model =
    case DatasetAccess.currentDataset model of
        Just dataset ->
            downloadDataset model.exportFormat dataset

        Nothing ->
            Cmd.none


downloadDataset : FileFormat -> Dataset -> Cmd Msg
downloadDataset format dataset =
    case format of
        JsonFormat ->
            File.Download.string (dataset.name ++ ".json") "application/json" (exportJsonText dataset)

        CsvFormat ->
            File.Download.string (dataset.name ++ ".csv") "text/csv" (CsvCodec.encodeDataset dataset)


exportJsonText : Dataset -> String
exportJsonText dataset =
    Encode.encode 2 (Encode.list (encodeExportItem dataset.fields) dataset.items)


encodeExportItem : List FieldConfig -> Item -> Encode.Value
encodeExportItem fields item =
    Encode.object (List.filterMap (exportField item) fields)


exportField : Item -> FieldConfig -> Maybe ( String, Encode.Value )
exportField item field =
    Dict.get field.key item.values
        |> Maybe.map (\v -> ( field.key, DomainJson.encodeValue v ))



-- バックアップ（設定を含む）


{-| バックアップは通常のJSON読み込みとは別枠の操作。
モード（新規/追加/置き換え）や形式の選択を必要とせず、常に新しいデータセットとして復元する。
-}
openBackupFile : Cmd Msg
openBackupFile =
    File.Select.file [ "application/json", ".json" ] (BackupFileSelected >> FileFlowMsg)


readBackupFile : File -> Cmd Msg
readBackupFile file =
    Task.perform (BackupTextLoaded >> FileFlowMsg) (File.toString file)


handleBackupText : String -> Model -> ( Model, Cmd Msg )
handleBackupText text model =
    case Decode.decodeString DomainJson.decodeDataset text of
        Ok dataset ->
            restoreDataset dataset model

        Err _ ->
            ( { model | importError = Just "バックアップの形式が正しくありません。" }, Cmd.none )


restoreDataset : Dataset -> Model -> ( Model, Cmd Msg )
restoreDataset dataset model =
    let
        restored =
            { dataset | id = nextDatasetId model }

        pushed =
            { model | history = History.push model model.history }
    in
    save
        { pushed
            | datasets = pushed.datasets ++ [ restored ]
            , selectedDatasetId = restored.id
            , fileModalOpen = False
        }


exportBackup : Model -> Cmd Msg
exportBackup model =
    case DatasetAccess.currentDataset model of
        Just dataset ->
            File.Download.string
                (dataset.name ++ "-backup.json")
                "application/json"
                (Encode.encode 2 (DomainJson.encodeDataset dataset))

        Nothing ->
            Cmd.none