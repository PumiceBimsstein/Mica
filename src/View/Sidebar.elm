module View.Sidebar exposing (view)

import DatasetAccess
import History
import Html exposing (Html, button, div, h1, input, label, text, span)
import Html.Attributes exposing (class, disabled, title, placeholder, value, type_, checked)
import Html.Events exposing (onClick, onInput)
import Types as Types
import Types exposing (CardSize(..), Model, Msg(..), FileFlowMsg(..), SearchMsg(..), SearchState, SearchMode(..), FieldConfig)
import View.FilterPanel as FilterPanel
import Svg exposing (path, svg)
import Svg.Attributes as SvgAttr
import Search
import Set exposing (Set)


view : Model -> Html Msg
view model =
    div [ class sidebarClasses ]
        [ headerRow model
        , div [ class topButtonRowClasses ]
            [ displayLevelButton model.cardSize
                --cardSizeButtons model.cardSize
            , settingsButton
            ]
        , fileButton
        --, undoButton model
        , searchArea model
        , filterArea model
        ]


headerRow : Model -> Html Msg
headerRow model =
    div [ class "flex items-center justify-between gap-2" ]
        [ appTitle model
        , undoButton model
        ]


sidebarClasses : String
sidebarClasses =
    "w-72 shrink-0 h-screen overflow-y-auto border-r border-neutral-200 bg-neutral-50 px-4 py-5 flex flex-col gap-4"



appTitle : Model -> Html Msg
appTitle model =
    case DatasetAccess.currentDataset model of
        Just dataset ->
            h1 [ class "text-lg font-semibold text-neutral-900 truncate" ]
                [ text dataset.name ]

        Nothing ->
            h1 [ class "text-lg font-semibold text-neutral-400 truncate" ]
                [ text "カードビューア" ]

topButtonRowClasses : String
topButtonRowClasses =
    "flex items-center gap-2"


cardSizeButtons : CardSize -> Html Msg
cardSizeButtons current =
    div [ class "flex gap-1 rounded-md border border-neutral-200 bg-white p-1" ]
        [ cardSizeButton current Small "小"
        , cardSizeButton current Medium "中"
        , cardSizeButton current Large "大"
        ]


{-| 表示レベル選択ボタン（トグル形式）
-}
displayLevelButton : CardSize -> Html Msg
displayLevelButton current =
    let
        nextSize =
            case current of
                Small ->
                    Medium

                Medium ->
                    Large

                Large ->
                    Small

        label =
            case current of
                Small ->
                    "小"

                Medium ->
                    "中"

                Large ->
                    "大"

        buttonClasses =
            "px-3 py-1 text-sm rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
    in
    button
        [ class buttonClasses
        , onClick (SetCardSize nextSize)
        , title "表示レベル: クリックで切り替え"
        ]
        [ text ("表示レベル: " ++ label) ]

cardSizeButton : CardSize -> CardSize -> String -> Html Msg
cardSizeButton current target label =
    button
        [ class (cardSizeButtonClasses (current == target))
        , onClick (SetCardSize target)
        ]
        [ text label ]


cardSizeButtonClasses : Bool -> String
cardSizeButtonClasses isActive =
    if isActive then
        "px-3 py-1 text-sm rounded bg-neutral-900 text-white"

    else
        "px-3 py-1 text-sm rounded text-neutral-600 hover:bg-neutral-100"


{-| 設定ウィンドウを開く。フィールドの表示名・表示方法・カード表示・フィルター対象・
表示順序・リンク先フィールドを変更できる。
-}
settingsButton : Html Msg
settingsButton =
    button [ class placeholderButtonClasses, onClick (ToggleSettingsModal True) ] [ text "項目設定" ]


placeholderButtonClasses : String
placeholderButtonClasses =
    "px-3 py-1 text-sm rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100"


{-| ファイル操作ウィンドウを開く。データ切り替え・JSON読み込み・書き出しに対応。
-}
fileButton : Html Msg
fileButton =
    button [ class fileButtonClasses, onClick (FileFlowMsg (ToggleModal True)) ] [ text "ファイル" ]

fileButtonClasses : String
fileButtonClasses =
    "w-full px-3 py-1 text-sm rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100"


{-| データ削除などの取り消しに使う。履歴が無い間は押せない。
-}
-- undoButton : Model -> Html Msg
-- undoButton model =
--     button
--         [ class (undoButtonClasses (History.canUndo model))
--         , onClick UndoRequested
--         , disabled (not (History.canUndo model))
--         ]
--         [ text "元に戻す" ]


-- undoButtonClasses : Bool -> String
-- undoButtonClasses enabled =
--     if enabled then
--         "w-full px-3 py-1 text-sm rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100"

--     else
--         "w-full px-3 py-1 text-sm rounded border border-neutral-200 text-neutral-300 cursor-not-allowed"


