module Types exposing
    ( AppendChoice(..)
    , BetweenRelation(..)
    , CardSize(..)
    , Dataset
    , DatasetRenameState
    , DisplayRole(..)
    , EditingFieldValue(..)
    , EditingTextListState
    , EditModalState
    , EditModalMsg(..)
    , FieldConfig
    , FieldSettingsMsg(..)
    , FileFormat(..)
    , FilterUiState
    , Item
    , Model
    , Msg(..)
    , DatasetMsg(..)
    , SortModalMsg(..)
    , FilterMsg(..)
    , FileFlowMsg(..)
    , SearchMsg(..)
    , SearchMode(..)
    , SearchState
    , PendingImport
    , ReadMode(..)
    , Snapshot
    , TextInputSize
    , TextListItemState
    , Value(..)
    , WithinRelation(..)
    )

import Dict exposing (Dict)
import File
import Json.Decode as Decode
import Set exposing (Set)


{-| 初期バージョンで扱う値の型。
文字列 / 文字列配列 / 真偽値の三種類に限定する。
-}
type Value
    = Text String
    | TextList (List String)
    | Boolean Bool


{-| フィールドの表示方法。データ上の型とは独立した概念。
-}
type DisplayRole
    = PlainText
    | Title
    | Image
    | Link


{-| 一つのフィールドをどう扱うかの設定。
-}
type alias FieldConfig =
    { key : String
    , label : String
    , displayRole : DisplayRole
    , showOnCard : Bool
    , filterable : Bool
    , isBool : Bool
    , isTextList : Bool
    , trueLabel : Maybe String
    , falseLabel : Maybe String
    }


{-| 一件分のデータ。id はアプリ内部で選択・並べ替えを行うための識別子で、
JSON/CSV の入出力内容そのものには含めない。
-}
type alias Item =
    { id : String
    , values : Dict String Value
    }


type CardSize
    = Small
    | Medium
    | Large


{-| メインデータ一件分。fields の並び順がそのままプロパティの表示・入出力順序になる。
id はIndexedDB保存など内部処理で使う識別子で、name はユーザーが自由に
付け替えられる表示名。
imageLinkField / titleLinkField は、画像・タイトルクリック時の遷移先として
使用するフィールドの key。
filterOrder は、フィルターとして表示する際の並び順（フィールドキーのリスト）。
fields の並び順（カード詳細表示・入出力の順序）とは独立して管理する。
-}
type alias Dataset =
    { id : String
    , name : String
    , fields : List FieldConfig
    , items : List Item
    , imageLinkField : Maybe String
    , titleLinkField : Maybe String
    , filterOrder : List String
    }


{-| ファイル読み込みの三モード。
-}
type ReadMode
    = NewDataset
    | AppendData
    | ReplaceData


{-| 読み込み・書き出しのファイル形式。
-}
type FileFormat
    = JsonFormat
    | CsvFormat


{-| 追加・置き換え時に、既存データに無い新しいプロパティが見つかった場合の選択肢。
-}
type AppendChoice
    = AddNewFields
    | IgnoreNewFields
    | AbortImport


{-| ファイル読み込みでパース済みだが、まだ確定していないインポート内容。
新規モードでは名前入力待ち、追加・置き換えモードでは新プロパティの扱い選択待ちになる。
-}
type alias PendingImport =
    { mode : ReadMode
    , rawItems : List (List ( String, Value ))
    , newKeys : List String
    , nameInput : String
    }


{-| Undo用に、データそのもの（datasets / selectedDatasetId）だけを切り取った状態。
カードサイズやモーダルの開閉といったUI状態は含めない。
-}
type alias Snapshot =
    { dataset : Dataset
    }


{-| フィルターと他のフィルターとの関係。
-}
type BetweenRelation
    = RelAnd
    | RelOr
    | RelNot


{-| 一つのフィルター内で複数選択肢を選んだ場合の、選択肢同士の関係。
-}
type WithinRelation
    = WithinAnd
    | WithinOr


{-| フィールドごとのフィルターUI状態。選択肢そのもの（件数など）は
Datasetから毎回導出するため保持せず、ユーザーの選択・関係設定・折り畳み状態だけを持つ。
relationPopupOpen は「他のフィルターとの関係」を選ぶ小ウィンドウの開閉状態。
-}
type alias FilterUiState =
    { selected : Set String
    , betweenRelation : BetweenRelation
    , withinRelation : WithinRelation
    , collapsed : Bool
    , relationPopupOpen : Bool
    }


{-| 検索モード。全文検索か、指定フィールドのみかを選択できる。
-}
type SearchMode
    = SearchAll
    | SearchFields (Set String)


