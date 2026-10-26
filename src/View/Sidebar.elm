module View.Sidebar exposing (view)

import History
import Html exposing (Html, button, div, h1, input, label, text, span)
import Html.Attributes exposing (class, disabled, title, placeholder, value, type_, checked)
import Html.Events exposing (onClick, onInput)
import Types as Types
import View.FilterPanel as FilterPanel
import Svg exposing (path, svg)
import Svg.Attributes as SvgAttr
import Search
import Set exposing (Set)
import Filter
import Types exposing 
    ( CardSize(..)
    , FieldConfig
    , FieldSettingsMsg(..)
    , FileFlowMsg(..)
    , FilterMsg(..)
    , Model
    , Msg(..)
    , SearchMode(..)
    , SearchMsg(..)
    , SearchState
    )

view : Model -> Html Msg
view model =
    div [ class sidebarClasses ]
        [ headerRow model
        , cardSizeSegment model.cardSize
        , actionRow
        , searchArea model
        , filterSectionHeader model
        , filterArea model
        ]


headerRow : Model -> Html Msg
headerRow model =
    div [ class "relative flex items-center justify-center min-h-[32px]" ]
        [ appTitle model
        , div [ class "absolute right-0" ] [ undoButton model ]
        ]


sidebarClasses : String
sidebarClasses =
    "w-72 shrink-0 h-screen overflow-y-auto border-r border-neutral-200 bg-neutral-50 px-4 py-5 flex flex-col gap-3.5"


appTitle : Model -> Html Msg
appTitle model =
    h1  [ class "text-lg font-title font-semibold text-neutral-900 truncate text-center px-8 w-full" ]
        [ text model.dataset.name ]


cardSizeSegment : CardSize -> Html Msg
cardSizeSegment current =
    div [ class "grid grid-cols-3 p-1 bg-neutral-200/70 rounded-lg text-xs font-medium gap-1" ]
        [ sizeTab current Small "画像"
        , sizeTab current Medium "タイトル"
        , sizeTab current Large "詳細"
        ]

sizeTab : CardSize -> CardSize -> String -> Html Msg
sizeTab current target label =
    let
        isActive =
            current == target
    in
    button
        [ class
            (if isActive then
                "py-1.5 rounded-md bg-white text-neutral-900 font-semibold shadow-xs transition text-center cursor-default"

             else
                "py-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 transition text-center cursor-pointer"
            )
        , onClick (SetCardSize target)
        , title ("表示サイズ: " ++ label)
        ]
        [ text label ]


settingsButton : Html Msg
settingsButton =
    button
        [ class "flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 shadow-xs transition cursor-pointer"
        , onClick (ToggleSettingsModal True)
        ]
        [ cogIcon
        , text "項目設定"
        ]


actionRow : Html Msg
actionRow =
    div [ class "grid grid-cols-2 gap-2" ]
        [ fileButton
        , settingsButton
        ]


fileButton : Html Msg
fileButton =
    button
        [ class fileButtonClasses
        , onClick (FileFlowMsg (ToggleModal True))
        ]
        [ folderIcon
        , text "ファイル"
        ]

fileButtonClasses : String
fileButtonClasses =
    "flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-neutral-200 bg-white"
        ++ " text-neutral-700 hover:bg-neutral-100 shadow-xs transition cursor-pointer"


-- 履歴が無い間は押せない
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


-- 検索エリア全体
searchArea : Model -> Html Msg
searchArea model =
    div [ class "border-t border-neutral-200 pt-2 -mx-4 px-4 space-y-2" ]
        [ searchInput model.searchState
        , searchModeButtons model.searchState
        , searchFieldCheckboxes model.searchState model.dataset
        ]




-- 検索ワード入力欄
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


-- 検索モード切り替えボタン
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


-- フィールド指定時のチェックボックス

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


filterSectionHeader : Model -> Html Msg
filterSectionHeader model =
    let
        hasActiveFilters =
            Filter.isFilterActive model.filterUi model.dataset
    in
    div [ class "flex flex-col gap-2 border-t border-neutral-200 pt-3 -mx-4 px-4 relative" ]
        [ div [ class "flex items-center justify-between" ]
            [ span [ class "text-xs font-semibold text-neutral-500 uppercase tracking-wider" ]
                [ text "フィルター" ]
            , div [ class "flex items-center gap-1.5" ]
                [ -- フィルター選択がある時だけ「すべて解除」を表示
                  if hasActiveFilters then
                    button
                        [ class "px-1.5 py-0.5 text-xs text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                        , onClick (FilterMsg ClearAllFilters)
                        , title "選択中のフィルターをすべて解除"
                        ]
                        [ text "すべて解除" ]

                  else
                    text ""
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
            ]
        , filterSelectDropdown model
        ]



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
            , div [ class "relative z-40 bg-white border border-neutral-300 rounded-lg shadow-md p-2 flex flex-col gap-1 max-h-56 overflow-y-auto" ]
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

-- MARK: アイコン部品


folderIcon : Html Msg
folderIcon =
    svg
        [ SvgAttr.class "w-3.5 h-3.5 text-neutral-400 shrink-0"
        , SvgAttr.viewBox "0 0 24 24"
        , SvgAttr.fill "none"
        , SvgAttr.stroke "currentColor"
        , SvgAttr.strokeWidth "2"
        , SvgAttr.strokeLinecap "round"
        , SvgAttr.strokeLinejoin "round"
        ]
        [ path [ SvgAttr.d "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" ] [] ]


cogIcon : Html Msg
cogIcon =
    svg
        [ SvgAttr.class "w-3.5 h-3.5 text-neutral-400 shrink-0"
        , SvgAttr.viewBox "0 0 24 24"
        , SvgAttr.fill "none"
        , SvgAttr.stroke "currentColor"
        , SvgAttr.strokeWidth "2"
        , SvgAttr.strokeLinecap "round"
        , SvgAttr.strokeLinejoin "round"
        ]
        [ path [ SvgAttr.d "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" ] []
        , path [ SvgAttr.d "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" ] []
        ]