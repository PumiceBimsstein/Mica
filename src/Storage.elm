module Storage exposing
    ( PersistedState
    , applyPersistedState
    , decodeState
    , save
    )


import DomainJson
import Json.Decode as Decode
import Json.Encode as Encode
import Dict exposing (Dict)
import Ports
import Filter
import Set exposing (Set)
import Types exposing
        ( BetweenRelation(..)
        , CardSize(..)
        , Dataset
        , FilterUiState
        , Model
        , WithinRelation(..)
        )


type alias PersistedState =
    { dataset : Dataset
    , cardSize : CardSize
    , filterUi : Dict String FilterUiState
    }


save : Model -> Cmd msg
save model =
    Ports.saveState (encodeState model)


encodeState : Model -> Encode.Value
encodeState model =
    Encode.object
        [ ( "dataset", DomainJson.encodeDataset model.dataset )
        , ( "cardSize", encodeCardSize model.cardSize )
        , ( "filterUi", encodeFilterUi model.filterUi )
        ]


encodeFilterUi : Dict String FilterUiState -> Encode.Value
encodeFilterUi filterUi =
    Encode.dict identity encodeFilterUiState filterUi


encodeFilterUiState : FilterUiState -> Encode.Value
encodeFilterUiState ui =
    Encode.object
        [ ( "selected", Encode.list Encode.string (Set.toList ui.selected) )
        , ( "betweenRelation", encodeBetweenRelation ui.betweenRelation )
        , ( "withinRelation", encodeWithinRelation ui.withinRelation )
        , ( "collapsed", Encode.bool ui.collapsed )
        ]


encodeBetweenRelation : BetweenRelation -> Encode.Value
encodeBetweenRelation rel =
    Encode.string
        (case rel of
            RelAnd ->
                "and"

            RelOr ->
                "or"

            RelNot ->
                "not"
        )


encodeWithinRelation : WithinRelation -> Encode.Value
encodeWithinRelation rel =
    Encode.string
        (case rel of
            WithinAnd ->
                "and"

            WithinOr ->
                "or"
        )


decodeState : Decode.Value -> Result Decode.Error PersistedState
decodeState value =
    Decode.decodeValue persistedStateDecoder value


persistedStateDecoder : Decode.Decoder PersistedState
persistedStateDecoder =
    Decode.map3 PersistedState
        (Decode.field "dataset" DomainJson.decodeDataset)
        (Decode.field "cardSize" decodeCardSize)
        decodeFilterUi


decodeFilterUi : Decode.Decoder (Dict String FilterUiState)
decodeFilterUi =
    Decode.oneOf
        [ Decode.field "filterUi" (Decode.dict decodeFilterUiState)
        , Decode.succeed Dict.empty
        ]

decodeFilterUiState : Decode.Decoder FilterUiState
decodeFilterUiState =
    Decode.map4
        (\selected between within collapsed ->
            { selected = selected
            , betweenRelation = between
            , withinRelation = within
            , collapsed = collapsed
            , relationPopupOpen = False -- 復元時は必ず閉じた状態
            }
        )
        (Decode.field "selected" (Decode.list Decode.string |> Decode.map Set.fromList))
        (Decode.field "betweenRelation" decodeBetweenRelation)
        (Decode.field "withinRelation" decodeWithinRelation)
        (Decode.field "collapsed" Decode.bool)

decodeBetweenRelation : Decode.Decoder BetweenRelation
decodeBetweenRelation =
    Decode.string
        |> Decode.andThen
            (\str ->
                case str of
                    "and" ->
                        Decode.succeed RelAnd

                    "or" ->
                        Decode.succeed RelOr

                    "not" ->
                        Decode.succeed RelNot

                    _ ->
                        Decode.succeed RelAnd
            )

decodeWithinRelation : Decode.Decoder WithinRelation
decodeWithinRelation =
    Decode.string
        |> Decode.andThen
            (\str ->
                case str of
                    "and" ->
                        Decode.succeed WithinAnd

                    "or" ->
                        Decode.succeed WithinOr

                    _ ->
                        Decode.succeed WithinOr
            )

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
        | dataset = state.dataset
        , cardSize = state.cardSize
        , filterUi = state.filterUi
    }