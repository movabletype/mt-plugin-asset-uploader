import { readable, writable } from "svelte/store";
import type { Readable } from "svelte/store";
import { Asset, SUPPORTED_LIMITS } from "@movabletype/app/object";
import type { Item } from "@movabletype/app/object";
import { PagerData } from "@movabletype/svelte-components";

export interface Options {
  imageDefaultThumb: boolean;
  imageDefaultWidth: number;
  imageDefaultAlign: "left" | "center" | "right" | "none";
  imageDefaultPopup: boolean;
  imageSupportedAligns?: ("left" | "center" | "right" | "none")[];
}

export interface AssetData {
  id: string;
  status: "loading" | "loaded" | "error";
  selected: boolean;
  asset: Asset;
  alternativeText: string;
  caption: string;
  width: number | undefined;
  linkToOriginal: boolean;
  align: "left" | "center" | "right" | "none";
  uploadPromise?: Promise<void>;
}
export type InitialSelectedAssetData = {
  id: string;
} & Partial<AssetData>;

type uploadAssetAPIOptions = Parameters<MTAPIMap["uploadAsset"]>[0]["options"];
export interface UploadOptions extends uploadAssetAPIOptions {
  allowToChange: boolean;
  userBasename: string;
  dirSeparator: string;
}

export default class AssetDataStore {
  status: "loading" | "loaded" | "error" = "loading";
  #options: Options;
  #params: Record<string, string>;
  #perPage: number = 12;
  #currentPage: number = 1;
  #multiSelect: boolean;

  #stash: AssetData[] = [];
  #totalCount: number = 0;

  #items: Item[] = [];
  #offset: number = 0;

  setObjects: (objects: AssetData[]) => void = () => {};
  objects: Readable<AssetData[]>;

  setSelectedObjects: (asset: AssetData[]) => void = () => {};
  selectedObjects: Readable<AssetData[]>;

  setPagerData: (data: PagerData) => void = () => {};
  pagerData: Readable<PagerData | undefined>;

  constructor({
    multiSelect,
    params,
    options,
    initialSelectedData = []
  }: {
    multiSelect: boolean;
    params: Record<string, string>;
    options: Options;
    initialSelectedData?: InitialSelectedAssetData[];
  }) {
    this.objects = readable<AssetData[]>([], (set) => {
      this.setObjects = set;
    });
    this.selectedObjects = writable<AssetData[]>([], (set) => {
      this.setSelectedObjects = set;
    });
    this.pagerData = readable<PagerData | undefined>(undefined, (set) => {
      this.setPagerData = set;
    });

    options.imageSupportedAligns ??= ["left", "center", "right", "none"];
    this.#params = params;
    this.#multiSelect = multiSelect;
    this.#options = options;
    this.load({ initialSelectedData });
  }

