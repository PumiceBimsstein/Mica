module View.Card exposing (view)

import Html exposing (Html, a, button, div, h3, img, text)
import Html.Attributes exposing (attribute, class, href, src, target, title)
import Html.Events exposing (onClick, onMouseEnter, onMouseLeave)
import ItemAccess exposing (detailFields, findFieldByRole, getText, getValue, valueToText)
import Types exposing (CardSize(..), Dataset, DisplayRole(..), EditModalMsg(..), FieldConfig, Item, Msg(..))


view : Dataset -> CardSize -> Bool -> Maybe String -> Item -> Html Msg
view dataset size isSelected hoveredItemId item =
    case size of
        Small ->
            viewSmall dataset isSelected hoveredItemId item

        Medium ->
            viewMedium dataset isSelected hoveredItemId item

        Large ->
            viewLarge dataset isSelected hoveredItemId item



-- MARK:共通ヘルパー


imageUrl : Dataset -> Item -> Maybe String
imageUrl dataset item =
    findFieldByRole Image dataset.fields
        |> Maybe.andThen (\field -> getText field.key item)


titleText : Dataset -> Item -> Maybe String
titleText dataset item =
    findFieldByRole Title dataset.fields
        |> Maybe.andThen (\field -> getText field.key item)


linkUrl : Maybe String -> Item -> Maybe String
linkUrl maybeFieldKey item =
    maybeFieldKey |> Maybe.andThen (\key -> getText key item)


cardImage : String -> Html Msg
cardImage imgSrc =
    img [ src imgSrc, class "w-full h-full object-contain" ] []


linkedImage : Maybe String -> String -> Html Msg
linkedImage maybeUrl imgSrc =
    case maybeUrl of
        Just url ->
            a [ href url, target "_blank", class "block w-full h-full" ] [ cardImage imgSrc ]

        Nothing ->
            cardImage imgSrc


titleLink : Dataset -> Item -> Html Msg
titleLink dataset item =
    let
        label =
            Maybe.withDefault "(無題)" (titleText dataset item)
    in
    case linkUrl dataset.titleLinkField item of
        Just url ->
            a [ href url, target "_blank", class titleClasses ] [ text label ]

        Nothing ->
            h3 [ class titleClasses ] [ text label ]


titleClasses : String
titleClasses =
    "text-sm text-neutral-900 truncate block"


{-| カードのドラッグ並べ替え（SortableJS）・選択（マーキー選択・長押し）が
DOM上でこのアイテムを識別できるよう、id と選択状態の見た目を共通で付与する。
-}
cardContainerAttributes : Item -> Bool -> String -> List (Html.Attribute Msg)
cardContainerAttributes item isSelected baseClasses =
    [ attribute "data-id" item.id
    , class (baseClasses ++ selectedClasses isSelected)
    ]


selectedClasses : Bool -> String
selectedClasses isSelected =
    if isSelected then
        " ring-2 ring-neutral-900 ring-offset-2"

    else
        ""



-- 小サイズ：画像のみ。画像が無ければタイトルのみ。


viewSmall : Dataset -> Bool -> Maybe String -> Item -> Html Msg
viewSmall dataset isSelected hoveredItemId item =
    let
        isHovered =
            hoveredItemId == Just item.id
    in
    div
        (cardContainerAttributes item isSelected smallCardClasses
            ++ [ onMouseEnter (CardMouseEntered item.id)
               , onMouseLeave CardMouseLeft
               ]
        )
        [ smallCardBody dataset item
        --, editButton item.id
        , if isHovered then
            editButton item.id

          else
            text ""
        ]


smallCardClasses : String
smallCardClasses =
    "w-32 h-48 rounded-md border border-neutral-200 bg-white overflow-hidden flex items-center justify-center relative group"


smallCardBody : Dataset -> Item -> Html Msg
smallCardBody dataset item =
    case imageUrl dataset item of
        Just url ->
            linkedImage (linkUrl dataset.imageLinkField item) url

        Nothing ->
            div [ class "px-3 text-center text-sm text-neutral-700" ]
                [ text (Maybe.withDefault "(無題)" (titleText dataset item)) ]



