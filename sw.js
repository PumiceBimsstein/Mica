// sw.js
const IMAGE_CACHE_NAME = "mica-card-images-v1";

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 画像リクエスト、または拡張子が画像形式のURLを判定
  const isImage =
    req.destination === "image" ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(req.url);

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        // 1. キャッシュを探す
        const cachedResponse = await cache.match(req);
        if (cachedResponse) {
          // キャッシュが存在すればそれをそのまま返す（サーバーにリクエストしない）
          return cachedResponse;
        }

        // 2. なければネットワークから取得してキャッシュに保存
        try {
          const networkResponse = await fetch(req);
          // 正常に取得できた場合、キャッシュにクローンを保存
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === "opaque")) {
            cache.put(req, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // オフラインなどで取得できない場合のフォールバック
          return cachedResponse || Response.error();
        }
      })
    );
  }
});
