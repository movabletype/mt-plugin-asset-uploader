export interface InsertMethod {
  (asset: object, insertOptions: object): Promise<void> | void;
  (html: string): Promise<void> | void;
}
interface Context {
  insert: InsertMethod;
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