-- 中サイズ：画像とタイトル（一行、はみ出しは省略記号）


viewMedium : Dataset -> Bool -> Maybe String -> Item -> Html Msg
viewMedium dataset isSelected hoveredItemId item =
    let
        isHovered =
            hoveredItemId == Just item.id
    in
    div
        (cardContainerAttributes item isSelected mediumCardClasses
            ++ [ onMouseEnter (CardMouseEntered item.id)
               , onMouseLeave CardMouseLeft
               ]
        )
        [ mediumCardImage dataset item
        , div [ class "px-2 py-2 flex-1 flex flex-col justify-between" ]
            [ titleLink dataset item
            , if isHovered then
                editButton item.id

              else
                text ""
            ]
        ]


mediumCardClasses : String
mediumCardClasses =
    "w-40 rounded-md border border-neutral-200 bg-white flex flex-col group relative"


mediumCardImage : Dataset -> Item -> Html Msg
mediumCardImage dataset item =
    div [ class "h-56 flex items-center justify-center bg-neutral-50 overflow-hidden" ]
        [ case imageUrl dataset item of
            Just url ->
                linkedImage (linkUrl dataset.imageLinkField item) url

            Nothing ->
                text ""
        ]



-- 大サイズ：横長、左に画像、右に詳細情報


viewLarge : Dataset -> Bool -> Maybe String -> Item -> Html Msg
viewLarge dataset isSelected hoveredItemId item =
    let
        isHovered =
            hoveredItemId == Just item.id
    in
    div
        (cardContainerAttributes item isSelected largeCardClasses
            ++ [ onMouseEnter (CardMouseEntered item.id)
               , onMouseLeave CardMouseLeft
               ]
        )
        [ largeCardImage dataset item
        , largeCardDetail dataset item isHovered
        ]


largeCardClasses : String
largeCardClasses =
    "w-full max-w-3xl rounded-md border border-neutral-200 bg-white overflow-hidden flex group"


largeCardImage : Dataset -> Item -> Html Msg
largeCardImage dataset item =
    div [ class "w-48 shrink-0 flex items-center justify-center bg-neutral-50" ]
        [ case imageUrl dataset item of
            Just url ->
                linkedImage (linkUrl dataset.imageLinkField item) url

            Nothing ->
                text ""
        ]


largeCardDetail : Dataset -> Item -> Bool -> Html Msg
largeCardDetail dataset item isHovered =
    div [ class "flex-1 px-4 py-3 flex flex-col gap-2 relative" ]
        (titleLink dataset item :: List.map (detailRow item) (detailFields dataset.fields)
            ++ [ if isHovered then
                    editButton item.id

                 else
                    text ""
               ]
        )


detailRow : Item -> FieldConfig -> Html Msg
detailRow item field =
    div [ class "text-sm" ]
        [ div [ class "text-neutral-400" ] [ text field.label ]
        , detailValueView item field
        ]

detailValueView : Item -> FieldConfig -> Html Msg
detailValueView item field =
    case getValue field.key item of
        Just value ->
            let
                valueText =
                    valueToText value
            in
            case field.displayRole of
                Link ->
                    a
                        [ href valueText
                        , target "_blank"
                        , class "text-neutral-800 hover:underline"
                        ]
                        [ text valueText ]

                _ ->
                    div [ class "text-neutral-800" ]
                        [ text valueText ]

        Nothing ->
            div [ class "text-neutral-800" ]
                [ text "—" ]



-- MARK:編集ボタン

editButton : String -> Html Msg
editButton itemId =
    button
        [ class editButtonClasses
        , onClick (EditModalMsg (EditButtonClicked itemId))
        , title "編集"
        ]
        [ text "edit" ]


editButtonClasses : String
editButtonClasses =
    "absolute top-2 right-2 z-10 w-8 h-6 rounded bg-neutral-700 hover:bg-neutral-800 text-white text-sm flex items-center justify-center shadow"