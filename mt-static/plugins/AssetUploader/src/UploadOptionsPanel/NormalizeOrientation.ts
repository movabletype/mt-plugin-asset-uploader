import { mount, unmount } from "svelte";
import NormalizeOrientation from "./NormalizeOrientation.svelte";
customElements.define(
  "mt-asset-uploader-normalize-orientation",
  class extends HTMLElement {
    mount: ReturnType<typeof mount> | undefined;
    connectedCallback() {
      this.style.order = "300";
      this.addEventListener("mt-component-init", () => {
        this.mount = mount(NormalizeOrientation, {
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
  resolve("mt-asset-uploader-normalize-orientation");
});
