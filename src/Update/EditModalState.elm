module Update.EditModalState exposing
    ( setBooleanField
    , setTextField
    , setTextListField
    , confirmTextListField
    , setTextListItem
    , setTextListItemSize
    , setTextSize
    )

import Dict
import Types exposing (EditModalState, EditingFieldValue(..))


{-| 指定キーの EditingFieldValue を安全に更新するヘルパー
-}

updateField : String -> EditingFieldValue -> (EditingFieldValue -> EditingFieldValue) -> EditModalState -> EditModalState
updateField fieldKey defaultValue transform editState =
    let
        updater maybeValue =
            case maybeValue of
                Just value ->
                    Just (transform value)

                Nothing ->
                    Just (transform defaultValue)
    in
    { editState | editingValues = Dict.update fieldKey updater editState.editingValues }


{-| テキスト入力値の更新（テキストフィールド専用）
-}
setTextField : String -> String -> EditModalState -> EditModalState
setTextField fieldKey newValue =
    updateField fieldKey (EditingText "" { width = 0, height = 0 })
        (\fieldValue ->
            case fieldValue of
                EditingText _ size ->
                    EditingText newValue size

                other ->
                    other
        )


{-| テキストリスト入力値の更新（ユーザー入力時、rawInputのみ更新）
-}
setTextListField : String -> String -> EditModalState -> EditModalState
setTextListField fieldKey newValue =
    updateField fieldKey (EditingTextList { rawInput = "", items = [] })
        (\fieldValue ->
            case fieldValue of
                EditingTextList state ->
                    EditingTextList { state | rawInput = newValue }

                other ->
                    other
        )


{-| テキストリスト入力値の確定（rawInputをパースしてitemsを更新）
-}
confirmTextListField : String -> EditModalState -> EditModalState
confirmTextListField fieldKey =
    updateField fieldKey (EditingTextList { rawInput = "", items = [] })
        (\fieldValue ->
            case fieldValue of
                EditingTextList state ->
                    EditingTextList { state | items = parseCommaSeparatedText state.rawInput }

                other ->
                    other
        )


parseCommaSeparatedText : String -> List Types.TextListItemState
parseCommaSeparatedText rawInput =
    rawInput
        |> String.split ","
        |> List.map String.trim
        |> List.filter (not << String.isEmpty)
        |> List.map (\val -> { value = val, size = { width = 0, height = 0 } })

{-| テキストエリアサイズの更新
-}
setTextSize : String -> Int -> Int -> EditModalState -> EditModalState
setTextSize fieldKey width height =
    updateField fieldKey (EditingText "" { width = width, height = height })
        (\fieldValue ->
            case fieldValue of
                EditingText content _ ->
                    EditingText content { width = width, height = height }

                other ->
                    other
        )


{-| テキストリスト項目値の更新（インデックス指定）
-}
setTextListItem : String -> Int -> String -> EditModalState -> EditModalState
setTextListItem fieldKey index newValue =
    updateField fieldKey (EditingTextList { rawInput = "", items = [] })
        (\fieldValue ->
            case fieldValue of
                EditingTextList state ->
                    let
                        updatedItems =
                            List.indexedMap
                                (\i item ->
                                    if i == index then
                                        { item | value = newValue }

                                    else
                                        item
                                )
                                state.items
                    in
                    EditingTextList { state | items = updatedItems }

                other ->
                    other
        )


{-| テキストリスト項目サイズの更新（インデックス指定）
-}
setTextListItemSize : String -> Int -> Int -> Int -> EditModalState -> EditModalState
setTextListItemSize fieldKey index width height =
    updateField fieldKey (EditingTextList { rawInput = "", items = [] })
        (\fieldValue ->
            case fieldValue of
                EditingTextList state ->
                    let
                        updatedItems =
                            List.indexedMap
                                (\i item ->
                                    if i == index then
                                        { item | size = { width = width, height = height } }

                                    else
                                        item
                                )
                                state.items
                    in
                    EditingTextList { state | items = updatedItems }

                other ->
                    other
        )

{-| チェックボックス値の更新
-}
setBooleanField : String -> Bool -> EditModalState -> EditModalState
setBooleanField fieldKey newValue =
    updateField fieldKey (EditingBoolean False)
        (\fieldValue ->
            case fieldValue of
                EditingBoolean _ ->
                    EditingBoolean newValue

                other ->
                    other
        )