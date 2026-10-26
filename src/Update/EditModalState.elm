module Update.EditModalState exposing
    ( addNewFieldToState
    , confirmTextListField
    , defaultNewFieldForm
    , setBooleanField
    , setNewFieldBool
    , setNewFieldName
    , setNewFieldType
    , setNewFieldValue
    , setTextField
    , setTextListField
    , setTextListItem
    , setTextListItemSize
    , setTextSize
    , toggleAddFieldForm
    )

import Dict
import Types
    exposing
        ( DisplayRole(..)
        , EditModalState
        , EditingFieldValue(..)
        , FieldConfig
        , NewFieldForm
        , NewFieldType(..)
        )


-- 指定キーの EditingFieldValue を安全に更新するヘルパー

updateField : String -> EditingFieldValue -> (EditingFieldValue -> EditingFieldValue) -> EditModalState -> EditModalState
updateField fieldKey defaultValue transform editState =
    let
        updater maybeValue =
            case maybeValue of
                Just value ->
                    Just (transform value)

                Nothing ->
                    Just (transform defaultValue)
    in
    { editState | editingValues = Dict.update fieldKey updater editState.editingValues }


-- テキスト入力値の更新（テキストフィールド専用）
setTextField : String -> String -> EditModalState -> EditModalState
setTextField fieldKey newValue =
    updateField fieldKey (EditingText "" { width = 0, height = 0 })
        (\fieldValue ->
            case fieldValue of
                EditingText _ size ->
                    EditingText newValue size

                other ->
                    other
        )


-- テキストリスト入力値の更新（ユーザー入力時、rawInputのみ更新）
setTextListField : String -> String -> EditModalState -> EditModalState
setTextListField fieldKey newValue =
    updateField fieldKey (EditingTextList { rawInput = "", items = [] })
        (\fieldValue ->
            case fieldValue of
                EditingTextList state ->
                    EditingTextList { state | rawInput = newValue }

                other ->
                    other
        )


-- テキストリスト入力値の確定（rawInputをパースしてitemsを更新）
confirmTextListField : String -> EditModalState -> EditModalState
confirmTextListField fieldKey =
    updateField fieldKey (EditingTextList { rawInput = "", items = [] })
        (\fieldValue ->
            case fieldValue of
                EditingTextList state ->
                    EditingTextList { state | items = parseCommaSeparatedText state.rawInput }

                other ->
                    other
        )


parseCommaSeparatedText : String -> List Types.TextListItemState
parseCommaSeparatedText rawInput =
    rawInput
        |> String.split ","
        |> List.map String.trim
        |> List.filter (not << String.isEmpty)
        |> List.map (\val -> { value = val, size = { width = 0, height = 0 } })

-- テキストエリアサイズの更新
setTextSize : String -> Int -> Int -> EditModalState -> EditModalState
setTextSize fieldKey width height =
    updateField fieldKey (EditingText "" { width = width, height = height })
        (\fieldValue ->
            case fieldValue of
                EditingText content _ ->
                    EditingText content { width = width, height = height }

                other ->
                    other
        )


-- テキストリスト項目値の更新（インデックス指定）

setTextListItem : String -> Int -> String -> EditModalState -> EditModalState
setTextListItem fieldKey index newValue =
    updateField fieldKey (EditingTextList { rawInput = "", items = [] })
        (\fieldValue ->
            case fieldValue of
                EditingTextList state ->
                    let
                        updatedItems =
                            List.indexedMap
                                (\i item ->
                                    if i == index then
                                        { item | value = newValue }

                                    else
                                        item
                                )
                                state.items
                    in
                    EditingTextList { state | items = updatedItems }

                other ->
                    other
        )


-- テキストリスト項目サイズの更新（インデックス指定）
setTextListItemSize : String -> Int -> Int -> Int -> EditModalState -> EditModalState
setTextListItemSize fieldKey index width height =
    updateField fieldKey (EditingTextList { rawInput = "", items = [] })
        (\fieldValue ->
            case fieldValue of
                EditingTextList state ->
                    let
                        updatedItems =
                            List.indexedMap
                                (\i item ->
                                    if i == index then
                                        { item | size = { width = width, height = height } }

                                    else
                                        item
                                )
                                state.items
                    in
                    EditingTextList { state | items = updatedItems }

                other ->
                    other
        )

-- チェックボックス値の更新
setBooleanField : String -> Bool -> EditModalState -> EditModalState
setBooleanField fieldKey newValue =
    updateField fieldKey (EditingBoolean False)
        (\fieldValue ->
            case fieldValue of
                EditingBoolean _ ->
                    EditingBoolean newValue

                other ->
                    other
        )

-- MARK:新規項目追加

defaultNewFieldForm : NewFieldForm
defaultNewFieldForm =
    { name = ""
    , fieldType = NewFieldString
    , stringValue = ""
    , boolValue = False
    }


toggleAddFieldForm : EditModalState -> EditModalState
toggleAddFieldForm state =
    { state | isAddingField = not state.isAddingField }


setNewFieldName : String -> EditModalState -> EditModalState
setNewFieldName name state =
    let
        form =
            state.newFieldForm
    in
    { state | newFieldForm = { form | name = name } }


setNewFieldType : NewFieldType -> EditModalState -> EditModalState
setNewFieldType fieldType state =
    let
        form =
            state.newFieldForm
    in
    { state | newFieldForm = { form | fieldType = fieldType } }


setNewFieldValue : String -> EditModalState -> EditModalState
setNewFieldValue val state =
    let
        form =
            state.newFieldForm
    in
    { state | newFieldForm = { form | stringValue = val } }


setNewFieldBool : Bool -> EditModalState -> EditModalState
setNewFieldBool val state =
    let
        form =
            state.newFieldForm
    in
    { state | newFieldForm = { form | boolValue = val } }

addNewFieldToState : EditModalState -> EditModalState
addNewFieldToState state =
    let
        trimmedName =
            String.trim state.newFieldForm.name

        alreadyExists =
            List.any (\f -> f.key == trimmedName) state.fields
    in
    if String.isEmpty trimmedName || alreadyExists then
        state

    else
        let
            isBool =
                state.newFieldForm.fieldType == NewFieldBoolean

            newField : FieldConfig
            newField =
                { key = trimmedName
                , label = trimmedName
                , displayRole = PlainText
                , showOnCard = True
                , filterable = False
                , isBool = isBool
                , isTextList = False
                , trueLabel =
                    if isBool then
                        Just "はい"

                    else
                        Nothing
                , falseLabel =
                    if isBool then
                        Just "いいえ"

                    else
                        Nothing
                }

            newEditingValue =
                if isBool then
                    EditingBoolean state.newFieldForm.boolValue

                else
                    EditingText state.newFieldForm.stringValue { width = 536, height = 50 }
        in
        { state
            | fields = state.fields ++ [ newField ]
            , editingValues = Dict.insert trimmedName newEditingValue state.editingValues
            , newFieldForm = defaultNewFieldForm
            , isAddingField = False
        }
