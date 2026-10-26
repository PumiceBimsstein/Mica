module FileFlow exposing
    ( confirmNewDataset
    , exportBackup
    , exportCurrentDataset
    , handleBackupText
    , handleFileLoaded
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
        ( AppendChoice(..)
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

openFile : Cmd Msg
openFile =
    File.Select.file [ "application/json", "text/csv", ".json", ".csv" ] (FileSelected >> FileFlowMsg)

readFile : File -> Cmd Msg
readFile file =
    let
        fileName =
            File.name file
    in
    Task.perform (\content -> FileFlowMsg (FileLoaded fileName content)) (File.toString file)


-- 読み込んだテキストの処理

-- handleFileLoaded : String -> String -> Model -> ( Model, Cmd Msg )
-- handleFileLoaded fileName text model =
--     case parseRawItems fileName text model of
--         Ok rawItems ->
--             startImport rawItems model

--         Err message ->
--             ( { model | importError = Just message, pendingImport = Nothing }, Cmd.none )

handleFileLoaded : String -> String -> Model -> ( Model, Cmd Msg )
handleFileLoaded fileName text model =
    case parseRawItems fileName text model of
        Ok rawItems ->
            startImport rawItems model

        Err message ->
            -- エラー時はモーダルを開いてエラーメッセージを表示
            ( { model | importError = Just message, pendingImport = Nothing, fileModalOpen = True }, Cmd.none )


parseRawItems : String -> String -> Model -> Result String (List (List ( String, Value )))
parseRawItems fileName text model =
    let
        lowerName =
            String.toLower fileName
    in
    if String.endsWith ".csv" lowerName then
        CsvCodec.decodeRawItems (existingDatasetFor model) text

    else if String.endsWith ".json" lowerName then
        Import.decodeRawItems text
            |> Result.mapError (\_ -> "JSONの形式が正しくありません。")

    else
        -- 拡張子がない場合のフォールバック（JSON を試し、ダメなら CSV）
        case Import.decodeRawItems text of
            Ok items ->
                Ok items

            Err _ ->
                CsvCodec.decodeRawItems (existingDatasetFor model) text

{-| 新規モードでは既存データを参照しない（列の型は列内の値から推測する）。
追加・置き換えでは、対象データセットの既存フィールドの型をCSVの列の型推測に使う。
-}

existingDatasetFor : Model -> Maybe Dataset
existingDatasetFor model =
    if model.readMode == NewDataset then
        Nothing

    else
        Just model.dataset


startImport : List (List ( String, Value )) -> Model -> ( Model, Cmd Msg )
startImport rawItems model =
    case model.readMode of
        NewDataset ->
            ( { model | pendingImport = Just (newPendingImport rawItems), importError = Nothing }, Cmd.none )

        _ ->
            resolveOrPrompt rawItems model.dataset model


-- newPendingImport : List (List ( String, Value )) -> PendingImport
-- newPendingImport rawItems =
--     { mode = NewDataset, rawItems = rawItems, newKeys = [], nameInput = "" }

newPendingImport : List (List ( String, Value )) -> PendingImport
newPendingImport rawItems =
    { mode = NewDataset
    , rawItems = rawItems
    , newKeys = []
    , nameInput = ""
    , choice = AddNewFields
    }


-- resolveOrPrompt : List (List ( String, Value )) -> Dataset -> Model -> ( Model, Cmd Msg )
-- resolveOrPrompt rawItems target model =
--     let
--         newKeys =
--             Import.findNewKeys target.fields rawItems

--         pending =
--             { mode = model.readMode
--             , rawItems = rawItems
--             , newKeys = newKeys
--             , nameInput = ""
--             , choice = AddNewFields
--             }
--     in
--     if List.isEmpty newKeys then
--         let
--             count =
--                 List.length rawItems
--         in
--         ( { model | pendingImport = Just pending, importError = Nothing }
--         , Ports.generateUuids count
--         )

--     else
--         ( { model | pendingImport = Just pending, importError = Nothing }, Cmd.none )


resolveOrPrompt : List (List ( String, Value )) -> Dataset -> Model -> ( Model, Cmd Msg )
resolveOrPrompt rawItems target model =
    let
        newKeys =
            Import.findNewKeys target.fields rawItems

        pending =
            { mode = model.readMode
            , rawItems = rawItems
            , newKeys = newKeys
            , nameInput = ""
            , choice = AddNewFields
            }
    in
    if List.isEmpty newKeys then
        -- 既存フィールドと一致している場合はモーダルを開かずそのまま追加完了
        let
            count =
                List.length rawItems
        in
        ( { model | pendingImport = Just pending, importError = Nothing }
        , Ports.generateUuids count
        )

    else
        -- 既存データにない新キーが見つかった場合はモーダルを開いてユーザーに選択を促す
        ( { model | pendingImport = Just pending, importError = Nothing, fileModalOpen = True }, Cmd.none )


-- 追加・置き換えインポート解決時：UUID 生成要求を JS ポートへ送る
resolveChoice : AppendChoice -> Model -> ( Model, Cmd Msg )
resolveChoice choice model =
    case model.pendingImport of
        Just pending ->
            let
                count =
                    List.length pending.rawItems

                updatedPending =
                    { pending | choice = choice }
            in
            ( { model | pendingImport = Just updatedPending }
            , Ports.generateUuids count
            )

        Nothing ->
            ( { model | pendingImport = Nothing }, Cmd.none )


applyImportAndSave : AppendChoice -> List String -> PendingImport -> Model -> ( Model, Cmd Msg )
applyImportAndSave choice uuids pending model =
    case Import.applyChoice choice uuids pending model.dataset of
        Just updated ->
            save
                { model
                    | history = History.push model model.history
                    , dataset = updated 
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
    { model | pendingImport = Maybe.map (\p -> { p | nameInput = text }) model.pendingImport }


confirmNewDataset : Model -> ( Model, Cmd Msg )
confirmNewDataset model =
    case model.pendingImport of
        Just pending ->
            ( model, Ports.generateUuids (List.length pending.rawItems) )

        Nothing ->
            ( model, Cmd.none )

finaliseNewDatasetImport : List String -> Model -> ( Model, Cmd Msg )
finaliseNewDatasetImport uuids model =
    case model.pendingImport of
        Just pending ->
            let
                newDataset =
                    Import.buildNewDataset model.dataset.id (datasetNameOrDefault pending.nameInput) uuids pending.rawItems
            in
            save
                { model
                    | history = History.push model model.history
                    , dataset = newDataset
                    , pendingImport = Nothing
                    , fileModalOpen = False
                }

        Nothing ->
            ( model, Cmd.none )


datasetNameOrDefault : String -> String
datasetNameOrDefault input =
    if String.isEmpty (String.trim input) then
        "新しいデータ"

    else
        input


-- 書き出し

exportCurrentDataset : FileFormat -> Model -> Cmd Msg
exportCurrentDataset format model =
    downloadDataset format model.dataset


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


-- バックアップの復元：現在のデータセットを上書き
restoreDataset : Dataset -> Model -> ( Model, Cmd Msg )
restoreDataset dataset model =
    let
        pushed = { model | history = History.push model model.history }
    in
    save
        { pushed
            | dataset = dataset
            , fileModalOpen = False
        }


exportBackup : Model -> Cmd Msg
exportBackup model =
    let
        dataset = model.dataset
    in
    File.Download.string
        ("Mica-backup-" ++ dataset.name ++ ".json")
        "application/json"
        (Encode.encode 2 (DomainJson.encodeDataset dataset))

