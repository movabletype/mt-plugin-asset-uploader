import { mount, unmount } from "svelte";
import AutoRenameNonAscii from "./AutoRenameNonAscii.svelte";
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
window.MT.UI.Component.add("asset-upload-options-common").then(({ resolve }) => {
  resolve("mt-asset-uploader-auto-rename-non-ascii");
});
