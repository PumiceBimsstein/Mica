module Update.AutoSortManager exposing (handleAutoSortMsg)

import History
import Process
import Sort
import Storage
import Task
import Types
    exposing
        ( AutoSortMsg(..)
        , CardActionMsg(..)
        , Model
        , Msg(..)
        )


handleAutoSortMsg : AutoSortMsg -> Model -> ( Model, Cmd Msg )
handleAutoSortMsg msg model =
    case msg of
        OpenModal ->
            ( { model | autoSortModalOpen = True, actionMenuOpen = False }, Cmd.none )

        CloseModal ->
            ( { model | autoSortModalOpen = False }, Cmd.none )

        SetPrimaryField fieldKey ->
            let
                st =
                    model.autoSortState
            in
            ( { model | autoSortState = { st | primaryField = fieldKey } }, Cmd.none )

        SetPrimaryDirection dir ->
            let
                st =
                    model.autoSortState
            in
            ( { model | autoSortState = { st | primaryDirection = dir } }, Cmd.none )

        SetSecondaryField maybeFieldKey ->
            let
                st =
                    model.autoSortState
            in
            ( { model | autoSortState = { st | secondaryField = maybeFieldKey } }, Cmd.none )

        SetSecondaryDirection dir ->
            let
                st =
                    model.autoSortState
            in
            ( { model | autoSortState = { st | secondaryDirection = dir } }, Cmd.none )

        Apply ->
            applySort model


applySort : Model -> ( Model, Cmd Msg )
applySort model =
    let
        primary =
            { fieldKey = model.autoSortState.primaryField
            , direction = model.autoSortState.primaryDirection
            }

        secondary =
            model.autoSortState.secondaryField
                |> Maybe.map (\f -> { fieldKey = f, direction = model.autoSortState.secondaryDirection })

        sortedItems =
            Sort.sortItems primary secondary model.dataset.items

        oldDataset =
            model.dataset

        updatedDataset =
            { oldDataset | items = sortedItems }

        newModel =
            { model
                | history = History.push model model.history
                , dataset = updatedDataset
                , autoSortModalOpen = False
                , toast = Just { message = "カードをソートしました", showUndo = True }
            }
    in
    ( newModel
    , Cmd.batch
        [ Storage.save newModel
        , triggerAutoDismissToast
        ]
    )


triggerAutoDismissToast : Cmd Msg
triggerAutoDismissToast =
    Process.sleep 5000 |> Task.perform (\_ -> CardActionMsg DismissToast)
