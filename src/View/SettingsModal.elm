module View.SettingsModal exposing (view)

import Dict
import Html exposing (Html, button, div, h2, input, label, option, select, span, text)
import Html.Attributes exposing (checked, class, disabled, placeholder, selected, type_, value)
import Html.Events exposing (onClick, onInput)
import Types exposing
    ( Dataset
    , DisplayRole(..)
    , FieldConfig
    , FieldSettingsMsg(..)
    , Model
    , Msg(..)
    , Value(..)
    )


view : Model -> Html Msg
view model =
    if model.settingsModalOpen then
        overlay model.dataset

    else
        text ""


overlay : Dataset -> Html Msg
overlay dataset =
    div [ class "fixed inset-0 flex items-center justify-center z-50" ]
        [ -- 背景レイヤー（範囲外クリックでモーダルを閉じる）
          div
            [ class "absolute inset-0 bg-black/30"
            , onClick (ToggleSettingsModal False)
            ]
            []
        , -- パネル本体（背景の上に重なる兄弟要素）
          div [ class "relative bg-white rounded-md shadow-lg w-[36rem] max-h-[80vh] overflow-y-auto p-5 flex flex-col gap-4 z-10" ]
            [ header
            , fieldList dataset
            , linkFieldSection dataset
            ]
        ]

overlayClasses : String
overlayClasses =
    "fixed inset-0 bg-black/30 flex items-center justify-center z-50"


panelClasses : String
panelClasses =
    "bg-white rounded-md shadow-lg w-[36rem] max-h-[80vh] overflow-y-auto p-5 flex flex-col gap-4"


header : Html Msg
header =
    div [ class "flex items-center justify-between" ]
        [ h2 [ class "text-base font-semibold text-neutral-900" ] [ text "設定" ]
        , button
            [ class "text-sm text-neutral-400 hover:text-neutral-700"
            , onClick (ToggleSettingsModal False)
            ]
            [ text "閉じる" ]
        ]



-- フィールド一覧


fieldList : Dataset -> Html Msg
fieldList dataset =
    let
        total =
            List.length dataset.fields
    in
    div [ class "flex flex-col gap-2" ]
        (List.indexedMap (\i field -> fieldRow total i dataset field) dataset.fields)


fieldRow : Int -> Int -> Dataset -> FieldConfig -> Html Msg
fieldRow total index dataset field =
    div [ class "border border-neutral-200 rounded-md p-2 flex flex-col gap-2" ]
        [ div [ class "flex items-center gap-2" ]
            [ moveButtons field index total
            , labelInput field
            ]
        , div [ class "flex items-center justify-between flex-wrap gap-2" ]
            [ displayRoleButtons field
            , div [ class "flex items-center gap-3" ]
                [ showOnCardCheckbox field
                --, filterableCheckbox field
                ]
            ]
        , booleanDisplayConfig dataset field
        ]


booleanDisplayConfig : Dataset -> FieldConfig -> Html Msg
booleanDisplayConfig dataset field =
    if isBoolField dataset field then
        div [ class boolConfigClasses ]
            [ trueLabelInput field
            , falseLabelInput field
            ]

    else
        text ""


boolConfigClasses : String
boolConfigClasses =
    "self-end flex items-center gap-4 bg-neutral-50 p-2 rounded border border-neutral-100 text-xs mt-1"


trueLabelInput : FieldConfig -> Html Msg
trueLabelInput field =
    div [ class "flex items-center gap-2" ]
        [ span [ class "text-neutral-500" ] [ text "True表記" ]
        , input
            [ class boolInputClasses
            , value (Maybe.withDefault "はい" field.trueLabel)
            , placeholder "はい"
            , onInput (FieldSettingsMsg << SetTrueLabel field.key)
            ]
            []
        ]


falseLabelInput : FieldConfig -> Html Msg
falseLabelInput field =
    div [ class "flex items-center gap-2" ]
        [ span [ class "text-neutral-500" ] [ text "False表記" ]
        , input
            [ class boolInputClasses
            , value (Maybe.withDefault "いいえ" field.falseLabel)
            , placeholder "いいえ"
            , onInput (FieldSettingsMsg << SetFalseLabel field.key)
            ]
            []
        ]


boolInputClasses : String
boolInputClasses =
    "w-20 border border-neutral-200 rounded px-2 py-0.5 text-xs bg-white"


isBoolField : Dataset -> FieldConfig -> Bool
isBoolField dataset field =
    dataset.items
        |> List.filterMap (\item -> Dict.get field.key item.values)
        |> List.any isBooleanValue


isBooleanValue : Value -> Bool
isBooleanValue val =
    case val of
        Boolean _ ->
            True

        _ ->
            False


moveButtons : FieldConfig -> Int -> Int -> Html Msg
moveButtons field index total =
    div [ class "flex gap-1" ]
        [ moveUpButton field.key (index > 0)
        , moveDownButton field.key (index < total - 1)
        ]


