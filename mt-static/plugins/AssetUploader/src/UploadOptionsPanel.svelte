<script module>
  import "./UploadOptionsPanel/Destination";
  import "./UploadOptionsPanel/AutoRenameNonAscii";
  import "./UploadOptionsPanel/OperationIfExists";
  import "./UploadOptionsPanel/NormalizeOrientation";
</script>

<script lang="ts">
  import { ModalContent } from "@movabletype/svelte-components";
  import { ComponentList } from "@movabletype/svelte-components";
  import { uploadOptions } from "./uploadOptionsStore";

  let {
    showUploadOptionsView = $bindable()
  }: {
    showUploadOptionsView: boolean;
  } = $props();

  function onUpdate(ev: CustomEvent) {
    uploadOptions.update((options) => {
      Object.assign(options, ev.detail);
      return options;
    });
  }
</script>

<ModalContent>
  <svelte:fragment slot="title">{window.trans("Options")}</svelte:fragment>
  <svelte:fragment slot="body">
    <ComponentList
      namespace="asset-upload-options.modal"
      detail={$uploadOptions}
      on:mt-component-update={onUpdate as (ev: Event) => void}
    ></ComponentList>
    {#if $uploadOptions.allowToChange}
      <div class="row" style="order: 100">
        <div class="col-10 mx-auto">
          <fieldset>
            <legend class="h3">{window.trans("Upload Destination")}</legend>
            <ComponentList
              namespace="asset-upload-options-destination.modal"
              detail={$uploadOptions}
              on:mt-component-update={onUpdate as (ev: Event) => void}
            ></ComponentList>
          </fieldset>
        </div>
      </div>
    {/if}
    <div class="row" style="order: 200">
      <div class="col-10 mx-auto">
        <fieldset class="mb-3">
          <legend class="h3">{window.trans("Upload Options")}</legend>
          <ComponentList
            namespace="asset-upload-options-common.modal"
            detail={$uploadOptions}
            on:mt-component-update={onUpdate as (ev: Event) => void}
          ></ComponentList>
        </fieldset>
      </div>
    </div>
  </svelte:fragment>
  <svelte:fragment slot="footer">
    <button type="button" class="btn btn-default" onclick={() => (showUploadOptionsView = false)}>
      {window.trans("Close")}
    </button>
  </svelte:fragment>
</ModalContent>
