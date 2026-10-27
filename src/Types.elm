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
    , NewFieldType(..)
    , NewFieldForm
    , DatasetMsg(..)
    , SortModalMsg(..)
    , FilterMsg(..)
    , FileFlowMsg(..)
    , SearchMsg(..)
    , SearchMode(..)
    , SearchState
    , Toast
    , PendingImport
    , ReadMode(..)
    , Snapshot
    , TextInputSize
    , TextListItemState
    , Value(..)
    , WithinRelation(..)
    , DetailModalMsg(..)
    , SortCriterion
    , SortDirection(..)
    )

import Dict exposing (Dict)
import File
import Set exposing (Set)


-- 初期バージョンで扱う値の型。文字列 / 文字列配列 / 真偽値の三種類に限定する。
type Value
    = Text String
    | TextList (List String)
    | Boolean Bool


-- フィールドの表示方法。データ上の型とは独立した概念。
type DisplayRole
    = PlainText
    | Title
    | Image
    | Link


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


type alias Dataset =
    { id : String
    , name : String
    , fields : List FieldConfig
    , items : List Item
    , imageLinkField : Maybe String
    , titleLinkField : Maybe String
    , filterOrder : List String
    , wrapTitleOnCard : Bool
    }


type ReadMode
    = NewDataset
    | AppendData
    | ReplaceData


type FileFormat
    = JsonFormat
    | CsvFormat


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
    , choice : AppendChoice
    }


-- Undo用に、データそのもの（datasets / selectedDatasetId）だけを切り取った状態。
type alias Snapshot =
    { dataset : Dataset
    }


-- フィルターと他のフィルターとの関係。
type BetweenRelation
    = RelAnd
    | RelOr
    | RelNot


-- 一つのフィルター内の選択肢同士の関係。
type WithinRelation
    = WithinAnd
    | WithinOr


type alias FilterUiState =
    { selected : Set String
    , betweenRelation : BetweenRelation
    , withinRelation : WithinRelation
    , collapsed : Bool
    , relationPopupOpen : Bool
    }


type SearchMode
    = SearchAll
    | SearchFields (Set String)


--query: 入力した検索ワード
--mode: 検索モード（全文検索 or フィールド指定）
type alias SearchState =
    { query : String
    , mode : SearchMode
    }


-- カード編集ウィンドウ
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


-- 新規フィールド追加
type NewFieldType
    = NewFieldString
    | NewFieldBoolean


type alias NewFieldForm =
    { name : String
    , fieldType : NewFieldType
    , stringValue : String
    , boolValue : Bool
    }


type alias EditModalState =
    { editingItemId : String
    , editingValues : Dict String EditingFieldValue
    , fields : List FieldConfig
    , newFieldForm : NewFieldForm
    , isAddingField : Bool
    }


type alias DatasetRenameState =
    { datasetId : String
    , name : String
    }

-- MARK:Sort
type SortDirection
    = Ascending
    | Descending


type alias SortCriterion =
    { fieldKey : String
    , direction : SortDirection
    }


type alias AutoSortState =
    { primaryField : String
    , primaryDirection : SortDirection
    , secondaryField : Maybe String
    , secondaryDirection : SortDirection
    }


type alias Toast =
    { message : String
    , showUndo : Bool
    }

type alias Model =
    { dataset : Dataset
    , cardSize : CardSize
    , fileModalOpen : Bool
    , settingsModalOpen : Bool
    , sortModalOpen : Bool
    , actionMenuOpen : Bool
    , filterSelectOpen : Bool
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
    , detailModalItemId : Maybe String
    , isDraggingFile : Bool
    , copyDeleteMode : Bool
    , pendingCopyItemId : Maybe String
    , toast : Maybe Toast
    , autoSortModalOpen : Bool
    , autoSortState : AutoSortState
    }


type Msg
    = SetCardSize CardSize
    | ToggleSettingsModal Bool
    | ToggleActionMenu
    | ToggleFilterSelectDropdown Bool
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
    | DetailModalMsg DetailModalMsg
    | TopCardIdReceived (Maybe String)
    | CreateItemWithId String
    | DatasetFileImport (List String)
    | SetMainCardScale Float
    | ToggleCopyDeleteMode
    | CopyItemClicked String
    | DeleteItemClicked String
    | DismissToast
    | UndoFromToast
    | OpenAutoSortModal
    | CloseAutoSortModal
    | SetAutoSortPrimaryField String
    | SetAutoSortPrimaryDirection SortDirection
    | SetAutoSortSecondaryField (Maybe String)
    | SetAutoSortSecondaryDirection SortDirection
    | ApplyAutoSort

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
    | ClearAllFilters

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
    | SetWrapTitleOnCard Bool

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
    | ToggleAddFieldForm
    | NewFieldNameChanged String
    | NewFieldTypeChanged NewFieldType
    | NewFieldValueChanged String
    | NewFieldBoolChanged Bool
    | AddField

type FileFlowMsg
    = ToggleModal Bool
    | SetReadMode ReadMode
    | RequestOpenFile
    | FileSelected File.File
    | FileLoaded String String
    | ImportNameChanged String
    | ConfirmNewDataset
    | ResolveNewProperties AppendChoice
    | CancelPendingImport
    | ExportClicked FileFormat
    | RequestOpenBackupFile
    | BackupFileSelected File.File
    | BackupTextLoaded String
    | ExportBackupClicked
    | DragEntered
    | DragLeft
    | DragOver
    | FileDropped File.File

type SearchMsg
    = SetQuery String
    | ToggleSearchMode
    | ToggleSearchField String

type DetailModalMsg
    = OpenDetail String
    | CloseDetail
    | NextCard
    | PrevCard
    | KeyDown String