  #loadPromise: ReturnType<typeof Asset.load> | Promise<void> = Promise.resolve();
  async #load(...args: Parameters<typeof Asset.load>) {
    const lastLoadPromise = this.#loadPromise;
    return (this.#loadPromise = lastLoadPromise.then(() => Asset.load(...args)) as ReturnType<
      typeof Asset.load<Asset>
    >);
  }

  #defaultAssetDataOptions() {
    return {
      linkToOriginal: this.#options.imageDefaultPopup,
      align: this.#options.imageSupportedAligns?.includes(this.#options.imageDefaultAlign)
        ? this.#options.imageDefaultAlign
        : "none"
    };
  }

  async #updateObjects() {
    const objects: AssetData[] = [];
    const end = Math.min(this.#currentPage * this.#perPage, this.#totalCount);
    for (let i = (this.#currentPage - 1) * this.#perPage; i < end; i++) {
      if (!this.#stash[i]) {
        const page = Math.floor((i - this.#offset) / this.#limit()) + 1;
        const { count, objects: assets } = await this.#load(
          {
            blog_id: this.#blogId(),
            items: this.#items
          },
          {
            limit: this.#limit(),
            page
          }
        );
        this.#totalCount = count + this.#offset;
        const k = (page - 1) * this.#limit() + this.#offset;
        for (let j = 0; j < assets.length; j++) {
          this.#stash[k + j] ??= {
            id: assets[j].id,
            status: "loaded",
            selected: false,
            asset: assets[j],
            alternativeText: "",
            caption: "",
            width:
              this.#options.imageDefaultThumb && this.#options.imageDefaultWidth < assets[j].width
                ? this.#options.imageDefaultWidth
                : assets[j].width,
            ...this.#defaultAssetDataOptions()
          } as AssetData;
        }
      }

      if (this.#stash[i]) {
        objects.push(this.#stash[i]);
      }
    }

    this.setObjects(objects);
  }

  #updatePagerData() {
    this.setPagerData({
      totalPages: Math.ceil(this.#totalCount / this.#perPage),
      currentPage: this.#currentPage,
      setPage: async (page) => {
        this.#currentPage = page;
        await this.#updateObjects();
        this.#updatePagerData();
      }
    });
  }

  #blogId() {
    return (
      this.#params.blog_id ||
      document.querySelector<HTMLScriptElement>("#asset-uploader-script")?.dataset.blogId ||
      ""
    );
  }

  #limit() {
    return (
      SUPPORTED_LIMITS.find((limit) => limit >= this.#perPage) ||
      SUPPORTED_LIMITS[SUPPORTED_LIMITS.length - 1]
    );
  }

  search(searchText: string) {
    this.load({ searchText });
  }

  async load({
    searchText,
    initialSelectedData = []
  }: {
    searchText?: string;
    initialSelectedData?: InitialSelectedAssetData[];
  }) {
    const selectedObjects: AssetData[] = [];
    this.status = "loading";
    this.#stash = [];

    this.#items = [
      {
        type: "class",
        args: {
          value: "image"
        }
      }
    ];
    if (searchText) {
      this.#items.push({ type: "file_name", args: { string: searchText, option: "contains" } });
    }

    if (initialSelectedData.length > 0) {
      const { count, objects: assets } = await Asset.load(
        {
          blog_id: this.#blogId(),
          items: [
            ...this.#items,
            {
              type: "pack",
              args: {
                op: "or",
                items: initialSelectedData.map((data) => ({
                  type: "id",
                  args: { value: data.id, option: "equal" }
                }))
              }
            }
          ]
        },
        { limit: SUPPORTED_LIMITS[SUPPORTED_LIMITS.length - 1] }
      );
      this.#offset = count;
      const map = assets.reduce(
        (acc, asset) => {
          acc[asset.id] = asset;
          return acc;
        },
        {} as Record<string, Asset>
      );
      this.#stash.push(
        ...initialSelectedData
          .map((data) => {
            const asset = map[data.id];
            if (!asset) {
              return;
            }
            const assetData = {
              alternativeText: "",
              caption: "",
              width:
                this.#options.imageDefaultThumb && this.#options.imageDefaultWidth < asset.width
                  ? this.#options.imageDefaultWidth
                  : asset.width,
              ...this.#defaultAssetDataOptions(),
              ...data,
              status: "loaded",
              selected: true,
              asset
            } as AssetData;

            selectedObjects.push(assetData);
            this.#items.push({ type: "id", args: { value: data.id, option: "not_equal" } });

            return assetData;
          })
          .filter((data) => !!data)
      );
    }

    const { count, objects: assets } = await Asset.load(
      {
        blog_id: this.#blogId(),
        items: this.#items
      },
      { limit: this.#limit() }
    );
    this.#stash.push(
      ...assets.map(
        (asset) =>
          ({
            id: asset.id,
            status: "loaded",
            selected: false,
            asset,
            alternativeText: "",
            caption: "",
            width:
              this.#options.imageDefaultThumb && this.#options.imageDefaultWidth < asset.width
                ? this.#options.imageDefaultWidth
                : asset.width,
            ...this.#defaultAssetDataOptions()
          }) as AssetData
      )
    );

    this.status = "loaded";
    this.#totalCount = count + this.#offset;
    this.#updateObjects();
    this.#updatePagerData();
    this.setSelectedObjects(selectedObjects);
  }

  select(asset: AssetData) {
    let changed = false;
    const selectedObjects: AssetData[] = [];
    this.#stash.forEach((data) => {
      const selected = data === asset ? !data.selected : this.#multiSelect && data.selected;
      if (data.selected !== selected) {
        data.selected = selected;
        changed = true;
      }
      if (selected) {
        selectedObjects.push(data);
      }
    });

    if (changed) {
      this.setSelectedObjects(selectedObjects);
      this.#updateObjects();
    }
  }

  async upload(files: FileList | null | undefined, options: UploadOptions) {
    if (!files) {
      return;
    }

    const uploadAsset = await window.MT.import("uploadAsset");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.src = url;
      });

      const uploadPromise = uploadAsset({
        file,
        context: { blogId: parseInt(this.#blogId()) },
        options,
        requestOptions: {}
      });

      const assetData: AssetData = {
        id: `upload-${Math.random().toString(36)}`,
        status: "loading",
        selected: true,
        asset: new Asset({
          id: "",
          blog_id: "",
          label: file.name,
          description: "",
          tags: "",
          width,
          height,
          url,
          thumbnail_url: url
        }),
        alternativeText: "",
        caption: "",
        width:
          this.#options.imageDefaultThumb && this.#options.imageDefaultWidth < width
            ? this.#options.imageDefaultWidth
            : width,
        ...this.#defaultAssetDataOptions()
      };
      assetData.uploadPromise = uploadPromise
        .then(async (res) => {
          const resData = await res.json();
          if (resData.error !== null) {
            throw new Error(resData.error);
          } else if ("cancel" in resData.result) {
            throw new Error(resData.result.cancel);
          }

          assetData.status = "loaded";
          Object.assign(assetData.asset, resData.result.asset);
        })
        .catch((error: Error) => {
          alert(error.message);
          this.#stash = this.#stash.filter((data) => data.id !== assetData.id);
          this.#offset--;
          this.#totalCount--;
          this.setSelectedObjects([]);
          this.#updateObjects();
        });

      this.#stash.unshift(assetData);
      this.#offset++;
      this.#totalCount++;

      this.setSelectedObjects(this.#stash.filter((data) => data.selected));
      this.#updateObjects();
    }
  }

  static async getProcessedAsset(data: AssetData): Promise<Asset | undefined> {
    await data.uploadPromise;
    if (data.status === "error") {
      return;
    }
    return data.asset;
  }
}
