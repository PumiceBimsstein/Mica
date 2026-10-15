module DatasetAccess exposing (currentDataset, reorderItems, replaceDataset)

import Set
import Types exposing (Dataset, Model)


{-| 現在選択中のメインデータを取得する。
selectedDatasetId に一致するものが無い場合（初回起動直後など）は
先頭のデータセットを暫定的に使う。
-}
currentDataset : Model -> Maybe Dataset
currentDataset model =
    case List.filter (\d -> d.id == model.selectedDatasetId) model.datasets of
        found :: _ ->
            Just found

        [] ->
            List.head model.datasets


{-| リスト内の、同じidを持つデータセットを置き換える。
ファイル読み込み・設定変更など、既存データセットを更新するあらゆる場面で使う。
-}
replaceDataset : Dataset -> List Dataset -> List Dataset
replaceDataset updated datasets =
    List.map (replaceIfMatching updated) datasets


replaceIfMatching : Dataset -> Dataset -> Dataset
replaceIfMatching updated existing =
    if existing.id == updated.id then
        updated

    else
        existing


reorderItems : List String -> Dataset -> Dataset
reorderItems orderedIds dataset =
    let
        originalIds =
            List.map .id dataset.items

        orderedIdSet =
            Set.fromList orderedIds

        originalIdSet =
            Set.fromList originalIds

        validLength =
            List.length orderedIds == List.length originalIds

        validIds =
            orderedIdSet == originalIdSet

        noDuplicateIds =
            Set.size orderedIdSet == List.length orderedIds
    in
    if validLength && validIds && noDuplicateIds then
        let
            byId id =
                List.filter (\item -> item.id == id) dataset.items
                    |> List.head

            ordered =
                List.filterMap byId orderedIds
        in
        { dataset | items = ordered }

    else
        dataset

