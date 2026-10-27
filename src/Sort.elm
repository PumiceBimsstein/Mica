module Sort exposing
    ( Chunk(..)
    , compareNatural
    , sortItems
    )

import Dict
import Types exposing (Dataset, Item, SortCriterion, SortDirection(..), Value(..))


type Chunk
    = TextChunk String
    | NumericChunk Int


{-| 文字列をテキストと数値のチャンク列に分解（自然順ソート用）
例: "vol-2" -> [TextChunk "vol-", NumericChunk 2]
    "vol-10" -> [TextChunk "vol-", NumericChunk 10]
-}
parseChunks : String -> List Chunk
parseChunks str =
    parseChars (String.toList str) []


parseChars : List Char -> List Chunk -> List Chunk
parseChars chars acc =
    case chars of
        [] ->
            List.reverse acc

        c :: rest ->
            if Char.isDigit c then
                let
                    ( digits, remainder ) =
                        spanDigits (c :: rest)

                    num =
                        String.fromList digits |> String.toInt |> Maybe.withDefault 0
                in
                parseChars remainder (NumericChunk num :: acc)

            else
                let
                    ( nonDigits, remainder ) =
                        spanNonDigits (c :: rest)

                    txt =
                        String.fromList nonDigits
                in
                parseChars remainder (TextChunk txt :: acc)


spanDigits : List Char -> ( List Char, List Char )
spanDigits chars =
    case chars of
        c :: rest ->
            if Char.isDigit c then
                let
                    ( match, remainder ) =
                        spanDigits rest
                in
                ( c :: match, remainder )

            else
                ( [], c :: rest )

        [] ->
            ( [], [] )


spanNonDigits : List Char -> ( List Char, List Char )
spanNonDigits chars =
    case chars of
        c :: rest ->
            if not (Char.isDigit c) then
                let
                    ( match, remainder ) =
                        spanNonDigits rest
                in
                ( c :: match, remainder )

            else
                ( [], c :: rest )

        [] ->
            ( [], [] )


{-| 自然順比較（大文字小文字を区別せず、数値を整数として比較）
-}
compareNatural : String -> String -> Order
compareNatural a b =
    compareChunkList (parseChunks (String.toLower a)) (parseChunks (String.toLower b))


compareChunkList : List Chunk -> List Chunk -> Order
compareChunkList listA listB =
    case ( listA, listB ) of
        ( [], [] ) ->
            EQ

        ( [], _ ) ->
            LT

        ( _, [] ) ->
            GT

        ( chunkA :: restA, chunkB :: restB ) ->
            case compareSingleChunk chunkA chunkB of
                EQ ->
                    compareChunkList restA restB

                diff ->
                    diff


compareSingleChunk : Chunk -> Chunk -> Order
compareSingleChunk a b =
    case ( a, b ) of
        ( NumericChunk n1, NumericChunk n2 ) ->
            compare n1 n2

        ( TextChunk s1, TextChunk s2 ) ->
            compare s1 s2

        ( NumericChunk _, TextChunk _ ) ->
            LT

        ( TextChunk _, NumericChunk _ ) ->
            GT


{-| アイテムからソート対象の文字列値を抽出（空値は Nothing）
-}
extractFieldValue : String -> Item -> Maybe String
extractFieldValue key item =
    case Dict.get key item.values of
        Just (Text s) ->
            if String.isEmpty (String.trim s) then
                Nothing

            else
                Just (String.trim s)

        Just (TextList xs) ->
            case List.filter (not << String.isEmpty << String.trim) xs of
                first :: _ ->
                    Just (String.trim first)

                [] ->
                    Nothing

        Just (Boolean b) ->
            if b then
                Just "1"

            else
                Just "0"

        Nothing ->
            Nothing


{-| 単一の基準による比較。
未入力・空値は昇順・降順に関係なく常に末尾に配置。
-}
compareByCriterion : SortCriterion -> Item -> Item -> Order
compareByCriterion criterion itemA itemB =
    let
        valA =
            extractFieldValue criterion.fieldKey itemA

        valB =
            extractFieldValue criterion.fieldKey itemB
    in
    case ( valA, valB ) of
        ( Nothing, Nothing ) ->
            EQ

        ( Nothing, Just _ ) ->
            GT

        ( Just _, Nothing ) ->
            LT

        ( Just strA, Just strB ) ->
            let
                natOrder =
                    compareNatural strA strB
            in
            case criterion.direction of
                Ascending ->
                    natOrder

                Descending ->
                    case natOrder of
                        LT ->
                            GT

                        GT ->
                            LT

                        EQ ->
                            EQ


{-| 複数基準（第1優先、第2優先）によるソート
-}
sortItems : SortCriterion -> Maybe SortCriterion -> List Item -> List Item
sortItems primary maybeSecondary items =
    List.sortWith
        (\a b ->
            case compareByCriterion primary a b of
                EQ ->
                    case maybeSecondary of
                        Just secondary ->
                            compareByCriterion secondary a b

                        Nothing ->
                            EQ

                other ->
                    other
        )
        items
