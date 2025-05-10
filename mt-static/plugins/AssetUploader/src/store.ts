import { readable, writable } from "svelte/store";
import type { Readable, Writable } from "svelte/store";
import { Asset } from "@movabletype/app/object";
import { PagerData } from "@movabletype/svelte-components";

interface AssetData {
  id: string;
  status: "loading" | "loaded" | "error";
  selected: boolean;
  asset: Asset;
  alternativeText: string;
  caption: string;
  uploadPromise?: ReturnType<MTAPIMap["uploadAssets"]>[0];
}

export type UploadOptions = Parameters<MTAPIMap["uploadAssets"]>[0]["options"];

export default class Store {
  status: "loading" | "loaded" | "error" = "loading";
  params: URLSearchParams;
  perPage: number = 12;
  currentPage: number = 1;
  multiSelect: boolean = true;

  stash: AssetData[] = [];
  totalCount: number = 0;

  setObjects: (objects: AssetData[]) => void = () => {};
  objects: Readable<AssetData[]>;

  setSelectedObjects: (asset: AssetData[]) => void = () => {};
  // FIXME: svelte compiler bug? we can use Readable<AssetData[]> here, but if we use it, error occurs in runtime
  selectedObjects: Writable<AssetData[]>;

  setPagerData: (data: PagerData) => void = () => {};
  pagerData: Readable<PagerData | undefined>;

  constructor({ params }: { params: URLSearchParams }) {
    this.objects = readable<AssetData[]>([], (set) => {
      this.setObjects = set;
    });
    this.selectedObjects = writable<AssetData[]>([], (set) => {
      this.setSelectedObjects = set;
    });
    this.pagerData = readable<PagerData | undefined>(undefined, (set) => {
      this.setPagerData = set;
    });

    this.params = params;
    this.load();
  }

  private updateObjects() {
    this.setObjects(
      this.stash.slice((this.currentPage - 1) * this.perPage, this.currentPage * this.perPage)
    );
  }

  private updatePagerData() {
    this.setPagerData({
      totalPages: Math.ceil(this.totalCount / this.perPage),
      currentPage: this.currentPage,
      setPage: (page) => {
        this.currentPage = page;
        this.updateObjects();
        this.updatePagerData();
      }
    });
  }

  search(searchText: string) {
    this.load(searchText);
  }

  async load(searchText: string = "") {
    const items = searchText
      ? [{ type: "file_name", args: { string: searchText, option: "contains" } }]
      : undefined;

    this.status = "loading";
    const { count, objects: assets } = await Asset.load(
      {
        blog_id: this.params.get("blog_id") || "",
        items
      },
      { limit: 25 } // FIXME: limit
    );
    this.stash = assets.map((asset) => ({
      id: asset.id,
      status: "loaded",
      selected: false,
      asset,
      alternativeText: "",
      caption: ""
    }));
    this.status = "loaded";
    this.totalCount = count;
    this.updateObjects();
    this.updatePagerData();
    this.setSelectedObjects([]);
  }

  select(asset: AssetData) {
    let changed = false;
    const selectedObjects: AssetData[] = [];
    this.stash.forEach((data) => {
      const selected = data === asset ? !data.selected : this.multiSelect && data.selected;
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
      this.updateObjects();
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
        context: { blogId: parseInt(this.params.get("blog_id")!) },
        options,
        requestOptions: {}
      })[0];

      const id = `upload-${Math.random().toString(36)}`;
      this.stash.unshift({
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
        uploadPromise
      });

      this.setSelectedObjects(this.stash.filter((data) => data.selected));
      this.updateObjects();
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
