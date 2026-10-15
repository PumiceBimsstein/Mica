module Search exposing
    ( searchableFields
    , matchesSearch
    , searchResults
    , queryToLowercase
    , valueToString
    )

{-| 検索に関する純粋なロジック。Model全体やCmdには触れない。

検索は以下のように動作する：
- 全文検索: アイテムのすべての値を文字列化して、クエリを含むか判定
- フィールド指定検索: 指定フィールドの値のみを対象とし、OR検索（選択フィールドのいずれかがマッチ）
-}

import Dict exposing (Dict)
import Set exposing (Set)
import Types exposing (Dataset, FieldConfig, Item, SearchMode(..), SearchState, Value(..))


{-| 検索可能なフィールド一覧を取得する。
すべてのフィールドが検索対象になる。
-}
searchableFields : Dataset -> List FieldConfig
searchableFields dataset =
    dataset.fields


{-| アイテムが検索条件にマッチするかどうかを判定する。
クエリが空の場合は常に true。
-}
matchesSearch : SearchState -> Dataset -> Item -> Bool
matchesSearch searchState dataset item =
    if String.isEmpty (String.trim searchState.query) then
        True

    else
        let
            queryLower =
                queryToLowercase searchState.query
        in
        case searchState.mode of
            SearchAll ->
                matchesSearchAll queryLower item

            SearchFields fieldKeys ->
                if Set.isEmpty fieldKeys then
                    True

                else
                    matchesSearchFields queryLower fieldKeys item


{-| 全文検索：アイテムのすべての値を対象に検索
-}
matchesSearchAll : String -> Item -> Bool
matchesSearchAll queryLower item =
    item.values
        |> Dict.values
        |> List.any (\value -> String.contains queryLower (valueToString value))


{-| フィールド指定検索：指定フィールドのいずれかがマッチ（OR検索）
-}
matchesSearchFields : String -> Set String -> Item -> Bool
matchesSearchFields queryLower fieldKeys item =
    fieldKeys
        |> Set.toList
        |> List.any
            (\fieldKey ->
                Dict.get fieldKey item.values
                    |> Maybe.map (\value -> String.contains queryLower (valueToString value))
                    |> Maybe.withDefault False
            )


{-| 検索条件を満たすアイテムだけを抽出する。
-}
searchResults : SearchState -> Dataset -> List Item
searchResults searchState dataset =
    List.filter (matchesSearch searchState dataset) dataset.items


{-| クエリを小文字に変換する（大文字小文字を区別しない検索のため）
-}
queryToLowercase : String -> String
queryToLowercase =
    String.toLower


{-| Value を検索可能な文字列に変換する。
Text: そのまま
TextList: スペース区切りで結合
Boolean: "true" または "false"
-}
valueToString : Value -> String
valueToString value =
    case value of
        Text s ->
            String.toLower s

        TextList xs ->
            xs
                |> List.map String.toLower
                |> String.join " "

        Boolean b ->
            if b then
                "true"

            else
                "false"
