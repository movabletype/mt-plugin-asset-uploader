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
}

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

  async load() {
    this.status = "loading";
    const { count, objects: assets } = await Asset.load(
      { blog_id: this.params.get("blog_id") || "" },
      { limit: 25 } // FIXME: limit
    );
    this.stash = assets.map((asset, i) => ({
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
  }

  select(asset: AssetData) {
    let changed = false;
    let selectedObjects: AssetData[] = [];
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
}
