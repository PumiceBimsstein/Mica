module View exposing (view)

import Json.Decode as Decode
import File
import Filter
import Html exposing (Html, div, text, button, node, span)
import Html.Attributes exposing (class, id, style, disabled, value, type_, title)
import Html.Events exposing (onClick, onInput, custom)
import Html.Keyed as Keyed
import Svg exposing (path, svg)
import Svg.Attributes as SvgAttr
import View.Card as Card
import View.DetailModal as DetailModal
import View.EditModal as EditModal
import View.FileModal as FileModal
import View.SettingsModal as SettingsModal
import View.Sidebar as Sidebar
import Types
    exposing (
        CardSize(..), Dataset, EditModalMsg(..)
        , FieldConfig, AutoSortState
        , FileFlowMsg(..), Item, Model, Msg(..)
        , SortModalMsg(..)
        , AutoSortMsg(..)
        , CardActionMsg(..)
        )


view : Model -> Html Msg
view model =
    div [ class "flex" ]
        [ Sidebar.view model
        , mainArea model
        , FileModal.view model
        , SettingsModal.view model
        , EditModal.view model
        , DetailModal.view model
        , sortModal model
        , autoSortModalView model
        , actionButtonGroup model
        , copyDeleteModeBanner model
        , toastNotificationView model.toast
        , scrollToTopButton
        ]


mainArea : Model -> Html Msg
mainArea model =
    div
        [ class "flex-1 h-screen relative overflow-hidden flex flex-col"
        , custom "dragenter" dragEnterDecoder
        , custom "dragover" dragOverDecoder
        ]
        [ -- 通常のカードスクロール領域
          div
            [ id "main-area"
            , class mainAreaClasses
            ]
            [ mainContent model ]

        -- ドラッグ中のみ最前面（z-50）を全面覆うオーバーレイ
        , if model.isDraggingFile then
            dropOverlay

          else
            text ""
        ]

mainAreaClasses : String
mainAreaClasses =
    "flex-1 h-full overflow-y-auto p-6 bg-white flex flex-col gap-3"


mainContent : Model -> Html Msg
mainContent model =
    div
        [ class "flex flex-col gap-3 pt-12 pb-24 origin-top-left"
        , style "zoom" (String.fromFloat model.mainAreaCardScale)
        ]
        [ cardGrid model model.dataset (Filter.visibleItems model.searchState model.filterUi model.dataset)
        ]


-- MARK: 操作メニュー
actionButtonGroup : Model -> Html Msg
actionButtonGroup model =
    div [ class "fixed top-6 right-6 z-30 flex flex-col items-end gap-2" ]
        [ menuBackdrop model.actionMenuOpen
        , menuToggleButton model.actionMenuOpen
        , if model.actionMenuOpen then
            actionMenuDropdown model

          else
            text ""
        ]


menuBackdrop : Bool -> Html Msg
menuBackdrop isOpen =
    if isOpen then
        div [ class "fixed inset-0 z-30", onClick ToggleActionMenu ] []

    else
        text ""


menuToggleButton : Bool -> Html Msg
menuToggleButton isOpen =
    button
        [ class "z-40 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 shadow-md text-neutral-700 hover:bg-neutral-50 cursor-pointer flex items-center gap-1"
        , onClick ToggleActionMenu
        ]
        [ text
            (if isOpen then
                "✕ 閉じる"

             else
                "⚙ 操作"
            )
        ]


actionMenuDropdown : Model -> Html Msg
actionMenuDropdown model =
    let
        isFiltered =
            Filter.isFilterActive model.filterUi model.dataset
    in
    div [ class "z-40 flex flex-col gap-1.5 items-stretch bg-white border border-neutral-200 rounded-lg p-2 shadow-md min-w-[120px]" ]
        [ addItemButton
        , manualSortButton isFiltered
        , autoSortButton
        , copyDeleteModeButton model.copyDeleteMode
        , mainCardSizeSlider model.mainAreaCardScale
        ]


addItemButton : Html Msg
addItemButton =
    button
        [ class actionMenuButtonClasses
        , onClick (EditModalMsg CreateNewItem)
        ]
        [ text "＋ 追加" ]


manualSortButton : Bool -> Html Msg
manualSortButton isFiltered =
    button
        [ class actionMenuButtonClasses
        , onClick (SortModalMsg RequestOpen)
        , disabled isFiltered
        , title
            (if isFiltered then
                "フィルター使用時は無効"

             else
                "手動で並べ替え"
            )
        ]
        [ text "手動並べ替え" ]


