module Update.ItemManager exposing
    ( createNewItemWithUuid
    , insertNewItem
    )

import DatasetAccess
import Dict exposing (Dict)
import History
import Storage
import Types exposing (Dataset, FieldConfig, Item, Model, Msg, Value(..))


createNewItemWithUuid : String -> Maybe String -> Model -> ( Model, Cmd Msg )
createNewItemWithUuid uuid maybeTopId model =
    DatasetAccess.currentDataset model
        |> Maybe.map (appendItemAndSave uuid maybeTopId model)
        |> Maybe.withDefault ( model, Cmd.none )


appendItemAndSave : String -> Maybe String -> Model -> Dataset -> ( Model, Cmd Msg )
appendItemAndSave uuid maybeTopId model dataset =
    dataset
        |> insertNewItem uuid maybeTopId
        |> updateModelDatasets model
        |> recordHistory model
        |> saveModel


updateModelDatasets : Model -> Dataset -> Model
updateModelDatasets model updatedDataset =
    { model | datasets = DatasetAccess.replaceDataset updatedDataset model.datasets }


recordHistory : Model -> Model -> Model
recordHistory snapshot model =
    { model | history = History.push snapshot model.history }


saveModel : Model -> ( Model, Cmd Msg )
saveModel model =
    ( model, Storage.save model )


insertNewItem : String -> Maybe String -> Dataset -> Dataset
insertNewItem uuid maybeTargetId dataset =
    { dataset | items = placeItem maybeTargetId (buildNewItem uuid dataset) dataset.items }


placeItem : Maybe String -> Item -> List Item -> List Item
placeItem maybeTargetId newItem items =
    case maybeTargetId of
        Just targetId ->
            insertBeforeId targetId newItem items

        Nothing ->
            newItem :: items


insertBeforeId : String -> Item -> List Item -> List Item
insertBeforeId targetId newItem items =
    case items of
        [] ->
            [ newItem ]

        head :: tail ->
            insertAtMatch targetId newItem head tail


insertAtMatch : String -> Item -> Item -> List Item -> List Item
insertAtMatch targetId newItem current items =
    if current.id == targetId then
        newItem :: current :: items

    else
        current :: insertBeforeId targetId newItem items


buildNewItem : String -> Dataset -> Item
buildNewItem uuid dataset =
    { id = uuid
    , values = buildDefaultValues dataset
    }


buildDefaultValues : Dataset -> Dict String Value
buildDefaultValues dataset =
    dataset.fields
        |> List.map (toFieldEntry dataset)
        |> Dict.fromList


toFieldEntry : Dataset -> FieldConfig -> ( String, Value )
toFieldEntry dataset field =
    ( field.key, defaultFieldValue dataset field )


defaultFieldValue : Dataset -> FieldConfig -> Value
defaultFieldValue dataset field =
    if hasAnyBooleanValueInDataset dataset field then
        Boolean False

    else
        Text ""


{-| データセット内のそのフィールドに boolean 値が実在するか確認。
-}
hasAnyBooleanValueInDataset : Dataset -> FieldConfig -> Bool
hasAnyBooleanValueInDataset dataset field =
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