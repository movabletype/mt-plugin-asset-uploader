import type { Asset } from "@movabletype/app/object";

export interface InsertMethod {
  (data: { asset: Asset; insertOptions: Parameters<Asset["asHtml"]>[0] }[]): void | Promise<void>;
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
