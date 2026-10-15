module ItemAccess exposing
    ( detailFields
    , findFieldByRole
    , getBool
    , getText
    , getTextList
    , getValue
    , valueToText
    )

import Dict
import Types exposing (DisplayRole(..), FieldConfig, Item, Value(..))


{-| 指定した表示方法を持つ最初のフィールド設定を探す。
Title / Image はデータセット内で通常一つずつ想定している。
-}
findFieldByRole : DisplayRole -> List FieldConfig -> Maybe FieldConfig
findFieldByRole role fields =
    List.filter (\field -> field.displayRole == role) fields
        |> List.head


getValue : String -> Item -> Maybe Value
getValue key item =
    Dict.get key item.values


getText : String -> Item -> Maybe String
getText key item =
    case getValue key item of
        Just (Text s) ->
            Just s

        _ ->
            Nothing


getTextList : String -> Item -> Maybe (List String)
getTextList key item =
    case getValue key item of
        Just (TextList xs) ->
            Just xs

        _ ->
            Nothing


getBool : String -> Item -> Maybe Bool
getBool key item =
    case getValue key item of
        Just (Boolean b) ->
            Just b

        _ ->
            Nothing


{-| 値を画面表示用の文字列に変換する。
-}
valueToText : Value -> String
valueToText value =
    case value of
        Text s ->
            s

        TextList xs ->
            String.join ", " xs

        Boolean b ->
            if b then
                "はい"

            else
                "いいえ"


{-| 大サイズカードの詳細情報欄に表示するフィールド一覧。
showOnCard が true のフィールドのうち、タイトルと画像はすでに専用の場所に
表示されているため除外する。
-}
detailFields : List FieldConfig -> List FieldConfig
detailFields fields =
    List.filter isDetailField fields


isDetailField : FieldConfig -> Bool
isDetailField field =
    field.showOnCard && field.displayRole /= Title && field.displayRole /= Image
