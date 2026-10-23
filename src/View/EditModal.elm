module View.EditModal exposing (view)

import Dict
import Html exposing (Html, button, div, h2, input, label, span, text, textarea)
import Html.Attributes exposing (checked, class, type_, value)
import Html.Events exposing (onClick, onInput)
import ItemAccess exposing (getValue)
import Types exposing (EditModalMsg(..), EditModalState, EditingFieldValue(..), FieldConfig, Item, Model, Msg(..), Value(..))


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
        dataset =
            model.dataset

        isNewItem =
            not (List.any (\item -> item.id == editState.editingItemId) dataset.items)
    in
    div [ class "fixed inset-0 flex items-center justify-center z-60 p-4" ]
        [ -- 画面全体を覆う背景（クリックで保存して閉じる）
          div
            [ class "absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            , onClick (EditModalMsg Confirm)
            ]
            []
        , -- パネル本体
          div [ class "relative bg-white rounded-xl shadow-xl border border-neutral-200/80 w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col z-10" ]
            [ header editState model
            , formContent editState model
            , footer isNewItem
            ]
        ]


header : EditModalState -> Model -> Html Msg
header editState model =
    let
        dataset =
            model.dataset

        isNewItem =
            not (List.any (\item -> item.id == editState.editingItemId) dataset.items)

        title =
            if isNewItem then
                "新規作成"

            else
                "アイテムを編集"
    in
    div [ class "px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/50" ]
        [ h2 [ class "text-base font-bold text-neutral-800" ] [ text title ]
        , button
            [ class "text-neutral-400 hover:text-neutral-700 p-1 text-base rounded-md transition leading-none cursor-pointer"
            , onClick (EditModalMsg Close)
            ]
            [ text "✕" ]
        ]


formContent : EditModalState -> Model -> Html Msg
formContent editState model =
    div [ class "px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4" ]
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
    div [ class "flex flex-col gap-1.5" ]
        [ label [ class "text-xs font-semibold text-neutral-600" ] [ text field.label ]
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
    textarea
        [ class textareaClasses
        , value content
        , onInput (EditModalMsg << TextFieldChanged fieldKey)
        , Html.Attributes.rows 1
        ]
        []


textListFieldEditor : String -> Types.EditingTextListState -> Html Msg
textListFieldEditor fieldKey state =
    textarea
        [ class textareaClasses
        , value state.rawInput
        , onInput (EditModalMsg << TextListFieldChanged fieldKey)
        , Html.Attributes.rows 1
        ]
        []


booleanFieldEditor : FieldConfig -> Bool -> Html Msg
booleanFieldEditor field isChecked =
    let
        label_ =
            Maybe.withDefault "はい" field.trueLabel
    in
    label [ class "flex items-center gap-2 text-sm cursor-pointer select-none py-1" ]
        [ input
            [ type_ "checkbox"
            , class "w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
            , checked isChecked
            , onClick (EditModalMsg (BooleanFieldChanged field.key (not isChecked)))
            ]
            []
        , span [ class "text-neutral-700" ] [ text label_ ]
        ]


footer : Bool -> Html Msg
footer isNewItem =
    div [ class "px-6 py-4 border-t border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/30" ]
        [ if isNewItem then
            div [] []

          else
            button
                [ class deleteButtonClasses
                , onClick (EditModalMsg DeleteItem)
                ]
                [ text "このカードを削除" ]
        , div [ class "flex items-center gap-2 ml-auto" ]
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


-- MARK: クラス定義


textareaClasses : String
textareaClasses =
    "w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-white text-neutral-900 min-h-[38px] transition focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"


cancelButtonClasses : String
cancelButtonClasses =
    "px-3.5 py-1.5 text-xs font-medium rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer"


saveButtonClasses : String
saveButtonClasses =
    "px-4 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs transition cursor-pointer"


deleteButtonClasses : String
deleteButtonClasses =
    "px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"