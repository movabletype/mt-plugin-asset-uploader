import { mount } from "svelte";
import AssetModal from "./AssetModal.svelte";
import type { InitialSelectedAssetData, Options } from "./AssetModal.svelte";
import type { InsertMethod } from "./context";
import { asHtml } from "./util/asset";

const options = JSON.parse(
  document.querySelector<HTMLScriptElement>("#asset-uploader-script")?.dataset.options || "{}"
) as Options;

interface AssetUploaderOpenOptions {
  field: string;
  multiSelect?: boolean;
  selectMetaData?: boolean;
  initialSelectedData?: InitialSelectedAssetData[];
  params?: Record<string, string>;
  insert?: (data: Record<string, string>[]) => Promise<void>;
}

interface AssetUploader {
  open: (options: AssetUploaderOpenOptions) => Promise<void>;
}

const getInsertData = async (
  data: Parameters<InsertMethod>[0]
): Promise<Record<string, string>[]> => {
  const result: Record<string, string>[] = [];

  (
    await Promise.all(
      data.map(({ asset, insertOptions }) =>
        asHtml(asset, {
          include: true,
          alternativeText: insertOptions.alternativeText,
          caption: insertOptions.caption,
          width: insertOptions.width,
          linkToOriginal: insertOptions.linkToOriginal,
          align: insertOptions.align
        })
      )
    )
  ).forEach((resp) => {
    if (resp.error === null) {
      result.push(resp.result);
    } else {
      window.alert(resp.error);
    }
  });

  return result;
};

function getInsertHtml(field: string): InsertMethod {
  return async (data) => {
    const html = (await getInsertData(data)).map(({ html }) => html).join("");
    window.app?.insertHTML(html, field);
  };
}

function getInsertFieldAsset(field: string): InsertMethod {
  return async (data) => {
    const asset = data[0].asset;

    const resp = await asHtml(asset, {
      enclose: true
    });

    if (resp.error !== null) {
      window.alert(resp.error);
      return;
    }

    const html = resp.result.html;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window.MT as any).AssetUploader = {
  open: (opts: AssetUploaderOpenOptions) => {
    const insert = opts.insert;
    mount(AssetModal, {
      target: document.body,
      props: {
        insert: insert
          ? async (data) => {
              insert(await getInsertData(data));
            }
          : getInsertHtml(opts.field),
        selectMetaData: opts.selectMetaData,
        multiSelect: opts.multiSelect,
        initialSelectedData: opts.initialSelectedData,
        params: opts.params || {},
        options
      }
    });
  }
} as AssetUploader;

const modalOpen = window.jQuery.fn.mtModal.open;
window.jQuery.fn.mtModal.open = async (url: string, opts: unknown) => {
  const params = Object.fromEntries(
    new URLSearchParams(url.replace(/.*?\?/, "").replace(/&amp;/g, "&"))
  );
  if (params.__mode === "dialog_asset_modal" && params.filter_val === "image") {
    mount(AssetModal, {
      target: document.body,
      props: {
        insert: getInsertHtml(params.edit_field),
        selectMetaData: true,
        multiSelect: true,
        params,
        options
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

    const params = Object.fromEntries(
      new URLSearchParams(elm.href.replace(/.*?\?/, "").replace(/&amp;/g, "&"))
    );
    if (params.filter_val === "image") {
      const initialSelectedData: InitialSelectedAssetData[] = [];
      const editField = params.edit_field;
      const input = document.querySelector<HTMLInputElement>(`#${editField}`);
      if (input) {
        const m = input.value.match(/mt:asset-id="(\d+)"/);
        if (m) {
          initialSelectedData.push({
            id: m[1]
          });
        }
      }

      mount(AssetModal, {
        target: document.body,
        props: {
          insert: getInsertFieldAsset(params.edit_field),
          params,
          options,
          initialSelectedData
        }
      });
    } else {
      modalOpen(elm.href, {});
    }
  });
});
