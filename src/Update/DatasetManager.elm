module Update.DatasetManager exposing
    ( closeRenameModal
    , confirmRenameDataset
    , openRenameModal
    , updateRenameModalName
    )

import History
import Types exposing (Dataset, Model)


recordHistory : Model -> Model -> Model
recordHistory snapshot model =
    { model | history = History.push snapshot model.history }


openRenameModal : Model -> Model
openRenameModal model =
    { model | renameModal = Just { datasetId = model.dataset.id, name = model.dataset.name } }


updateRenameModalName : String -> Model -> Model
updateRenameModalName name model =
    { model | renameModal = Maybe.map (\state -> { state | name = name }) model.renameModal }


closeRenameModal : Model -> Model
closeRenameModal model =
    { model | renameModal = Nothing }


confirmRenameDataset : Model -> Model
confirmRenameDataset model =
    model.renameModal
        |> Maybe.map (applyRenameAndRecord model)
        |> Maybe.withDefault model


applyRenameAndRecord : Model -> Types.DatasetRenameState -> Model
applyRenameAndRecord model renameState =
    model
        |> recordHistory model
        |> applyDatasetRename renameState
        |> closeRenameModal

applyDatasetRename : Types.DatasetRenameState -> Model -> Model
applyDatasetRename renameState model =
    let
        oldDataset =
            model.dataset

        updatedDataset =
            { oldDataset | name = renameState.name }
    in
    { model | dataset = updatedDataset }
