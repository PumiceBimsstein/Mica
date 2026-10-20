const DB_NAME = "card-viewer";
const DB_VERSION = 1;
const STORE_NAME = "appState";
const RECORD_KEY = "state";

const EMPTY_STATE = { datasets: [], selectedDatasetId: "", cardSize: "medium" };

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadState() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
    req.onsuccess = () => resolve(req.result || EMPTY_STATE);
    req.onerror = () => reject(req.error);
  });
}

async function saveState(state) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(state, RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function initPorts(app) {
  // MultiDrag プラグインの有効化
  if (window.Sortable && window.Sortable.MultiDrag) {
    try {
      Sortable.mount(new Sortable.MultiDrag());
    } catch (e) {
      // 既にマウントされている場合のエラーを防止
    }
  }

  // UUIDの単一生成（新規カード追加用）
  if (app.ports.generateUuid) {
    app.ports.generateUuid.subscribe(() => {
      const uuid = crypto.randomUUID();
      if (app.ports.idGenerated) {
        app.ports.idGenerated.send(uuid);
      }
    });
  }
  
  // UUIDの複数生成
  if (app.ports.generateUuids) {
    app.ports.generateUuids.subscribe((count) => {
      const uuids = Array.from({ length: count }, () => crypto.randomUUID());
      if (app.ports.idsArrayGenerated) {
        app.ports.idsArrayGenerated.send(uuids);
      }
    });
  }

  // スクロール時に最上部カードIDを取得してElmへ通知する
  const mainArea = document.getElementById("main-area");
  if (mainArea) {
    let ticking = false;
    mainArea.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const topCardId = getTopVisibleCardId(mainArea, "#card-grid [data-id]");
          if (app.ports.topCardIdReceived) {
            app.ports.topCardIdReceived.send(topCardId || null);
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  app.ports.scrollToTop.subscribe(() => {
    const mainArea = document.getElementById('main-area');
    if (mainArea) {
      mainArea.scrollTop = 0;
    }
  });

  app.ports.loadState.subscribe(() => {
    loadState()
      .then((state) => app.ports.stateLoaded.send(state))
      .catch((err) => {
        console.error("card-viewer: failed to load state", err);
        app.ports.stateLoaded.send(EMPTY_STATE);
      });
  });

  app.ports.saveState.subscribe((state) => {
    saveState(state).catch((err) => {
      console.error("card-viewer: failed to save state", err);
    });
  });


  // 指定されたカードIDの位置までスクロール
  app.ports.scrollToCard.subscribe((cardId) => {
    if (!cardId) return;
    requestAnimationFrame(() => {
      const targetEl = document.getElementById("sort-item-" + cardId) || document.querySelector(`[data-id="${cardId}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ block: "start", behavior: "auto" });
      }
    });
  });
}

// 指定コンテナ内で最上部に最も近い要素のIDを取得する
function getTopVisibleCardId(container, selector) {
  if (!container) return "";
  const items = container.querySelectorAll(selector);
  const containerRect = container.getBoundingClientRect();
  let closestId = "";
  let minDiff = Infinity;

  items.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const diff = Math.abs(rect.top - containerRect.top);
    if (diff < minDiff) {
      minDiff = diff;
      closestId = el.getAttribute("data-id") || el.id.replace("sort-item-", "");
    }
  });

  return closestId;
}

// MARK:<sortable-card-grid>
class SortableCardGrid extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    
    if (window.Sortable) {
      this._sortable = new Sortable(this, {
        animation: 150,
        ghostClass: "opacity-50",
        multiDrag: true,
        selectedClass: "border-4 border-blue-500", // 選択されたカードに付与する見た目用クラス
        deselectOnBodyClick: true,
        fallbackTolerance: 3
      });
    }

    // モーダル内でのカードクリック（リンク遷移）を無効化する処理
    const modalScrollArea = this.closest("#sort-modal-scroll-area");
    if (modalScrollArea) {
      this._preventLinkClick = (e) => {
        const linkEl = e.target.closest("a");
        if (linkEl) {
          e.preventDefault();
        }
      };
      this.addEventListener("click", this._preventLinkClick, true);
    }


    // 「完了」ボタンクリックのハンドリング
    this._handleGlobalClick = (e) => {
      const closeBtn = e.target.closest("#sort-modal-close-btn");
      if (!closeBtn) return;

      const newOrder = Array.from(this.children)
        .map((el) => el.id.replace("sort-item-", ""))
        .filter(Boolean);

      const modalScrollArea = document.getElementById("sort-modal-scroll-area");
      const topCardId = getTopVisibleCardId(modalScrollArea, "[id^='sort-item-']");

      // index.html で保持した window.appInstance を参照して送信
      if (window.appInstance && window.appInstance.ports && window.appInstance.ports.receiveClosedSortModal) {
        window.appInstance.ports.receiveClosedSortModal.send({
          newOrder: newOrder,
          topCardId: topCardId || null
        });
      }
    };

    document.addEventListener("click", this._handleGlobalClick);
  }

  disconnectedCallback() {
    if (this._sortable) {
      this._sortable.destroy();
      this._sortable = null;
    }
    const closeBtn = document.getElementById("sort-modal-close-btn");
    if (closeBtn && this._handleClose) {
      closeBtn.removeEventListener("click", this._handleClose);
    }
  }
}

if (!customElements.get("sortable-card-grid")) {
  customElements.define("sortable-card-grid", SortableCardGrid);
}