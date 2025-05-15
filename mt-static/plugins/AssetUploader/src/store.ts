import { readable, writable } from "svelte/store";
import type { Readable } from "svelte/store";
import { Asset, SUPPORTED_LIMITS } from "@movabletype/app/object";
import type { Item } from "@movabletype/app/object";
import { PagerData } from "@movabletype/svelte-components";

interface AssetData {
  id: string;
  status: "loading" | "loaded" | "error";
  selected: boolean;
  asset: Asset;
  alternativeText: string;
  caption: string;
  width: number | undefined;
  uploadPromise?: ReturnType<MTAPIMap["uploadAssets"]>[0];
}
export type InitialSelectedAssetData = {
  id: string;
} & Partial<AssetData>;

export type UploadOptions = Parameters<MTAPIMap["uploadAssets"]>[0]["options"];

export default class Store {
  status: "loading" | "loaded" | "error" = "loading";
  #params: URLSearchParams;
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
    initialSelectedData = []
  }: {
    multiSelect: boolean;
    params: URLSearchParams;
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

    this.#params = params;
    this.#multiSelect = multiSelect;
    this.load({ initialSelectedData });
  }

  #loadPromise: ReturnType<typeof Asset.load> | Promise<void> = Promise.resolve();
  async #load(...args: Parameters<typeof Asset.load>) {
    const lastLoadPromise = this.#loadPromise;
    return (this.#loadPromise = lastLoadPromise.then(() => Asset.load(...args)) as ReturnType<
      typeof Asset.load
    >);
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
            width: undefined
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
    return this.#params.get("blog_id") || "";
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
              width: undefined,
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
            width: undefined
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

    const uploadAssets = await window.MT.import("uploadAssets");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.src = url;
      });

      const uploadPromise = uploadAssets({
        files: [file],
        context: { blogId: parseInt(this.#params.get("blog_id")!) },
        options,
        requestOptions: {}
      })[0];

      const id = `upload-${Math.random().toString(36)}`;
      this.#stash.unshift({
        id,
        status: "loading",
        selected: true,
        asset: new Asset({
          id: "",
          blog_id: "",
          label: file.name,
          description: "",
          width,
          height,
          url: URL.createObjectURL(file),
          thumbnail_url: URL.createObjectURL(file)
        }),
        alternativeText: "",
        caption: "",
        width: undefined,
        uploadPromise
      });

      this.setSelectedObjects(this.#stash.filter((data) => data.selected));
      this.#updateObjects();
    }
  }

  static async getProcessedAsset(data: AssetData) {
    if (data.uploadPromise) {
      const res = await (await data.uploadPromise).json();
      const asset = data.asset;
      asset.id = res.result.asset.id;
      asset.blog_id = res.result.asset.blog_id;
      delete data.uploadPromise;
      return asset;
    } else {
      return data.asset;
    }
  }
}
