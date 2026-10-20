module View exposing (view)

import Filter
import Html exposing (Html, div, text, button, node)
import Html.Attributes exposing (class, id, style, disabled, value, type_, attribute, title)
import Html.Events exposing (onClick, onInput)
import Html.Keyed as Keyed
import Types exposing (CardSize(..), Dataset, EditModalMsg(..), Item, Model, Msg(..), SortModalMsg(..))
import View.Card as Card
import View.EditModal as EditModal
import View.FileModal as FileModal
import View.SettingsModal as SettingsModal
import View.Sidebar as Sidebar


view : Model -> Html Msg
view model =
    div [ class "flex" ]
        [ Sidebar.view model
        , mainArea model
        , FileModal.view model
        , SettingsModal.view model
        , EditModal.view model
        , sortModal model
        , actionButtonGroup model
        , scrollToTopButton
        ]


mainArea : Model -> Html Msg
mainArea model =
    div [ id "main-area", class mainAreaClasses ] [ mainContent model ]


mainAreaClasses : String
mainAreaClasses =
    "flex-1 h-screen overflow-y-auto p-6 bg-white flex flex-col gap-3"


mainContent : Model -> Html Msg
mainContent model =
    div
        [ class "flex flex-col gap-3 pt-12 pb-24 origin-top-left"
        , style "zoom" (String.fromFloat model.mainAreaCardScale)
        ]
        [ cardGrid model model.dataset (Filter.visibleItems model.searchState model.filterUi model.dataset)
        ]


actionButtonGroup : Model -> Html Msg
actionButtonGroup model =
    let
        isFiltered =
            Filter.isFilterActive model.filterUi model.dataset
    in
    div [ class "fixed top-6 right-6 z-30 flex flex-col items-end gap-2" ]
        [ -- 展開時に背景をクリックしたら閉じる透明オーバーレイ
            if model.actionMenuOpen then
                div
                    [ class "fixed inset-0 z-30"
                    , onClick ToggleActionMenu
                    ]
                    []

            else
                text ""

                -- トグルボタン（展開・格納スイッチ）
                , button
                    [ class "z-40 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 shadow-md text-neutral-700 hover:bg-neutral-50 cursor-pointer flex items-center gap-1"
                    , onClick ToggleActionMenu
                    ]
                    [ text
                        (if model.actionMenuOpen then
                            "✕ 閉じる"

                         else
                            "⚙ 操作"
                        )
                    ]

                -- 展開時に表示されるメニュー本体
                , if model.actionMenuOpen then
                    div [ class "z-40 flex flex-col gap-1.5 items-stretch bg-white border border-neutral-200 rounded-lg p-2 shadow-md min-w-[90px]" ]
                        [ button
                            [ class actionButtonClasses
                            , onClick (EditModalMsg CreateNewItem)
                            ]
                            [ text "＋ 追加" ]
                        , button
                            [ class actionButtonClasses
                            , onClick (SortModalMsg RequestOpen)
                            , disabled isFiltered
                            , title "フィルター使用時は無効"
                            ]
                            [ text "入れ替え" ]
                        , mainCardSizeSlider model.mainAreaCardScale
                        ]

                  else
                    text ""
                ]

actionButtonRapperClasses : String
actionButtonRapperClasses =
    "fixed top-6 right-6 z-30 flex flex-col gap-1.5 items-stretch bg-white border border-neutral-200 rounded-lg p-2 shadow-md min-w-[90px]"

actionButtonClasses : String
actionButtonClasses =
    "w-full px-3 py-1.5 text-xs border border-neutral-100 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-center"


scrollToTopButton : Html Msg
scrollToTopButton =
    button
        [ class scrollToTopButtonClasses
        , onClick ScrollToTopClicked
        ]
        [ text "Top" ]


scrollToTopButtonClasses : String
scrollToTopButtonClasses =
    "fixed bottom-6 right-6 z-40 px-3 py-1.5 text-xs text-neutral-600 bg-white/70 border border-neutral-300 rounded shadow-sm opacity-50 hover:opacity-100 transition-opacity duration-200"


emptyState : Html Msg
emptyState =
    div [ class "text-neutral-400 text-sm" ]
        [ text "データがありません。ファイル操作からデータを読み込んでください。" ]


