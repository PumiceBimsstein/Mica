module Main exposing (main)

import Browser
import Dict
import MockData
import Ports
import Storage
import Update exposing (update)
import View
import Types exposing
    ( CardSize(..), FileFormat(..), Model, Msg(..)
    , EditModalMsg(..), SortModalMsg(..), ReadMode(..)
    , SearchState, SearchMode(..)
    )



main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = View.view
        , subscriptions = subscriptions
        }


{-| 起動時はまずモックデータを暫定表示しつつ、IndexedDBへ問い合わせる。
問い合わせ結果は StateLoaded で受け取り、Update側で反映する。
カードグリッドの並べ替え・選択の初期化も、他のメッセージ処理後と同様に行っておく。
-}
init : () -> ( Model, Cmd Msg )
init _ =
    ( defaultModel, Cmd.batch [ Storage.request ] )


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
    }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Ports.stateLoaded StateLoaded
        , Ports.openSortModalWithTopCard (OpenWithTopCard >> SortModalMsg)
        , Ports.receiveClosedSortModal (\data -> SortModalMsg (CloseAndApply data.newOrder data.topCardId))
        , Ports.topCardIdReceived TopCardIdReceived
        , Ports.idGenerated CreateItemWithId
        , Ports.idsArrayGenerated DatasetFileImport
        ]
