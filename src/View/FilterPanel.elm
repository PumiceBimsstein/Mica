module View.FilterPanel exposing (view)

import Filter
import Html exposing (Html, button, div, input, label, span, text)
import Html.Attributes exposing (checked, class, disabled, type_)
import Html.Events exposing (onClick)
import Set
import Types
    exposing
        ( BetweenRelation(..)
        , Dataset
        , FieldConfig
        , FilterUiState
        , Model
        , Msg(..)
        , FilterMsg(..)
        , WithinRelation(..)
        , SearchState
        )


view : Model -> Dataset -> Html Msg
view model dataset =
    let
        orderedFields =
            Filter.orderedFilterableFields dataset

        total =
            List.length orderedFields
    in
    if List.isEmpty orderedFields then
        div [ class "text-sm text-neutral-400" ] [ text "フィルター可能なフィールドがありません" ]

    else
        div [ class "flex flex-col gap-2" ]
            (List.indexedMap (\i field -> filterBlock model dataset i total field) orderedFields)


filterBlock : Model -> Dataset -> Int -> Int -> FieldConfig -> Html Msg
filterBlock model dataset index total field =
    let
        ui =
            Filter.filterUiFor field.key model.filterUi
    in
    div [ class "border border-neutral-200 rounded-md bg-white" ]
        [ filterHeader field ui index total
        , if ui.collapsed then
            text ""

          else
            optionListWithActiveFilters model dataset field ui
        ]



-- ヘッダー：並べ替え・折り畳み・関係設定（ポップアップ）をまとめて配置


filterHeader : FieldConfig -> FilterUiState -> Int -> Int -> Html Msg
filterHeader field ui index total =
    div [ class "relative flex items-center gap-1 px-2 py-1.5" ]
        [ moveFilterButtons field index total
        , button
            [ class "flex-1 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded px-1"
            , onClick (FilterMsg (ToggleCollapsed field.key))
            ]
            [ text field.label ]
        , relationPopupTrigger field ui
        , collapseIndicator field ui
        ]


collapseIndicator : FieldConfig -> FilterUiState -> Html Msg
collapseIndicator field ui =
    button
        [ class "text-neutral-400 text-xs px-1"
        , onClick (FilterMsg (ToggleCollapsed field.key))
        ]
        [ text
            (if ui.collapsed then
                "▸"

             else
                "▾"
            )
        ]


moveFilterButtons : FieldConfig -> Int -> Int -> Html Msg
moveFilterButtons field index total =
    div [ class "flex gap-0.5" ]
        [ moveButton field.key (\key -> FilterMsg (MoveUp key)) (index > 0) "↑"
        , moveButton field.key (\key -> FilterMsg (MoveDown key)) (index < total - 1) "↓"
        ]


moveButton : String -> (String -> Msg) -> Bool -> String -> Html Msg
moveButton key toMsg enabled label_ =
    button
        [ class (moveButtonClasses enabled)
        , onClick (toMsg key)
        , disabled (not enabled)
        ]
        [ text label_ ]


moveButtonClasses : Bool -> String
moveButtonClasses enabled =
    if enabled then
        "px-1.5 py-0.5 text-xs rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-100"

    else
        "px-1.5 py-0.5 text-xs rounded border border-neutral-100 text-neutral-300 cursor-not-allowed"



-- 関係設定（他のフィルターとの関係・選択肢同士の関係）を一つのポップアップにまとめる


-- relationPopupTrigger : FieldConfig -> FilterUiState -> Html Msg
-- relationPopupTrigger field ui =
--     div [ class "relative" ]
--         [ button
--             [ class relationBadgeClasses
--             , onClick (FilterMsg (ToggleRelationPopup field.key))
--             ]
--             [ text "関係" ]
--         , if ui.relationPopupOpen then
--             relationPopup field ui

--           else
--             text ""
--         ]

relationPopupTrigger : FieldConfig -> FilterUiState -> Html Msg
relationPopupTrigger field ui =
    div [ class "relative" ]
        [ button
            [ class relationBadgeClasses
            , onClick (FilterMsg (ToggleRelationPopup field.key))
            ]
            [ text "関係" ]
        , if ui.relationPopupOpen then
            div []
                [ -- 画面全体を覆う暗いオーバーレイ（背景の操作を禁止し、クリックで閉じる）
                  div
                    [ class "fixed inset-0 bg-black/15 z-40"
                    , onClick (FilterMsg (ToggleRelationPopup field.key))
                    ]
                    []
                , relationPopup field ui
                ]

          else
            text ""
        ]

