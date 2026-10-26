module View.FileModal exposing (view)

import Html exposing (Html, button, div, h2, h3, input, label, p, span, text)
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
    div [ class "fixed inset-0 flex items-center justify-center z-50 p-4" ]
        [ div
            [ class "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            , onClick (FileFlowMsg (ToggleModal False))
            ]
            []
        , div [ class "relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col z-10 border border-neutral-100" ]
            [ header
            , div [ class "p-6 flex flex-col gap-6" ]
                [ currentDatasetCard model.dataset
                , importSection model
                , exportSection
                , backupSection
                , errorMessage model
                ]
            ]
        , renameModalView model
        ]


header : Html Msg
header =
    div [ class "px-6 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-20" ]
        [ h2 [ class "text-base font-bold text-neutral-800" ] [ text "ファイル・データ管理" ]
        , button
            [ class "text-neutral-400 hover:text-neutral-700 p-1 text-sm rounded-md transition"
            , onClick (FileFlowMsg (ToggleModal False))
            ]
            [ text "✕" ]
        ]


-- MARK: 現在のデータセット情報


currentDatasetCard : Dataset -> Html Msg
currentDatasetCard dataset =
    div [ class "bg-neutral-50 rounded-lg p-4 border border-neutral-200/80 flex items-center justify-between" ]
        [ div [ class "flex flex-col gap-1 min-w-0 pr-3" ]
            [ span [ class "text-[11px] font-semibold text-neutral-400 uppercase tracking-wider" ] [ text "現在のデータセット" ]
            , div [ class "text-base font-bold text-neutral-800 truncate" ] [ text dataset.name ]
            , span [ class "text-xs text-neutral-500" ] [ text (String.fromInt (List.length dataset.items) ++ " 件のカード") ]
            ]
        , button
            [ class "shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 shadow-sm transition"
            , onClick (DatasetMsg OpenRename)
            ]
            [ text "名前を変更" ]
        ]


-- MARK: 読み込みセクション


importSection : Model -> Html Msg
importSection model =
    div [ class "flex flex-col gap-3" ]
        [ sectionHeader "データの読み込み" "JSON または CSV ファイルからデータを取り込みます。"
        , readModeSelector model.readMode
        , importAction model
        ]


readModeSelector : ReadMode -> Html Msg
readModeSelector current =
    div [ class "grid grid-cols-3 gap-2 bg-neutral-100 p-1 rounded-lg text-xs font-medium text-neutral-600" ]
        [ modeTab current NewDataset "新規" "現在のデータを破棄して作り直す"
        , modeTab current AppendData "追加" "現在のデータの末尾に付け足す"
        , modeTab current ReplaceData "置き換え" "設定を保ったままカードのみ入れ替える"
        ]


modeTab : ReadMode -> ReadMode -> String -> String -> Html Msg
modeTab current target label_ tip =
    let
        isActive =
            current == target
    in
    button
        [ class
            (if isActive then
                "py-2 px-3 rounded-md bg-white text-neutral-900 font-semibold shadow-sm transition text-center"

             else
                "py-2 px-3 rounded-md text-neutral-500 hover:text-neutral-900 transition text-center"
            )
        , onClick (FileFlowMsg (SetReadMode target))
        , Html.Attributes.title tip
        ]
        [ text label_ ]


importAction : Model -> Html Msg
importAction model =
    case model.pendingImport of
        Just pending ->
            pendingImportView pending

        Nothing ->
            button
                [ class "w-full py-3 px-4 border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                , onClick (FileFlowMsg RequestOpenFile)
                ]
                [ span [ class "font-semibold" ] [ text "ファイルを選択" ]
                , span [ class "text-xs text-neutral-400" ] [ text "対応形式: .json, .csv（自動判別）" ]
                ]


pendingImportView : PendingImport -> Html Msg
pendingImportView pending =
    case pending.mode of
        NewDataset ->
            newDatasetForm pending

        _ ->
            newPropertyChoice pending


