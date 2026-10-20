module View.EditModal exposing (view)

import Dict
import Html exposing (Html, button, div, h2, input, label, span, text, textarea)
import Html.Attributes exposing (checked, class, type_, value)
import Html.Events exposing (onClick, onInput, stopPropagationOn)
import Json.Decode as Decode
import ItemAccess exposing (getValue)
import Types exposing (Dataset, EditModalMsg(..), EditModalState, EditingFieldValue(..), FieldConfig, Item, Model, Msg(..), TextListItemState, Value(..))


view : Model -> Html Msg
view model =
    if model.editModalOpen then
        case model.editModal of
            Just editState ->
                overlay editState model

            Nothing ->
                text ""

    else
        text ""


overlay : EditModalState -> Model -> Html Msg
overlay editState model =
    let
        dataset = model.dataset
        isNewItem =
            not (List.any (\item -> item.id == editState.editingItemId) dataset.items)

    in
    div [ class "fixed inset-0 flex items-center justify-center z-50" ]
        [ -- 画面全体を覆う背景（クリックで保存して閉じる）
          div
            [ class "absolute inset-0 bg-black/15"
            , onClick (EditModalMsg Confirm)
            ]
            []
        , -- パネル本体（背景の上に重なる兄弟要素）
          div [ class "relative bg-white rounded-lg border border-neutral-200 w-[36rem] max-h-[80vh] overflow-y-auto flex flex-col z-10" ]
            [ header editState model
            , formContent editState model
            , footer isNewItem
            ]
        ]


overlayClasses : String
overlayClasses =
    "fixed inset-0 bg-black/15 flex items-center justify-center z-50"


panelClasses : String
panelClasses =
    "bg-white rounded-lg border border-neutral-200 w-[36rem] max-h-[80vh] overflow-y-auto flex flex-col"


header : EditModalState -> Model -> Html Msg
header editState model =
    let
        dataset = model.dataset
        isNewItem =
            not (List.any (\item -> item.id == editState.editingItemId) dataset.items)

        title =
            if isNewItem then
                "新規作成"

            else
                "アイテムを編集"
    in
    div [ class headerClasses ]
        [ h2 [ class headerTitleClasses ] [ text title ]
        , button [ class headerCloseClasses, onClick (EditModalMsg Close)] [ text "×" ]
        ]

headerClasses : String
headerClasses =
    "px-5 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0"

headerTitleClasses : String
headerTitleClasses =
    "text-lg font-medium text-neutral-900"

headerCloseClasses : String
headerCloseClasses =
    "text-neutral-400 hover:text-neutral-600 text-xl leading-none"

formContent : EditModalState -> Model -> Html Msg
formContent editState model =
    div [ class "px-5 py-4 flex-1 overflow-y-auto flex flex-col gap-5" ]
        (List.map (fieldForm editState model) (getFieldsForEdit editState model))


getFieldsForEdit : EditModalState -> Model -> List FieldConfig
getFieldsForEdit editState model =
    case findItem editState.editingItemId model of
        Just _ ->
            model.dataset.fields

        Nothing ->
            []


findItem : String -> Model -> Maybe Item
findItem itemId model =
    model.dataset.items
        |> List.filter (\item -> item.id == itemId)
        |> List.head