{-| 検索の状態を管理する。
query: ユーザーが入力した検索ワード
mode: 検索モード（全文検索 or フィールド指定）
-}
type alias SearchState =
    { query : String
    , mode : SearchMode
    }


{-| カード編集ウィンドウ
-}
type alias TextInputSize =
    { width : Int
    , height : Int
    }


type alias TextListItemState =
    { value : String
    , size : TextInputSize
    }


type alias EditingTextListState =
    { rawInput : String
    , items : List TextListItemState
    }


type EditingFieldValue
    = EditingText String TextInputSize
    | EditingTextList EditingTextListState
    | EditingBoolean Bool


type alias EditModalState =
    { editingItemId : String
    , editingValues : Dict String EditingFieldValue
    , fields : List FieldConfig
    }


type alias DatasetRenameState =
    { datasetId : String
    , name : String
    }


type alias Model =
    { dataset : Dataset
    , cardSize : CardSize
    , fileModalOpen : Bool
    , settingsModalOpen : Bool
    , sortModalOpen : Bool
    , actionMenuOpen : Bool
    , filterSelectOpen : Bool -- [追加]
    , mainAreaCardScale : Float
    , sortModalCardScale : Float
    , targetTopCardId : Maybe String
    , readMode : ReadMode
    , importFormat : FileFormat
    , exportFormat : FileFormat
    , pendingImport : Maybe PendingImport
    , importError : Maybe String
    , history : List Snapshot
    , filterUi : Dict String FilterUiState
    , hoveredItemId : Maybe String
    , editModalOpen : Bool
    , editModal : Maybe EditModalState
    , renameModal : Maybe DatasetRenameState
    , topVisibleCardId : Maybe String
    , searchState : SearchState
    }


type Msg
    = SetCardSize CardSize
    | StateLoaded Decode.Value
    | ToggleSettingsModal Bool
    | ToggleActionMenu
    | ToggleFilterSelectDropdown Bool -- [追加]
    | UndoRequested
    | CardMouseEntered String
    | CardMouseLeft
    | ScrollToTopClicked
    | SortModalMsg SortModalMsg
    | DatasetMsg DatasetMsg
    | FileFlowMsg FileFlowMsg
    | FilterMsg FilterMsg
    | FieldSettingsMsg FieldSettingsMsg
    | EditModalMsg EditModalMsg
    | SearchMsg SearchMsg
    | TopCardIdReceived (Maybe String)
    | CreateItemWithId String
    | DatasetFileImport (List String)
    | SetMainCardScale Float


type DatasetMsg
    = OpenRename
    | RenameNameChanged String
    | CancelRename
    | ConfirmRename

type SortModalMsg
    = RequestOpen
    | OpenWithTopCard String
    | CloseAndApply (List String) (Maybe String)
    | SetCardScale Float

type FilterMsg
    = ToggleOption String String
    | SetBetweenRelation String BetweenRelation
    | SetWithinRelation String WithinRelation
    | ToggleCollapsed String
    | ToggleRelationPopup String
    | MoveUp String
    | MoveDown String

type FieldSettingsMsg
    = SetLabel String String
    | SetDisplayRole String DisplayRole
    | SetShowOnCard String Bool
    | SetFilterable String Bool
    | SetTrueLabel String String
    | SetFalseLabel String String
    | MoveFieldUp String
    | MoveFieldDown String
    | SetImageLinkField (Maybe String)
    | SetTitleLinkField (Maybe String)

type EditModalMsg
    = EditButtonClicked String
    | Open String
    | Close
    | TextFieldChanged String String
    | TextListFieldChanged String String
    | TextSizeChanged String Int Int
    | TextListItemChanged String Int String
    | TextListItemSizeChanged String Int Int Int
    | BooleanFieldChanged String Bool
    | Confirm
    | Cancel
    | DeleteItem
    | CreateNewItem

type FileFlowMsg
    = ToggleModal Bool
    | SetReadMode ReadMode
    --| SetImportFormat FileFormat
    --| SetExportFormat FileFormat
    | RequestOpenFile
    | FileSelected File.File
    --| FileTextLoaded String
    | FileLoaded String String -- fileName, content
    | ImportNameChanged String
    | ConfirmNewDataset
    | ResolveNewProperties AppendChoice
    | CancelPendingImport
    | ExportClicked FileFormat
    | RequestOpenBackupFile
    | BackupFileSelected File.File
    | BackupTextLoaded String
    | ExportBackupClicked

type SearchMsg
    = SetQuery String
    | ToggleSearchMode
    | ToggleSearchField String

