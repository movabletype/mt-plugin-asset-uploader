import { mount } from "svelte";
import AssetModal from "./AssetModal.svelte";
import type { InitialSelectedAssetData } from "./AssetModal.svelte";
import type { InsertMethod } from "./context";

function getInsertHtml(field: string): InsertMethod {
  return (data) => {
    const html = data
      .map(({ asset, insertOptions }) =>
        asset.asHtml({
          alternativeText: insertOptions.alternativeText,
          caption: insertOptions.caption,
          width: insertOptions.width
        })
      )
      .join("");

    window.app?.insertHTML(html, field);
  };
}

function getInsertFieldAsset(field: string): InsertMethod {
  return async (data) => {
    const asset = data[0].asset;

    const html = await asset.asHtml({
      enclose: true
    });

    const a = document.createElement("a");
    a.href = asset.url;
    a.target = "_blank";
    a.title = window.trans("View image");
    const img = document.createElement("img");
    img.src = asset.thumbnail_url;
    a.appendChild(img);
    const previewHtml = a.outerHTML;

    window.insertCustomFieldAsset(html, field, previewHtml);
  };
}

const modalOpen = window.jQuery.fn.mtModal.open;
window.jQuery.fn.mtModal.open = async (url: string, opts: unknown) => {
  const params = new URLSearchParams(url.replace(/.*?\?/, "").replace(/&amp;/g, "&"));
  if (params.get("__mode") === "dialog_asset_modal" && params.get("filter_val") === "image") {
    mount(AssetModal, {
      target: document.body,
      props: {
        insert: getInsertHtml(params.get("edit_field") as string),
        selectMetaData: true,
        multiSelect: true,
        params
      }
    });
  } else {
    modalOpen(url, opts);
  }
};

document.querySelectorAll<HTMLAnchorElement>(".mt-modal-open").forEach((elm) => {
  window.jQuery(elm).off("click");
  elm.addEventListener("click", (ev) => {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    ev.preventDefault();

    const params = new URLSearchParams(elm.href.replace(/.*?\?/, "").replace(/&amp;/g, "&"));
    if (params.get("filter_val") === "image") {
      const initialSelectedData: InitialSelectedAssetData[] = [];
      const editField = params.get("edit_field");
      const input = document.querySelector<HTMLInputElement>(`#${editField}`);
      if (input) {
        const m = input.value.match(/mt:asset-id="(\d+)"/);
        if (m) {
          initialSelectedData.push({
            id: m[1],
          });
        }
      }

      mount(AssetModal, {
        target: document.body,
        props: {
          insert: getInsertFieldAsset(params.get("edit_field") as string),
          params,
          initialSelectedData,
        }
      });
    } else {
      modalOpen(elm.href, {});
    }
  });
});
