-- src/View/DetailModal.elm

module View.DetailModal exposing (view)

import Filter
import Html exposing (Html, a, button, div, h2, img, span, text)
import Html.Attributes exposing (class, disabled, href, src, target)
import Html.Events exposing (onClick)
import ItemAccess exposing (detailFields, findFieldByRole, getText, getValue, valueToText)
import Svg exposing (path, svg)
import Svg.Attributes as SvgAttr
import Types
    exposing
        ( Dataset
        , DetailModalMsg(..)
        , DisplayRole(..)
        , EditModalMsg(..)
        , FieldConfig
        , Item
        , Model
        , Msg(..)
        )


view : Model -> Html Msg
view model =
    case model.detailModalItemId of
        Nothing ->
            text ""

        Just currentId ->
            let
                visibleItems =
                    Filter.visibleItems model.searchState model.filterUi model.dataset

                maybeCurrentItem =
                    List.filter (\it -> it.id == currentId) model.dataset.items |> List.head

                currentIndex =
                    findItemIndex currentId visibleItems

                totalCount =
                    List.length visibleItems

                hasPrev =
                    Maybe.map (\idx -> idx > 0) currentIndex |> Maybe.withDefault False

                hasNext =
                    Maybe.map (\idx -> idx < totalCount - 1) currentIndex |> Maybe.withDefault False
            in
            case maybeCurrentItem of
                Just item ->
                    overlay model.dataset item hasPrev hasNext (currentIndex |> Maybe.map (\i -> i + 1) |> Maybe.withDefault 0) totalCount

                Nothing ->
                    text ""


overlay : Dataset -> Item -> Bool -> Bool -> Int -> Int -> Html Msg
overlay dataset item hasPrev hasNext currentNumber totalCount =
    div [ class "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10" ]
        [ div
            [ class "absolute inset-0 bg-black/60 backdrop-blur-sm"
            , onClick (DetailModalMsg CloseDetail)
            ]
            []
        , navButton hasPrev PrevCard "left-4 md:left-8" chevronLeftIcon "前のカード (←)"
        , modalContent dataset item currentNumber totalCount
        , navButton hasNext NextCard "right-4 md:right-8" chevronRightIcon "次のカード (→)"
        ]

navButton : Bool -> DetailModalMsg -> String -> Html Msg -> String -> Html Msg
navButton enabled action positionClasses iconNode tip =
    button
        [ class
            ("fixed top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full p-0 border-0 leading-none flex items-center justify-center transition shadow-lg outline-none select-none "
                ++ positionClasses
                ++ (if enabled then
                        " bg-white/95 text-neutral-700 hover:text-neutral-950 hover:bg-white hover:scale-110 cursor-pointer border border-neutral-200/60"

                    else
                        " bg-white/30 text-neutral-400 opacity-40 cursor-not-allowed border border-transparent"
                   )
            )
        , onClick (DetailModalMsg action)
        , disabled (not enabled)
        , Html.Attributes.title tip
        ]
        [ iconNode ]


-- MARK: SVG 矢印アイコン（視覚的重心を補正）

chevronLeftIcon : Html Msg
chevronLeftIcon =
    svg
        [ SvgAttr.width "24"
        , SvgAttr.height "24"
        , SvgAttr.viewBox "0 0 24 24"
        , SvgAttr.fill "none"
        , SvgAttr.stroke "currentColor"
        , SvgAttr.strokeWidth "2.5"
        , SvgAttr.strokeLinecap "round"
        , SvgAttr.strokeLinejoin "round"
        , SvgAttr.class "shrink-0 -translate-x-0.5 pointer-events-none"
        ]
        [ path [ SvgAttr.d "M15 19l-7-7 7-7" ] [] ]


chevronRightIcon : Html Msg
chevronRightIcon =
    svg
        [ SvgAttr.width "24"
        , SvgAttr.height "24"
        , SvgAttr.viewBox "0 0 24 24"
        , SvgAttr.fill "none"
        , SvgAttr.stroke "currentColor"
        , SvgAttr.strokeWidth "2.5"
        , SvgAttr.strokeLinecap "round"
        , SvgAttr.strokeLinejoin "round"
        , SvgAttr.class "shrink-0 translate-x-0.5 pointer-events-none"
        ]
        [ path [ SvgAttr.d "M9 5l7 7-7 7" ] [] ]


modalContent : Dataset -> Item -> Int -> Int -> Html Msg
modalContent dataset item currentNumber totalCount =
    let
        maybeImg =
            findFieldByRole Image dataset.fields
                |> Maybe.andThen (\field -> getText field.key item)
                |> Maybe.andThen
                    (\url ->
                        if String.isEmpty (String.trim url) then
                            Nothing

                        else
                            Just url
                    )

        title =
            findFieldByRole Title dataset.fields
                |> Maybe.andThen (\field -> getText field.key item)
                |> Maybe.withDefault "(無題)"
    in
    div [ class "relative z-20 bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-neutral-200" ]
        [ div [ class "px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50" ]
            [ div [ class "flex items-center gap-3" ]
                [ span [ class "text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-700" ]
                    [ text (String.fromInt currentNumber ++ " / " ++ String.fromInt totalCount) ]
                , h2 [ class "text-lg font-title font-bold text-neutral-800 truncate max-w-lg" ] [ text title ]
                ]
            , div [ class "flex items-center gap-2" ]
                [ button
                    [ class "px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                    , onClick (EditModalMsg (EditButtonClicked item.id))
                    ]
                    [ text "編集" ]
                , button
                    [ class "text-neutral-400 hover:text-neutral-700 p-1 text-lg rounded-md transition leading-none ml-2"
                    , onClick (DetailModalMsg CloseDetail)
                    ]
                    [ text "✕" ]
                ]
            ]
        , -- メインコンテンツ領域（縦スクロール対応）
          div [ class "p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6" ]
            [ -- 画像エリア
              case maybeImg of
                Just url ->
                    div [ class "md:w-1/2 flex items-center justify-center bg-neutral-50 rounded-lg p-2 border border-neutral-100 shrink-0 min-h-[250px]" ]
                        [ img [ src url, class "max-w-full max-h-[50vh] object-contain rounded" ] [] ]

                Nothing ->
                    text ""
            , -- 詳細情報一覧
              div [ class "flex-1 flex flex-col gap-4" ]
                (List.map (detailPropertyView item) (detailFields dataset.fields))
            ]
        ]


detailPropertyView : Item -> FieldConfig -> Html Msg
detailPropertyView item field =
    div [ class "border-b border-neutral-100 pb-2 flex flex-col gap-0.5" ]
        [ span [ class "text-xs font-medium text-neutral-400" ] [ text field.label ]
        , case getValue field.key item of
            Just value ->
                let
                    valText =
                        valueToText value
                in
                case field.displayRole of
                    Link ->
                        a
                            [ href valText
                            , target "_blank"
                            , class "text-sm text-blue-600 hover:underline break-all"
                            ]
                            [ text valText ]

                    _ ->
                        span [ class "text-sm text-neutral-800 whitespace-pre-wrap break-words" ]
                            [ text valText ]

            Nothing ->
                span [ class "text-sm text-neutral-300 italic" ] [ text "—" ]
        ]


findItemIndex : String -> List Item -> Maybe Int
findItemIndex targetId list =
    list
        |> List.indexedMap Tuple.pair
        |> List.filter (\( _, it ) -> it.id == targetId)
        |> List.head
        |> Maybe.map Tuple.first
