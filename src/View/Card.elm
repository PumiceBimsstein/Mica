module View.Card exposing (view)

import Html exposing (Html, a, button, div, h3, img, text)
import Html.Attributes exposing (attribute, class, href, src, target, title)
import Html.Events exposing (onClick, onMouseEnter, onMouseLeave)
import ItemAccess exposing (detailFields, findFieldByRole, getText, getValue, valueToText)
import Types
    exposing
        ( CardSize(..)
        , Dataset
        , DetailModalMsg(..)
        , DisplayRole(..)
        , EditModalMsg(..)
        , FieldConfig
        , Item
        , Msg(..)
        )


-- MARK: メインエントリ

view : Dataset -> CardSize -> Bool -> Maybe String -> Item -> Html Msg
view dataset size isSelected hoveredItemId item =
    let
        isHovered =
            hoveredItemId == Just item.id
    in
    case size of
        Small ->
            viewSmall dataset isSelected isHovered item

        Medium ->
            viewMedium dataset isSelected isHovered item

        Large ->
            viewLarge dataset isSelected isHovered item



-- MARK: サイズ別カードビュー

viewSmall : Dataset -> Bool -> Bool -> Item -> Html Msg
viewSmall dataset isSelected isHovered item =
    div (buildCardAttributes smallCardClasses isSelected item.id)
        (appendEditButtonIf isHovered item.id
            [ smallCardBody dataset item ]
        )


viewMedium : Dataset -> Bool -> Bool -> Item -> Html Msg
viewMedium dataset isSelected isHovered item =
    div (buildCardAttributes mediumCardClasses isSelected item.id)
        [ mediumCardImage dataset item
        , mediumCardFooter dataset item isHovered
        ]


viewLarge : Dataset -> Bool -> Bool -> Item -> Html Msg
viewLarge dataset isSelected isHovered item =
    div (buildCardAttributes largeCardClasses isSelected item.id)
        [ largeCardImage dataset item
        , largeCardDetail dataset item isHovered
        ]


-- MARK: 各サイズ内パーツ


smallCardBody : Dataset -> Item -> Html Msg
smallCardBody dataset item =
    case imageUrl dataset item of
        Just url ->
            renderLinkedImage dataset item url

        Nothing ->
            renderFallbackTitle dataset item


mediumCardImage : Dataset -> Item -> Html Msg
mediumCardImage dataset item =
    div [ class "h-56 flex items-center justify-center bg-neutral-50 overflow-hidden" ]
        [ case imageUrl dataset item of
            Just url ->
                renderLinkedImage dataset item url

            Nothing ->
                text ""
        ]


mediumCardFooter : Dataset -> Item -> Bool -> Html Msg
mediumCardFooter dataset item isHovered =
    div [ class "px-2 py-2 flex-1 flex flex-col justify-between" ]
        (appendEditButtonIf isHovered item.id
            [ renderTitle dataset item ]
        )


largeCardImage : Dataset -> Item -> Html Msg
largeCardImage dataset item =
    div [ class "w-48 shrink-0 flex items-center justify-center bg-neutral-50" ]
        [ case imageUrl dataset item of
            Just url ->
                renderLinkedImage dataset item url

            Nothing ->
                text ""
        ]


largeCardDetail : Dataset -> Item -> Bool -> Html Msg
largeCardDetail dataset item isHovered =
    let
        rows =
            renderTitle dataset item
                :: List.map (detailRow item) (detailFields dataset.fields)
    in
    div [ class "flex-1 px-4 py-3 flex flex-col gap-2 relative" ]
        (appendEditButtonIf isHovered item.id rows)


-- MARK: タイトル・画像描画パイプライン


renderTitle : Dataset -> Item -> Html Msg
renderTitle dataset item =
    let
        target =
            resolveLinkTarget dataset.titleLinkField item

        classes =
            titleClasses dataset.wrapTitleOnCard
    in
    titleText dataset item
        |> Maybe.withDefault "(無題)"
        |> text
        |> wrapTitleWithLink target classes item.id


renderFallbackTitle : Dataset -> Item -> Html Msg
renderFallbackTitle dataset item =
    let
        targetlink =
            resolveLinkTarget dataset.imageLinkField item

        titleString =
            titleText dataset item
                |> Maybe.withDefault "(無題)"

        baseClasses =
            "w-full h-full flex items-center justify-center px-3 text-center text-sm text-neutral-700 font-title font-medium tracking-wide"
    in
    case targetlink of
        LinkDetail ->
            button
                [ class (baseClasses ++ " cursor-pointer hover:text-blue-600 hover:underline")
                , onClick (DetailModalMsg (OpenDetail item.id))
                , title titleString
                ]
                [ text titleString ]

        LinkUrl url ->
            a
                [ class (baseClasses ++ " hover:text-blue-600 hover:underline")
                , href url
                , target "_blank"
                , title titleString
                ]
                [ text titleString ]

        NoLink ->
            div [ class baseClasses, title titleString ]
                [ text titleString ]


renderLinkedImage : Dataset -> Item -> String -> Html Msg
renderLinkedImage dataset item url =
    let
        target =
            resolveLinkTarget dataset.imageLinkField item

        titleString =
            titleText dataset item
                |> Maybe.withDefault ""

        imageNode =
            renderRawImage titleString url
    in
    wrapImageWithLink target item.id titleString imageNode


renderRawImage : String -> String -> Html Msg
renderRawImage titleString imgSrc =
    img
        [ src imgSrc
        , class "w-full h-full object-contain"
        , title titleString
        ]
        []


-- MARK: リンク判定

type CardLinkTarget
    = LinkDetail
    | LinkUrl String
    | NoLink


