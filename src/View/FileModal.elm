module View.FileModal exposing (view)

import Html exposing (Html, button, div, h2, input, label, li, p, text, ul)
import Html.Attributes exposing (checked, class, name, placeholder, type_, value)
import Html.Events exposing (onClick, onInput)
import Types
    exposing
        ( AppendChoice(..)
        , Dataset
        , DatasetMsg(..)
        , FileFormat(..)
        , FileFlowMsg(..)
        , Model
        , Msg(..)
        , PendingImport
        , ReadMode(..)
        )


view : Model -> Html Msg
view model =
    if model.fileModalOpen then
        overlay model

    else
        text ""


overlay : Model -> Html Msg
overlay model =
    div [ class "fixed inset-0 flex items-center justify-center z-50" ]
        [ -- 背景レイヤー（範囲外クリックでモーダルを閉じる）
          div
            [ class "absolute inset-0 bg-black/30"
            , onClick (FileFlowMsg (ToggleModal False))
            ]
            []
        , -- パネル本体（背景の上に重なる兄弟要素）
          div [ class "relative bg-white rounded-md shadow-lg w-[32rem] max-h-[80vh] overflow-y-auto p-5 flex flex-col gap-5 z-10" ]
            [ header
            --, datasetSwitcher model
            , importSection model
            , exportSection model
            , backupSection
            , errorMessage model
            ]
        , renameModalView model
        ]


overlayClasses : String
overlayClasses =
    "fixed inset-0 bg-black/30 flex items-center justify-center z-50"


panelClasses : String
panelClasses =
    "bg-white rounded-md shadow-lg w-[32rem] max-h-[80vh] overflow-y-auto p-5 flex flex-col gap-5"


header : Html Msg
header =
    div [ class "flex items-center justify-between" ]
        [ h2 [ class "text-base font-semibold text-neutral-900" ] [ text "ファイル操作" ]
        , button
            [ class "text-sm text-neutral-400 hover:text-neutral-700"
            , onClick (FileFlowMsg (ToggleModal False))
            ]
            [ text "閉じる" ]
        ]



-- MARK:メインデータの切り替え


-- datasetSwitcher : Model -> Html Msg
-- datasetSwitcher model =
--     div [ class "flex flex-col gap-2" ]
--         [ sectionTitle "メインデータの切り替え"
--         , ul [ class "flex flex-col gap-1" ] (List.map (datasetRow model.selectedDatasetId) model.datasets)
--         ]


datasetRow : String -> Dataset -> Html Msg
datasetRow selectedId dataset =
    li [ class "flex items-center gap-1" ]
        [ button
            [ class (datasetRowClasses (dataset.id == selectedId))
            --, onClick (DatasetMsg (Select dataset.id))
            ]
            [ text dataset.name ]
        , renameDatasetButton dataset.id
        --, deleteDatasetButton dataset.id
        ]

-- [追加] データセット名変更ボタン
renameDatasetButton : String -> Html Msg
renameDatasetButton datasetId =
    button
        [ class renameButtonClasses
        , onClick (DatasetMsg OpenRename)
        ]
        [ text "名前変更" ]


-- [追加] 名前変更ボタンのスタイル
renameButtonClasses : String
renameButtonClasses =
    "shrink-0 px-2 py-1 text-xs rounded text-neutral-600 hover:bg-neutral-100"


deleteButtonClasses : String
deleteButtonClasses =
    "shrink-0 px-2 py-1 text-xs rounded text-red-500 hover:bg-red-50"


datasetRowClasses : Bool -> String
datasetRowClasses isSelected =
    if isSelected then
        "flex-1 text-left px-3 py-1.5 rounded text-sm bg-neutral-900 text-white"

    else
        "flex-1 text-left px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-neutral-100"



-- MARK:JSON読み込み

importSection : Model -> Html Msg
importSection model =
    div [ class "flex flex-col gap-2 border-t border-neutral-100 pt-4" ]
        [ sectionTitle "読み込み"
        , formatRadios "import-format" (\fmt -> FileFlowMsg (SetImportFormat fmt)) model.importFormat, readModeRadios model.readMode
        , importAction model
        ]


formatRadios : String -> (FileFormat -> Msg) -> FileFormat -> Html Msg
formatRadios groupName toMsg current =
    div [ class "flex gap-3 text-sm" ]
        [ formatRadio groupName toMsg current JsonFormat "JSON"
        , formatRadio groupName toMsg current CsvFormat "CSV"
        ]


formatRadio : String -> (FileFormat -> Msg) -> FileFormat -> FileFormat -> String -> Html Msg
formatRadio groupName toMsg current target label_ =
    label [ class "flex items-center gap-1" ]
        [ input
            [ type_ "radio"
            , name groupName
            , checked (current == target)
            , onClick (toMsg target)
            ]
            []
        , text label_
        ]


readModeRadios : ReadMode -> Html Msg
readModeRadios current =
    div [ class "flex gap-3 text-sm" ]
        [ readModeRadio current NewDataset "新規"
        , readModeRadio current AppendData "追加"
        , readModeRadio current ReplaceData "置き換え"
        ]


readModeRadio : ReadMode -> ReadMode -> String -> Html Msg
readModeRadio current target label_ =
    label [ class "flex items-center gap-1" ]
        [ input
            [ type_ "radio"
            , name "read-mode"
            , checked (current == target)
            , onClick (FileFlowMsg (SetReadMode target))
            ]
            []
        , text label_
        ]


