module MockData exposing (dataset)

import Dict
import Types exposing (Dataset, DisplayRole(..), FieldConfig, Item, Value(..))


{-| 開発中の表示確認用データ。IndexedDB / ファイル読込を実装したら
このモジュールは使われなくなる（Main.elm の init を差し替える）。
-}
dataset : Dataset
dataset =
    { id = "sample"
    , name = "サンプル書籍データ"
    , fields = fields
    , items = items
    , imageLinkField = Just "infoUrl"
    , titleLinkField = Just "infoUrl"
    , filterOrder = []
    }


fields : List FieldConfig
fields =
    [ { key = "title", label = "タイトル", displayRole = Title, showOnCard = True, filterable = False
        , isBool = False, isTextList = False, trueLabel = Nothing, falseLabel = Nothing }
    , { key = "author", label = "著者", displayRole = PlainText, showOnCard = True, filterable = True
        , isBool = False, isTextList = False, trueLabel = Nothing, falseLabel = Nothing }
    , { key = "coverUrl", label = "表紙画像", displayRole = Image, showOnCard = False, filterable = False
        , isBool = False, isTextList = False, trueLabel = Nothing, falseLabel = Nothing }
    , { key = "infoUrl", label = "詳細ページ", displayRole = Link, showOnCard = False, filterable = False
        , isBool = False, isTextList = False, trueLabel = Nothing, falseLabel = Nothing }
    , { key = "tags", label = "タグ", displayRole = PlainText, showOnCard = True, filterable = True
        , isBool = False, isTextList = True, trueLabel = Nothing, falseLabel = Nothing }
    , { key = "read", label = "既読", displayRole = PlainText, showOnCard = True, filterable = True
        , isBool = True, isTextList = False, trueLabel = Just "はい", falseLabel = Just "いいえ" }
    ]

items : List Item
items =
    [ mkItem "item-1"
        [ ( "title", Text "深海の記録" )
        , ( "author", Text "小野寺 環" )
        , ( "coverUrl", Text "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" )
        , ( "infoUrl", Text "https://example.com/books/item-1" )
        , ( "tags", TextList [ "海洋", "紀行" ] )
        , ( "read", Boolean True )
        ]
    , mkItem "item-2"
        [ ( "title", Text "北の灯台守" )
        , ( "author", Text "白石 誠" )
        , ( "coverUrl", Text "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400" )
        , ( "infoUrl", Text "https://example.com/books/item-2" )
        , ( "tags", TextList [ "小説" ] )
        , ( "read", Boolean False )
        ]
    , mkItem "item-3"
        [ ( "title", Text "都市計画ノート" )
        , ( "author", Text "本田 さくら" )
        , ( "tags", TextList [ "建築", "都市" ] )
        , ( "read", Boolean False )
        ]
    , mkItem "item-4"
        [ ( "title", Text "静かな実験室" )
        , ( "author", Text "川上 悠" )
        , ( "coverUrl", Text "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400" )
        , ( "infoUrl", Text "https://example.com/books/item-4" )
        , ( "tags", TextList [ "科学", "エッセイ" ] )
        , ( "read", Boolean True )
        ]
    , mkItem "item-5"
        [ ( "title", Text "旅の記憶、街の記憶" )
        , ( "author", Text "藤田 遼" )
        , ( "coverUrl", Text "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400" )
        , ( "infoUrl", Text "https://example.com/books/item-5" )
        , ( "tags", TextList [ "紀行" ] )
        , ( "read", Boolean False )
        ]
    ]


mkItem : String -> List ( String, Value ) -> Item
mkItem id pairs =
    { id = id, values = Dict.fromList pairs }