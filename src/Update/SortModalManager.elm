module Update.SortModalManager exposing
    ( applySortAndClose
    , openSortModal
    )

import DatasetAccess
import History
import Ports
import Storage
import Types exposing (Dataset, Model, Msg)


openSortModal : Model -> ( Model, Cmd Msg )
openSortModal model =
    ( updateOpenSortModalState model, scrollToTopCard model )


updateOpenSortModalState : Model -> Model
updateOpenSortModalState model =
    { model
        | sortModalOpen = True
        , sortModalCardScale = 1.0
        , targetTopCardId = Just (topCardIdString model)
    }


topCardIdString : Model -> String
topCardIdString model =
    Maybe.withDefault "" model.topVisibleCardId


scrollToTopCard : Model -> Cmd Msg
scrollToTopCard model =
    model
        |> topCardIdString
        |> Ports.scrollToCard


applySortAndClose : List String -> Maybe String -> Model -> ( Model, Cmd Msg )
applySortAndClose newOrder topCardId model =
    model
        |> closeSortModal topCardId
        |> recordHistory model
        |> applyDatasetReorder newOrder
        |> saveAndScroll topCardId


closeSortModal : Maybe String -> Model -> Model
closeSortModal topCardId model =
    { model | sortModalOpen = False, targetTopCardId = topCardId }


recordHistory : Model -> Model -> Model
recordHistory snapshot model =
    { model | history = History.push snapshot model.history }


applyDatasetReorder : List String -> Model -> Model
applyDatasetReorder newOrder model =
    updateModelDataset (DatasetAccess.reorderItems newOrder) model


updateModelDataset : (Dataset -> Dataset) -> Model -> Model
updateModelDataset transform model =
    DatasetAccess.currentDataset model
        |> Maybe.map (replaceDatasetInModel transform model)
        |> Maybe.withDefault model


replaceDatasetInModel : (Dataset -> Dataset) -> Model -> Dataset -> Model
replaceDatasetInModel transform model dataset =
    { model | datasets = DatasetAccess.replaceDataset (transform dataset) model.datasets }


saveAndScroll : Maybe String -> Model -> ( Model, Cmd Msg )
saveAndScroll topCardId model =
    ( model, Cmd.batch [ Storage.save model, scrollCommand topCardId ] )


scrollCommand : Maybe String -> Cmd Msg
scrollCommand maybeId =
    case maybeId of
        Just id ->
            Ports.scrollToCard id

        Nothing ->
            Cmd.none