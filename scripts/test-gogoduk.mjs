
const API_BASE = "https://api.gogoduk.com";
const apiKey = process.env.GOGODUK_API_KEY;

if (!apiKey) {
  throw new Error("Missing GOGODUK_API_KEY");
}

const address =
  "674/8 Trường Sa, Phú Nhuận";

async function get(path, params) {
  const url = new URL(path, API_BASE);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(
      `GoGoDuk HTTP ${response.status}: ` +
        (await response.text())
    );
  }

  return response.json();
}

// 1. Tìm địa chỉ
const suggestions = await get("/v1/suggest", {
  input: address,
  country: "VN",
  lang: "vi",
});

console.log(
  "Suggestions:",
  JSON.stringify(suggestions, null, 2)
);

// Chỉ thử resolve gợi ý đầu tiên.
// KHÔNG tự coi nó là địa chỉ chính xác.
const first = suggestions.predictions?.[0];

if (!first?.placeId) {
  console.log("Không tìm thấy địa chỉ");
  process.exit(0);
}

// 2. Lấy thông tin chi tiết và tọa độ
const detail = await get("/v1/place/resolve", {
  id: first.placeId,
  lang: "vi",
});

console.log(
  "Resolved:",
  JSON.stringify(detail, null, 2)
);
const result = detail.result;

const reverse = await get("/v1/reverse-geocode", {
  lat: String(result.lat),
  lng: String(result.lon),
});

console.log("Reverse geocode:", reverse);