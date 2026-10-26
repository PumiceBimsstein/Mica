module Update.EditModalManager exposing (closeEditModal, openEditModal)

import Dict exposing (Dict)
import Types exposing
    ( Dataset
    , EditModalState
    , EditingFieldValue(..)
    , FieldConfig
    , Item
    , Model
    , TextListItemState
    , Value(..)
    )


openEditModal : String -> Model -> Model
openEditModal itemId model =
    findItemWithDataset itemId model
        |> Maybe.map (activateModalWithItem itemId model)
        |> Maybe.withDefault model


activateModalWithItem : String -> Model -> ( Item, Dataset ) -> Model
activateModalWithItem itemId model ( item, dataset ) =
    activateEditModal itemId item dataset model


activateEditModal : String -> Item -> Dataset -> Model -> Model
activateEditModal itemId item dataset model =
    { model
        | editModalOpen = True
        , editModal = Just (initializeEditModal itemId item dataset)
    }


closeEditModal : Model -> Model
closeEditModal model =
    { model | editModalOpen = False, editModal = Nothing }


findItemWithDataset : String -> Model -> Maybe ( Item, Dataset )
findItemWithDataset itemId model =
    model.dataset
        |> findItemInDataset itemId


findItemInDataset : String -> Dataset -> Maybe ( Item, Dataset )
findItemInDataset itemId dataset =
    findItemById itemId dataset.items
        |> Maybe.map (pairWithDataset dataset)


pairWithDataset : Dataset -> Item -> ( Item, Dataset )
pairWithDataset dataset item =
    ( item, dataset )


findItemById : String -> List Item -> Maybe Item
findItemById itemId items =
    items
        |> List.filter (isMatchingId itemId)
        |> List.head


isMatchingId : String -> Item -> Bool
isMatchingId targetId item =
    item.id == targetId


-- initializeEditModal : String -> Item -> Dataset -> EditModalState
-- initializeEditModal itemId item dataset =
--     { editingItemId = itemId
--     , editingValues = buildEditingValues item dataset.fields
--     , fields = dataset.fields
--     }

initializeEditModal : String -> Item -> Dataset -> EditModalState
initializeEditModal itemId item dataset =
    { editingItemId = itemId
    , editingValues = buildEditingValues item dataset.fields
    , fields = dataset.fields
    , newFieldForm =
        { name = ""
        , fieldType = Types.NewFieldString
        , stringValue = ""
        , boolValue = False
        }
    , isAddingField = False
    }

buildEditingValues : Item -> List FieldConfig -> Dict String EditingFieldValue
buildEditingValues item fields =
    fields
        |> List.map (\field ->
            let
                value =
                    Dict.get field.key item.values
                        |> Maybe.withDefault (defaultValueForField field)
            in
            ( field.key, valueToEditingFieldValue field value )
        )
        |> Dict.fromList


defaultValueForField : FieldConfig -> Value
defaultValueForField field =
    if field.isBool then
        Boolean False

    else if field.isTextList then
        TextList []

    else
        Text ""


valueToEditingFieldValue : FieldConfig -> Value -> EditingFieldValue
valueToEditingFieldValue field value =
    case value of
        Text text ->
            if field.isTextList then
                -- テキストリスト扱いの場合、カンマで分割してEditingTextListStateに変換
                let
                    items =
                        parseCommaSeparatedText text
                in
                EditingTextList { rawInput = text, items = items }

            else
                EditingText text defaultTextSize

        TextList list ->
            let
                items =
                    List.map textToEditingListItem list

                rawInput =
                    String.join ", " list
            in
            EditingTextList { rawInput = rawInput, items = items }

        Boolean bool ->
            EditingBoolean bool


textToEditingListItem : String -> TextListItemState
textToEditingListItem text =
    { value = text, size = defaultTextSize }


parseCommaSeparatedText : String -> List TextListItemState
parseCommaSeparatedText rawInput =
    rawInput
        |> String.split ","
        |> List.map String.trim
        |> List.filter (not << String.isEmpty)
        |> List.map (\val -> { value = val, size = defaultTextSize })


defaultTextSize : { width : Int, height : Int }
defaultTextSize =
    { width = 536, height = 50 }