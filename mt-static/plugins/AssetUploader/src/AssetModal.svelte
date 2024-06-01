<script lang="ts">
  import { unmount } from "svelte";
  import { Modal } from "@movabletype/svelte-components";
  import TableView from "./TableView.svelte";
  import { setAssetModalContext } from "./context";

  let self: Modal;
  function close() {
    unmount(self);
  }

  export let insert;
  export let params: URLSearchParams;
  setAssetModalContext({ insert, params });
</script>

<Modal on:close={close} bind:this={self}>
  <TableView />
</Modal>