autoSortButton : Html Msg
autoSortButton =
    button
        [ class actionMenuButtonClasses
        , onClick (AutoSortMsg OpenModal)
        ]
        [ text "ソート" ]


copyDeleteModeButton : Bool -> Html Msg
copyDeleteModeButton isModeActive =
    button
        [ class (copyDeleteButtonClasses isModeActive)
        , onClick (CardActionMsg ToggleMode)
        ]
        [ text (if isModeActive then "✓ コピー・削除中" else "コピーと削除") ]


actionMenuButtonClasses : String
actionMenuButtonClasses =
    "w-full px-3 py-1.5 text-xs border border-neutral-100 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-center cursor-pointer"


copyDeleteButtonClasses : Bool -> String
copyDeleteButtonClasses isActive =
    if isActive then
        "w-full px-3 py-1.5 text-xs border rounded font-semibold bg-amber-500 text-white shadow-xs transition cursor-pointer text-center"

    else
        actionMenuButtonClasses


cardKeyedEntry : Model -> Dataset -> Item -> ( String, Html Msg )
cardKeyedEntry model dataset item =
    ( item.id, Card.view dataset model.cardSize False model.hoveredItemId model.copyDeleteMode item )


-- MARK: コピー・削除モード中の通知
copyDeleteModeBanner : Model -> Html Msg
copyDeleteModeBanner model =
    if not model.copyDeleteMode then
        text ""

    else
        div [ class "fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-3 text-xs font-semibold" ]
            [ span [] [ text "コピー・削除モード" ]
            , button
                [ class "bg-amber-700 hover:bg-amber-800 text-white px-2 py-0.5 rounded text-[11px] cursor-pointer"
                , onClick (CardActionMsg ToggleMode)
                ]
                [ text "終了" ]
            ]


-- MARK: スナックバー（トースト通知）

toastNotificationView : Maybe Types.Toast -> Html Msg
toastNotificationView maybeToast =
    case maybeToast of
        Just toast ->
            div [ class "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm animate-bounce-in" ]
                [ span [ class "font-medium" ] [ text toast.message ]
                , if toast.showUndo then
                    button
                        [ class "text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                        , onClick (CardActionMsg UndoFromToast)
                        ]
                        [ text "元に戻す" ]

                  else
                    text ""
                , button
                    [ class "text-neutral-400 hover:text-white p-1 text-xs cursor-pointer ml-1"
                    , onClick (CardActionMsg DismissToast)
                    ]
                    [ text "✕" ]
                ]

        Nothing ->
            text ""


autoSortModalView : Model -> Html Msg
autoSortModalView model =
    if not model.autoSortModalOpen then
        text ""

    else
        autoSortOverlay model


autoSortOverlay : Model -> Html Msg
autoSortOverlay model =
    div [ class "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" ]
        [ autoSortBackdrop
        , autoSortDialog model
        ]


autoSortBackdrop : Html Msg
autoSortBackdrop =
    div
        [ class "absolute inset-0"
        , onClick (AutoSortMsg CloseModal)
        ]
        []


autoSortDialog : Model -> Html Msg
autoSortDialog model =
    div [ class "relative bg-white rounded-xl shadow-2xl border border-neutral-200 p-5 w-full max-w-md flex flex-col gap-4 z-10" ]
        [ autoSortHeader
        , autoSortBody model.dataset.fields model.autoSortState
        , autoSortFooter
        ]


-- MARK: ヘッダー

autoSortHeader : Html Msg
autoSortHeader =
    div [ class "flex items-center justify-between border-b border-neutral-100 pb-2" ]
        [ span [ class "text-sm font-bold text-neutral-800" ] [ text "カードのソート（並べ替え）" ]
        , button
            [ class "text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer leading-none"
            , onClick (AutoSortMsg CloseModal)
            ]
            [ text "✕" ]
        ]


-- MARK: フォーム本体

autoSortBody : List FieldConfig -> AutoSortState -> Html Msg
autoSortBody fields state =
    div [ class "flex flex-col gap-3 text-xs" ]
        [ primarySortSection fields state
        , secondarySortSection fields state
        , autoSortNote
        ]


