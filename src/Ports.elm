port module Ports exposing
    ( saveState
    , openSortModalWithTopCard
    , receiveClosedSortModal
    , scrollToCard
    , scrollToTop
    , topCardIdReceived
    , generateUuid
    , generateUuids
    , idGenerated
    , idsArrayGenerated
    )


import Json.Encode as Encode
import Types exposing (Msg(..))


port saveState : Encode.Value -> Cmd msg


port openSortModalWithTopCard : (String -> msg) -> Sub msg


port scrollToCard : String -> Cmd msg


port receiveClosedSortModal : ({ newOrder : List String, topCardId : Maybe String } -> msg) -> Sub msg


port scrollToTop : () -> Cmd msg


port topCardIdReceived : (Maybe String -> msg) -> Sub msg


-- 単一 UUID 生成（新規カード用）
port generateUuid : () -> Cmd msg

-- 複数 UUID 生成（ファイル読み込み・インポート用）
port generateUuids : Int -> Cmd msg

-- UUID の受信
port idGenerated : (String -> msg) -> Sub msg

-- 複数 UUID リストの受信
port idsArrayGenerated : (List String -> msg) -> Sub msg