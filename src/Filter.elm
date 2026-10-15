module Filter exposing
    ( FilterOption
    , defaultFilterUi
    , filterUiFor
    , isFilterActive
    , optionsFor
    , optionsForWithActiveFilters
    , orderedFilterableFields
    , toggleOption
    , toggleMember
    , visibleItems
    )

{-| フィルターに関する純粋なロジック。選択肢の集計、絞り込み判定、
フィルターUI状態そのものの小さな変換のみを扱う。Model全体やCmdには触れない。

複数フィルターの組み合わせ方（AND/OR/NOTグループ化）は要件に厳密な定義が無いため、
次のように解釈している。

  - AND関係のフィルターは、選択されているものすべてに一致する必要がある
  - OR関係のフィルターは、選択されているもののうち少なくとも一つに一致すればよい
    （OR関係のフィルターが一つも無ければ、この条件は無視する）
  - NOT関係のフィルターは、選択されているもの全てに一致しないことを要求する
  - 上記三つの結果をANDで組み合わせる
-}

import Dict exposing (Dict)
import Set exposing (Set)
import Search
import Types
    exposing
        ( BetweenRelation(..)
        , Dataset
        , FieldConfig
        , FilterUiState
        , Item
        , SearchState
        , Value(..)
        , WithinRelation(..)
        )


defaultFilterUi : FilterUiState
defaultFilterUi =
    { selected = Set.empty
    , betweenRelation = RelAnd
    , withinRelation = WithinOr
    , collapsed = False
    , relationPopupOpen = False
    }


filterUiFor : String -> Dict String FilterUiState -> FilterUiState
filterUiFor key filterUi =
    Dict.get key filterUi |> Maybe.withDefault defaultFilterUi


toggleOption : String -> FilterUiState -> FilterUiState
toggleOption optionValue ui =
    { ui | selected = toggleMember optionValue ui.selected }


toggleMember : comparable -> Set comparable -> Set comparable
toggleMember value set =
    if Set.member value set then
        Set.remove value set

    else
        Set.insert value set



{-| フィルターとして表示するフィールドを、フィルターの表示順（Dataset.filterOrder）に
従って並べる。filterOrderに無い、あるいはまだ存在しない新しいフィルター可能フィールドは、
fields本来の順序のまま末尾に追加する。
-}
orderedFilterableFields : Dataset -> List FieldConfig
orderedFilterableFields dataset =
    let
        filterableFields =
            List.filter .filterable dataset.fields

        byKey key =
            List.head (List.filter (\f -> f.key == key) filterableFields)

        ordered =
            List.filterMap byKey dataset.filterOrder

        orderedKeys =
            List.map .key ordered

        remaining =
            List.filter (\f -> not (List.member f.key orderedKeys)) filterableFields
    in
    ordered ++ remaining



-- 選択肢の集計


type alias FilterOption =
    { value : String
    , label : String
    , count : Int
    }


{-| 該当件数の多い順に並んだ選択肢一覧を返す。
-}

optionsFor : List Item -> FieldConfig -> List FilterOption
optionsFor items field =
    let
        isBoolean =
            fieldIsBoolean items field.key || field.isBool
    in
    items
        |> List.concatMap (optionKeysOfItem field.key)
        |> countBy identity
        |> Dict.toList
        |> List.map (\( value, count ) -> { value = value, label = optionLabel field isBoolean value, count = count })
        |> sortFilterOptions isBoolean


{-| 現在のフィルター状態を考慮した選択肢一覧を返す。
検索結果を対象として絞り込む（検索と他のフィルターの組み合わせに対応）。
指定されたフィールド以外のフィルター条件で絞り込んだアイテムに対して、
選択肢の件数を集計する。これにより、他のフィルターで選択されている内容に応じて
件数が動的に変わる。
-}
optionsForWithActiveFilters : SearchState -> Dict String FilterUiState -> Dataset -> FieldConfig -> List FilterOption
optionsForWithActiveFilters searchState filterUiDict dataset field =
    let
        -- 1. 検索結果を取得
        searchedItems =
            Search.searchResults searchState dataset

        -- 2. 検索結果からそのフィールドの全選択肢（マスター）を取得し、カウント0で初期化
        allOptionsDict =
            searchedItems
                |> List.concatMap (optionKeysOfItem field.key)
                |> List.map (\val -> ( val, 0 ))
                |> Dict.fromList

        -- 3. 他のフィルターを適用したアイテムを取得（検索結果を対象に）
        filteredItems =
            searchedItems
                |> List.filter (passesFiltersExcept filterUiDict dataset field.key)

        -- 4. 絞り込み後アイテムのカウントを集計
        filteredCounts =
            filteredItems
                |> List.concatMap (optionKeysOfItem field.key)
                |> countBy identity

        -- 5. マスターに対して絞り込み後のカウントをマージ（存在しない項目は0）
        mergedCounts =
            Dict.merge
                (\k v acc -> Dict.insert k v acc) -- マスターのみ（0件）
                (\k _ vFiltered acc -> Dict.insert k vFiltered acc) -- 両方に存在
                (\k vFiltered acc -> Dict.insert k vFiltered acc) -- 絞り込み後のみ（通常発生しない）
                allOptionsDict
                filteredCounts
                Dict.empty

        isBoolean =
            fieldIsBoolean searchedItems field.key || field.isBool
    in
    mergedCounts
        |> Dict.toList
        |> List.map (\( value, count ) -> { value = value, label = optionLabel field isBoolean value, count = count })
        |> sortFilterOptions isBoolean