moveUpButton : String -> Bool -> Html Msg
moveUpButton key enabled =
    button
        [ class (moveButtonClasses enabled)
        , onClick (FieldSettingsMsg (MoveFieldUp key))
        , disabled (not enabled)
        ]
        [ text "↑" ]


moveDownButton : String -> Bool -> Html Msg
moveDownButton key enabled =
    button
        [ class (moveButtonClasses enabled)
        , onClick (FieldSettingsMsg (MoveFieldDown key))
        , disabled (not enabled)
        ]
        [ text "↓" ]


moveButtonClasses : Bool -> String
moveButtonClasses enabled =
    if enabled then
        "px-2 py-0.5 text-xs rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-100"

    else
        "px-2 py-0.5 text-xs rounded border border-neutral-100 text-neutral-300 cursor-not-allowed"


labelInput : FieldConfig -> Html Msg
labelInput field =
    div [ class "flex-1 flex items-center gap-2" ]
        [ span [ class "text-xs text-neutral-400 shrink-0" ] [ text field.key ]
        , input
            [ class inputClasses
            , value field.label
            , onInput (FieldSettingsMsg << SetLabel field.key)
            ]
            []
        ]


displayRoleButtons : FieldConfig -> Html Msg
displayRoleButtons field =
    div [ class "flex gap-1" ]
        [ displayRoleButton field PlainText "通常"
        , displayRoleButton field Title "タイトル"
        , displayRoleButton field Image "画像"
        , displayRoleButton field Link "リンク"
        ]


displayRoleButton : FieldConfig -> DisplayRole -> String -> Html Msg
displayRoleButton field target label_ =
    button
        [ class (toggleButtonClasses (field.displayRole == target))
        , onClick (FieldSettingsMsg (SetDisplayRole field.key target))
        ]
        [ text label_ ]


toggleButtonClasses : Bool -> String
toggleButtonClasses isActive =
    if isActive then
        "px-2 py-0.5 text-xs rounded bg-neutral-900 text-white"

    else
        "px-2 py-0.5 text-xs rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-100"


showOnCardCheckbox : FieldConfig -> Html Msg
showOnCardCheckbox field =
    checkboxField field.key "カードに表示" field.showOnCard (SetShowOnCard field.key)


-- filterableCheckbox : FieldConfig -> Html Msg
-- filterableCheckbox field =
--     checkboxField field.key "フィルター" field.filterable (SetFilterable field.key)


checkboxField : String -> String -> Bool -> (Bool -> FieldSettingsMsg) -> Html Msg
checkboxField _ labelText current toMsg =
    label [ class "flex items-center gap-1 text-sm text-neutral-600" ]
        [ input
            [ type_ "checkbox"
            , checked current
            , onClick (FieldSettingsMsg (toMsg (not current)))
            ]
            []
        , text labelText
        ]


inputClasses : String
inputClasses =
    "flex-1 border border-neutral-200 rounded px-2 py-1 text-sm"



-- リンク先フィールド


linkFieldSection : Dataset -> Html Msg
linkFieldSection dataset =
    div [ class "flex flex-col gap-2 border-t border-neutral-100 pt-4" ]
        [ sectionTitle "リンク先フィールド"
        , imageLinkSelector dataset
        , titleLinkSelector dataset
        ]


imageLinkSelector : Dataset -> Html Msg
imageLinkSelector dataset =
    linkFieldSelector "画像クリック時" dataset.fields dataset.imageLinkField SetImageLinkField


titleLinkSelector : Dataset -> Html Msg
titleLinkSelector dataset =
    linkFieldSelector "タイトルクリック時" dataset.fields dataset.titleLinkField SetTitleLinkField


linkFieldSelector : String -> List FieldConfig -> Maybe String -> (Maybe String -> FieldSettingsMsg) -> Html Msg
linkFieldSelector labelText fields current toMsg =
    div [ class "flex items-center gap-2 text-sm" ]
        [ span [ class "w-28 shrink-0 text-neutral-600" ] [ text labelText ]
        , select
            [ class inputClasses
            , onInput (\s -> FieldSettingsMsg (toMsg (stringToMaybe s)))
            ]
            (option [ value "", selected (current == Nothing) ] [ text "なし" ]
                :: List.map (fieldOption current) fields
            )
        ]


fieldOption : Maybe String -> FieldConfig -> Html Msg
fieldOption current field =
    option [ value field.key, selected (current == Just field.key) ] [ text field.label ]


stringToMaybe : String -> Maybe String
stringToMaybe s =
    if String.isEmpty s then
        Nothing

    else
        Just s


sectionTitle : String -> Html Msg
sectionTitle labelText =
    div [ class "text-xs font-medium text-neutral-400" ] [ text labelText ]