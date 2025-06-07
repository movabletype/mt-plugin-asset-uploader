<script lang="ts">
  import { uploadOptions } from "../uploadOptionsStore";
</script>

<div id="operation_if_exists-field" class="app-setting field field-content field-left-label">
  <label for="operation_if_exists" class="form-label"
    >{window.trans("Operation for a file exists")}</label
  >

  <select
    id="operation_if_exists"
    class="custom-select form-control text-truncate form-select"
    value={String($uploadOptions.operationIfExists)}
    onchange={(e) => {
      $uploadOptions.operationIfExists = parseInt((e.target as HTMLSelectElement).value);
    }}
  >
    <option value="1">{window.trans("Upload and rename")}</option>
    <option value="2">{window.trans("Overwrite existing file")}</option>
    <option value="3">{window.trans("Cancel upload")}</option>
  </select>
</div>
