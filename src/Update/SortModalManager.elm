module Update.SortModalManager exposing
    ( applySortAndClose
    , openSortModal
    )

import History
import Ports
import Storage
import Set
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
    updateModelDataset (reorderItems newOrder) model


updateModelDataset : (Dataset -> Dataset) -> Model -> Model
updateModelDataset transform model =
    { model | dataset = transform model.dataset }


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