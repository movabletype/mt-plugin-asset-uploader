<script module>
  import type { InsertMethod } from "./context";
  import type { InitialSelectedAssetData, Options } from "./store";
  // eslint-disable-next-line no-import-assign
  export type { InitialSelectedAssetData, Options };
</script>

<script lang="ts">
  import { unmount } from "svelte";
  import { Modal } from "@movabletype/svelte-components";
  import SelectionPanel from "./SelectionPanel.svelte";
  import { setAssetModalContext } from "./context";
  import Store from "./store";

  let {
    insert,
    selectMetaData = false,
    multiSelect = false,
    params,
    options,
    initialSelectedData
  }: {
    insert: InsertMethod;
    selectMetaData?: boolean;
    multiSelect?: boolean;
    params: Record<string, string>;
    options: Options;
    initialSelectedData?: InitialSelectedAssetData[];
  } = $props();

  let self: Modal;
  function close() {
    unmount(self);
  }

  setAssetModalContext({ insert, params });

  const store = new Store({
    multiSelect,
    params,
    options,
    initialSelectedData
  });
</script>

<Modal id="mt-asset-uploader-modal" size="lg" on:close={close} bind:this={self}>
  <SelectionPanel {selectMetaData} {store} />
</Modal>
