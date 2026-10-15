module Csv exposing (parse, toCsvText)

{-| CSVテキストと「行のリスト（各行はセル文字列のリスト）」の相互変換。
ドメインモデル（Value/Item/Datasetなど）については一切関知しない、
純粋なCSVの構文だけを扱うモジュール。
引用符処理は通常のCSV規則（カンマ・改行・二重引用符を含む場合は
セル全体を二重引用符で囲み、内部の二重引用符は連続する二つの二重引用符で表す）に従う。
-}


parse : String -> List (List String)
parse text =
    parseChars (String.toList (normalizeNewlines text)) emptyState
        |> .rows
        |> List.reverse
        |> List.map List.reverse


toCsvText : List (List String) -> String
toCsvText rows =
    rows
        |> List.map rowToCsvLine
        |> String.join "\n"


rowToCsvLine : List String -> String
rowToCsvLine cells =
    cells |> List.map escapeCell |> String.join ","


escapeCell : String -> String
escapeCell cell =
    if needsQuoting cell then
        "\"" ++ String.replace "\"" "\"\"" cell ++ "\""

    else
        cell


needsQuoting : String -> Bool
needsQuoting cell =
    String.contains "," cell || String.contains "\"" cell || String.contains "\n" cell


normalizeNewlines : String -> String
normalizeNewlines text =
    text |> String.replace "\u{000D}\n" "\n" |> String.replace "\u{000D}" "\n"


type alias ParseState =
    { rows : List (List String)
    , currentRow : List String
    , currentCell : String
    , inQuotes : Bool
    }


emptyState : ParseState
emptyState =
    { rows = [], currentRow = [], currentCell = "", inQuotes = False }


parseChars : List Char -> ParseState -> ParseState
parseChars chars state =
    case chars of
        [] ->
            finalizeState state

        '"' :: rest ->
            if state.inQuotes then
                case rest of
                    '"' :: rest2 ->
                        parseChars rest2 (appendChar '"' state)

                    _ ->
                        parseChars rest { state | inQuotes = False }

            else
                parseChars rest { state | inQuotes = True }

        ',' :: rest ->
            if state.inQuotes then
                parseChars rest (appendChar ',' state)

            else
                parseChars rest (endCell state)

        '\n' :: rest ->
            if state.inQuotes then
                parseChars rest (appendChar '\n' state)

            else
                parseChars rest (endRow (endCell state))

        c :: rest ->
            parseChars rest (appendChar c state)


appendChar : Char -> ParseState -> ParseState
appendChar c state =
    { state | currentCell = state.currentCell ++ String.fromChar c }


endCell : ParseState -> ParseState
endCell state =
    { state | currentRow = state.currentCell :: state.currentRow, currentCell = "" }


endRow : ParseState -> ParseState
endRow state =
    { state | rows = state.currentRow :: state.rows, currentRow = [] }


{-| 末尾の改行だけが残っている場合など、中身の無い最後の行は捨てる。
-}
finalizeState : ParseState -> ParseState
finalizeState state =
    if state.currentCell == "" && List.isEmpty state.currentRow then
        state

    else
        endRow (endCell state)
