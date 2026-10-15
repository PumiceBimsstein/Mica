module Settings exposing
    ( moveFieldDown
    , moveFieldUp
    , moveFilterDown
    , moveFilterUp
    , setDisplayRole
    , setFilterable
    , setImageLinkField
    , setLabel
    , setShowOnCard
    , setTitleLinkField
    , setTrueLabel
    , setFalseLabel
    )

{-| 設定ウィンドウ・フィルターパネルで行う、フィールド設定の変更に関する純粋なロジック。
すべてDataset全体を受け取りDataset全体を返す（Model・Cmdには触れない）ので、
Update側では「今のデータセットにこの変換を適用して保存する」という
一つの処理だけを考えればよい。
-}

import Filter
import Types exposing (Dataset, DisplayRole, FieldConfig)



-- 個々のフィールドの属性変更


setLabel : String -> String -> Dataset -> Dataset
setLabel key newLabel dataset =
    mapField key (\f -> { f | label = newLabel }) dataset


setDisplayRole : String -> DisplayRole -> Dataset -> Dataset
setDisplayRole key role dataset =
    mapField key (\f -> { f | displayRole = role }) dataset


setShowOnCard : String -> Bool -> Dataset -> Dataset
setShowOnCard key value dataset =
    mapField key (\f -> { f | showOnCard = value }) dataset


setFilterable : String -> Bool -> Dataset -> Dataset
setFilterable key value dataset =
    mapField key (\f -> { f | filterable = value }) dataset


mapField : String -> (FieldConfig -> FieldConfig) -> Dataset -> Dataset
mapField key transform dataset =
    { dataset | fields = List.map (mapIfMatching key transform) dataset.fields }


mapIfMatching : String -> (FieldConfig -> FieldConfig) -> FieldConfig -> FieldConfig
mapIfMatching key transform field =
    if field.key == key then
        transform field

    else
        field



-- リンク先フィールド


setImageLinkField : Maybe String -> Dataset -> Dataset
setImageLinkField value dataset =
    { dataset | imageLinkField = value }


setTitleLinkField : Maybe String -> Dataset -> Dataset
setTitleLinkField value dataset =
    { dataset | titleLinkField = value }



-- フィールド自体の表示順序（カード詳細・入出力の順序）


moveFieldUp : String -> Dataset -> Dataset
moveFieldUp key dataset =
    { dataset | fields = moveBy -1 (\f -> f.key == key) dataset.fields }


moveFieldDown : String -> Dataset -> Dataset
moveFieldDown key dataset =
    { dataset | fields = moveBy 1 (\f -> f.key == key) dataset.fields }


-- Bool型フィールドのTrue/False表記を設定する

setTrueLabel : String -> String -> Dataset -> Dataset
setTrueLabel key value dataset =
    { dataset
        | fields =
            List.map
                (\field ->
                    if field.key == key then
                        { field | trueLabel = Just value }

                    else
                        field
                )
                dataset.fields
    }


setFalseLabel : String -> String -> Dataset -> Dataset
setFalseLabel key value dataset =
    { dataset
        | fields =
            List.map
                (\field ->
                    if field.key == key then
                        { field | falseLabel = Just value }

                    else
                        field
                )
                dataset.fields
    }


-- フィルターの表示順序（fieldsの順序とは独立）


moveFilterUp : String -> Dataset -> Dataset
moveFilterUp key dataset =
    { dataset | filterOrder = moveBy -1 ((==) key) (currentFilterOrder dataset) }


moveFilterDown : String -> Dataset -> Dataset
moveFilterDown key dataset =
    { dataset | filterOrder = moveBy 1 ((==) key) (currentFilterOrder dataset) }


currentFilterOrder : Dataset -> List String
currentFilterOrder dataset =
    Filter.orderedFilterableFields dataset |> List.map .key



-- 汎用の並べ替えヘルパー（フィールド一覧・フィルターキー一覧の両方で使う）


moveBy : Int -> (a -> Bool) -> List a -> List a
moveBy delta isTarget list =
    case indexOfPred isTarget list of
        Just i ->
            let
                j =
                    i + delta
            in
            if j >= 0 && j < List.length list then
                swapIndices i j list

            else
                list

        Nothing ->
            list


indexOfPred : (a -> Bool) -> List a -> Maybe Int
indexOfPred isTarget list =
    list
        |> List.indexedMap Tuple.pair
        |> List.filter (\( _, x ) -> isTarget x)
        |> List.head
        |> Maybe.map Tuple.first


swapIndices : Int -> Int -> List a -> List a
swapIndices i j list =
    case ( atIndex i list, atIndex j list ) of
        ( Just a, Just b ) ->
            List.indexedMap (swapAt i j a b) list

        _ ->
            list


swapAt : Int -> Int -> a -> a -> Int -> a -> a
swapAt i j a b idx x =
    if idx == i then
        b

    else if idx == j then
        a

    else
        x


atIndex : Int -> List a -> Maybe a
atIndex idx list =
    list |> List.drop idx |> List.head
