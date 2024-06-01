import { Exporter } from "./exporter";
import { UI } from "./ui";
import { exportAll as exportAllAPI } from "./api";

interface EditorDisplayOptions {
  content_css_list?: string[];
  body_class_list?: string[];
}

type TypeOfExporter = typeof Exporter;
export declare interface MT extends TypeOfExporter {
  UI: typeof UI;

  /* from core */
  Util: {
    isMobileView(): boolean;
  };
  Editor: {
    defaultCommonOptions: EditorDisplayOptions;
  } | null;
}

declare global {
  interface Window {
    MT: MT;

    ScriptURI: string;
    CMSScriptURI: string;
    uploadFiles(files: File[]): void;
    setDirty(status: boolean): void;
    app: {
      getIndirectMethod(name: string): () => void;
      insertHTML(html: string, field: string);
    } | null;
    insertCustomFieldAsset(html: string, field: string, preview: string);
    trans(msgId: string, ...params: string[]): string;
    jQuery: typeof jQuery;
  }

  interface JQuery {
    modal(action: string): void;
    mtModal: {
      open(uri: string, opts: Record<string, unknown>): void;
    };
  }

  interface JQueryStatic {
    _data(elm: HTMLElement, key: string): Record<string, unknown>;
  }
}

const MT = {
  UI,
  ...Exporter
} as MT;
if (window.MT) {
  Object.assign(window.MT, MT);
} else {
  window.MT = MT;
}

exportAllAPI();

export {};
