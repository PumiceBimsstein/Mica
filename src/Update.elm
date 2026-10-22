module Update exposing (update)

import Dict
import FileFlow
import Filter
import Search
import History
import Json.Decode as Decode
import Ports
import Set
import Settings
import Storage
import Search
import Update.DatasetEdit exposing (confirmEditItem, deleteEditingItem)
import Update.ItemManager exposing (createNewItemWithUuid)
import Update.EditModalManager exposing (closeEditModal, openEditModal)
import Update.SortModalManager exposing (applySortAndClose, openSortModal)
import Update.DetailModalManager exposing (handleDetailModalMsg)
import Update.EditModalState exposing
    ( setBooleanField
    , setTextField
    , setTextListField
    , confirmTextListField
    , setTextListItem
    , setTextListItemSize
    , setTextSize
    )
import Update.DatasetManager exposing
    ( closeRenameModal
    , confirmRenameDataset
    , openRenameModal
    , updateRenameModalName
    )
import Types exposing
    ( CardSize
    , Dataset
    , DatasetMsg(..)
    , SortModalMsg(..)
    , FilterMsg(..)
    , FieldSettingsMsg(..)
    , EditModalMsg(..)
    , FileFlowMsg(..)
    , SearchMsg(..)
    , SearchMode(..)
    , SearchState
    , EditModalState
    , EditingFieldValue(..)
    , FilterUiState
    , Model
    , Msg(..)
    , Value(..)
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetCardSize size ->
            saveAfter (setCardSize size model)

        -- StateLoaded value ->
        --     handleStateLoaded value model

        ToggleSettingsModal open ->
            ( { model | settingsModalOpen = open }, Cmd.none )
        
        ToggleActionMenu ->
            ( { model | actionMenuOpen = not model.actionMenuOpen }, Cmd.none )

        ToggleFilterSelectDropdown open ->
            ( { model | filterSelectOpen = open }, Cmd.none )

        SortModalMsg sortMsg ->
            updateSortModal sortMsg model
        
        DatasetMsg datasetMsg ->
            updateDataset datasetMsg model

        UndoRequested ->
            saveAfter (undo model)

        FileFlowMsg fileFlowMsg ->
            updateFileFlow fileFlowMsg model

        FilterMsg filterMsg ->
            updateFilter filterMsg model

        FieldSettingsMsg fieldSettingsMsg ->
            updateFieldSettings fieldSettingsMsg model

        EditModalMsg editModalMsg ->
            updateEditModalMsg editModalMsg model

        CardMouseEntered itemId ->
            ( { model | hoveredItemId = Just itemId }, Cmd.none )

        CardMouseLeft ->
            ( { model | hoveredItemId = Nothing }, Cmd.none )

        ScrollToTopClicked ->
            ( model, Ports.scrollToTop () )

        TopCardIdReceived maybeTopId ->
            ( { model | topVisibleCardId = maybeTopId }, Cmd.none )
        
        DatasetFileImport uuids ->
            fileImport uuids model
        
        CreateItemWithId uuid ->
            let
                (newModel, saveCmd) = createNewItemWithUuid uuid model.topVisibleCardId model
            in
            (newModel, saveCmd)
        
        SetMainCardScale scale ->
            ( { model | mainAreaCardScale = scale }, Cmd.none )

        SearchMsg searchMsg ->
            updateSearch searchMsg model
        
        DetailModalMsg detailMsg ->
            handleDetailModalMsg detailMsg model


updateDataset : DatasetMsg -> Model -> ( Model, Cmd Msg )
updateDataset msg model =
    case msg of
        OpenRename ->
            ( openRenameModal model, Cmd.none )

        RenameNameChanged name ->
            ( updateRenameModalName name model, Cmd.none )

        CancelRename ->
            ( closeRenameModal model, Cmd.none )

        ConfirmRename ->
            saveAfter (confirmRenameDataset model)


updateSortModal : SortModalMsg -> Model -> ( Model, Cmd Msg )
updateSortModal msg model =
    case msg of
        RequestOpen ->
            openSortModal model

        OpenWithTopCard topCardId ->
            ( { model | sortModalOpen = True, sortModalCardScale = 1.0, targetTopCardId = Just topCardId }, Ports.scrollToCard topCardId )

        CloseAndApply newOrder topCardId ->
            applySortAndClose newOrder topCardId model

        SetCardScale scale ->
            ( { model | sortModalCardScale = scale }, Cmd.none )


updateFileFlow : FileFlowMsg -> Model -> ( Model, Cmd Msg )
updateFileFlow msg model =
    case msg of
        ToggleModal open ->
            ( openOrCloseFileModal open model, Cmd.none )

        SetReadMode mode ->
            ( { model | readMode = mode }, Cmd.none )

        RequestOpenFile ->
            ( model, FileFlow.openFile )

        FileSelected file ->
            ( model, FileFlow.readFile file )

        FileLoaded fileName text ->
            FileFlow.handleFileLoaded fileName text model

        ImportNameChanged text ->
            ( FileFlow.updatePendingName text model, Cmd.none )

        ConfirmNewDataset ->
            FileFlow.confirmNewDataset model

        ResolveNewProperties choice ->
            FileFlow.resolveChoice choice model

        CancelPendingImport ->
            ( { model | pendingImport = Nothing }, Cmd.none )

        ExportClicked format ->
            ( model, FileFlow.exportCurrentDataset format model )

        RequestOpenBackupFile ->
            ( model, FileFlow.openBackupFile )

        BackupFileSelected file ->
            ( model, FileFlow.readBackupFile file )

        BackupTextLoaded text ->
            FileFlow.handleBackupText text model

        ExportBackupClicked ->
            ( model, FileFlow.exportBackup model )


updateFilter : FilterMsg -> Model -> ( Model, Cmd Msg )
updateFilter msg model =
    case msg of
        ToggleOption fieldKey optionValue ->
            saveAfter (updateFilterUi fieldKey (Filter.toggleOption optionValue) model)

        SetBetweenRelation fieldKey relation ->
            saveAfter (updateFilterUi fieldKey (\ui -> { ui | betweenRelation = relation }) model)

        SetWithinRelation fieldKey relation ->
            saveAfter (updateFilterUi fieldKey (\ui -> { ui | withinRelation = relation }) model)

        ToggleCollapsed fieldKey ->
            saveAfter (updateFilterUi fieldKey (\ui -> { ui | collapsed = not ui.collapsed }) model)

        ToggleRelationPopup fieldKey ->
            ( updateFilterUi fieldKey (\ui -> { ui | relationPopupOpen = not ui.relationPopupOpen }) model, Cmd.none )

        MoveUp key ->
            updateCurrentDataset (Settings.moveFilterUp key) model

        MoveDown key ->
            updateCurrentDataset (Settings.moveFilterDown key) model


updateFieldSettings : FieldSettingsMsg -> Model -> ( Model, Cmd Msg )
updateFieldSettings msg model =
    case msg of
        SetLabel key newLabel ->
            updateCurrentDataset (Settings.setLabel key newLabel) model

        SetDisplayRole key role ->
            updateCurrentDataset (Settings.setDisplayRole key role) model

        SetShowOnCard key value ->
            updateCurrentDataset (Settings.setShowOnCard key value) model

        SetFilterable key value ->
            updateCurrentDataset (Settings.setFilterable key value) model

        SetTrueLabel key value ->
            updateCurrentDataset (Settings.setTrueLabel key value) model

        SetFalseLabel key value ->
            updateCurrentDataset (Settings.setFalseLabel key value) model

        MoveFieldUp key ->
            updateCurrentDataset (Settings.moveFieldUp key) model

        MoveFieldDown key ->
            updateCurrentDataset (Settings.moveFieldDown key) model

        SetImageLinkField value ->
            updateCurrentDataset (Settings.setImageLinkField value) model

        SetTitleLinkField value ->
            updateCurrentDataset (Settings.setTitleLinkField value) model


updateEditModalMsg : EditModalMsg -> Model -> ( Model, Cmd Msg )
updateEditModalMsg msg model =
    case msg of
        EditButtonClicked itemId ->
            ( openEditModal itemId model, Cmd.none )

        Open itemId ->
            ( openEditModal itemId model, Cmd.none )

        Close ->
            ( closeEditModal model, Cmd.none )

        TextFieldChanged fieldKey newValue ->
            ( updateEditModalState (setTextField fieldKey newValue) model, Cmd.none )

        TextListFieldChanged fieldKey newValue ->
            ( updateEditModalState (setTextListField fieldKey newValue) model, Cmd.none )

        TextSizeChanged fieldKey width height ->
            ( updateEditModalState (setTextSize fieldKey width height) model, Cmd.none )

        TextListItemChanged fieldKey index newValue ->
            ( updateEditModalState (setTextListItem fieldKey index newValue) model, Cmd.none )

        TextListItemSizeChanged fieldKey index width height ->
            ( updateEditModalState (setTextListItemSize fieldKey index width height) model, Cmd.none )

        BooleanFieldChanged fieldKey newValue ->
            ( updateEditModalState (setBooleanField fieldKey newValue) model, Cmd.none )

        Confirm ->
            let
                modelWithParsedLists =
                    model |> updateEditModalState confirmAllTextLists
            in
            saveAfter (modelWithParsedLists |> confirmEditItem |> closeEditModal)

        Cancel ->
            ( closeEditModal model, Cmd.none )

        DeleteItem ->
            saveAfter (model |> deleteEditingItem |> closeEditModal)

        CreateNewItem ->
            ( model, Ports.generateUuid () )
        

-- MARK: ヘルパー関数

setCardSize : CardSize -> Model -> Model
setCardSize size model =
    { model | cardSize = size, mainAreaCardScale = 1.0 }


saveAfter : Model -> ( Model, Cmd Msg )
saveAfter model =
    ( model, Storage.save model )



-- 起動時読込

-- ファイル操作ウィンドウ・データセット切り替え・削除

openOrCloseFileModal : Bool -> Model -> Model
openOrCloseFileModal open model =
    { model | fileModalOpen = open, importError = Nothing, pendingImport = Nothing }


-- 履歴の先頭を取り出してデータへ復元する。履歴が無ければ何もしない。

undo : Model -> Model
undo model =
    case History.pop model.history of
        Just ( snapshot, rest ) ->
            History.applySnapshot snapshot { model | history = rest }

        Nothing ->
            model


-- フィルター

updateFilterUi : String -> (FilterUiState -> FilterUiState) -> Model -> Model
updateFilterUi fieldKey transform model =
    let
        current =
            Filter.filterUiFor fieldKey model.filterUi
    in
    { model | filterUi = Dict.insert fieldKey (transform current) model.filterUi }


-- 設定ウィンドウ

{-| 現在選択中のデータセットに変換を適用し、保存する。
設定ウィンドウの各項目変更は、すべてこの一つの処理に載せている。
-}
updateCurrentDataset : (Dataset -> Dataset) -> Model -> ( Model, Cmd Msg )
updateCurrentDataset transform model =
    saveAfter { model | dataset = transform model.dataset }


updateEditModalState : (EditModalState -> EditModalState) -> Model -> Model
updateEditModalState transform model =
    { model | editModal = Maybe.map transform model.editModal }


fileImport : List String -> Model -> ( Model, Cmd Msg )
fileImport uuids model =
    model.pendingImport
        |> Maybe.map (processPendingImport uuids model)
        |> Maybe.withDefault ( model, Cmd.none )


processPendingImport : List String -> Model -> Types.PendingImport -> ( Model, Cmd Msg )
processPendingImport uuids model pending =
    case pending.mode of
        Types.NewDataset ->
            FileFlow.finaliseNewDatasetImport uuids model

        _ ->
            applyImportToCurrentDataset uuids pending model


applyImportToCurrentDataset : List String -> Types.PendingImport -> Model -> ( Model, Cmd Msg )
applyImportToCurrentDataset uuids pending model =
    FileFlow.applyImportAndSave Types.AddNewFields uuids pending model

applyAndSaveImport : List String -> Types.PendingImport -> Model -> ( Model, Cmd Msg )
applyAndSaveImport uuids pending model =
    FileFlow.applyImportAndSave Types.AddNewFields uuids pending model


clearPendingImport : Model -> Model
clearPendingImport model =
    { model | pendingImport = Nothing }


{-| 編集中の全テキストリストフィールドのrawInputをパースしてitemsを確定させる
-}
confirmAllTextLists : EditModalState -> EditModalState
confirmAllTextLists editState =
    let
        keys =
            Dict.keys editState.editingValues
    in
    List.foldl confirmTextListField editState keys


-- MARK: 検索処理

updateSearch : SearchMsg -> Model -> ( Model, Cmd Msg )
updateSearch msg model =
    case msg of
        SetQuery newQuery ->
            ( { model | searchState = updateSearchQuery newQuery model.searchState }, Cmd.none )

        ToggleSearchMode ->
            ( { model | searchState = toggleSearchMode model.searchState }, Cmd.none )

        ToggleSearchField fieldKey ->
            ( { model | searchState = toggleSearchField fieldKey model.searchState }, Cmd.none )


-- 検索ワードを更新する。
updateSearchQuery : String -> SearchState -> SearchState
updateSearchQuery newQuery state =
    { state | query = newQuery }


{-| 検索モードを切り替える。
SearchAll <-> SearchFields (空) に切り替える。
-}
toggleSearchMode : SearchState -> SearchState
toggleSearchMode state =
    case state.mode of
        SearchAll ->
            { state | mode = SearchFields Set.empty }

        SearchFields _ ->
            { state | mode = SearchAll }


{-| フィールド指定検索でのフィールド選択を切り替える。
SearchAll の場合は何もしない。
-}
toggleSearchField : String -> SearchState -> SearchState
toggleSearchField fieldKey state =
    case state.mode of
        SearchAll ->
            state

        SearchFields fields ->
            { state | mode = SearchFields (Filter.toggleMember fieldKey fields) }