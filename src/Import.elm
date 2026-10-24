module Import exposing
    ( applyChoice
    , buildNewDataset
    , decodeRawItems
    , findNewKeys
    )

{-| ファイルから読み込んだ生データを、既存のデータセット構造へ
どう反映するかという純粋なロジックをまとめる。Model や Cmd には触れない。
-}

import Dict
import DomainJson
import Json.Decode as Decode
import Types
    exposing
        ( AppendChoice(..)
        , Dataset
        , DisplayRole(..)
        , FieldConfig
        , Item
        , PendingImport
        , ReadMode(..)
        , Value
        )


-- パース

decodeRawItems : String -> Result Decode.Error (List (List ( String, Value )))
decodeRawItems text =
    Decode.decodeString rawItemsDecoder text


-- rawItemsDecoder : Decode.Decoder (List (List ( String, Value )))
-- rawItemsDecoder =
--     Decode.list (Decode.keyValuePairs DomainJson.decodeValue)

rawItemsDecoder : Decode.Decoder (List (List ( String, Value )))
rawItemsDecoder =
    Decode.list
        (Decode.keyValuePairs (Decode.nullable DomainJson.decodeValue)
            |> Decode.map (List.filterMap dropNull)
        )

-- null のプロパティはフィールドごとスキップ
dropNull : ( String, Maybe Value ) -> Maybe ( String, Value )
dropNull ( key, maybeVal ) =
    case maybeVal of
        Just val ->
            Just ( key, val )

        Nothing ->
            Nothing

-- キー順序・新規キーの判定

{-| 各アイテムに出現したキーを、最初に出現した順に重複なく並べる。
-}
collectKeyOrder : List (List ( String, Value )) -> List String
collectKeyOrder rawItems =
    List.foldl collectFromItem [] rawItems |> List.reverse


collectFromItem : List ( String, Value ) -> List String -> List String
collectFromItem pairs acc =
    List.foldl addKeyIfNew acc pairs


addKeyIfNew : ( String, Value ) -> List String -> List String
addKeyIfNew ( key, _ ) acc =
    if List.member key acc then
        acc

    else
        key :: acc


findNewKeys : List FieldConfig -> List (List ( String, Value )) -> List String
findNewKeys existingFields rawItems =
    collectKeyOrder rawItems
        |> List.filter (\key -> not (List.member key (existingKeysOf existingFields)))


existingKeysOf : List FieldConfig -> List String
existingKeysOf fields =
    List.map .key fields



-- 新規データセットの作成


{-| 型推測なしの基本フィールド設定。
-}
defaultFieldConfig : String -> FieldConfig
defaultFieldConfig key =
    { key = key
    , label = key
    , displayRole = PlainText
    , showOnCard = True
    , filterable = False
    , isBool = False
    , isTextList = False
    , trueLabel = Nothing
    , falseLabel = Nothing
    }


{-| キーとデータから型を推測して、フィールドを作成する。
指定されたキーを持つ値がすべて Boolean 型ならば、isBool = True と設定する。
-}
inferFieldConfig : String -> List (List ( String, Value )) -> FieldConfig
inferFieldConfig key rawItems =
    let
        base =
            defaultFieldConfig key

        valuesForKey =
            rawItems
                |> List.concatMap (\item -> List.filterMap (\( k, v ) -> if k == key then Just v else Nothing) item)

        isBoolType =
            if List.isEmpty valuesForKey then
                False
            else
                List.all isBooleanValue valuesForKey
    in
    { base | isBool = isBoolType }


isBooleanValue : Value -> Bool
isBooleanValue val =
    case val of
        Types.Boolean _ ->
            True

        _ ->
            False


toItem : String -> List ( String, Value ) -> Item
toItem uuid pairs =
    { id = uuid, values = Dict.fromList pairs }


buildItems : List String -> List (List ( String, Value )) -> List Item
buildItems uuids rawItems =
    List.map2 toItem uuids rawItems

{-| 新規データセットを作成する。フィールドはデータから推測し、
表示方法は仮に通常テキストとする（設定画面から後で変更できる）。
-}


buildNewDataset : String -> String -> List String -> List (List ( String, Value )) -> Dataset
buildNewDataset newId name uuids rawItems =
    let
        keys =
            collectKeyOrder rawItems
    in
    { id = newId
    , name = name
    , fields = List.map (\key -> inferFieldConfig key rawItems) keys
    , items = buildItems uuids rawItems
    , imageLinkField = Nothing
    , titleLinkField = Nothing
    , filterOrder = []
    , wrapTitleOnCard = False
    }


-- 追加・置き換えインポートの解決


{-| choice に応じて、新しいプロパティを追加する／無視する／中止する。
中止の場合は Nothing を返す。
-}

applyChoice : AppendChoice -> List String -> PendingImport -> Dataset -> Maybe Dataset
applyChoice choice uuids pending target =
    case choice of
        AbortImport ->
            Nothing

        AddNewFields ->
            Just (mergeInto True uuids pending target)

        IgnoreNewFields ->
            Just (mergeInto False uuids pending target)


mergeInto : Bool -> List String -> PendingImport -> Dataset -> Dataset
mergeInto includeNewKeys uuids pending target =
    let
        effectiveRawItems =
            if includeNewKeys then
                pending.rawItems

            else
                List.map (restrictKeys (existingKeysOf target.fields)) pending.rawItems

        newFields =
            if includeNewKeys then
                target.fields ++ List.map (\key -> inferFieldConfig key pending.rawItems) pending.newKeys

            else
                target.fields

        newItems =
            buildItems uuids effectiveRawItems
    in
    case pending.mode of
        ReplaceData ->
            { target | fields = newFields, items = newItems }

        _ ->
            { target | fields = newFields, items = target.items ++ newItems }

restrictKeys : List String -> List ( String, Value ) -> List ( String, Value )
restrictKeys allowedKeys pairs =
    List.filter (\( key, _ ) -> List.member key allowedKeys) pairs