undoButton : Model -> Html Msg
undoButton model =
    button
        [ class (undoButtonClasses (History.canUndo model))
        , onClick UndoRequested
        , disabled (not (History.canUndo model))
        , title "Undo"
        ]
        [ undoIcon ]


undoIcon : Html Msg
undoIcon =
    svg
        [ SvgAttr.class "w-4 h-4 mx-auto fill-current"
        , SvgAttr.viewBox "0 0 24 24"
        ]
        [ path
            [ SvgAttr.d "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
            ]
            []
        ]


undoButtonClasses : Bool -> String
undoButtonClasses enabled =
    if enabled then
        "p-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100 shrink-0 flex items-center justify-center"

    else
        "p-1.5 rounded border border-neutral-200 text-neutral-300 cursor-not-allowed shrink-0 flex items-center justify-center"


{-| 検索エリア全体
-}
searchArea : Model -> Html Msg
searchArea model =
    case DatasetAccess.currentDataset model of
        Just dataset ->
            div [ class "border-t border-neutral-200 pt-2 -mx-4 px-4 space-y-2" ]
                [ searchInput model.searchState
                , searchModeButtons model.searchState
                , searchFieldCheckboxes model.searchState dataset
                ]

        Nothing ->
            div [] []


{-| 検索ワード入力欄
-}
searchInput : SearchState -> Html Msg
searchInput searchState =
    let
        inputClasses =
            "w-full px-2 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-neutral-400"
    in
    input
        [ class inputClasses
        , type_ "text"
        , placeholder "検索ワード"
        , value searchState.query
        , onInput (\q -> SearchMsg (SetQuery q))
        ]
        []


{-| 検索モード切り替えボタン
-}
searchModeButtons : SearchState -> Html Msg
searchModeButtons searchState =
    let
        isSearchAll =
            case searchState.mode of
                SearchAll ->
                    True

                SearchFields _ ->
                    False

        buttonClasses isActive =
            if isActive then
                "flex-1 px-2 py-1 text-xs rounded bg-neutral-900 text-white"

            else
                "flex-1 px-2 py-1 text-xs rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
    in
    div [ class "flex gap-1" ]
        [ button
            [ class (buttonClasses isSearchAll)
            , onClick (SearchMsg ToggleSearchMode)
            ]
            [ text "すべて" ]
        , button
            [ class (buttonClasses (not isSearchAll))
            , onClick (SearchMsg ToggleSearchMode)
            ]
            [ text "フィールド指定" ]
        ]


{-| フィールド指定モード時のチェックボックスリスト
SearchAll の場合は非表示
-}
searchFieldCheckboxes : SearchState -> Types.Dataset -> Html Msg
searchFieldCheckboxes searchState dataset =
    case searchState.mode of
        SearchAll ->
            div [] []

        SearchFields selectedFields ->
            let
                searchableFields =
                    Search.searchableFields dataset
            in
            if List.isEmpty searchableFields then
                div [] []

            else
                div [ class "space-y-1 bg-white rounded border border-neutral-200 p-2" ]
                    (List.map
                        (\field -> searchFieldCheckbox field selectedFields)
                        searchableFields
                    )


{-| フィールド指定時のチェックボックス
-}
-- searchFieldCheckbox : FieldConfig -> Set String -> Html Msg
-- searchFieldCheckbox field selectedFields =
--     let
--         isChecked =
--             Set.member field.key selectedFields

--         checkboxClasses =
--             "w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"

--         labelClasses =
--             "text-sm text-neutral-700"
--     in
--     div [ class "flex items-center gap-2 cursor-pointer" ]
--         [ input
--             [ class checkboxClasses
--             , type_ "checkbox"
--             , checked isChecked
--             , onInput (\_ -> SearchMsg (ToggleSearchField field.key))
--             ]
--             []
--         , label [ class labelClasses ]
--             [ text field.label ]
--         ]


searchFieldCheckbox : FieldConfig -> Set String -> Html Msg
searchFieldCheckbox field selectedFields =
    let
        isChecked =
            Set.member field.key selectedFields

        labelClasses =
            "text-sm text-neutral-700"
    in
    label [ class "flex items-center gap-2 cursor-pointer" ]
        [ input
            [ class "w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
            , type_ "checkbox"
            , checked isChecked
            , onInput (\_ -> SearchMsg (ToggleSearchField field.key))
            ]
            []
        , span [ class labelClasses ] [ text field.label ]
        ]

filterArea : Model -> Html Msg
filterArea model =
    case DatasetAccess.currentDataset model of
        Just dataset ->
            div [ class "flex-1 overflow-y-auto flex flex-col gap-2" ] [ FilterPanel.view model dataset ]

        Nothing ->
            div [ class "mt-2 text-sm text-neutral-400" ] [ text "データがありません" ]
