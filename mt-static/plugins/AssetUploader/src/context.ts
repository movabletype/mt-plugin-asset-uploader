import type { Asset } from "@movabletype/app/object";
import type { AsHtmlOptions } from "./util/asset";

export interface InsertMethod {
  (data: { asset: Asset; insertOptions: AsHtmlOptions }[]): void | Promise<void>;
}
interface Context {
  insert: InsertMethod;
  params: Record<string, string>;
}

import { getContext, setContext } from "svelte";

const paramsKey = Symbol();
export function setAssetModalContext(ctx: Context): void {
  setContext(paramsKey, ctx);
}
export function getAssetModalContext(): Context {
  return getContext(paramsKey);
}
