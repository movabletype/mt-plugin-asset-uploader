import { mount } from "svelte";
import AssetModal from "./AssetModal.svelte";

function getInsertHtml(field: string) {
  return (html: string) => {
    window.app?.insertHTML(html, field);
  };
}

function getInsertFieldAsset(field: string) {
  return (html: string) => {
    window.insertCustomFieldAsset(html, field, html);
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
      mount(AssetModal, {
        target: document.body,
        props: {
          insert: getInsertFieldAsset(params.get("edit_field") as string),
          params
        }
      });
    } else {
      modalOpen(elm.href, {});
    }
  });
});
