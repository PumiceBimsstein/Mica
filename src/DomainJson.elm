module DomainJson exposing
    ( decodeDataset
    , decodeItem
    , decodeValue
    , encodeDataset
    , encodeItem
    , encodeValue
    )

{-| Value / Item / FieldConfig / Dataset のJSONエンコード・デコード。
IndexedDBへの保存だけでなく、後のステップで実装するファイル入出力
（通常JSON・バックアップJSON）でもこのモジュールを再利用する想定。
-}

import Dict exposing (Dict)
import Json.Decode as Decode
import Json.Encode as Encode
import Types exposing (Dataset, DisplayRole(..), FieldConfig, Item, Value(..))



-- Value


encodeValue : Value -> Encode.Value
encodeValue value =
    case value of
        Text s ->
            Encode.string s

        TextList xs ->
            Encode.list Encode.string xs

        Boolean b ->
            Encode.bool b


decodeValue : Decode.Decoder Value
decodeValue =
    Decode.oneOf
        [ Decode.map Text Decode.string
        , Decode.map TextList (Decode.list Decode.string)
        , Decode.map Boolean Decode.bool
        ]



-- Item


encodeItem : Item -> Encode.Value
encodeItem item =
    Encode.object
        [ ( "id", Encode.string item.id )
        , ( "values", encodeValues item.values )
        ]


encodeValues : Dict String Value -> Encode.Value
encodeValues values =
    Encode.object (List.map (\( k, v ) -> ( k, encodeValue v )) (Dict.toList values))


decodeItem : Decode.Decoder Item
decodeItem =
    Decode.map2 Item
        (Decode.field "id" Decode.string)
        (Decode.field "values" (Decode.dict decodeValue))



-- FieldConfig


encodeFieldConfig : FieldConfig -> Encode.Value
encodeFieldConfig field =
    Encode.object
        [ ( "key", Encode.string field.key )
        , ( "label", Encode.string field.label )
        , ( "displayRole", encodeDisplayRole field.displayRole )
        , ( "showOnCard", Encode.bool field.showOnCard )
        , ( "filterable", Encode.bool field.filterable )
        , ( "isBool", Encode.bool field.isBool )
        , ( "isTextList", Encode.bool field.isTextList )
        , ( "trueLabel", encodeMaybeString field.trueLabel )
        , ( "falseLabel", encodeMaybeString field.falseLabel )
        ]


decodeFieldConfig : Decode.Decoder FieldConfig
decodeFieldConfig =
    Decode.succeed FieldConfig
        |> decodeAndMap (Decode.field "key" Decode.string)
        |> decodeAndMap (Decode.field "label" Decode.string)
        |> decodeAndMap (Decode.field "displayRole" decodeDisplayRole)
        |> decodeAndMap (Decode.field "showOnCard" Decode.bool)
        |> decodeAndMap (Decode.field "filterable" Decode.bool)
        |> decodeAndMap (Decode.oneOf [ Decode.field "isBool" Decode.bool, Decode.succeed False ])
        |> decodeAndMap (Decode.oneOf [ Decode.field "isTextList" Decode.bool, Decode.succeed False ])
        |> decodeAndMap (Decode.maybe (Decode.field "trueLabel" Decode.string))
        |> decodeAndMap (Decode.maybe (Decode.field "falseLabel" Decode.string))


decodeAndMap : Decode.Decoder a -> Decode.Decoder (a -> b) -> Decode.Decoder b
decodeAndMap =
    Decode.map2 (\a f -> f a)

encodeDisplayRole : DisplayRole -> Encode.Value
encodeDisplayRole role =
    Encode.string
        (case role of
            PlainText ->
                "plain"

            Title ->
                "title"

            Image ->
                "image"

            Link ->
                "link"
        )


decodeDisplayRole : Decode.Decoder DisplayRole
decodeDisplayRole =
    Decode.string |> Decode.andThen displayRoleFromString


displayRoleFromString : String -> Decode.Decoder DisplayRole
displayRoleFromString s =
    case s of
        "plain" ->
            Decode.succeed PlainText

        "title" ->
            Decode.succeed Title

        "image" ->
            Decode.succeed Image

        "link" ->
            Decode.succeed Link

        other ->
            Decode.fail ("unknown displayRole: " ++ other)



-- Dataset


encodeDataset : Dataset -> Encode.Value
encodeDataset dataset =
    Encode.object
        [ ( "id", Encode.string dataset.id )
        , ( "name", Encode.string dataset.name )
        , ( "fields", Encode.list encodeFieldConfig dataset.fields )
        , ( "items", Encode.list encodeItem dataset.items )
        , ( "imageLinkField", encodeMaybeString dataset.imageLinkField )
        , ( "titleLinkField", encodeMaybeString dataset.titleLinkField )
        , ( "filterOrder", Encode.list Encode.string dataset.filterOrder )
        , ( "wrapTitleOnCard", Encode.bool dataset.wrapTitleOnCard )
        ]


encodeMaybeString : Maybe String -> Encode.Value
encodeMaybeString maybeValue =
    case maybeValue of
        Just s ->
            Encode.string s

        Nothing ->
            Encode.null


-- decodeDataset : Decode.Decoder Dataset
-- decodeDataset =
--     Decode.map7 Dataset
--         (Decode.field "id" Decode.string)
--         (Decode.field "name" Decode.string)
--         (Decode.field "fields" (Decode.list decodeFieldConfig))
--         (Decode.field "items" (Decode.list decodeItem))
--         (Decode.field "imageLinkField" (Decode.nullable Decode.string))
--         (Decode.field "titleLinkField" (Decode.nullable Decode.string))
--         decodeFilterOrder

decodeDataset : Decode.Decoder Dataset
decodeDataset =
    Decode.succeed Dataset
        |> decodeAndMap (Decode.field "id" Decode.string)
        |> decodeAndMap (Decode.field "name" Decode.string)
        |> decodeAndMap (Decode.field "fields" (Decode.list decodeFieldConfig))
        |> decodeAndMap (Decode.field "items" (Decode.list decodeItem))
        |> decodeAndMap (Decode.field "imageLinkField" (Decode.nullable Decode.string))
        |> decodeAndMap (Decode.field "titleLinkField" (Decode.nullable Decode.string))
        |> decodeAndMap decodeFilterOrder
        |> decodeAndMap (Decode.oneOf [ Decode.field "wrapTitleOnCard" Decode.bool, Decode.succeed False ])



{-| filterOrderが無い（このフィールドを追加する前に保存されたデータ）場合は
空リストとして扱う。
-}
decodeFilterOrder : Decode.Decoder (List String)
decodeFilterOrder =
    Decode.oneOf
        [ Decode.field "filterOrder" (Decode.list Decode.string)
        , Decode.succeed []
        ]