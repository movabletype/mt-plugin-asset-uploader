import TinyAssetModal from "./TinyAssetModal.svelte";

function getInsertHtml(field) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (asset, options) => {
    const html = `<img src=${asset.url} />`; // build html from options. Maybe you need to make a request to mt.cgi.
    window.app?.insertHTML(html, field);
  };
}

function getInsertFieldAsset(field) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (asset, options) => {
    const preview = `<a href="${asset.url}" target="_blank"><img src="${
      asset.thumbnail_url || asset.thumbnail
    }" alt="" /></a>`;
    window.insertCustomFieldAsset("", field, preview);
  };
}

const modalOpen = window.jQuery.fn.mtModal.open;
window.jQuery.fn.mtModal.open = async (...args) => {
  const params = new URLSearchParams(
    args[0].replace(/.*?\?/, "").replace(/&amp;/g, "&")
  );
  if (params.get("__mode") === "dialog_asset_modal") {
    new TinyAssetModal({
      target: document.body,
      props: {
        insert: getInsertHtml(params.get("edit_field")),
        params,
      },
    });
  } else {
    modalOpen(...args);
  }
};

document
  .querySelectorAll<HTMLAnchorElement>(".mt-modal-open")
  .forEach((elm) => {
    window.jQuery(elm).off("click");
    elm.addEventListener("click", (ev) => {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      ev.preventDefault();

      const params = new URLSearchParams(
        elm.href.replace(/.*?\?/, "").replace(/&amp;/g, "&")
      );
      new TinyAssetModal({
        target: document.body,
        props: {
          insert: getInsertFieldAsset(params.get("edit_field")),
          params,
        },
      });
    });
  });