relationPopup : FieldConfig -> FilterUiState -> Html Msg
relationPopup field ui =
    div [ class popupClasses ]
        [ popupSectionLabel "他のフィルターとの関係"
        , div [ class popupOptionRowClasses ]
            [ popupOption (ui.betweenRelation == RelAnd) (FilterMsg (SetBetweenRelation field.key RelAnd)) "AND"
            , popupOption (ui.betweenRelation == RelOr) (FilterMsg (SetBetweenRelation field.key RelOr)) "OR"
            , popupOption (ui.betweenRelation == RelNot) (FilterMsg (SetBetweenRelation field.key RelNot)) "NOT"
            ]
        , popupSectionLabel "選択肢同士の関係"
        , div [ class popupOptionRowClasses ]
            [ popupOption (ui.withinRelation == WithinAnd) (FilterMsg (SetWithinRelation field.key WithinAnd)) "AND"
            , popupOption (ui.withinRelation == WithinOr) (FilterMsg (SetWithinRelation field.key WithinOr)) "OR"
            ]
        ]


popupSectionLabel : String -> Html Msg
popupSectionLabel labelText =
    div [ class "text-[11px] text-neutral-400 px-1 pt-1" ] [ text labelText ]


popupOption : Bool -> Msg -> String -> Html Msg
popupOption isActive msg label_ =
    button
        [ class (popupOptionClasses isActive), onClick msg ]
        [ text label_ ]


relationBadgeClasses : String
relationBadgeClasses =
    "shrink-0 px-2 py-0.5 text-xs rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-100"


-- popupClasses : String
-- popupClasses =
--     "absolute z-10 top-full right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-md flex flex-col p-1 gap-0.5 min-w-[8rem]"
popupClasses : String
popupClasses =
    "absolute z-50 top-full right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-md flex flex-col p-1 gap-0.5 min-w-[8rem]"

popupOptionRowClasses : String
popupOptionRowClasses =
    "flex gap-0.5 px-1 pb-1"


popupOptionClasses : Bool -> String
popupOptionClasses isActive =
    if isActive then
        "flex-1 px-2 py-1 text-xs rounded bg-neutral-900 text-white"

    else
        "flex-1 px-2 py-1 text-xs rounded text-neutral-600 hover:bg-neutral-100"



-- 選択肢一覧


optionListWithActiveFilters : Model -> Dataset -> FieldConfig -> FilterUiState -> Html Msg
optionListWithActiveFilters model dataset field ui =
    let
        rawOptions =
            Filter.optionsForWithActiveFilters model.searchState model.filterUi dataset field

        options =
            if field.isBool then
                rawOptions
                    |> List.map (formatBoolOption field)
                    |> sortBoolOptions

            else
                rawOptions
    in
    div [ class "px-2 pb-2 flex flex-col gap-1 border-t border-neutral-100 pt-2" ]
        (List.map (optionRow field ui) options)


formatBoolOption : FieldConfig -> Filter.FilterOption -> Filter.FilterOption
formatBoolOption field option =
    if option.value == "true" then
        { option | label = Maybe.withDefault "はい" field.trueLabel }

    else if option.value == "false" then
        { option | label = Maybe.withDefault "いいえ" field.falseLabel }

    else
        option


sortBoolOptions : List Filter.FilterOption -> List Filter.FilterOption
sortBoolOptions options =
    List.sortWith
        (\a b ->
            case ( a.value, b.value ) of
                ( "true", "false" ) ->
                    LT

                ( "false", "true" ) ->
                    GT

                _ ->
                    EQ
        )
        options



optionRow : FieldConfig -> FilterUiState -> Filter.FilterOption -> Html Msg
optionRow field ui option =
    label [ class "flex items-center gap-2 text-sm text-neutral-700" ]
        [ input
            [ type_ "checkbox"
            , checked (Set.member option.value ui.selected)
            , onClick (FilterMsg (ToggleOption field.key option.value))
            ]
            []
        , span [ class "flex-1" ] [ text option.label ]
        , span [ class "text-neutral-400 text-xs" ] [ text ("(" ++ String.fromInt option.count ++ ")") ]
        ]