newDatasetForm : PendingImport -> Html Msg
newDatasetForm pending =
    div [ class "bg-blue-50/60 border border-blue-200 rounded-lg p-4 flex flex-col gap-3 text-sm" ]
        [ p [ class "text-blue-900 font-medium" ]
            [ text (String.fromInt (List.length pending.rawItems) ++ " 件のデータを新規作成します。新しいデータの名前を入力してください。") ]
        , input
            [ class "w-full border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            , placeholder "データセットの名前"
            , value pending.nameInput
            , onInput (ImportNameChanged >> FileFlowMsg)
            ]
            []
        , div [ class "flex justify-end gap-2" ]
            [ button [ class secondaryButtonClasses, onClick (FileFlowMsg CancelPendingImport) ] [ text "取消" ]
            , button [ class primaryButtonClasses, onClick (FileFlowMsg ConfirmNewDataset) ] [ text "決定して作成" ]
            ]
        ]


newPropertyChoice : PendingImport -> Html Msg
newPropertyChoice pending =
    div [ class "bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col gap-3 text-sm" ]
        [ p [ class "text-amber-900 font-medium" ]
            [ text ("既存データに無いプロパティが見つかりました: " ++ String.join ", " pending.newKeys) ]
        , div [ class "flex justify-end gap-2 flex-wrap" ]
            [ button [ class secondaryButtonClasses, onClick (FileFlowMsg CancelPendingImport) ] [ text "中止" ]
            , button [ class secondaryButtonClasses, onClick (FileFlowMsg (ResolveNewProperties IgnoreNewFields)) ] [ text "無視する" ]
            , button [ class primaryButtonClasses, onClick (FileFlowMsg (ResolveNewProperties AddNewFields)) ] [ text "プロパティを追加" ]
            ]
        ]


-- MARK: 書き出しセクション

exportSection : Html Msg
exportSection =
    div [ class "flex flex-col gap-3 pt-4 border-t border-neutral-100" ]
        [ sectionHeader "データの書き出し" "現在のカードデータをファイルとしてダウンロードします。"
        , div [ class "grid grid-cols-2 gap-3" ]
            [ button
                [ class "py-2 px-3 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition"
                , onClick (FileFlowMsg (ExportClicked JsonFormat))
                ]
                [ text "JSON で書き出す" ]
            , button
                [ class "py-2 px-3 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition"
                , onClick (FileFlowMsg (ExportClicked CsvFormat))
                ]
                [ text "CSV で書き出す" ]
            ]
        ]


-- MARK: バックアップセクション

backupSection : Html Msg
backupSection =
    div [ class "flex flex-col gap-3 pt-4 border-t border-neutral-100" ]
        [ sectionHeader "バックアップ" "項目の表示名や配置順などの全設定を含めて保存・復元します。"
        , div [ class "grid grid-cols-2 gap-3" ]
            [ button
                [ class "py-2 px-3 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition"
                , onClick (FileFlowMsg RequestOpenBackupFile)
                ]
                [ text "復元（読み込み）" ]
            , button
                [ class "py-2 px-3 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition"
                , onClick (FileFlowMsg ExportBackupClicked)
                ]
                [ text "バックアップ書き出し" ]
            ]
        ]


-- MARK: 共通部品

sectionHeader : String -> String -> Html Msg
sectionHeader title_ description_ =
    div [ class "flex flex-col gap-0.5" ]
        [ h3 [ class "text-xs font-bold text-neutral-700" ] [ text title_ ]
        , p [ class "text-[11px] text-neutral-400" ] [ text description_ ]
        ]


errorMessage : Model -> Html Msg
errorMessage model =
    case model.importError of
        Just message ->
            div [ class "p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium" ]
                [ text message ]

        Nothing ->
            text ""


primaryButtonClasses : String
primaryButtonClasses =
    "px-3.5 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition shadow-sm"


secondaryButtonClasses : String
secondaryButtonClasses =
    "px-3.5 py-1.5 text-xs font-medium rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition"


-- MARK: 名前変更モーダル

renameModalView : Model -> Html Msg
renameModalView model =
    case model.renameModal of
        Nothing ->
            text ""

        Just renameState ->
            div [ class "fixed inset-0 flex items-center justify-center z-[60] p-4" ]
                [ div
                    [ class "absolute inset-0 bg-black/30"
                    , onClick (DatasetMsg CancelRename)
                    ]
                    []
                , div [ class "relative bg-white rounded-xl shadow-xl w-80 p-5 flex flex-col gap-4 z-10 border border-neutral-100" ]
                    [ div [ class "flex flex-col gap-1" ]
                        [ h3 [ class "text-sm font-bold text-neutral-800" ] [ text "データセット名の変更" ]
                        , p [ class "text-xs text-neutral-400" ] [ text "新しい名前を入力してください。" ]
                        ]
                    , input
                        [ class "w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
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