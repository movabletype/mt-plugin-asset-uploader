import MTObject from "./object";
import type { ColumnList } from "./object";

interface AsHtmlOptions {
  alternativeText?: string;
  caption?: string;
}

export default class Asset extends MTObject {
  blog_id: string;
  label: string;
  url: string;
  description: string;
  thumbnail_url: string;
  width: number;
  height: number;
  constructor(props: Asset) {
    super(props);
    this.blog_id = props.blog_id;
    this.label = props.label;
    this.description = props.description;
    this.url = props.url;
    this.thumbnail_url = props.thumbnail_url;
    this.width = props.width;
    this.height = props.height;
  }

  static datasource = "asset";
  static columns = [
    {
      column: "asset_uploader_blog_id",
      property: "blog_id"
    },
    {
      column: "asset_uploader_label",
      property: "label"
    },
    {
      column: "asset_uploader_description",
      property: "description"
    },
    {
      column: "asset_uploader_url",
      property: "url"
    },
    {
      column: "asset_uploader_thumbnail_url",
      property: "thumbnail_url"
    },
    {
      column: "image_width",
      property: "width",
      type: "number"
    },
    {
      column: "image_height",
      property: "height",
      type: "number"
    }
  ] as ColumnList;

  async asHtml(options: AsHtmlOptions): Promise<string> {
    // TODO: Implement asHtml with options
    const body = new FormData();
    body.set("__mode", "asset_uploader_as_html");
    body.set("blog_id", this.blog_id);
    body.set("id", this.id);
    return (
      await fetch(window.CMSScriptURI, {
        method: "POST",
        credentials: "include",
        body
      })
    ).text();
  }
}