noMatchState : Html Msg
noMatchState =
    div [ class "text-neutral-400 text-sm" ] [ text "条件に一致するカードがありません。" ]


{-| card-grid というidをつけ、JavaScript側（SortableJS・選択操作）がこの
コンテナを見つけられるようにする。並べ替え後の順序をModelにも正しく反映できるよう、
アイテムidをキーとしたHtml.Keyedで描画する。
-}

cardGrid : Model -> Dataset -> List Item -> Html Msg
cardGrid model dataset items =
    if List.isEmpty items then
        noMatchState

    else
        Keyed.node "div"
            [ class (cardGridClasses model.cardSize), id "card-grid" ]
            (List.map (cardKeyedEntry model dataset) items)


cardKeyedEntry : Model -> Dataset -> Item -> ( String, Html Msg )
cardKeyedEntry model dataset item =
    ( item.id, Card.view dataset model.cardSize False model.hoveredItemId item )

cardGridClasses : CardSize -> String
cardGridClasses size =
    case size of
        Small ->
            "flex flex-wrap gap-4"

        Medium ->
            "flex flex-wrap gap-4"

        Large ->
            "grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4"


-- [追加] 並べ替え専用モーダルの描画

sortModal : Model -> Html Msg
sortModal model =
    if not model.sortModalOpen then
        text ""

    else
        let
            scaleStr =
                String.fromFloat model.sortModalCardScale
            dataset = model.dataset
        in
        div [ class "fixed inset-0 z-50 bg-black/50 flex" ]
            [ div [ class "flex-1 h-full overflow-y-auto p-6 bg-white pointer-events-auto", id "sort-modal-scroll-area" ]
                [ node "sortable-card-grid"
                    [ class "flex flex-wrap gap-4 origin-top-left"
                    , id "sortable-card-grid"
                    , style "zoom" scaleStr
                    ]
                    (List.map (sortModalCardEntry dataset model.cardSize) dataset.items)
                ]
            , sortModalControls model
            ]


-- [変更] 個別の幅・高さ指定を撤廃し、カード単体は通常の要素として描画する
sortModalCardEntry : Dataset -> CardSize -> Item -> Html Msg
sortModalCardEntry dataset cardSize item =
    div 
        [ class "select-none modal-card-item shrink-0"
        , id ("sort-item-" ++ item.id)
        ]
        [ Card.view dataset cardSize False dataset.titleLinkField item ]


sortModalControls : Model -> Html Msg
sortModalControls model =
    div [ class "w-16 h-full bg-neutral-100 border-l border-neutral-200 flex flex-col items-center justify-start py-6 gap-8 z-10" ]
        [ button
            [ class "w-10 h-10 bg-neutral-800 text-white rounded-full flex items-center justify-center text-xs hover:bg-neutral-700 shadow"
            , id "sort-modal-close-btn"
            ]
            [ text "完了" ]
        , cardSizeSlider model.sortModalCardScale
        ]

cardSizeSlider : Float -> Html Msg
cardSizeSlider currentScale =
    div [ class "flex flex-col items-center gap-2 h-48" ]
        [ div [ class "text-[10px] text-neutral-500 font-bold" ] [ text "サイズ" ]
        , Html.input
            [ type_ "range"
            , Html.Attributes.min "0.5"
            , Html.Attributes.max "2.0"
            , Html.Attributes.step "0.05"
            , value (String.fromFloat currentScale)
            , onInput (\val -> SortModalMsg (SetCardScale (String.toFloat val |> Maybe.withDefault 1.0)))
            , class "h-32 [writing-mode:vertical-lr] [direction:rtl] cursor-pointer"
            ]
            []
        ]


mainCardSizeSlider : Float -> Html Msg
mainCardSizeSlider currentScale =
    div [ class "flex flex-col items-center gap-1 pt-2 border-t border-neutral-100" ]
        [ div [ class "text-[10px] text-neutral-500 font-bold" ] [ text "サイズ" ]
        , Html.input
            [ type_ "range"
            , Html.Attributes.min "0.5"
            , Html.Attributes.max "2.0"
            , Html.Attributes.step "0.05"
            , value (String.fromFloat currentScale)
            , onInput (\val -> SetMainCardScale (String.toFloat val |> Maybe.withDefault 1.0))
            , class "h-32 [writing-mode:vertical-lr] [direction:rtl] cursor-pointer"
            ]
            []
        ]