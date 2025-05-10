<script lang="ts">
  import { onMount } from "svelte";
  import { ModalContent, Pager } from "@movabletype/svelte-components";
  import UploadOptions from "./UploadOptions.svelte";
  import { getAssetModalContext } from "./context";
  import Store from "./store";
  import type { UploadOptions as StoreUploadOptions } from "./store";

  export let store: Store;
  let objects = store.objects;
  let selectedObjects = store.selectedObjects;
  let pagerData = store.pagerData;
  let isDragging = false;

  let searchText: string = "";
  function search() {
    store.search(searchText);
  }

  let close: (() => void) | undefined;

  let showUploadOptionsView = false;
  let uploadOptions: StoreUploadOptions;

  const { insert } = getAssetModalContext();
  async function insertThenClose() {
    const insertHtmls = await Promise.all(
      $selectedObjects.map(async (data) => {
        const asset = await Store.getProcessedAsset(data);
        return asset.asHtml({
          alternativeText: data.alternativeText,
          caption: data.caption
        });
      })
    );
    insert(insertHtmls.join(""));

    close?.();
  }

  let fileInput: HTMLInputElement;
  onMount(() => {
    fileInput.addEventListener("change", async () => {
      store.upload(fileInput.files, uploadOptions);
    });
  });

  function dropHandler(ev: DragEvent) {
    ev.preventDefault();
    isDragging = false;
    store.upload(ev.dataTransfer?.files, uploadOptions);
  }

  function dragEnterHandler() {
    isDragging = true;
    function documentDragEnterHandler(ev: DragEvent) {
      const target = ev.target;
      if (!(target instanceof HTMLElement) || !target.closest(".modal-body")) {
        // isDragging = false;
        document.removeEventListener("dragenter", documentDragEnterHandler);
      }
    }
    document.addEventListener("dragenter", documentDragEnterHandler);
  }
</script>

{#if !showUploadOptionsView}
  <!-- svelte-ignore a11y-missing-attribute -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <ModalContent bind:close>
    <svelte:fragment slot="title">{window.trans("Insert Image Asset")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div
        class="position-relative"
        class:mt-asset-uploader-dragging={isDragging}
        on:dragover|preventDefault
        on:dragenter={dragEnterHandler}
        on:drop={dropHandler}
      >
        <div class="row">
          <div class="col row">
            <div class="col-auto">
              <input bind:this={fileInput} type="file" multiple class="d-none" />
              <button type="button" class="btn btn-default" on:click={() => fileInput.click()}
                >{window.trans("Upload")}</button
              >
            </div>
            <div class="col-auto">
              <input bind:value={searchText} type="search" class="form-control text" />
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-primary" on:click={search}
                >{window.trans("Search")}</button
              >
            </div>
          </div>
          <div class="col-auto text-right">
            <button
              type="button"
              class="btn btn-default"
              on:click={() => {
                showUploadOptionsView = true;
              }}>設定</button
            >
          </div>
        </div>
        <div class="row p-3">
          <div class="col row">
            <div class="col-12">
              <div class="row d-flex flex-wrap">
                {#each $objects as asset ((asset.selected, asset.id))}
                  <a
                    class="p-2 col-3 mt-asset-uploader-asset"
                    on:click={() => store.select(asset)}
                    aria-label={asset.asset.label}
                  >
                    <img
                      src={asset.asset.thumbnail_url}
                      style={asset.selected ? "outline: 3px solid blue" : ""}
                    />
                  </a>
                {/each}
              </div>
              <div class="mt-5">
                <Pager data={$pagerData} />
              </div>
            </div>
          </div>
          <div class="col-auto mt-asset-uploader-insert-options">
            {#each $selectedObjects as asset (asset.id)}
              <div>
                <div class="row g-4">
                  <div class="col-6">
                    <img src={asset.asset.url} class="mw-100" />
                  </div>
                  <div class="col-6">
                    <div>
                      {asset.asset.label}
                    </div>
                    <div>
                      {asset.asset.width} x {asset.asset.height}
                    </div>
                  </div>
                </div>
                <div class="field field-content field-top-label mt-4">
                  <label class="form-label" for="asset-uploader-alternative-text"
                    >代替テキスト</label
                  >
                  <input
                    id="asset-uploader-alternative-text"
                    type="text"
                    class="form-control text full"
                    bind:value={asset.alternativeText}
                  />
                </div>
                <div class="field field-content field-top-label mt-4">
                  <label class="form-label" for="asset-uploader-caption">キャプション</label>
                  <textarea
                    id="asset-uploader-caption"
                    class="form-control text full"
                    rows="1"
                    bind:value={asset.caption}
                  ></textarea>
                </div>
                <div class="field field-content field-top-label mt-4">
                  <label class="form-label" for="asset-uploader-width">横幅</label>
                  <textarea
                    id="asset-uploader-width"
                    class="form-control text full"
                    rows="1"
                    bind:value={asset.caption}
                  ></textarea>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={window.trans("Insert (s)")}
        class="action primary button btn btn-primary"
        on:click={insertThenClose}
      >
        {window.trans("Insert")}
      </button>
      <button
        type="button"
        title={window.trans("Cancel (x)")}
        class="cancel action button mt-close-dialog btn btn-default"
        on:click={close}
      >
        {window.trans("Cancel")}
      </button>
    </svelte:fragment>
  </ModalContent>
{:else}
  <UploadOptions bind:showUploadOptionsView bind:uploadOptions />
{/if}

<style>
  .mt-asset-uploader-dragging:after {
    content: "ファイルをドロップしてください";
    position: absolute;
    top: 0;
    left: -5px;
    font-size: 18px;
    color: #0d76bf;
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% + 10px);
    height: 100%;
    background-color: rgba(186, 227, 255, 0.6);
    outline: 3px solid #0a93f3;
    outline-offset: -3px;
    z-index: 10;
  }
  .mt-asset-uploader-asset {
    width: 133px;
    height: 133px;
  }
  .mt-asset-uploader-asset img {
    outline-offset: -3px;
    object-fit: cover;
    object-position: center center;
    width: 126px;
    height: 126px;
  }
  .mt-asset-uploader-insert-options {
    width: 245px;
    height: 460px;
    overflow-y: auto;
  }
  input[type="search"] {
    width: 10rem;
  }
  textarea {
    field-sizing: content;
  }
</style>
