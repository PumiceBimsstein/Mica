-- src/Update/DetailModalManager.elm

module Update.DetailModalManager exposing (handleDetailModalMsg)

import Filter
import Types exposing (DetailModalMsg(..), Model, Msg)


handleDetailModalMsg : DetailModalMsg -> Model -> ( Model, Cmd Msg )
handleDetailModalMsg msg model =
    case msg of
        OpenDetail itemId ->
            ( { model | detailModalItemId = Just itemId }, Cmd.none )

        CloseDetail ->
            ( { model | detailModalItemId = Nothing }, Cmd.none )

        NextCard ->
            ( navigateCard 1 model, Cmd.none )

        PrevCard ->
            ( navigateCard -1 model, Cmd.none )

        KeyDown key ->
            case key of
                "ArrowRight" ->
                    ( navigateCard 1 model, Cmd.none )

                "ArrowLeft" ->
                    ( navigateCard -1 model, Cmd.none )

                "Escape" ->
                    ( { model | detailModalItemId = Nothing }, Cmd.none )

                _ ->
                    ( model, Cmd.none )


navigateCard : Int -> Model -> Model
navigateCard delta model =
    case model.detailModalItemId of
        Just currentId ->
            let
                items =
                    Filter.visibleItems model.searchState model.filterUi model.dataset

                ids =
                    List.map .id items

                currentIndex =
                    findIdIndex currentId ids
            in
            case currentIndex of
                Just idx ->
                    let
                        nextIdx =
                            idx + delta
                    in
                    case getAt nextIdx ids of
                        Just nextId ->
                            { model | detailModalItemId = Just nextId }

                        Nothing ->
                            model

                Nothing ->
                            model

        Nothing ->
            model


findIdIndex : String -> List String -> Maybe Int
findIdIndex targetId list =
    list
        |> List.indexedMap Tuple.pair
        |> List.filter (\( _, id ) -> id == targetId)
        |> List.head
        |> Maybe.map Tuple.first


getAt : Int -> List a -> Maybe a
getAt index list =
    if index < 0 then
        Nothing

    else
        list |> List.drop index |> List.head
