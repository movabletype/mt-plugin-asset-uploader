<script module>
  import type { InsertMethod } from "./context";
  import type { InitialSelectedAssetData, Options, UploadOptions } from "./assetDataStore";
  // eslint-disable-next-line no-import-assign
  export type { InitialSelectedAssetData, Options, UploadOptions };
</script>

<script lang="ts">
  import { unmount } from "svelte";
  import { Modal } from "@movabletype/svelte-components";
  import SelectionPanel from "./SelectionPanel.svelte";
  import { setAssetModalContext } from "./context";
  import AssetDataStore from "./assetDataStore";

  let {
    blogId,
    insert,
    selectMetaData = false,
    multiSelect = false,
    params,
    options,
    allowUpload = true,
    allowEdit = true,
    uploadOptions: _uploadOptions,
    initialSelectedData
  }: {
    blogId: number;
    insert: InsertMethod;
    selectMetaData?: boolean;
    multiSelect?: boolean;
    params: Record<string, string>;
    options: Options;
    allowUpload?: boolean;
    allowEdit?: boolean;
    uploadOptions: Readonly<UploadOptions>;
    initialSelectedData?: InitialSelectedAssetData[];
  } = $props();

  const uploadOptions: UploadOptions = { ..._uploadOptions };

  let self: Modal;
  function close() {
    unmount(self);
  }

  setAssetModalContext({ insert, params });

  let statusMessage: string = $state("");
  $effect(() => {
    const searchParams = new URLSearchParams();
    searchParams.set("__mode", "asset_uploader_site_status");
    searchParams.set("blog_id", `${blogId}`);

    fetch(window.CMSScriptURI + "?" + searchParams.toString(), {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(resp.statusText);
        }
        return resp.json();
      })
      .then((data: { error: null; result: { message: string } } | { error: string }) => {
        if (data.error !== null) {
          throw new Error(data.error);
        }
        statusMessage = data.result.message;
      })
      .catch((error: Error) => {
        alert(error.message);
      });
  });

  const assetDataStore = new AssetDataStore({
    multiSelect,
    params,
    options,
    initialSelectedData
  });
</script>

<Modal id="mt-asset-uploader-modal" size="lg" on:close={close} bind:this={self}>
  <SelectionPanel
    {selectMetaData}
    {assetDataStore}
    {options}
    {allowUpload}
    {allowEdit}
    {uploadOptions}
    {statusMessage}
  />
</Modal>

<style>
  @media (max-width: 992px) {
    :global(#mt-asset-uploader-modal .modal-dialog) {
      max-width: 800px;
    }
  }
</style>