-- 第1優先キー設定
primarySortSection : List FieldConfig -> AutoSortState -> Html Msg
primarySortSection fields state =
    div [ class "flex flex-col gap-1" ]
        [ span [ class "font-semibold text-neutral-600" ] [ text "第1優先項目" ]
        , div [ class "flex gap-2" ]
            [ primaryFieldSelect fields state.primaryField
            , directionSelect state.primaryDirection (\d -> AutoSortMsg (SetPrimaryDirection d))
            ]
        ]


-- 第2優先キー設定
secondarySortSection : List FieldConfig -> AutoSortState -> Html Msg
secondarySortSection fields state =
    div [ class "flex flex-col gap-1 pt-2 border-t border-neutral-100" ]
        [ span [ class "font-semibold text-neutral-600" ] [ text "第2優先項目（同値の場合）" ]
        , div [ class "flex gap-2" ]
            [ secondaryFieldSelect fields state.secondaryField
            , directionSelect state.secondaryDirection (\d -> AutoSortMsg (SetSecondaryDirection d))
            ]
        ]


-- MARK: セレクトボックス・選択肢部品

primaryFieldSelect : List FieldConfig -> String -> Html Msg
primaryFieldSelect fields currentField =
    Html.select
        [ class "flex-1 border border-neutral-200 rounded px-2 py-1.5 bg-white cursor-pointer"
        , onInput (AutoSortMsg << SetPrimaryField)
        ]
        (List.map (fieldOption currentField) fields)


secondaryFieldSelect : List FieldConfig -> Maybe String -> Html Msg
secondaryFieldSelect fields maybeSelectedKey =
    Html.select
        [ class "flex-1 border border-neutral-200 rounded px-2 py-1.5 bg-white cursor-pointer"
        , onInput (\val -> AutoSortMsg (SetSecondaryField (stringToMaybe val)))
        ]
        (Html.option [ Html.Attributes.value "", Html.Attributes.selected (maybeSelectedKey == Nothing) ] [ text "（指定なし）" ]
            :: List.map (secondaryFieldOption maybeSelectedKey) fields
        )


fieldOption : String -> FieldConfig -> Html Msg
fieldOption currentKey field =
    Html.option
        [ Html.Attributes.value field.key
        , Html.Attributes.selected (field.key == currentKey)
        ]
        [ text field.label ]


secondaryFieldOption : Maybe String -> FieldConfig -> Html Msg
secondaryFieldOption maybeSelectedKey field =
    Html.option
        [ Html.Attributes.value field.key
        , Html.Attributes.selected (maybeSelectedKey == Just field.key)
        ]
        [ text field.label ]


directionSelect : Types.SortDirection -> (Types.SortDirection -> Msg) -> Html Msg
directionSelect currentDir toMsg =
    Html.select
        [ class "w-24 border border-neutral-200 rounded px-2 py-1.5 bg-white cursor-pointer"
        , onInput (\val -> toMsg (if val == "desc" then Types.Descending else Types.Ascending))
        ]
        [ Html.option [ Html.Attributes.value "asc", Html.Attributes.selected (currentDir == Types.Ascending) ] [ text "昇順 (A→Z)" ]
        , Html.option [ Html.Attributes.value "desc", Html.Attributes.selected (currentDir == Types.Descending) ] [ text "降順 (Z→A)" ]
        ]


autoSortNote : Html Msg
autoSortNote =
    span [ class "text-[11px] text-neutral-400" ]
        [ text "※ 数値混じりの項目は自然順で整列されます。未入力のカードは常に末尾に配置されます。" ]


-- MARK: フッター

autoSortFooter : Html Msg
autoSortFooter =
    div [ class "flex justify-end gap-2 pt-2 border-t border-neutral-100" ]
        [ button
            [ class "px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded cursor-pointer transition"
            , onClick (AutoSortMsg CloseModal)
            ]
            [ text "キャンセル" ]
        , button
            [ class "px-4 py-1.5 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 rounded shadow-xs cursor-pointer transition"
            , onClick (AutoSortMsg Apply)
            ]
            [ text "ソート実行" ]
        ]


stringToMaybe : String -> Maybe String
stringToMaybe str =
    if String.isEmpty (String.trim str) then
        Nothing

    else
        Just str


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


noMatchState : Html Msg
noMatchState =
    div [ class "text-neutral-400 text-sm" ] [ text "条件に一致するカードがありません。" ]


