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
    insert,
    selectMetaData = false,
    multiSelect = false,
    params,
    options,
    allowUpload = true,
    uploadOptions: _uploadOptions,
    initialSelectedData
  }: {
    insert: InsertMethod;
    selectMetaData?: boolean;
    multiSelect?: boolean;
    params: Record<string, string>;
    options: Options;
    allowUpload?: boolean;
    uploadOptions: Readonly<UploadOptions>;
    initialSelectedData?: InitialSelectedAssetData[];
  } = $props();

  const uploadOptions: UploadOptions = { ..._uploadOptions };

  let self: Modal;
  function close() {
    unmount(self);
  }

  setAssetModalContext({ insert, params });

  const assetDataStore = new AssetDataStore({
    multiSelect,
    params,
    options,
    initialSelectedData
  });
</script>

<Modal id="mt-asset-uploader-modal" size="lg" on:close={close} bind:this={self}>
  <SelectionPanel {selectMetaData} {assetDataStore} {options} {allowUpload} {uploadOptions} />
</Modal>

<style>
  @media (max-width: 992px) {
    :global(#mt-asset-uploader-modal .modal-dialog) {
      max-width: 800px;
    }
  }
</style>
