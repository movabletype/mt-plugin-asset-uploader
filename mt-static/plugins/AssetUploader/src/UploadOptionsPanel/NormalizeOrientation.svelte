<script lang="ts">
  import { uploadOptions } from "../uploadOptionsStore";
</script>

<div id="normalize_orientation-field" class="app-setting field field-content field-left-label">
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label class="form-label">{window.trans("Normalize orientation")}</label>

  <div class="mb-3">
    <div class="form-check">
      <input
        type="checkbox"
        class="cb form-check-input"
        id="normalize_orientation"
        bind:checked={$uploadOptions.normalizeOrientation}
      />
      <label class="form-check-label" for="normalize_orientation"
        >{window.trans("Enable orientation normalization")}</label
      >
    </div>
  </div>
</div>
