import { mount } from "svelte";
import AssetModal from "./AssetModal.svelte";
import type { InitialSelectedAssetData, Options, UploadOptions } from "./AssetModal.svelte";
import type { InsertMethod } from "./context";
import { asHtml } from "./util/asset";
import { addToObjectAsset } from "./util/objectasset";

const script = document.querySelector<HTMLScriptElement>("#asset-uploader-script")!;
const options = JSON.parse(script.dataset.insertOptions || "{}") as Options;
const uploadOptions = JSON.parse(script.dataset.uploadOptions || "{}") as UploadOptions;
const canUpload = script.dataset.canUpload === "1";
const blogId = parseInt(script.dataset.blogId ?? "0");
const magicToken = script.dataset.magicToken ?? "";

interface AssetUploaderOpenOptions {
  field: string;
  multiSelect?: boolean;
  selectMetaData?: boolean;
  initialSelectedData?: InitialSelectedAssetData[];
  params?: Record<string, string>;
  insert?: (data: Record<string, string>[]) => Promise<void>;
  options?: Partial<Options>;
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
    addToObjectAsset(data);

    const html = (await getInsertData(data)).map(({ html }) => html).join("");
    window.app?.insertHTML(html, field);
  };
}

function getInsertFieldAsset(field: string): InsertMethod {
  return async (data) => {
    addToObjectAsset(data);

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

function getInsertContentFieldAsset(fieldId: string): InsertMethod {
  return async (data) => {
    addToObjectAsset(data);

    const assets = data.map(({ asset }) => asset);

    const body = new FormData();
    body.set("__mode", "dialog_insert_options");
    body.set("_type", "asset");
    body.set("magic_token", magicToken);
    body.set("dialog_view", "1");
    body.set("no_insert", "1");
    body.set("dialog", "1");
    body.set("content_field_id", fieldId);
    body.set("force_insert", "1");
    body.set("entry_insert", "1");

    body.set("blog_id", `${blogId}`);
    body.set("id", assets.map(({ id }) => id).join(","));

    fetch(window.CMSScriptURI, {
      method: "POST",
      body,
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then((resp) => resp.text())
      .then((html) => {
        const iframe = document.createElement("iframe");
        iframe.srcdoc = html;
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        iframe.onload = () => {
          const iframeWindow = iframe.contentWindow;
          iframeWindow?.jQuery.ready(() => {
            iframe.remove();
          });
        };
      })
      .catch((err) => {
        window.alert(err.message);
      });
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window.MT as any).AssetUploader = {
  open: (opts: AssetUploaderOpenOptions) => {
    const insert = opts.insert;
    mount(AssetModal, {
      target: document.body,
      props: {
        blogId,
        insert: insert
          ? async (data: Parameters<InsertMethod>[0]) => {
              addToObjectAsset(data);

              insert(await getInsertData(data));
            }
          : getInsertHtml(opts.field),
        selectMetaData: opts.selectMetaData,
        multiSelect: opts.multiSelect,
        initialSelectedData: opts.initialSelectedData,
        params: opts.params || {},
        options: {
          ...options,
          ...opts.options
        },
        uploadOptions,
        allowUpload: canUpload
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
        blogId,
        insert: getInsertHtml(params.edit_field),
        selectMetaData: true,
        multiSelect: true,
        params,
        options,
        uploadOptions,
        allowUpload: canUpload
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
    if (params.filter_val === "image" || params.filter_val === "1") {
      let allowUpload = canUpload;
      let multiSelect = false;

      const initialSelectedData: InitialSelectedAssetData[] = [];
      const editField = params.edit_field as string | undefined;
      const contentFieldId = params.content_field_id as string | undefined;
      if (editField) {
        const input = document.querySelector<HTMLInputElement>(`#${editField}`) as HTMLInputElement;
        const m = input.value.match(/mt:asset-id="(\d+)"/);
        if (m) {
          initialSelectedData.push({
            id: m[1]
          });
        }
      } else if (contentFieldId) {
        const input = document.querySelector<HTMLInputElement>(
          `#asset-field-${contentFieldId}`
        ) as HTMLInputElement;
        allowUpload &&= input.dataset.mtAssetUploaderAllowUpload === "1";
        multiSelect = input.dataset.mtMultiple === "1";
      }

      mount(AssetModal, {
        target: document.body,
        props: {
          blogId,
          insert: editField
            ? getInsertFieldAsset(editField)
            : getInsertContentFieldAsset(contentFieldId as string),
          multiSelect,
          params,
          options,
          uploadOptions,
          initialSelectedData,
          allowUpload
        }
      });
    } else {
      const modalOptions: {
        large?: boolean;
      } = {};
      if ("mtModalLarge" in elm.dataset) {
        modalOptions["large"] = true;
      }
      modalOpen(elm.href, modalOptions);
    }
  });
});
