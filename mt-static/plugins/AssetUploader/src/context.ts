import type { Asset } from "./Asset";

interface Context {
  insert: (
    asset: Asset,
    insertOptions: Record<string, unknown>
  ) => Promise<void> | void;
  params: URLSearchParams;
}

import { getContext, setContext } from "svelte";

const paramsKey = Symbol();
export function setAssetModalContext(ctx: Context): void {
  setContext(paramsKey, ctx);
}
export function getAssetModalContext(): Context {
  return getContext(paramsKey);
}
