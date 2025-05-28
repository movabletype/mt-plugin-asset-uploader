<script lang="ts">
  import { ModalContent } from "@movabletype/svelte-components";
  import { ComponentList } from "@movabletype/svelte-components";
  import type { UploadOptions } from "./store";

  let {
    showUploadOptionsView = $bindable(),
    uploadOptions = $bindable()
  }: {
    showUploadOptionsView: boolean;
    uploadOptions: UploadOptions;
  } = $props();

  const now = new Date();
  const zeroPad = (value: number) => value.toString().padStart(2, "0");

  const knownDestinationOptions = new Set([
    "%s",
    "%s/%u",
    "%s/%y",
    "%s/%y/%m",
    "%s/%y/%m/%d",
    "%a",
    "%a/%u",
    "%a/%y",
    "%a/%y/%m",
    "%a/%y/%m/%d"
  ]);
  let useCustomDestination = $state(!knownDestinationOptions.has(uploadOptions.destination));

  function onMessage(ev: CustomEvent) {
    Object.assign(uploadOptions, ev.detail);
  }
</script>

{#if uploadOptions || true}
  <ModalContent>
    <svelte:fragment slot="title">{window.trans("Options")}</svelte:fragment>
    <svelte:fragment slot="body">
      <ComponentList
        namespace="asset-upload-options.modal"
        detail={uploadOptions}
        on:message={onMessage as (ev: Event) => void}
      >
        <svelte:fragment slot="prepend">
          <div class="row">
            <div class="col-10 mx-auto">
              {#if uploadOptions.allowToChange}
                <fieldset>
                  <legend class="h3">{window.trans("Upload Destination")}</legend>
                  <div class="app-setting field field-content field-top-label form-inline">
                    <div class="row w-100">
                      {#if useCustomDestination}
                        <input
                          type="text"
                          class="form-control w-100"
                          bind:value={uploadOptions.destination}
                        />
                      {:else}
                        <div class="col-12 col-md-6 pe-0">
                          <select
                            class="custom-select form-control w-100 form-select"
                            aria-describedby="uploadDestination"
                            value={uploadOptions.destination}
                            onchange={(e) => {
                              const value = (e.target as HTMLSelectElement).value;
                              if (value === "") {
                                useCustomDestination = true;
                                if (uploadOptions.extraPath) {
                                  uploadOptions.destination +=
                                    uploadOptions.dirSeparator + uploadOptions.extraPath;
                                  uploadOptions.extraPath = "";
                                }
                              } else {
                                uploadOptions.destination = value;
                              }
                            }}
                          >
                            <option value="%s">&lt;{window.trans("Site Root")}&gt;</option>
                            <option value="%s/%u"
                              >&lt;{window.trans(
                                "Site Root"
                              )}&gt;/{uploadOptions.userBasename}</option
                            >
                            <option value="%s/%y"
                              >&lt;{window.trans("Site Root")}&gt;/{now.getFullYear()}</option
                            >
                            <option value="%s/%y/%m"
                              >&lt;{window.trans("Site Root")}&gt;/{now.getFullYear()}/{zeroPad(
                                now.getMonth() + 1
                              )}</option
                            >
                            <option value="%s/%y/%m/%d"
                              >&lt;{window.trans("Site Root")}&gt;/{now.getFullYear()}/{zeroPad(
                                now.getMonth() + 1
                              )}/{zeroPad(now.getDate())}</option
                            >
                            <option value="%a">&lt;{window.trans("Archive Root")}&gt;</option>
                            <option value="%a/%u"
                              >&lt;{window.trans(
                                "Archive Root"
                              )}&gt;/{uploadOptions.userBasename}</option
                            >
                            <option value="%a/%y"
                              >&lt;{window.trans("Archive Root")}&gt;/{now.getFullYear()}</option
                            >
                            <option value="%a/%y/%m"
                              >&lt;{window.trans("Archive Root")}&gt;/{now.getFullYear()}/{zeroPad(
                                now.getMonth() + 1
                              )}</option
                            >
                            <option value="%a/%y/%m/%d"
                              >&lt;{window.trans("Archive Root")}&gt;/{now.getFullYear()}/{zeroPad(
                                now.getMonth() + 1
                              )}/{zeroPad(now.getDate())}</option
                            >
                            <option value="">{window.trans("Custom...")}</option>
                          </select>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="upload-extra-path row">
                            <div class="col-auto h5 mt-auto mb-auto">/</div>
                            <div class="col w-100 ms-0 ps-0">
                              <input
                                type="text"
                                class="form-control text path w-100 ms-0"
                                bind:value={uploadOptions.extraPath}
                              />
                            </div>
                          </div>
                        </div>
                      {/if}
                    </div>
                    <small class="form-text text-body-secondary mt-3"
                      >{window.trans("_USAGE_UPLOAD")}</small
                    >
                  </div>
                </fieldset>
              {/if}

              <fieldset class="mb-3">
                <legend class="h3">{window.trans("Upload Options")}</legend>
                <div
                  id="auto_rename_non_ascii-field"
                  class="app-setting field field-content field-left-label"
                >
                  <!-- svelte-ignore a11y_label_has_associated_control -->
                  <label class="form-label">{window.trans("Rename filename")}</label>

                  <div class="mb-3">
                    <div class="form-check">
                      <input
                        type="checkbox"
                        class="cb form-check-input"
                        bind:checked={uploadOptions.autoRenameNonAscii}
                      />
                      <label class="form-check-label" for="auto_rename_non_ascii"
                        >{window.trans("Rename non-ascii filename automatically")}</label
                      >
                    </div>
                  </div>
                </div>

                <div
                  id="operation_if_exists-field"
                  class="app-setting field field-content field-left-label"
                >
                  <label for="operation_if_exists" class="form-label"
                    >{window.trans("Operation for a file exists")}</label
                  >

                  <select
                    id="operation_if_exists"
                    class="custom-select form-control text-truncate form-select"
                    value={String(uploadOptions.operationIfExists)}
                    onchange={(e) => {
                      uploadOptions.operationIfExists = parseInt(
                        (e.target as HTMLSelectElement).value
                      );
                    }}
                  >
                    <option value="1">{window.trans("Upload and rename")}</option>
                    <option value="2">{window.trans("Overwrite existing file")}</option>
                    <option value="3">{window.trans("Cancel upload")}</option>
                  </select>
                </div>

                <div
                  id="normalize_orientation-field"
                  class="app-setting field field-content field-left-label"
                >
                  <!-- svelte-ignore a11y_label_has_associated_control -->
                  <label class="form-label">{window.trans("Normalize orientation")}</label>

                  <div class="mb-3">
                    <div class="form-check">
                      <input
                        type="checkbox"
                        class="cb form-check-input"
                        bind:checked={uploadOptions.normalizeOrientation}
                      />
                      <label class="form-check-label" for="normalize_orientation"
                        >{window.trans("Enable orientation normalization")}</label
                      >
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </svelte:fragment>
      </ComponentList>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button type="button" class="btn btn-default" onclick={() => (showUploadOptionsView = false)}>
        {window.trans("Close")}
      </button>
    </svelte:fragment>
  </ModalContent>
{/if}
