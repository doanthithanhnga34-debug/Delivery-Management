"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "delivery_shipper_name";
const SHIPPER_CHANGE_EVENT = "shipper-name-changed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SHIPPER_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SHIPPER_CHANGE_EVENT, callback);
  };
}
function getSnapshot(){
    return localStorage.getItem(STORAGE_KEY) ?? ""
}
function getServerSnapShot(){
    return ""
}
export function useShipperName(){
    return useSyncExternalStore(
        subscribe, getSnapshot, getServerSnapShot
    )
}


export function saveShipperName(name: string) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, normalizedName);
  }

  // Thông báo cho các component trong cùng tab.
  window.dispatchEvent(new Event(SHIPPER_CHANGE_EVENT));
}