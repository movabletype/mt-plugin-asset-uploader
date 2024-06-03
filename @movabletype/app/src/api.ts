import type { uploadAssets } from "./api/uploadAssets";
import type { sendHttpRequest } from "./api/sendHttpRequest";
import type { getJSON } from "./api/getJSON";
import type { Alert } from "./api/Alert";
import type { Logger } from "./api/Logger";

declare global {
  interface MTAPIMap {
    uploadAssets: typeof uploadAssets;
    sendHttpRequest: typeof sendHttpRequest;
    getJSON: typeof getJSON;
    Alert: typeof Alert;
    Logger: typeof Logger;
  }
}

export function exportAll(): void {
  const Apis = import.meta.glob("./api/*.ts");
  Object.keys(Apis).forEach(async (filename) => {
    const key = filename.match(/([^\/]+)\.ts$/)[1];
    const { resolve } = await window.MT.export(key);
    const module = await Apis[filename]();
    resolve(module[key]);
  });
}
