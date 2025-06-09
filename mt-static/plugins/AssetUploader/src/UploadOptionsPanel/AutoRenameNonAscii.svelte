<script lang="ts">
  import { uploadOptions } from "../uploadOptionsStore";
</script>

<div id="auto_rename_non_ascii-field" class="app-setting field field-content field-left-label">
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label class="form-label">{window.trans("Rename filename")}</label>

  <div class="mb-3">
    <div class="form-check">
      <input
        type="checkbox"
        id="auto_rename_non_ascii"
        class="cb form-check-input"
        bind:checked={$uploadOptions.autoRenameNonAscii}
      />
      <label class="form-check-label" for="auto_rename_non_ascii"
        >{window.trans("Rename non-ascii filename automatically")}</label
      >
    </div>
  </div>
</div>
