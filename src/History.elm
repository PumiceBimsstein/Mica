module History exposing (applySnapshot, canUndo, pop, push, snapshotOf)

{-| Undo用の履歴スタック。datasets / selectedDatasetId だけを対象とする、
副作用のない純粋な操作のみを提供する。
カード編集（今後実装）でも、1回の編集確定ごとにpushする想定。
-}

import Types exposing (Model, Snapshot)


{-| 保持する履歴の最大件数。無制限に積み上がらないよう上限を設ける。
-}
maxSize : Int
maxSize =
    20


snapshotOf : Model -> Snapshot
snapshotOf model =
    { dataset = model.dataset }


push : Model -> List Snapshot -> List Snapshot
push model stack =
    (snapshotOf model :: stack) |> List.take maxSize


pop : List Snapshot -> Maybe ( Snapshot, List Snapshot )
pop stack =
    case stack of
        top :: rest ->
            Just ( top, rest )

        [] ->
            Nothing


applySnapshot : Snapshot -> Model -> Model
applySnapshot snapshot model =
    { model | dataset = snapshot.dataset }


canUndo : Model -> Bool
canUndo model =
    not (List.isEmpty model.history)
