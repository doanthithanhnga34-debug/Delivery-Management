export function isZaloBrowser(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return /zalo/i.test(navigator.userAgent);
}

export function isAndroid():boolean{
    if (typeof window === "undefined") {
    return false;
  }
  return /android/i.test(navigator.userAgent);
}

export function openExternalBrowser(){
    const url = new URL(window.location.href);
     if (isAndroid()) {
    const intentUrl =
      `intent://${url.host}${url.pathname}${url.search}${url.hash}` +
      `#Intent;scheme=${url.protocol.replace(":", "")};` +
      `package=com.android.chrome;` +
      `S.browser_fallback_url=${encodeURIComponent(url.href)};` +
      `end`;

    window.location.href = intentUrl;
  }
}