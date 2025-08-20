<script lang="ts">
  import { ModalContent, Pager } from "@movabletype/svelte-components";
  import type { Asset } from "@movabletype/app/object";
  import UploadOptionsPanel from "./UploadOptionsPanel.svelte";
  import { getAssetModalContext } from "./context";
  import AssetDataStore from "./assetDataStore";
  import type { Options, UploadOptions, AssetData } from "./assetDataStore";
  import alignLeftIcon from "../assets/ic_alignleft.svg?raw";
  import alignCenterIcon from "../assets/ic_aligncenter.svg?raw";
  import alignRightIcon from "../assets/ic_alignright.svg?raw";
  import alignNoneIcon from "../assets/ic_alignnone.svg?raw";
  import { uploadOptions } from "./uploadOptionsStore";

  let {
    assetDataStore,
    options,
    allowUpload,
    allowEdit,
    uploadOptions: initialUploadOptions,
    selectMetaData,
    statusMessage
  }: {
    assetDataStore: AssetDataStore;
    options: Options;
    allowUpload: boolean;
    allowEdit: boolean;
    uploadOptions: UploadOptions;
    selectMetaData: boolean;
    statusMessage: string;
  } = $props();

  uploadOptions.set(initialUploadOptions);

  let objects = assetDataStore.objects;
  let selectedObjects = assetDataStore.selectedObjects;
  let pagerData = assetDataStore.pagerData;
  let isDragging = $state(false);
  let isInserting = $state(false);

  let searchText = $state("");
  function search() {
    assetDataStore.search(searchText);
  }

  // eslint-disable-next-line svelte/no-unused-svelte-ignore
  // svelte-ignore non_reactive_update FIXME:
  let close: (() => void) | undefined;

  let showUploadOptionsView = $state(false);
  let editingAsset = $state<{
    asset: Asset;
    label: string;
    description: string;
    tags: string;
  }>();
  // reset editingAsset when selectedObjects changes
  $effect(() => {
    if ($selectedObjects) {
      editingAsset = undefined;
    }
  });

  const { insert } = getAssetModalContext();
  async function insertThenClose() {
    isInserting = true;

    const insertData = await Promise.all(
      $selectedObjects.map(async (data) => ({
        asset: await AssetDataStore.getProcessedAsset(data),
        insertOptions: data
      }))
    );
    if (insertData.some((data) => data.asset === undefined)) {
      isInserting = false;
      return;
    }

    await insert(insertData as { asset: Asset; insertOptions: AssetData }[]);

    close?.();
  }

  let fileInput = $state<HTMLInputElement>();
  const onFileInputChange = async () => {
    assetDataStore.upload(fileInput?.files, $uploadOptions);
  };
  $effect(() => {
    if (!fileInput) {
      return;
    }
    const fi = fileInput;
    fi.addEventListener("change", onFileInputChange);
    return () => {
      fi.removeEventListener("change", onFileInputChange);
    };
  });

  let draggingContainer = $state<HTMLDivElement>();
  $effect(() => {
    if (draggingContainer) {
      draggingContainer.style.setProperty(
        "--mt-asset-uploader-dragging-text",
        `"${window.trans("Drop files here")}"`
      );
    }
  });

  function dropHandler(ev: DragEvent) {
    ev.preventDefault();
    if (!allowUpload) {
      return;
    }
    isDragging = false;
    assetDataStore.upload(ev.dataTransfer?.files, $uploadOptions);
  }

  function dragEnterHandler() {
    if (!allowUpload) {
      return;
    }
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

  function updateAlign(assetId: string, align: AssetData["align"]) {
    return () => {
      const asset = $selectedObjects.find((asset) => asset.id === assetId);
      if (asset) {
        asset.align = align;
      }
      $selectedObjects = $selectedObjects;
    };
  }
</script>

{#if !showUploadOptionsView}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <ModalContent bind:close>
    <svelte:fragment slot="title">{window.trans("Insert Image Asset")}</svelte:fragment>
    <svelte:fragment slot="body">
      {#if statusMessage}
        <div>{@html statusMessage}</div>
      {/if}
      <div
        class="position-relative"
        class:mt-asset-uploader-dragging={isDragging}
        ondragover={(ev) => ev.preventDefault()}
        ondragenter={dragEnterHandler}
        ondrop={dropHandler}
        bind:this={draggingContainer}
      >
        <div class="row">
          <div class="col">
            <div class="row gap-3 gap-md-0 g-5">
              {#if allowUpload}
                <div class="col-auto">
                  <input
                    bind:this={fileInput}
                    type="file"
                    multiple
                    class="d-none"
                    accept="image/*"
                  />
                  <button type="button" class="btn btn-default" onclick={() => fileInput?.click()}
                    >{window.trans("Upload")}</button
                  >
                </div>
              {/if}
              <div class="col-auto">
                <div class="row g-4">
                  <div class="col">
                    <input
                      bind:value={searchText}
                      type="search"
                      class="form-control text"
                      onkeydown={(e) => {
                        if (e.keyCode === 13) {
                          search();
                        }
                      }}
                    />
                  </div>
                  <div class="col-auto">
                    <button type="button" class="btn btn-primary" onclick={search}
                      >{window.trans("Search")}</button
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          {#if allowUpload}
            <div class="col-auto text-right">
              <button
                type="button"
                class="btn btn-default"
                onclick={() => {
                  showUploadOptionsView = true;
                }}>{window.trans("Options")}</button
              >
            </div>
          {/if}
        </div>
        <div class="row p-3 justify-content-center">
          <div class="col-12 col-md row">
            <div class="col-12">
              <div class="row d-flex flex-wrap">
                {#each $objects as asset ((asset.selected, asset.id))}
                  <a
                    class="p-2 col-3 mt-asset-uploader-asset"
                    onclick={(ev) => {
                      ev.preventDefault();
                      assetDataStore.select(asset);
                    }}
                    aria-label={asset.asset.label}
                    href={asset.asset.url}
                  >
                    <img
                      src={asset.asset.thumbnail_url}
                      class:selected={asset.selected}
                      alt={asset.asset.label}
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
            {#if editingAsset}
              <div class="mt-asset-uploader-insert-options-item">
                <div class="row g-4">
                  <div class="col-auto col-md-5">
                    <img
                      src={editingAsset.asset.url}
                      class="mw-100 mt-asset-uploader-insert-options-item-preview"
                      alt={editingAsset.asset.label}
                    />
                  </div>
                  <div class="col-auto col-md-7">
                    <div>
                      {editingAsset.label}
                    </div>
                    <div>
                      {editingAsset.asset.width} x {editingAsset.asset.height}
                    </div>
                    <div>
                      <button type="button" class="btn btn-link fw-normal p-0" disabled
                        >{window.trans("Edit information")}</button
                      >
                    </div>
                  </div>
                  <div class="field field-content field-top-label mt-4">
                    <label class="form-label" for="asset-uploader-label"
                      >{window.trans("Label")}</label
                    >
                    <input
                      id="asset-uploader-label"
                      type="text"
                      class="form-control text full"
                      bind:value={editingAsset.label}
                    />
                  </div>
                  <div class="field field-content field-top-label mt-4">
                    <label class="form-label" for="asset-uploader-description"
                      >{window.trans("Description")}</label
                    >
                    <textarea
                      id="asset-uploader-description"
                      class="form-control text full"
                      rows="2"
                      bind:value={editingAsset.description}
                    ></textarea>
                  </div>
                  <div class="field field-content field-top-label mt-4">
                    <label class="form-label" for="asset-uploader-tags"
                      >{window.trans("Tags")}</label
                    >
                    <input
                      id="asset-uploader-tags"
                      type="text"
                      class="form-control text full"
                      bind:value={editingAsset.tags}
                    />
                  </div>
                  <div class="field field-content field-top-label mt-4 text-end">
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      disabled={!editingAsset.label}
                      onclick={() => {
                        Object.assign(editingAsset!.asset, {
                          label: editingAsset!.label,
                          description: editingAsset!.description,
                          tags: editingAsset!.tags
                        });
                        editingAsset!.asset.save();
                        editingAsset = undefined;
                      }}>{window.trans("Finish")}</button
                    >
                  </div>
                </div>
              </div>
            {:else}
              {#each $selectedObjects as asset (asset.id)}
                <div class="mt-asset-uploader-insert-options-item">
                  <div class="row g-4">
                    <div class="col-auto col-md-5">
                      <img
                        src={asset.asset.url}
                        class="mw-100 mt-asset-uploader-insert-options-item-preview"
                        alt={asset.asset.label}
                      />
                    </div>
                    <div class="col-auto col-md-7">
                      <div>
                        {asset.asset.label}
                      </div>
                      <div>
                        {asset.asset.width} x {asset.asset.height}
                      </div>
                      {#if allowEdit}
                        <div>
                          <button
                            type="button"
                            class="btn btn-link fw-normal p-0"
                            onclick={() => {
                              editingAsset = {
                                asset: asset.asset,
                                label: asset.asset.label,
                                description: asset.asset.description,
                                tags: asset.asset.tags
                              };
                            }}>{window.trans("Edit information")}</button
                          >
                        </div>
                      {/if}
                    </div>
                  </div>
                  {#if selectMetaData}
                    <div class="field field-content field-top-label mt-4">
                      <label class="form-label" for={`asset-uploader-alternative-text-${asset.id}`}
                        >{window.trans("Alternative text")}</label
                      >
                      <input
                        id={`asset-uploader-alternative-text-${asset.id}`}
                        type="text"
                        class="form-control text full"
                        bind:value={asset.alternativeText}
                      />
                    </div>
                    <div class="field field-content field-top-label mt-4">
                      <label class="form-label" for={`asset-uploader-caption-${asset.id}`}
                        >{window.trans("Caption")}</label
                      >
                      <textarea
                        id={`asset-uploader-caption-${asset.id}`}
                        class="form-control text full"
                        rows="1"
                        bind:value={asset.caption}
                      ></textarea>
                    </div>
                    <div class="field field-content field-top-label mt-4">
                      <label class="form-label" for={`asset-uploader-width-${asset.id}`}
                        >{window.trans("Width")}</label
                      >
                      <div class="input-group">
                        <input
                          type="number"
                          id={`asset-uploader-width-${asset.id}`}
                          class="form-control"
                          bind:value={asset.width}
                        />
                        <span class="input-group-text">{window.trans("pixels")}</span>
                      </div>
                    </div>
                    <div class="field field-content field-top-label mt-4">
                      <div class="form-check">
                        <input
                          type="checkbox"
                          id={`asset-uploader-link-to-original-${asset.id}`}
                          class="form-check-input"
                          bind:checked={asset.linkToOriginal}
                        />
                        <label
                          class="form-check-label"
                          for={`asset-uploader-link-to-original-${asset.id}`}
                          >{window.trans("Link to original image")}</label
                        >
                      </div>
                    </div>
                    <div class="field field-content field-top-label mt-4">
                      <label class="form-label" for={`asset-uploader-align-${asset.id}`}
                        >{window.trans("Align")}</label
                      >
                      <div>
                        <div
                          class="btn-group align-button-group"
                          class:w-100={options.imageSupportedAligns?.length === 4}
                        >
                          {#if options.imageSupportedAligns?.includes("left")}
                            <button
                              type="button"
                              class="btn btn-default"
                              class:active-align={asset.align === "left"}
                              onclick={updateAlign(asset.id, "left")}
                              aria-label={window.trans("Align left")}
                            >
                              {@html alignLeftIcon}
                            </button>
                          {/if}
                          {#if options.imageSupportedAligns?.includes("center")}
                            <button
                              type="button"
                              class="btn btn-default"
                              class:active-align={asset.align === "center"}
                              onclick={updateAlign(asset.id, "center")}
                              aria-label={window.trans("Align center")}
                            >
                              {@html alignCenterIcon}
                            </button>
                          {/if}
                          {#if options.imageSupportedAligns?.includes("right")}
                            <button
                              type="button"
                              class="btn btn-default"
                              class:active-align={asset.align === "right"}
                              onclick={updateAlign(asset.id, "right")}
                              aria-label={window.trans("Align right")}
                            >
                              {@html alignRightIcon}
                            </button>
                          {/if}
                          {#if options.imageSupportedAligns?.includes("none")}
                            <button
                              type="button"
                              class="btn btn-default"
                              class:active-align={asset.align === "none"}
                              onclick={updateAlign(asset.id, "none")}
                              aria-label={window.trans("Align none")}
                            >
                              {@html alignNoneIcon}
                            </button>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={window.trans("Insert (s)")}
        class="action primary button btn btn-primary"
        disabled={$selectedObjects.length === 0 || isInserting}
        onclick={insertThenClose}
      >
        {window.trans("Insert")}
      </button>
      <button
        type="button"
        title={window.trans("Cancel (x)")}
        class="cancel action button mt-close-dialog btn btn-default"
        onclick={close}
      >
        {window.trans("Cancel")}
      </button>
    </svelte:fragment>
  </ModalContent>
{:else}
  <UploadOptionsPanel bind:showUploadOptionsView />
{/if}

<style>
  .mt-asset-uploader-dragging:after {
    content: var(--mt-asset-uploader-dragging-text);
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
    width: 25%;
    aspect-ratio: 1/1;
  }
  .mt-asset-uploader-asset img {
    outline-offset: -3px;
    object-fit: cover;
    object-position: center center;
    width: 100%;
    height: 100%;
    background: url(data:image/gif;base64,R0lGODlhEAAQAPEBAAAAAL+/v////wAAACH5BAAAAAAALAAAAAAQABAAAAIfjG+iq4jM3IFLJipswNly/XkcBpIiVaInlLJr9FZWAQA7);
  }
  .mt-asset-uploader-asset img.selected {
    outline: 3px solid #0176bf;
  }
  .mt-asset-uploader-insert-options {
    width: 245px;
    height: 460px;
    overflow-y: auto;
  }
  @media (max-width: 800px) {
    .mt-asset-uploader-insert-options {
      width: 29%;
    }
  }
  @media (max-width: 767.98px) {
    .mt-asset-uploader-insert-options {
      height: auto;
      width: 100%;
    }
  }
  .mt-asset-uploader-insert-options-item {
    margin-bottom: 10px;
  }
  .mt-asset-uploader-insert-options-item:last-child {
    margin-bottom: 0;
  }
  .mt-asset-uploader-insert-options-item-preview {
    max-height: 100px;
    background: url(data:image/gif;base64,R0lGODlhEAAQAPEBAAAAAL+/v////wAAACH5BAAAAAAALAAAAAAQABAAAAIfjG+iq4jM3IFLJipswNly/XkcBpIiVaInlLJr9FZWAQA7);
  }
  .align-button-group .active-align {
    background-color: #e9ecef;
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  }
  .align-button-group :global(svg) {
    width: 100%;
    height: 100%;
    max-width: 32px;
    max-height: 32px;
  }

  input[type="search"] {
    width: 10rem;
  }
  @media (max-width: 767.98px) {
    input[type="search"] {
      width: 5rem;
    }
  }
  textarea {
    field-sizing: content;
  }
</style>
