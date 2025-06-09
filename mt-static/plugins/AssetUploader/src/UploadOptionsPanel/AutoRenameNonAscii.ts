import { mount, unmount } from "svelte";
import AutoRenameNonAscii from "./AutoRenameNonAscii.svelte";
window.MT.UI.Component.add("asset-upload-options-common", () => {
  customElements.define(
    "mt-asset-uploader-auto-rename-non-ascii",
    class extends HTMLElement {
      mount: ReturnType<typeof mount> | undefined;
      connectedCallback() {
        this.style.order = "100";
        this.addEventListener("mt-component-init", () => {
          this.mount = mount(AutoRenameNonAscii, {
            target: this
          });
        });
      }
      disconnectedCallback() {
        if (this.mount) {
          unmount(this.mount);
        }
      }
    }
  );
  return "mt-asset-uploader-auto-rename-non-ascii";
});
