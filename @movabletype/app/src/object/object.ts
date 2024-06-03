export type ColumnList = {
  column: string; // column name in listing framework
  property: string; // property name in this class
  type?: "string" | "number";
}[];

export type Limit = 10 | 12 | 15 | 20 | 25 | 30 | 50 | 100;

interface LoadResult<T> {
  objects: T[];
  count: number;
}

interface Item {
  args: { value: string };
  type: string;
}

interface Terms {
  blog_id: string;
  items?: Item[];
}

interface Args {
  limit?: Limit;
  page?: number;
  sort_by?: string;
  sort_order?: "ascend" | "descend";
}

export default class MTObject {
  id: string;
  constructor({ id }: { id: string }) {
    this.id = id;
  }
  static datasource: string = "";
  static columns: ColumnList = [];
  static async load<T extends MTObject>(
    this: (new (props: any) => T) & typeof MTObject,
    { blog_id, items }: Terms,
    { limit, page, sort_by, sort_order }: Args = {}
  ): Promise<LoadResult<T>> {
    limit ??= 10;
    page ??= 1;
    sort_by ??= "id";
    sort_order ??= "descend";

    const body = new FormData();
    body.set("__mode", "filtered_list");
    body.set("blog_id", blog_id);
    body.set("datasource", this.datasource);
    body.set("limit", `${limit}`);
    body.set("sort_by", sort_by);
    body.set("sort_order", sort_order);
    body.set("page", `${page}`);
    if (items) {
      body.set("items", JSON.stringify(items));
    }
    body.set("columns", this.columns.map(({ column }) => column).join(","));

    const responseData = await (
      await fetch(window.CMSScriptURI, {
        method: "POST",
        credentials: "include",
        body,
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        }
      })
    ).json();

    const objects = responseData.result.objects.map(([id, ...rest]: any) => {
      const data: Record<string, string> = { id };
      this.columns.forEach(({ property }, i) => {
        data[property] = rest[i];
      });
      return new this(data as any);
    });

    return {
      count: responseData.result.count,
      objects
    };
  }
}
