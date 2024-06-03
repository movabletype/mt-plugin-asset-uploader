<script lang="ts">
  import { onMount } from "svelte";
  import { ModalContent, Pager } from "@movabletype/svelte-components";
  import UploadOptions from "./UploadOptions.svelte";
  import { getAssetModalContext } from "./context";
  import type Store from "./store";

  export let store: Store;
  let objects = store.objects;
  let selectedObjects = store.selectedObjects;
  let pagerData = store.pagerData;

  let close: any;

  let showUploadOptionsView = false;
  let uploadOptions: any;
  let assets: any[] = [];

  const { insert, params } = getAssetModalContext();
  async function insertThenClose() {
    const insertHtmls = await Promise.all(
      $selectedObjects.map(({ asset, alternativeText, caption }) =>
        asset.asHtml({
          alternativeText,
          caption
        })
      )
    );
    insert(insertHtmls.join(""));

    close();
  }

  let fileInput: HTMLInputElement;
  onMount(() => {
    fileInput.addEventListener("change", async () => {
      // @ts-ignore
      const uploadAssets = (await window.MT.import("uploadAssets" as unknown)) as any;
      const promiseList: Promise<Response>[] = uploadAssets({
        files: fileInput.files,
        context: { blogId: params.get("blog_id") },
        options: uploadOptions,
        requestOptions: {
          onprogress: function (progressEvent: ProgressEvent) {
            if (progressEvent.lengthComputable) {
              console.log(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          }
        }
      });
      promiseList.forEach(async (p) => {
        const res = await p;
        const data = await res.json();
        console.log(data);
        assets = [data.result.asset, ...assets];
      });
    });
  });
</script>

{#if !showUploadOptionsView}
  <!-- svelte-ignore a11y-missing-attribute -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <ModalContent bind:close>
    <svelte:fragment slot="title">{window.trans("Insert Image Asset")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="text-right">
        <input bind:this={fileInput} type="file" multiple class="d-none" />
        <button type="button" class="btn btn-default" on:click={() => fileInput.click()}
          >アップロード</button
        >
        <button
          type="button"
          class="btn btn-default"
          on:click={() => {
            showUploadOptionsView = true;
          }}>設定</button
        >
      </div>
      <div class="row p-3">
        <div class="col row">
          <div class="col-12">
            <div class="row d-flex flex-wrap">
              {#each $objects as asset ((asset.selected, asset.id))}
                <a class="p-2 col-3 mt-asset-uploader-asset" on:click={() => store.select(asset)}>
                  <img
                    src={asset.asset.thumbnail_url}
                    class="mw-100"
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
          {#each $selectedObjects as asset}
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
                <label class="form-label">代替テキスト</label>
                <input
                  type="text"
                  class="form-control text full"
                  bind:value={asset.alternativeText}
                />
              </div>
              <div class="field field-content field-top-label mt-4">
                <label class="form-label">キャプション</label>
                <textarea class="form-control text full" rows="1" bind:value={asset.caption} />
              </div>
              <div class="field field-content field-top-label mt-4">
                <label class="form-label">横幅</label>
                <textarea class="form-control text full" rows="1" bind:value={asset.caption} />
              </div>
            </div>
          {/each}
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
  .mt-asset-uploader-asset {
    width: 133px;
    height: 133px;
  }
  .mt-asset-uploader-insert-options {
    width: 245px;
    height: 460px;
    overflow-y: auto;
  }
  img {
    outline-offset: -3px;
  }
  textarea {
    field-sizing: content;
  }
</style>
