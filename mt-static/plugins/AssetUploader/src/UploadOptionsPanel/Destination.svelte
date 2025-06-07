<script lang="ts">
  import { uploadOptions } from "../uploadOptionsStore";

  const now = new Date();
  const zeroPad = (value: number) => value.toString().padStart(2, "0");

  const options = [
    {
      value: "%s",
      label: `<${window.trans("Site Root")}>`
    },
    {
      value: "%s/%u",
      label: `<${window.trans("Site Root")}>/${$uploadOptions.userBasename}`
    },
    {
      value: "%s/%y",
      label: `<${window.trans("Site Root")}>/${now.getFullYear()}`
    },
    {
      value: "%s/%y/%m",
      label: `<${window.trans("Site Root")}>/${now.getFullYear()}/${zeroPad(now.getMonth() + 1)}`
    },
    {
      value: "%s/%y/%m/%d",
      label: `<${window.trans("Site Root")}>/${now.getFullYear()}/${zeroPad(now.getMonth() + 1)}/${zeroPad(now.getDate())}`
    },
    {
      value: "%a",
      label: `<${window.trans("Archive Root")}>`
    },
    {
      value: "%a/%u",
      label: `<${window.trans("Archive Root")}>/${$uploadOptions.userBasename}`
    },
    {
      value: "%a/%y",
      label: `<${window.trans("Archive Root")}>/${now.getFullYear()}`
    },
    {
      value: "%a/%y/%m",
      label: `<${window.trans("Archive Root")}>/${now.getFullYear()}/${zeroPad(now.getMonth() + 1)}`
    },
    {
      value: "%a/%y/%m/%d",
      label: `<${window.trans("Archive Root")}>/${now.getFullYear()}/${zeroPad(now.getMonth() + 1)}/${zeroPad(now.getDate())}`
    },
    {
      value: "",
      label: window.trans("Custom...")
    }
  ];
  let useCustomDestination = $state(
    $uploadOptions.destination === "" || options.every((option) => option.value !== $uploadOptions.destination)
  );
</script>

<div class="app-setting field field-content field-top-label form-inline">
  <div class="row w-100">
    {#if useCustomDestination}
      <div class="col">
        <input type="text" class="form-control w-100" bind:value={$uploadOptions.destination} />
      </div>
    {:else}
      <div class="col-12 col-md-6 pe-0">
        <select
          class="custom-select form-control w-100 form-select"
          aria-describedby="uploadDestination"
          value={$uploadOptions.destination}
          onchange={(e) => {
            const value = (e.target as HTMLSelectElement).value;
            if (value === "") {
              useCustomDestination = true;
              if ($uploadOptions.extraPath) {
                $uploadOptions.destination += $uploadOptions.dirSeparator + $uploadOptions.extraPath;
                $uploadOptions.extraPath = "";
              }
            } else {
              $uploadOptions.destination = value;
            }
          }}
        >
          {#each options as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      <div class="col-12 col-md-6">
        <div class="upload-extra-path row">
          <div class="col-auto h5 mt-auto mb-auto">/</div>
          <div class="col w-100 ms-0 ps-0">
            <input
              type="text"
              class="form-control text path w-100 ms-0"
              bind:value={$uploadOptions.extraPath}
              disabled={$uploadOptions.extraPath === undefined}
            />
          </div>
        </div>
      </div>
    {/if}
  </div>
  <small class="form-text text-body-secondary mt-3">{window.trans("_USAGE_UPLOAD")}</small>
</div>