cardGrid : Model -> Dataset -> List Item -> Html Msg
cardGrid model dataset items =
    if List.isEmpty items then
        noMatchState

    else
        Keyed.node "div"
            [ class (cardGridClasses model.cardSize), id "card-grid" ]
            (List.map (cardKeyedEntry model dataset) items)


cardGridClasses : CardSize -> String
cardGridClasses size =
    case size of
        Small ->
            "flex flex-wrap gap-4"

        Medium ->
            "flex flex-wrap gap-4"

        Large ->
            "grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4"


-- 並べ替えモーダル

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


sortModalCardEntry : Dataset -> CardSize -> Item -> Html Msg
sortModalCardEntry dataset cardSize item =
    div 
        [ class "select-none modal-card-item shrink-0"
        , id ("sort-item-" ++ item.id)
        ]
        [ Card.view dataset cardSize False Nothing False item ]


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

-- MARK: ドラッグ＆ドロップ用オーバーレイ

dropOverlay : Html Msg
dropOverlay =
    div
        [ -- 画面全体を隙間なく覆い、イベントを確実にキャッチする
          class "absolute inset-0 z-50 bg-blue-500/15 backdrop-blur-xs flex flex-col p-6 transition-all cursor-pointer"
        , custom "dragover" dragOverDecoder
        , custom "dragleave" dragLeaveDecoder
        , custom "drop" dropDecoder
        , onClick (FileFlowMsg DragLeft)
        ]
        [ -- 内部の装飾要素はすべて pointer-events-none でマウス判定を無効化（dragleaveの誤爆防止）
          div [ class "w-full h-full border-4 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center pointer-events-none select-none bg-blue-50/20" ]
            [ div [ class "bg-white shadow-2xl rounded-2xl p-6 border border-blue-200 flex flex-col items-center gap-3 pointer-events-none select-none" ]
                [ dropUploadIcon
                , div [ class "text-base font-bold text-neutral-800" ] [ text "ファイルをドロップしてカードを追加" ]
                , div [ class "text-xs text-neutral-500" ] [ text "JSON または CSV ファイルに対応（追加モード）" ]
                , div [ class "text-[11px] text-neutral-400 mt-1" ] [ text "※ クリックまたは Esc キーでキャンセル" ]
                ]
            ]
        ]


dropUploadIcon : Html Msg
dropUploadIcon =
    svg
        [ SvgAttr.viewBox "0 0 24 24"
        , SvgAttr.fill "none"
        , SvgAttr.stroke "currentColor"
        , SvgAttr.strokeWidth "2"
        , SvgAttr.strokeLinecap "round"
        , SvgAttr.strokeLinejoin "round"
        , SvgAttr.class "w-10 h-10 text-blue-500"
        ]
        [ path [ SvgAttr.d "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" ] []
        , path [ SvgAttr.d "M7 10l5 5 5-5" ] []
        , path [ SvgAttr.d "M12 15V3" ] []
        ]


-- MARK: ドラッグ＆ドロップ用イベントデコーダー

dropDecoder : Decode.Decoder { message : Msg, stopPropagation : Bool, preventDefault : Bool }
dropDecoder =
    Decode.at [ "dataTransfer", "files" ] (Decode.list File.decoder)
        |> Decode.andThen
            (\files ->
                case files of
                    file :: _ ->
                        Decode.succeed
                            { message = FileFlowMsg (FileDropped file)
                            , stopPropagation = True
                            , preventDefault = True
                            }

                    [] ->
                        Decode.fail "No files"
            )


dragOverDecoder : Decode.Decoder { message : Msg, stopPropagation : Bool, preventDefault : Bool }
dragOverDecoder =
    Decode.succeed
        { message = FileFlowMsg DragOver
        , stopPropagation = True
        , preventDefault = True
        }


dragEnterDecoder : Decode.Decoder { message : Msg, stopPropagation : Bool, preventDefault : Bool }
dragEnterDecoder =
    Decode.succeed
        { message = FileFlowMsg DragEntered
        , stopPropagation = True
        , preventDefault = True
        }


dragLeaveDecoder : Decode.Decoder { message : Msg, stopPropagation : Bool, preventDefault : Bool }
dragLeaveDecoder =
    Decode.succeed
        { message = FileFlowMsg DragLeft
        , stopPropagation = True
        , preventDefault = True
        }