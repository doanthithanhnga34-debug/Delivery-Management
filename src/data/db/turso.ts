import "server-only";
import { Client, createClient } from "@libsql/client";

let client:Client|null = null;

export function getTursoClient(): Client{
    if(client) return client;
    const url = process.env.TURSO_DB_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if(!url || !authToken){
        throw new Error("Missing TURSO_DB_URL or TURSO_AUTH_TOKEN")
    }
    client = createClient({
        url,
        authToken
    })
    return client;
}