resolveLinkTarget : Maybe String -> Item -> CardLinkTarget
resolveLinkTarget maybeFieldKey item =
    case maybeFieldKey of
        Just "__detail__" ->
            LinkDetail

        Just fieldKey ->
            case linkUrl (Just fieldKey) item of
                Just url ->
                    LinkUrl url

                Nothing ->
                    NoLink

        Nothing ->
            NoLink


wrapTitleWithLink : CardLinkTarget -> String -> String -> Html Msg -> Html Msg
wrapTitleWithLink linktarget baseClasses itemId content =
    case linktarget of
        LinkDetail ->
            button
                [ class (baseClasses ++ " cursor-pointer hover:text-blue-600 hover:underline text-left w-full")
                , onClick (DetailModalMsg (OpenDetail itemId))
                ]
                [ content ]

        LinkUrl url ->
            a
                [ class (baseClasses ++ " hover:underline")
                , href url
                , target "_blank"
                ]
                [ content ]

        NoLink ->
            h3 [ class baseClasses ] [ content ]


wrapImageWithLink : CardLinkTarget -> String -> String -> Html Msg -> Html Msg
wrapImageWithLink linktarget itemId titleString imageNode =
    case linktarget of
        LinkDetail ->
            button
                [ class "block w-full h-full cursor-pointer hover:opacity-90 transition p-0 border-0 bg-transparent text-left"
                , onClick (DetailModalMsg (OpenDetail itemId))
                , title titleString
                ]
                [ imageNode ]

        LinkUrl url ->
            a
                [ class "block w-full h-full cursor-pointer hover:opacity-90 transition"
                , href url
                , target "_blank"
                , title titleString
                ]
                [ imageNode ]

        NoLink ->
            imageNode



-- MARK: 大サイズカード詳細フィールド

detailRow : Item -> FieldConfig -> Html Msg
detailRow item field =
    detailValueView item field
        |> wrapDetailRow field.label


wrapDetailRow : String -> Html Msg -> Html Msg
wrapDetailRow labelText valueNode =
    div [ class "text-sm" ]
        [ div [ class "text-neutral-400" ] [ text labelText ]
        , valueNode
        ]


detailValueView : Item -> FieldConfig -> Html Msg
detailValueView item field =
    case getValue field.key item of
        Just val ->
            formatDetailValue field.displayRole (valueToText val)

        Nothing ->
            emptyDetailPlaceholder


formatDetailValue : DisplayRole -> String -> Html Msg
formatDetailValue role textValue =
    case role of
        Link ->
            a
                [ href textValue
                , target "_blank"
                , class "text-neutral-800 hover:underline"
                ]
                [ text textValue ]

        _ ->
            div [ class "text-neutral-800" ]
                [ text textValue ]


emptyDetailPlaceholder : Html Msg
emptyDetailPlaceholder =
    div [ class "text-neutral-800" ] [ text "—" ]



-- MARK: コンテナ属性・デコレータ

buildCardAttributes : String -> Bool -> String -> List (Html.Attribute Msg)
buildCardAttributes baseClasses isSelected itemId =
    [ attribute "data-id" itemId
    , class (appendSelectedClass isSelected baseClasses)
    , onMouseEnter (CardMouseEntered itemId)
    , onMouseLeave CardMouseLeft
    ]


appendSelectedClass : Bool -> String -> String
appendSelectedClass isSelected base =
    if isSelected then
        base ++ " ring-2 ring-neutral-900 ring-offset-2"

    else
        base


appendEditButtonIf : Bool -> String -> List (Html Msg) -> List (Html Msg)
appendEditButtonIf isHovered itemId elements =
    if isHovered then
        elements ++ [ editButton itemId ]

    else
        elements


editButton : String -> Html Msg
editButton itemId =
    button
        [ class editButtonClasses
        , onClick (EditModalMsg (EditButtonClicked itemId))
        , title "編集"
        ]
        [ text "edit" ]



-- MARK: データ抽出

imageUrl : Dataset -> Item -> Maybe String
imageUrl dataset item =
    findFieldByRole Image dataset.fields
        |> Maybe.andThen (\field -> getText field.key item)
        |> Maybe.andThen
            (\url ->
                if String.isEmpty (String.trim url) then
                    Nothing

                else
                    Just url
            )

titleText : Dataset -> Item -> Maybe String
titleText dataset item =
    findFieldByRole Title dataset.fields
        |> Maybe.andThen (\field -> getText field.key item)


linkUrl : Maybe String -> Item -> Maybe String
linkUrl maybeFieldKey item =
    maybeFieldKey
        |> Maybe.andThen (\key -> getText key item)


smallCardClasses : String
smallCardClasses =
    "w-32 h-48 rounded-md border border-neutral-200 bg-white overflow-hidden flex items-center justify-center relative group"


mediumCardClasses : String
mediumCardClasses =
    "w-40 rounded-md border border-neutral-200 bg-white flex flex-col group relative"


largeCardClasses : String
largeCardClasses =
    "w-full max-w-3xl rounded-md border border-neutral-200 bg-white overflow-hidden flex group"


titleClasses : Bool -> String
titleClasses shouldWrap =
    let
        overflowClass =
            if shouldWrap then
                "break-words whitespace-normal leading-snug"

            else
                "truncate block"
    in
    "text-sm text-neutral-900 font-title font-semibold tracking-wide " ++ overflowClass


editButtonClasses : String
editButtonClasses =
    "absolute top-2 right-2 z-10 w-8 h-6 rounded bg-neutral-700 hover:bg-neutral-800 text-white text-sm flex items-center justify-center shadow"
