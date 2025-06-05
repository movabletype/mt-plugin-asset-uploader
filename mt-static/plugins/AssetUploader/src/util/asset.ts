import type { Asset } from "@movabletype/app/object";

export interface AsHtmlOptions {
  alternativeText?: string;
  caption?: string;
  width?: number;
  include?: boolean;
  enclose?: boolean;
  linkToOriginal?: boolean;
  align?: string;
}

export const asHtml = async (
  asset: Asset,
  options: AsHtmlOptions
): Promise<
  | { error: string }
  | {
      error: null;
      result: {
        html: string;
      };
    }
> => {
  const body = new FormData();
  body.set("__mode", "asset_uploader_as_html");
  body.set("blog_id", asset.blog_id);
  body.set("id", asset.id);
  for (const [k, v] of Object.entries(options)) {
    const value = typeof v === "boolean" ? (v ? "1" : "") : v;
    body.set(k, value);
  }
  return (
    await fetch(window.CMSScriptURI, {
      method: "POST",
      credentials: "include",
      body,
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    })
  ).json();
};
