interface Context {
  insert: (asset: Object, insertOptions: Object) => Promise<void> | void;
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
