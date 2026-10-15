module Storage exposing
    ( PersistedState
    , applyPersistedState
    , decodeState
    , request
    , save
    )

{-| Model と IndexedDB (Ports) の間を取り持つ。
DomainJson の型別エンコード・デコードを使い、永続化する状態全体
（datasets / selectedDatasetId / cardSize）をまとめる。
-}

import DomainJson
import Json.Decode as Decode
import Json.Encode as Encode
import Ports
import Types exposing (CardSize(..), Dataset, Model)


type alias PersistedState =
    { datasets : List Dataset
    , selectedDatasetId : String
    , cardSize : CardSize
    }


request : Cmd msg
request =
    Ports.loadState ()


save : Model -> Cmd msg
save model =
    Ports.saveState (encodeState model)


encodeState : Model -> Encode.Value
encodeState model =
    Encode.object
        [ ( "datasets", Encode.list DomainJson.encodeDataset model.datasets )
        , ( "selectedDatasetId", Encode.string model.selectedDatasetId )
        , ( "cardSize", encodeCardSize model.cardSize )
        ]


decodeState : Decode.Value -> Result Decode.Error PersistedState
decodeState value =
    Decode.decodeValue persistedStateDecoder value


persistedStateDecoder : Decode.Decoder PersistedState
persistedStateDecoder =
    Decode.map3 PersistedState
        (Decode.field "datasets" (Decode.list DomainJson.decodeDataset))
        (Decode.field "selectedDatasetId" Decode.string)
        (Decode.field "cardSize" decodeCardSize)


encodeCardSize : CardSize -> Encode.Value
encodeCardSize size =
    Encode.string
        (case size of
            Small ->
                "small"

            Medium ->
                "medium"

            Large ->
                "large"
        )


decodeCardSize : Decode.Decoder CardSize
decodeCardSize =
    Decode.string |> Decode.andThen cardSizeFromString


cardSizeFromString : String -> Decode.Decoder CardSize
cardSizeFromString s =
    case s of
        "small" ->
            Decode.succeed Small

        "medium" ->
            Decode.succeed Medium

        "large" ->
            Decode.succeed Large

        other ->
            Decode.fail ("unknown cardSize: " ++ other)


applyPersistedState : PersistedState -> Model -> Model
applyPersistedState state model =
    { model
        | datasets = state.datasets
        , selectedDatasetId = state.selectedDatasetId
        , cardSize = state.cardSize
    }
