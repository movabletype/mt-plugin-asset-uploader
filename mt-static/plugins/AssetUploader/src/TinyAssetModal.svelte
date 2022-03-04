<script lang="ts">
  import { get_current_component } from "svelte/internal";

  import Modal from "../../movabletype/svelte/Modal.svelte";
  import TableView from "./TableView.svelte";
  import { setAssetModalContext } from "./context";

  let self = get_current_component();
  function close(): void {
    self.$destroy();
  }

  export let insert;
  export let params: URLSearchParams;
  setAssetModalContext({ insert, params });
</script>

<Modal on:close={close}>
  <TableView />
</Modal>
