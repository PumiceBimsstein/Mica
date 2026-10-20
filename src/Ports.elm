port module Ports exposing
    ( --loadState
      saveState
    --, stateLoaded
    , openSortModalWithTopCard
    , receiveClosedSortModal
    , requestTopCardId
    , scrollToCard
    , scrollToTop
    , topCardIdReceived
    , generateUuid
    , generateUuids
    , idGenerated
    , idsArrayGenerated
    )

{-| IndexedDBとのやり取り、およびカードグリッド（SortableJSによる並べ替え・
マーキー選択/長押しによる複数選択）とのやり取りをJavaScript側（ports.js）に
委譲するためのport定義。このモジュールにロジックは置かない。
-}

import Json.Decode as Decode
import Json.Encode as Encode
import Types exposing (Msg(..))


--port loadState : () -> Cmd msg


port saveState : Encode.Value -> Cmd msg


--port stateLoaded : (Decode.Value -> msg) -> Sub msg


port requestTopCardId : () -> Cmd msg


port openSortModalWithTopCard : (String -> msg) -> Sub msg


port scrollToCard : String -> Cmd msg


port receiveClosedSortModal : ({ newOrder : List String, topCardId : Maybe String } -> msg) -> Sub msg


port scrollToTop : () -> Cmd msg


port topCardIdReceived : (Maybe String -> msg) -> Sub msg


-- 単一 UUID 生成要求（新規カード用）
port generateUuid : () -> Cmd msg

-- 複数 UUID 一括生成要求（ファイル読み込み・インポート用）
port generateUuids : Int -> Cmd msg

-- 生成された UUID の受信
port idGenerated : (String -> msg) -> Sub msg

-- 生成された複数 UUID リストの受信
port idsArrayGenerated : (List String -> msg) -> Sub msg