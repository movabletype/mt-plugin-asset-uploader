<script lang="ts">
  import type { Asset } from "./Asset";

  import { MT } from "../../movabletype";
  import { onMount } from "svelte";
  import ModalContent from "../../movabletype/svelte/ModalContent.svelte";
  import UploadOptions from "./UploadOptions.svelte";
  import { getAssetModalContext } from "./context";
  import { fetchAssets } from "./util";

  let close;

  let showUploadOptionsView = false;
  let uploadOptions;
  let insertOptions = {};

  let selectedIndex = 0;

  const { insert, params } = getAssetModalContext();
  async function insertThenClose(): Promise<void> {
    const res = insert(assets[selectedIndex], insertOptions);
    const promise = res instanceof Promise ? res : Promise.resolve();
    await promise;
    close();
  }

  let assets: Asset[] = [];
  onMount(async () => {
    const fetchParams = {};
    ["blog_id", "_type", "filter", "filter_val"].forEach((k) => {
      fetchParams[k] = params.get(k);
    });
    assets = await fetchAssets(fetchParams);
  });

  let fileInput: HTMLInputElement;
  onMount(() => {
    fileInput.addEventListener("change", async () => {
      const uploadAssets = await MT.import("uploadAssets");
      const promiseList: Promise<Response>[] = uploadAssets({
        files: fileInput.files,
        context: { blogId: Number(params.get("blog_id")) },
        options: uploadOptions,
        requestOptions: {
          onprogress: function (progressEvent: ProgressEvent) {
            if (progressEvent.lengthComputable) {
              console.log(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );
            }
          },
        },
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
  <ModalContent bind:close>
    <svelte:fragment slot="title">Select Assets</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="text-right">
        <input bind:this={fileInput} type="file" multiple class="d-none" />
        <button
          type="button"
          class="btn btn-default"
          on:click={() => fileInput.click()}>アップロード</button
        >
        <button
          type="button"
          class="btn btn-default"
          on:click={() => {
            showUploadOptionsView = true;
          }}>設定</button
        >
      </div>
      <div class="d-flex flex-wrap">
        {#each assets as asset, i (asset.url)}
          <div
            class="m-1"
            style={selectedIndex === i ? "outline: 1px solid blue" : ""}
            on:click={() => (selectedIndex = i)}
          >
            <img src={asset.thumbnail_url || asset.thumbnail} />
          </div>
        {/each}
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title="挿入 (s)"
        class="action primary button btn btn-primary"
        on:click={insertThenClose}
      >
        挿入
      </button>
      <button
        type="button"
        class="cancel action button mt-close-dialog btn btn-default"
        on:click={close}
      >
        キャンセル
      </button>
    </svelte:fragment>
  </ModalContent>
{:else}
  <UploadOptions bind:showUploadOptionsView bind:uploadOptions />
{/if}
