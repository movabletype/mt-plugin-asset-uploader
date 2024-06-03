<script lang="ts">
  import { unmount } from "svelte";
  import { Modal } from "@movabletype/svelte-components";
  import SelectionPanel from "./SelectionPanel.svelte";
  import { setAssetModalContext } from "./context";
  import Store from "./store";

  let self: Modal;
  function close() {
    unmount(self);
  }

  export let insert;
  export let params: URLSearchParams;
  setAssetModalContext({ insert, params });

  const store = new Store({
    params
  });
</script>

<Modal on:close={close} bind:this={self}>
  <SelectionPanel {store} />
</Modal>
