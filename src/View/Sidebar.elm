module View.Sidebar exposing (view)

import History
import Html exposing (Html, button, div, h1, input, label, text, span)
import Html.Attributes exposing (class, disabled, title, placeholder, value, type_, checked)
import Html.Events exposing (onClick, onInput)
import Types as Types
import Types exposing (CardSize(..), Model, Msg(..), FileFlowMsg(..), SearchMsg(..), SearchState, SearchMode(..), FieldConfig, FieldSettingsMsg(..))
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
        , filterSectionHeader model
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
    h1 [ class "text-lg font-semibold text-neutral-900 truncate" ]
        [ text model.dataset.name ]


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


-- ファイル操作ウィンドウを開く。データ切り替え・JSON読み込み・書き出しに対応。

fileButton : Html Msg
fileButton =
    button [ class fileButtonClasses, onClick (FileFlowMsg (ToggleModal True)) ] [ text "ファイル" ]

fileButtonClasses : String
fileButtonClasses =
    "w-full px-3 py-1 text-sm rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100"


-- データ削除などの取り消しに使う。履歴が無い間は押せない。

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
    div [ class "border-t border-neutral-200 pt-2 -mx-4 px-4 space-y-2" ]
        [ searchInput model.searchState
        , searchModeButtons model.searchState
        , searchFieldCheckboxes model.searchState model.dataset
        ]




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


-- filterSectionHeader : Model -> Html Msg
-- filterSectionHeader model =
--     div [ class "relative flex items-center justify-between border-t border-neutral-200 pt-3 -mx-4 px-4" ]
--         [ span [ class "text-xs font-semibold text-neutral-500 uppercase tracking-wider" ]
--             [ text "フィルター" ]
--         , button
--             [ class "px-2 py-0.5 text-xs rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 flex items-center gap-1 shadow-sm"
--             , onClick (ToggleFilterSelectDropdown (not model.filterSelectOpen))
--             ]
--             [ text "+ 項目選択" ]
--         , filterSelectDropdown model
--         ]

filterSectionHeader : Model -> Html Msg
filterSectionHeader model =
    div [ class "flex flex-col gap-2 border-t border-neutral-200 pt-3 -mx-4 px-4 relative" ]
        [ div [ class "flex items-center justify-between" ]
            [ span [ class "text-xs font-semibold text-neutral-500 uppercase tracking-wider" ]
                [ text "フィルター" ]
            , button
                [ class
                    (if model.filterSelectOpen then
                        "px-2 py-0.5 text-xs rounded border border-neutral-300 bg-neutral-200 text-neutral-800 font-medium shadow-sm transition"

                     else
                        "px-2 py-0.5 text-xs rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 shadow-sm transition"
                    )
                , onClick (ToggleFilterSelectDropdown (not model.filterSelectOpen))
                ]
                [ text
                    (if model.filterSelectOpen then
                        "✕ 閉じる"

                     else
                        "+ 項目選択"
                    )
                ]
            ]
        , filterSelectDropdown model
        ]


-- filterSelectDropdown : Model -> Html Msg
-- filterSelectDropdown model =
--     if not model.filterSelectOpen then
--         text ""

--     else
--         div []
--             [ -- 枠外クリックで閉じるための透明オーバーレイ
--               div
--                 [ class "fixed inset-0 z-30"
--                 , onClick (ToggleFilterSelectDropdown False)
--                 ]
--                 []
--             , -- ドロップダウン本体
--               div [ class "absolute right-4 top-full mt-1 w-52 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 z-40 flex flex-col gap-1 max-h-60 overflow-y-auto" ]
--                 (List.map filterFieldCheckbox model.dataset.fields)
--             ]

filterSelectDropdown : Model -> Html Msg
filterSelectDropdown model =
    if not model.filterSelectOpen then
        text ""

    else
        div [ class "flex flex-col" ]
            [ -- 枠外クリックで閉じるための透明オーバーレイ
              div
                [ class "fixed inset-0 z-30"
                , onClick (ToggleFilterSelectDropdown False)
                ]
                []
            , -- メニュー本体（サイドバー幅の中に確実に収まり、他の要素の上に重なって浮く）
              div [ class "relative z-40 bg-white border border-neutral-300 rounded-lg shadow-md p-2 flex flex-col gap-1 max-h-56 overflow-y-auto" ]
                [ div [ class "text-[11px] font-semibold text-neutral-400 px-2 py-0.5 border-b border-neutral-100 mb-1" ]
                    [ text "表示するフィルターを選択" ]
                , div [ class "flex flex-col gap-0.5" ]
                    (List.map filterFieldCheckbox model.dataset.fields)
                ]
            ]

filterFieldCheckbox : FieldConfig -> Html Msg
filterFieldCheckbox field =
    label [ class "flex items-center gap-2 px-2 py-1 hover:bg-neutral-50 rounded cursor-pointer text-xs text-neutral-700" ]
        [ input
            [ type_ "checkbox"
            , class "w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
            , checked field.filterable
            , onClick (FieldSettingsMsg (SetFilterable field.key (not field.filterable)))
            ]
            []
        , span [ class "truncate" ] [ text field.label ]
        ]



filterArea : Model -> Html Msg
filterArea model =
    div [ class "flex-1 overflow-y-auto flex flex-col gap-2 min-h-0" ]
        [ FilterPanel.view model model.dataset ]