sortFilterOptions : Bool -> List FilterOption -> List FilterOption
sortFilterOptions isBoolean options =
    if isBoolean then
        List.sortWith
            (\a b ->
                case ( a.value, b.value ) of
                    ( "true", "false" ) ->
                        LT

                    ( "false", "true" ) ->
                        GT

                    _ ->
                        EQ
            )
            options

    else
        List.sortBy (\opt -> -opt.count) options


optionLabel : FieldConfig -> Bool -> String -> String
optionLabel field isBoolean value =
    if isBoolean then
        if value == "true" then
            Maybe.withDefault "はい" field.trueLabel

        else if value == "false" then
            Maybe.withDefault "いいえ" field.falseLabel

        else
            value

    else
        value


{-| 指定されたフィールド以外の全フィルター条件を適用する。
-}
passesFiltersExcept : Dict String FilterUiState -> Dataset -> String -> Item -> Bool
passesFiltersExcept filterUiDict dataset exceptFieldKey item =
    let
        active =
            dataset.fields
                |> List.filter .filterable
                |> List.filter (\field -> field.key /= exceptFieldKey)
                |> List.map (\field -> ( field, filterUiFor field.key filterUiDict ))
                |> List.filter (\( _, ui ) -> not (Set.isEmpty ui.selected))

        inGroup relation =
            List.filter (\( _, ui ) -> ui.betweenRelation == relation) active

        matches ( field, ui ) =
            itemMatchesFilter field ui item
    in
    List.all matches (inGroup RelAnd)
        && (List.isEmpty (inGroup RelOr) || List.any matches (inGroup RelOr))
        && List.all (matches >> not) (inGroup RelNot)


fieldIsBoolean : List Item -> String -> Bool
fieldIsBoolean items key =
    items
        |> List.filterMap (\item -> Dict.get key item.values)
        |> List.any isBooleanValue


isBooleanValue : Value -> Bool
isBooleanValue value =
    case value of
        Boolean _ ->
            True

        _ ->
            False


{-| アイテムが持つ、あるフィールドの「選択肢キー」一覧。
Text: 値そのもの一件。TextList: 各要素。Boolean: "true"/"false"。値が無ければ空。
-}
optionKeysOfItem : String -> Item -> List String
optionKeysOfItem key item =
    case Dict.get key item.values of
        Just (Text s) ->
            [ s ]

        Just (TextList xs) ->
            xs

        Just (Boolean b) ->
            [ booleanOptionValue b ]

        Nothing ->
            []


booleanOptionValue : Bool -> String
booleanOptionValue b =
    if b then
        "true"

    else
        "false"


countBy : (a -> comparable) -> List a -> Dict comparable Int
countBy toKey list =
    List.foldl (\x acc -> Dict.update (toKey x) increment acc) Dict.empty list


increment : Maybe Int -> Maybe Int
increment maybeCount =
    Just (Maybe.withDefault 0 maybeCount + 1)



-- 絞り込みの適用


{-| 現在の検索条件とフィルター状態に基づいて、表示すべきアイテムだけを残す。
検索結果に対してフィルターを適用する。
-}
visibleItems : SearchState -> Dict String FilterUiState -> Dataset -> List Item
visibleItems searchState filterUiDict dataset =
    dataset
        |> searchAndFilter searchState filterUiDict


{-| 検索結果を取得してから、フィルターを適用する。
-}
searchAndFilter : SearchState -> Dict String FilterUiState -> Dataset -> List Item
searchAndFilter searchState filterUiDict dataset =
    let
        -- 1. 検索条件で絞り込み
        searchedItems =
            Search.searchResults searchState dataset

        -- 2. 検索結果に対してフィルターを適用
        filteredItems =
            List.filter (passesAllFilters filterUiDict dataset) searchedItems
    in
    filteredItems


{-| フィルターとして使えるフィールドのうち、いずれかで選択肢が選ばれていれば true。
-}
isFilterActive : Dict String FilterUiState -> Dataset -> Bool
isFilterActive filterUiDict dataset =
    dataset.fields
        |> List.filter .filterable
        |> List.any (\field -> not (Set.isEmpty (filterUiFor field.key filterUiDict).selected))


passesAllFilters : Dict String FilterUiState -> Dataset -> Item -> Bool
passesAllFilters filterUiDict dataset item =
    let
        active =
            dataset.fields
                |> List.filter .filterable
                |> List.map (\field -> ( field, filterUiFor field.key filterUiDict ))
                |> List.filter (\( _, ui ) -> not (Set.isEmpty ui.selected))

        inGroup relation =
            List.filter (\( _, ui ) -> ui.betweenRelation == relation) active

        matches ( field, ui ) =
            itemMatchesFilter field ui item
    in
    List.all matches (inGroup RelAnd)
        && (List.isEmpty (inGroup RelOr) || List.any matches (inGroup RelOr))
        && List.all (matches >> not) (inGroup RelNot)


itemMatchesFilter : FieldConfig -> FilterUiState -> Item -> Bool
itemMatchesFilter field ui item =
    if Set.isEmpty ui.selected then
        True

    else
        let
            itemValues =
                optionKeysOfItem field.key item

            optionIsPresent selectedValue =
                List.member selectedValue itemValues
        in
        case ui.withinRelation of
            WithinOr ->
                List.any optionIsPresent (Set.toList ui.selected)

            WithinAnd ->
                List.all optionIsPresent (Set.toList ui.selected)