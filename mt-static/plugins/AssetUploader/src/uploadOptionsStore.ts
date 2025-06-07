import { writable } from "svelte/store";
import type { UploadOptions } from "./assetDataStore";

export const uploadOptions = writable<UploadOptions>({
  allowToChange: true,
  destination: "",
  extraPath: undefined,
  dirSeparator: "/",
  userBasename: "",
  autoRenameNonAscii: false,
  operationIfExists: 1,
  normalizeOrientation: false
});
