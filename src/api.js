const creditActions = new Set([
  "advance",
  "family_start",
  "cloud_start",
  "prompt",
  "draw",
  "solo_start",
  "credit_update",
  "credit_bonus",
  "credit_refund",
]);
const pendingCreditRequests = new Map();
let browserVerification = null;
const verificationListeners = new Set();
export const getBrowserVerification = () => browserVerification;
export function onBrowserVerification(listener) {
  verificationListeners.add(listener);
  listener(browserVerification);
  return () => verificationListeners.delete(listener);
}
async function roomResponse(url, options) {
  const controller = new AbortController();
  const cancel = () => controller.abort(options.signal?.reason);
  let timedOut = false;
  if (options.signal?.aborted) cancel();
  else options.signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 8000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    // Bound the response body too: headers alone do not complete a room poll.
    return { res, raw: await res.text() };
  } catch (error) {
    if (timedOut)
      throw Object.assign(
        new Error("Bağlantı gecikti. Otomatik olarak yeniden bağlanılıyor."),
        { code: "ROOM_TIMEOUT" },
      );
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", cancel);
  }
}
export async function api(action, data, token, { signal } = {}) {
  // A CDN challenge needs a normal page navigation. Repeating API requests
  // cannot complete it and can prolong the traffic spike that triggered it.
  if (browserVerification) throw browserVerification;
  const fingerprint = creditActions.has(action)
    ? action + JSON.stringify(data || {})
    : null;
  if (fingerprint) {
    let requestId = pendingCreditRequests.get(fingerprint);
    if (!requestId) {
      requestId = Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) =>
        n.toString(16).padStart(2, "0"),
      ).join("");
      pendingCreditRequests.set(fingerprint, requestId);
    }
    data = { ...data, requestId };
  }
  const url =
    "/api/index.php?action=" +
    action +
    (data && action === "room" ? "&pin=" + encodeURIComponent(data.pin) : "") +
    (data && action === "questions"
      ? "&category=" + encodeURIComponent(data.category || "")
      : "") +
    (action === "credits" && data?.userId
      ? "&userId=" + encodeURIComponent(data.userId)
      : "") +
    (action === "credits" && data?.pin
      ? "&pin=" + encodeURIComponent(data.pin)
      : "");
  const read = [
    "credits",
    "status",
    "solo_summary",
    "solo_state",
    "categories",
    "questions",
    "family_questions",
    "rooms",
    "room",
    "users",
  ].includes(action);
  const options = {
    signal,
    method: read ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Player-Token": token } : {}),
    },
    ...(read ? {} : { body: JSON.stringify(data || {}) }),
    cache: "no-store",
    credentials: "same-origin",
  };
  const { res, raw } =
    action === "room"
      ? await roomResponse(url, options)
      : await fetch(url, options).then(async (res) => ({
          res,
          raw: await res.text(),
        }));
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    if (
      res.status === 403 &&
      /text\/html/i.test(res.headers.get("content-type") || "") &&
      /checking your browser before accessing|bot verification/i.test(raw)
    ) {
      browserVerification = Object.assign(
        new Error(
          "Tarayıcı doğrulaması gerekiyor. Oyuna devam etmek için sayfayı yenile.",
        ),
        { code: "BROWSER_VERIFICATION", status: 403 },
      );
      for (const listener of verificationListeners)
        listener(browserVerification);
      throw browserVerification;
    }
    throw new Error("Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin.");
  }
  if (fingerprint && res.status < 500)
    pendingCreditRequests.delete(fingerprint);
  if (!res.ok) throw new Error(json.error || "İşlem tamamlanamadı.");
  if (fingerprint) dispatchEvent(new Event("arena-credits-changed"));
  return json;
}
export const categories = [
  ["cografya", "Coğrafya", "Dünyanın izini sür", "🌍", "#d9f3eb"],
  ["dinozor", "Dinozorlar", "Zamanda geriye yolculuk", "🦕", "#eee3fc"],
  ["hayvanlar", "Hayvanlar", "Vahşi doğayı keşfet", "🦁", "#fff0d5"],
  ["turkiye", "Türkiye", "Her köşesi bir hikâye", "🎈", "#ffe2e8"],
  [
    "meshur",
    "Hangi ilin neyi meşhur?",
    "81 il, yüzlerce güzellik",
    "🧿",
    "#dbf4f0",
  ],
  ["plakalar", "Plakalar", "01’den 81’e Türkiye turu", "🚘", "#e6eaff"],
  ["ulkeler", "Ülkeler", "Sınırları aş, dünyayı tanı", "🗺️", "#def1ff"],
  [
    "bayraklar",
    "Ülke bayrakları",
    "Dört bayrak, bir doğru cevap",
    "🏳️",
    "#ffe5ec",
  ],
  ["enler", "Enler", "En büyük, en uzun, en hızlı", "🏔️", "#e4f1db"],
  ["gezegenler", "Gezegenler", "Yıldızlara doğru", "🪐", "#e7e4ff"],
  ["futbol", "Futbol", "Sahne senin, gol senin", "⚽", "#dff4dc"],
  [
    "dunya-kupasi",
    "Dünya Kupası",
    "Finaller, efsaneler ve 2002 heyecanı",
    "🏆",
    "#fff0bd",
  ],
  ["film", "Film", "Yeşilçam’dan dünya sinemasına", "🎬", "#ffe2ed"],
  ["kaleciler", "Kaleciler", "Kalenin efsaneleri", "🧤", "#e1edff"],
  ["arabalar", "Arabalar", "Bilgini vites yükselt", "🏎️", "#ffe6d7"],
  [
    "turkiye-tarihi",
    "Türkiye tarihi",
    "Anadolu’dan Cumhuriyet’e",
    "🏛️",
    "#ffe7db",
  ],
  ["osmanli-tarihi", "Osmanlı tarihi", "Altı asrın izinde", "📜", "#f2e6cf"],
  [
    "islam-tarihi",
    "İslam tarihi",
    "Tarih, bilim ve medeniyet",
    "🌙",
    "#dff3ec",
  ],
  [
    "peygamberler-tarihi",
    "Peygamberler tarihi",
    "Kıssalar ve hayat hikâyeleri",
    "📖",
    "#eae3ff",
  ],
  ["genel-kultur", "Genel kültür", "Her şeyden biraz", "💡", "#fff1be"],
].map(([id, name, desc, emoji, color]) => ({
  id,
  name,
  desc,
  emoji,
  color,
  count: 250,
}));
export const catById = (id) =>
  categories.find((c) => c.id === id) || categories[0];
