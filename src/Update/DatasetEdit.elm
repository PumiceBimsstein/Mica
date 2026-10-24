module Update.DatasetEdit exposing (confirmEditItem, deleteEditingItem)

import Dict
import History
import Types exposing (Dataset, EditModalState, Item, Model, EditingFieldValue(..), Value(..))


{-| 現在編集中のアイテムを削除し、Undo履歴を積んでデータセットを更新した Model を返す。
-}
deleteEditingItem : Model -> Model
deleteEditingItem model =
    case getEditingContext model of
        Just ( editState, dataset ) ->
            let
                updatedDataset =
                    removeItemFromDataset editState.editingItemId dataset
            in
            applyDatasetChange model updatedDataset

        Nothing ->
            model


{-| 編集内容をアイテムへ反映し、Undo履歴を積んでデータセットを更新した Model を返す。
-}
confirmEditItem : Model -> Model
confirmEditItem model =
    case getEditingContext model of
        Just ( editState, dataset ) ->
            let
                updatedDataset =
                    saveItemToDataset editState dataset
            in
            applyDatasetChange model updatedDataset

        Nothing ->
            model

-- MARK: ヘルパー関数


getEditingContext : Model -> Maybe ( EditModalState, Dataset )
getEditingContext model =
    model.editModal
        |> Maybe.map (\editState -> ( editState, model.dataset ))


applyDatasetChange : Model -> Dataset -> Model
applyDatasetChange model updatedDataset =
    { model
        | history = History.push model model.history
        , dataset = updatedDataset
    }


removeItemFromDataset : String -> Dataset -> Dataset
removeItemFromDataset itemId dataset =
    { dataset | items = List.filter (\item -> item.id /= itemId) dataset.items }


saveItemToDataset : EditModalState -> Dataset -> Dataset
saveItemToDataset editState dataset =
    let
        updatedItem =
            applyEditingValuesToItem editState

        isNewItem =
            not (List.any (\item -> item.id == editState.editingItemId) dataset.items)

        updatedItems =
            if isNewItem then
                dataset.items ++ [ updatedItem ]

            else
                List.map (updateItemIfMatch editState.editingItemId updatedItem) dataset.items
    in
    { dataset | items = updatedItems }


updateItemIfMatch : String -> Item -> Item -> Item
updateItemIfMatch targetId newItem currentItem =
    if currentItem.id == targetId then
        newItem

    else
        currentItem


applyEditingValuesToItem : EditModalState -> Item
applyEditingValuesToItem editState =
    let
        -- フィールドのキーとコンフィグをMapで管理して、フィールド情報にアクセス可能にする
        fieldConfigMap =
            editState.fields
                |> List.map (\f -> ( f.key, f ))
                |> Dict.fromList

        newValues =
            Dict.map
                (\fieldKey editingValue ->
                    let
                        -- フィールドのisTextListフラグを参照
                        isTextListField =
                            fieldConfigMap
                                |> Dict.get fieldKey
                                |> Maybe.map .isTextList
                                |> Maybe.withDefault False
                    in
                    case editingValue of
                        EditingText text _ ->
                            if isTextListField then
                                -- TextListフィールドの場合、カンマで分割
                                TextList (parseCommaSeparatedText text)
                            else
                                -- 通常のテキストフィールド（タイトル等）の場合、Textのまま
                                Text text

                        EditingTextList state ->
                            -- itemsから値を取り出してTextListに変換
                            TextList (List.map .value state.items)

                        EditingBoolean bool ->
                            Boolean bool
                    )
                editState.editingValues
    in
    Item editState.editingItemId newValues


parseCommaSeparatedText : String -> List String
parseCommaSeparatedText rawInput =
    rawInput
        |> String.split ","
        |> List.map String.trim
        |> List.filter (not << String.isEmpty)