fieldForm : EditModalState -> Model -> FieldConfig -> Html Msg
fieldForm editState model field =
    div [ class "flex flex-col gap-2" ]
        [ label [ class "text-sm font-medium text-neutral-900" ] [ text field.label ]
        , case Dict.get field.key editState.editingValues of
            Just (EditingText content size) ->
                textFieldEditor field.key content size

            Just (EditingTextList state) ->
                textListFieldEditor field.key state

            Just (EditingBoolean checked_) ->
                booleanFieldEditor field checked_

            Nothing ->
                let
                    maybeItem =
                        findItem editState.editingItemId model
                in
                case maybeItem |> Maybe.andThen (\item -> getValue field.key item) of
                    Just (Text content) ->
                        if field.isTextList then
                            let
                                state =
                                    { rawInput = content
                                    , items = [ { value = content, size = { width = 0, height = 0 } } ]
                                    }
                            in
                            textListFieldEditor field.key state

                        else
                            textFieldEditor field.key content { width = 0, height = 0 }

                    Just (TextList items) ->
                        let
                            state =
                                { rawInput = String.join ", " items
                                , items = List.map (\val -> { value = val, size = { width = 0, height = 0 } }) items
                                }
                        in
                        textListFieldEditor field.key state

                    Just (Boolean checked_) ->
                        booleanFieldEditor field checked_

                    Nothing ->
                        if field.isBool then
                            booleanFieldEditor field False

                        else if field.isTextList then
                            textListFieldEditor field.key { rawInput = "", items = [] }

                        else
                            textFieldEditor field.key "" { width = 0, height = 0 }
        ]


textFieldEditor : String -> String -> { width : Int, height : Int } -> Html Msg
textFieldEditor fieldKey content _ =
    div [ class "flex flex-col gap-1" ]
        [ textarea
            [ class textareaClasses
            , value content
            , onInput (EditModalMsg << TextFieldChanged fieldKey)
            , Html.Attributes.rows 1
            ]
            []
        ]


textareaClasses : String
textareaClasses =
    "border border-neutral-200 rounded px-3 py-1.5 text-sm font-sans resize bg-white text-neutral-900 min-h-[38px]"


textListFieldEditor : String -> Types.EditingTextListState -> Html Msg
textListFieldEditor fieldKey state =
    div [ class "flex flex-col gap-1" ]
        [ textarea
            [ class textareaClasses
            , value state.rawInput
            , onInput (EditModalMsg << TextListFieldChanged fieldKey)
            , Html.Attributes.rows 1
            ]
            []
        ]


textListItemField : String -> Int -> TextListItemState -> Html Msg
textListItemField fieldKey index item =
    div [ class "flex gap-2" ]
        [ textarea
            ( [ class textareaClasses
              , value item.value
              , onInput (EditModalMsg << TextListItemChanged fieldKey index)
              , Html.Attributes.rows 1
              , Html.Attributes.style "flex" "1"
              ]
                ++ (if item.size.height > 0 then
                        [ Html.Attributes.style "height" (String.fromInt item.size.height ++ "px") ]

                    else
                        []
                   )
            )
            []
        ]



booleanFieldEditor : FieldConfig -> Bool -> Html Msg
booleanFieldEditor field isChecked =
    let
        label_ =
            Maybe.withDefault "はい" field.trueLabel
    in
    label [ class "flex items-center gap-2 text-sm" ]
        [ input
            [ type_ "checkbox"
            , checked isChecked
            , onClick (EditModalMsg (BooleanFieldChanged field.key (not isChecked)))
            ]
            []
        , span [ class "text-neutral-700" ] [ text label_ ]
        ]


footer : Bool -> Html Msg
footer isNewItem =
    div [ class "px-5 py-4 border-t border-neutral-200 flex gap-2 justify-between shrink-0" ]
        [ if isNewItem then
            div [] []

          else
            button
                [ class deleteButtonClasses
                , onClick (EditModalMsg DeleteItem)
                ]
                [ text "このカードを削除" ]
        , div [ class "flex gap-2" ]
            [ button
                [ class cancelButtonClasses
                , onClick (EditModalMsg Cancel)
                ]
                [ text "キャンセル" ]
            , button
                [ class saveButtonClasses
                , onClick (EditModalMsg Confirm)
                ]
                [ text "保存" ]
            ]
        ]


cancelButtonClasses : String
cancelButtonClasses =
    "px-4 py-2 text-sm border border-neutral-200 rounded text-neutral-700 hover:bg-neutral-50"


saveButtonClasses : String
saveButtonClasses =
    "px-4 py-2 text-sm bg-blue-700 text-white rounded hover:bg-blue-800"


deleteButtonClasses : String
deleteButtonClasses =
    "px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-medium"