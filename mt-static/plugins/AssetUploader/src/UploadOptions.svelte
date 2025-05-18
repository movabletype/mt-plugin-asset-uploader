<script lang="ts">
  import { onMount } from "svelte";
  import { ModalContent } from "@movabletype/svelte-components";
  import { ComponentList } from "@movabletype/svelte-components";

  let {
    showUploadOptionsView = $bindable(),
    uploadOptions: _uploadOptions = $bindable()
  }: {
    showUploadOptionsView: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uploadOptions: any;
  } = $props();

  let uploadOptions = $state<any>();
  $effect(() => {
    _uploadOptions = uploadOptions;
  });

  if (!uploadOptions) {
    onMount(async () => {
      const defaultOptions = await new Promise((resolve) => {
        // fetch default option value from server?
        resolve({ fixOrientation: true });
      });
      uploadOptions = defaultOptions;
    });
  }

  function onMessage(ev: CustomEvent) {
    Object.assign(uploadOptions, ev.detail);
  }
</script>

{#if uploadOptions}
  <ModalContent>
    <svelte:fragment slot="title">Upload Config</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="text-right">
        <button
          type="button"
          class="btn btn-default"
          onclick={() => (showUploadOptionsView = false)}>閉じる</button
        >
      </div>
      <ComponentList
        namespace="asset-upload-options.modal"
        detail={uploadOptions}
        on:message={onMessage as (ev: Event) => void}
      >
        <svelte:fragment slot="prepend">
          <div>
            <h3>アップロード先</h3>
            <input bind:value={uploadOptions.destination} />
          </div>
          <div>
            <h3>画像の向きの修正</h3>
            <input type="checkbox" bind:checked={uploadOptions.fixOrientation} />
          </div>
        </svelte:fragment>
      </ComponentList>
    </svelte:fragment>
  </ModalContent>
{/if}
