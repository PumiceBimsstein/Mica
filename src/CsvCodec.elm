module CsvCodec exposing (decodeRawItems, encodeDataset)

{-| CSVの行と、ドメインモデル（Value/Item/FieldConfig/Dataset）との相互変換。
CSVのセルは常に文字列であり、Text/TextList/Booleanのどれとして扱うかは
セル自体からは分からないため、次の優先順位で列ごとの型を決める。

1. 追加・置き換え先の既存データセットがあれば、そのフィールドに既存アイテムが
   持っている実際の値の型を優先する。
2. 既存データが無い（新規データセットとして読み込む）場合は、列全体の値を見て、
   すべて true/false なら真偽値、カンマを含む値があれば文字列配列、
   それ以外は通常の文字列とみなす。

なお、CSVでは「値が空文字列であること」と「その項目が存在しないこと」を
区別できないため、空セルは値なし（アイテムにそのキーが存在しない）として扱う。
-}

import Csv
import Dict exposing (Dict)
import Types exposing (Dataset, FieldConfig, Item, Value(..))



-- 読み込み

decodeRawItems : Maybe Dataset -> String -> Result String (List (List ( String, Value )))
decodeRawItems maybeExisting text =
    case Csv.parse text of
        [] ->
            Ok []

        header :: rows ->
            if List.isEmpty header then
                Err "ヘッダー行がありません。"

            else
                Ok (rowsToItems maybeExisting header rows)


rowsToItems : Maybe Dataset -> List String -> List (List String) -> List (List ( String, Value ))
rowsToItems maybeExisting header rows =
    let
        columnTypes =
            inferColumnTypes maybeExisting header rows
    in
    List.map (rowToPairs header columnTypes) rows


rowToPairs : List String -> Dict String ColumnType -> List String -> List ( String, Value )
rowToPairs header columnTypes cells =
    List.map2 Tuple.pair header cells
        |> List.filterMap (cellPair columnTypes)


cellPair : Dict String ColumnType -> ( String, String ) -> Maybe ( String, Value )
cellPair columnTypes ( key, raw ) =
    if String.isEmpty raw then
        Nothing

    else
        Just ( key, cellToValue (columnTypeFor columnTypes key) raw )


type ColumnType
    = TypeText
    | TypeTextList
    | TypeBoolean


inferColumnTypes : Maybe Dataset -> List String -> List (List String) -> Dict String ColumnType
inferColumnTypes maybeExisting header rows =
    header
        |> List.map (\key -> ( key, columnTypeForKey maybeExisting header rows key ))
        |> Dict.fromList


columnTypeForKey : Maybe Dataset -> List String -> List (List String) -> String -> ColumnType
columnTypeForKey maybeExisting header rows key =
    case Maybe.andThen (existingTypeOf key) maybeExisting of
        Just columnType ->
            columnType

        Nothing ->
            inferFromColumnValues (columnValues header rows key)


existingTypeOf : String -> Dataset -> Maybe ColumnType
existingTypeOf key dataset =
    dataset.items
        |> List.filterMap (\item -> Dict.get key item.values)
        |> List.head
        |> Maybe.map valueToColumnType


valueToColumnType : Value -> ColumnType
valueToColumnType value =
    case value of
        Text _ ->
            TypeText

        TextList _ ->
            TypeTextList

        Boolean _ ->
            TypeBoolean


columnValues : List String -> List (List String) -> String -> List String
columnValues header rows key =
    case indexOf key header of
        Just idx ->
            rows |> List.filterMap (atIndex idx) |> List.filter (not << String.isEmpty)

        Nothing ->
            []


indexOf : String -> List String -> Maybe Int
indexOf key list =
    list
        |> List.indexedMap Tuple.pair
        |> List.filter (\( _, k ) -> k == key)
        |> List.head
        |> Maybe.map Tuple.first


atIndex : Int -> List a -> Maybe a
atIndex idx list =
    list |> List.drop idx |> List.head


inferFromColumnValues : List String -> ColumnType
inferFromColumnValues values =
    if List.isEmpty values then
        TypeText

    else if List.all isBooleanLiteral values then
        TypeBoolean

    else if List.any (String.contains ",") values then
        TypeTextList

    else
        TypeText


isBooleanLiteral : String -> Bool
isBooleanLiteral value =
    let
        lower =
            String.toLower value
    in
    lower == "true" || lower == "false"


columnTypeFor : Dict String ColumnType -> String -> ColumnType
columnTypeFor columnTypes key =
    Dict.get key columnTypes |> Maybe.withDefault TypeText


cellToValue : ColumnType -> String -> Value
cellToValue columnType raw =
    case columnType of
        TypeText ->
            Text raw

        TypeTextList ->
            TextList (raw |> String.split "," |> List.map String.trim |> List.filter (not << String.isEmpty))

        TypeBoolean ->
            Boolean (String.toLower raw == "true")



-- 書き出し


encodeDataset : Dataset -> String
encodeDataset dataset =
    let
        header =
            List.map .key dataset.fields

        rows =
            List.map (itemToRow dataset.fields) dataset.items
    in
    Csv.toCsvText (header :: rows)


itemToRow : List FieldConfig -> Item -> List String
itemToRow fields item =
    List.map (cellFor item) fields


cellFor : Item -> FieldConfig -> String
cellFor item field =
    Dict.get field.key item.values
        |> Maybe.map valueToCell
        |> Maybe.withDefault ""


valueToCell : Value -> String
valueToCell value =
    case value of
        Text s ->
            s

        TextList xs ->
            String.join "," xs

        Boolean b ->
            if b then
                "true"

            else
                "false"
