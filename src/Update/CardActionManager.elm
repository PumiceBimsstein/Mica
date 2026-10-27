module Update.CardActionManager exposing
    ( handleCardActionMsg
    , handleCreateItemWithId
    )

import History
import Ports
import Process
import Storage
import Task
import Types
    exposing
        ( CardActionMsg(..)
        , Item
        , Model
        , Msg(..)
        )
import Update.ItemManager exposing (createNewItemWithUuid)


handleCardActionMsg : CardActionMsg -> Model -> ( Model, Cmd Msg )
handleCardActionMsg msg model =
    case msg of
        ToggleMode ->
            ( { model | copyDeleteMode = not model.copyDeleteMode }, Cmd.none )

        RequestCopy itemId ->
            ( { model | pendingCopyItemId = Just itemId }
            , Ports.generateUuid ()
            )

        Delete itemId ->
            deleteCard itemId model

        DismissToast ->
            ( { model | toast = Nothing }, Cmd.none )

        UndoFromToast ->
            undoFromToast model


-- UUID受信時の処理（コピーの直後挿入か、通常の新規作成かの判定）
handleCreateItemWithId : String -> Model -> ( Model, Cmd Msg )
handleCreateItemWithId uuid model =
    case model.pendingCopyItemId of
        Just targetId ->
            let
                ( newModel, cmd ) =
                    copyItemDirectlyAfter targetId uuid model
            in
            ( { newModel | pendingCopyItemId = Nothing }, cmd )

        Nothing ->
            createNewItemWithUuid uuid model.topVisibleCardId model


deleteCard : String -> Model -> ( Model, Cmd Msg )
deleteCard itemId model =
    let
        oldDataset =
            model.dataset

        updatedDataset =
            { oldDataset | items = List.filter (\it -> it.id /= itemId) oldDataset.items }

        newModel =
            { model
                | history = History.push model model.history
                , dataset = updatedDataset
                , toast = Just { message = "カードを削除しました", showUndo = True }
            }
    in
    ( newModel
    , Cmd.batch
        [ Storage.save newModel
        , triggerAutoDismissToast
        ]
    )


copyItemDirectlyAfter : String -> String -> Model -> ( Model, Cmd Msg )
copyItemDirectlyAfter targetId newUuid model =
    let
        maybeTarget =
            List.filter (\it -> it.id == targetId) model.dataset.items |> List.head
    in
    case maybeTarget of
        Just targetItem ->
            let
                newItem =
                    { id = newUuid, values = targetItem.values }

                updatedItems =
                    insertAfter targetId newItem model.dataset.items

                oldDataset =
                    model.dataset

                updatedDataset =
                    { oldDataset | items = updatedItems }

                newModel =
                    { model
                        | history = History.push model model.history
                        , dataset = updatedDataset
                        , toast = Just { message = "カードを複製しました", showUndo = True }
                    }
            in
            ( newModel
            , Cmd.batch
                [ Storage.save newModel
                , triggerAutoDismissToast
                ]
            )

        Nothing ->
            ( model, Cmd.none )


insertAfter : String -> Item -> List Item -> List Item
insertAfter targetId newItem items =
    case items of
        [] ->
            [ newItem ]

        head :: tail ->
            if head.id == targetId then
                head :: newItem :: tail

            else
                head :: insertAfter targetId newItem tail


undoFromToast : Model -> ( Model, Cmd Msg )
undoFromToast model =
    case History.pop model.history of
        Just ( snapshot, rest ) ->
            let
                restoredModel =
                    History.applySnapshot snapshot { model | history = rest, toast = Nothing }
            in
            ( restoredModel, Storage.save restoredModel )

        Nothing ->
            ( { model | toast = Nothing }, Cmd.none )


triggerAutoDismissToast : Cmd Msg
triggerAutoDismissToast =
    Process.sleep 5000 |> Task.perform (\_ -> CardActionMsg DismissToast)
