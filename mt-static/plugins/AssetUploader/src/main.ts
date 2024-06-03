import { mount } from "svelte";
import { Asset } from "@movabletype/app/object";
import AssetModal from "./AssetModal.svelte";

function getInsertHtml(field: any) {
  return (html: string) => {
    window.app?.insertHTML(html, field);
  };
}

function getInsertFieldAsset(field: any) {
  return (asset: Asset) => {
    const preview = `<a href="${asset.url}" target="_blank"><img src="${asset.thumbnail_url}" alt="" /></a>`;
    window.insertCustomFieldAsset("", field, preview);
  };
}

const modalOpen = window.jQuery.fn.mtModal.open;
window.jQuery.fn.mtModal.open = async (url, opts) => {
  const params = new URLSearchParams(url.replace(/.*?\?/, "").replace(/&amp;/g, "&"));
  if (params.get("__mode") === "dialog_asset_modal") {
    mount(AssetModal, {
      target: document.body,
      props: {
        insert: getInsertHtml(params.get("edit_field")),
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
    mount(AssetModal, {
      target: document.body,
      props: {
        insert: getInsertFieldAsset(params.get("edit_field")),
        params
      }
    });
  });
});