importAction : Model -> Html Msg
importAction model =
    case model.pendingImport of
        Just pending ->
            pendingImportView pending

        Nothing ->
            button [ class primaryButtonClasses, onClick (FileFlowMsg RequestOpenFile) ] [ text "ファイルを選択" ]


pendingImportView : PendingImport -> Html Msg
pendingImportView pending =
    case pending.mode of
        NewDataset ->
            newDatasetForm pending

        _ ->
            newPropertyChoice pending


newDatasetForm : PendingImport -> Html Msg
newDatasetForm pending =
    div [ class "flex flex-col gap-2" ]
        [ p [ class "text-sm text-neutral-600" ]
            [ text (String.fromInt (List.length pending.rawItems) ++ "件のデータを新規データとして読み込みます。名前を入力してください。") ]
        , input
            [ class inputClasses
            , placeholder "データの名前"
            , value pending.nameInput
            , onInput (ImportNameChanged >> FileFlowMsg)
            ]
            []
        , div [ class "flex gap-2" ]
            [ button [ class primaryButtonClasses, onClick (FileFlowMsg ConfirmNewDataset) ] [ text "作成" ]
            , button [ class secondaryButtonClasses, onClick (FileFlowMsg CancelPendingImport) ] [ text "取消" ]
            ]
        ]


newPropertyChoice : PendingImport -> Html Msg
newPropertyChoice pending =
    div [ class "flex flex-col gap-2" ]
        [ p [ class "text-sm text-neutral-600" ]
            [ text ("既存データに無いプロパティがあります： " ++ String.join ", " pending.newKeys) ]
        , div [ class "flex gap-2" ]
            [ button [ class primaryButtonClasses, onClick (FileFlowMsg (ResolveNewProperties AddNewFields)) ] [ text "追加する" ]
            , button [ class secondaryButtonClasses, onClick (FileFlowMsg (ResolveNewProperties IgnoreNewFields)) ] [ text "無視する" ]
            , button [ class secondaryButtonClasses, onClick (FileFlowMsg (ResolveNewProperties AbortImport)) ] [ text "中止する" ]
            ]
        ]



-- MARK:書き出し

exportSection : Model -> Html Msg
exportSection model =
    div [ class "flex flex-col gap-2 border-t border-neutral-100 pt-4" ]
        [ sectionTitle "書き出し"
        , formatRadios "export-format" (\fmt -> FileFlowMsg (SetExportFormat fmt)) model.exportFormat
        , button [ class primaryButtonClasses, onClick (FileFlowMsg ExportClicked) ] [ text "書き出す" ]
        ]



-- MARK:バックアップ（設定を含む）

backupSection : Html Msg
backupSection =
    div [ class "flex flex-col gap-2 border-t border-neutral-100 pt-4" ]
        [ sectionTitle "バックアップ（設定を含む）"
        , p [ class "text-xs text-neutral-400" ]
            [ text "フィールド設定ごと保存・復元します。復元は新しいメインデータとして追加されます。" ]
        , div [ class "flex gap-2" ]
            [ button [ class secondaryButtonClasses, onClick (FileFlowMsg RequestOpenBackupFile) ] [ text "読み込む" ]
            , button [ class secondaryButtonClasses, onClick (FileFlowMsg ExportBackupClicked) ] [ text "書き出す" ]
            ]
        ]


-- MARK:共通部品

sectionTitle : String -> Html Msg
sectionTitle label_ =
    div [ class "text-xs font-medium text-neutral-400" ] [ text label_ ]


errorMessage : Model -> Html Msg
errorMessage model =
    case model.importError of
        Just message ->
            p [ class "text-sm text-red-600" ] [ text message ]

        Nothing ->
            text ""


primaryButtonClasses : String
primaryButtonClasses =
    "px-3 py-1.5 text-sm rounded bg-neutral-900 text-white hover:bg-neutral-700"


secondaryButtonClasses : String
secondaryButtonClasses =
    "px-3 py-1.5 text-sm rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-100"


inputClasses : String
inputClasses =
    "border border-neutral-200 rounded px-2 py-1.5 text-sm"


-- データセット名変更モーダル
renameModalView : Model -> Html Msg
renameModalView model =
    case model.renameModal of
        Nothing ->
            text ""

        Just renameState ->
            div [ class "fixed inset-0 flex items-center justify-center z-[60]" ]
                [ -- 背景レイヤー（範囲外クリックでキャンセルして閉じる）
                  div
                    [ class "absolute inset-0 bg-black/20"
                    , onClick (DatasetMsg CancelRename)
                    ]
                    []
                , -- パネル本体
                  div [ class "relative bg-white rounded-md shadow-lg w-80 p-4 flex flex-col gap-3 z-10" ]
                    [ p
                        [ class "text-sm font-medium text-neutral-900" ]
                        [ text "データの名前を変更" ]
                    , input
                        [ class inputClasses
                        , value renameState.name
                        , onInput (RenameNameChanged >> DatasetMsg)
                        ]
                        []
                    , div [ class "flex justify-end gap-2" ]
                        [ button
                            [ class secondaryButtonClasses
                            , onClick (DatasetMsg CancelRename)
                            ]
                            [ text "キャンセル" ]
                        , button
                            [ class primaryButtonClasses
                            , onClick (DatasetMsg ConfirmRename)
                            ]
                            [ text "決定" ]
                        ]
                    ]
                ]