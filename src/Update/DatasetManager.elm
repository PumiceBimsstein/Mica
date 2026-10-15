module Update.DatasetManager exposing
    ( closeRenameModal
    , confirmRenameDataset
    , deleteDataset
    , openRenameModal
    , selectDataset
    , updateRenameModalName
    )

import History
import Types exposing (Dataset, Model)


selectDataset : String -> Model -> Model
selectDataset id model =
    { model | selectedDatasetId = id, fileModalOpen = False }


deleteDataset : String -> Model -> Model
deleteDataset id model =
    model
        |> recordHistory model
        |> removeDataset id


recordHistory : Model -> Model -> Model
recordHistory snapshot model =
    { model | history = History.push snapshot model.history }


removeDataset : String -> Model -> Model
removeDataset id model =
    filterRemainingDatasets id model.datasets
        |> updateDatasetsAfterDelete id model


filterRemainingDatasets : String -> List Dataset -> List Dataset
filterRemainingDatasets targetId datasets =
    List.filter (isNotDatasetId targetId) datasets


isNotDatasetId : String -> Dataset -> Bool
isNotDatasetId targetId dataset =
    dataset.id /= targetId


updateDatasetsAfterDelete : String -> Model -> List Dataset -> Model
updateDatasetsAfterDelete deletedId model remaining =
    { model
        | datasets = remaining
        , selectedDatasetId = nextSelectedId deletedId model.selectedDatasetId remaining
    }


nextSelectedId : String -> String -> List Dataset -> String
nextSelectedId deletedId currentSelected remaining =
    if deletedId == currentSelected then
        fallbackSelectedId remaining

    else
        currentSelected


fallbackSelectedId : List Dataset -> String
fallbackSelectedId remaining =
    remaining
        |> List.head
        |> Maybe.map .id
        |> Maybe.withDefault ""


openRenameModal : String -> Model -> Model
openRenameModal datasetId model =
    findDatasetById datasetId model.datasets
        |> Maybe.map (setRenameModalState model)
        |> Maybe.withDefault model


findDatasetById : String -> List Dataset -> Maybe Dataset
findDatasetById datasetId datasets =
    datasets
        |> List.filter (isDatasetId datasetId)
        |> List.head


isDatasetId : String -> Dataset -> Bool
isDatasetId targetId dataset =
    dataset.id == targetId


setRenameModalState : Model -> Dataset -> Model
setRenameModalState model dataset =
    { model | renameModal = Just { datasetId = dataset.id, name = dataset.name } }


updateRenameModalName : String -> Model -> Model
updateRenameModalName name model =
    { model | renameModal = Maybe.map (updateStateName name) model.renameModal }


updateStateName : String -> { datasetId : String, name : String } -> { datasetId : String, name : String }
updateStateName newName state =
    { state | name = newName }


closeRenameModal : Model -> Model
closeRenameModal model =
    { model | renameModal = Nothing }


confirmRenameDataset : Model -> Model
confirmRenameDataset model =
    model.renameModal
        |> Maybe.map (applyRenameAndRecord model)
        |> Maybe.withDefault model


applyRenameAndRecord : Model -> { datasetId : String, name : String } -> Model
applyRenameAndRecord model renameState =
    model
        |> recordHistory model
        |> applyDatasetRename renameState
        |> closeRenameModal


applyDatasetRename : { datasetId : String, name : String } -> Model -> Model
applyDatasetRename renameState model =
    { model | datasets = List.map (renameIfMatch renameState) model.datasets }


renameIfMatch : { datasetId : String, name : String } -> Dataset -> Dataset
renameIfMatch renameState dataset =
    if dataset.id == renameState.datasetId then
        { dataset | name = renameState.name }

    else
        dataset