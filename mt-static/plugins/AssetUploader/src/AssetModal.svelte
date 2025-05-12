<script lang="ts">
  import { unmount } from "svelte";
  import { Modal } from "@movabletype/svelte-components";
  import SelectionPanel from "./SelectionPanel.svelte";
  import { setAssetModalContext } from "./context";
  import type { InsertMethod } from "./context";
  import Store from "./store";

  let {
    insert,
    params
  }: {
    insert: InsertMethod;
    params: URLSearchParams;
  } = $props();

  let self: Modal;
  function close() {
    unmount(self);
  }

  setAssetModalContext({ insert, params });

  const store = new Store({
    params
  });
</script>

<Modal size="lg" on:close={close} bind:this={self}>
  <SelectionPanel {store} />
</Modal>
