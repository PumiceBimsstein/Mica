module Main exposing (main)

import Browser
import Browser.Events
import Dict
import Json.Decode as Decode
import MockData
import Ports
import Storage
import Update exposing (update)
import View
import Types exposing
    ( CardSize(..), FileFormat(..), Model, Msg(..)
    , EditModalMsg(..), SortModalMsg(..), ReadMode(..)
    , SearchState, SearchMode(..), DetailModalMsg(..)
    , FileFlowMsg(..)
    )



main : Program Decode.Value Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = View.view
        , subscriptions = subscriptions
        }


-- flags をデコードして初期モデルを構築。
-- データがない場合、またはデコード失敗時はモックデータを使用する。

init : Decode.Value -> ( Model, Cmd Msg )
init flags =
    case Storage.decodeState flags of
        Ok state ->
            if List.isEmpty state.dataset.items then
                ( defaultModel, Cmd.none )

            else
                ( Storage.applyPersistedState state defaultModel, Cmd.none )

        Err _ ->
            ( defaultModel, Cmd.none )


defaultModel : Model
defaultModel =
    { dataset = MockData.dataset
    , cardSize = Medium
    , fileModalOpen = False
    , settingsModalOpen = False
    , sortModalOpen = False
    , actionMenuOpen = False
    , filterSelectOpen = False
    , mainAreaCardScale = 1.0
    , sortModalCardScale = 1.0
    , targetTopCardId = Nothing
    , readMode = NewDataset
    , importFormat = JsonFormat
    , exportFormat = JsonFormat
    , pendingImport = Nothing
    , importError = Nothing
    , history = []
    , filterUi = Dict.empty
    , hoveredItemId = Nothing
    , editModalOpen = False
    , editModal = Nothing
    , renameModal = Nothing
    , topVisibleCardId = Nothing
    , searchState = { query = "", mode = SearchAll }
    , detailModalItemId = Nothing
    , isDraggingFile = False
    }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Ports.openSortModalWithTopCard (OpenWithTopCard >> SortModalMsg)
        , Ports.receiveClosedSortModal (\data -> SortModalMsg (CloseAndApply data.newOrder data.topCardId))
        , Ports.topCardIdReceived TopCardIdReceived
        , Ports.idGenerated CreateItemWithId
        , Ports.idsArrayGenerated DatasetFileImport
        , keySubscription model
        ]


keySubscription : Model -> Sub Msg
keySubscription model =
    if model.isDraggingFile || model.detailModalItemId /= Nothing then
        Browser.Events.onKeyDown (keyDecoder model)

    else
        Sub.none


keyDecoder : Model -> Decode.Decoder Msg
keyDecoder model =
    Decode.field "key" Decode.string
        |> Decode.andThen
            (\key ->
                if model.isDraggingFile && key == "Escape" then
                    -- ファイルドラッグ中の Esc キャンセル
                    Decode.succeed (FileFlowMsg DragLeft)

                else
                    case model.detailModalItemId of
                        -- 詳細モーダル表示中のキー操作（←, →, Esc）
                        Just _ ->
                            Decode.succeed (DetailModalMsg (KeyDown key))

                        Nothing ->
                            Decode.fail "Ignored key"
            )
