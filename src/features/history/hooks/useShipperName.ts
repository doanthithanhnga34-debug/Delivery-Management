"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "delivery_shipper_name";

function subscribe(callback:()=> void){
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
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