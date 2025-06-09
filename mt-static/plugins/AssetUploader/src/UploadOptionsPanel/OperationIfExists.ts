import { mount, unmount } from "svelte";
import OperationIfExists from "./OperationIfExists.svelte";
customElements.define(
  "mt-asset-uploader-operation-if-exists",
  class extends HTMLElement {
    mount: ReturnType<typeof mount> | undefined;
    connectedCallback() {
      this.style.order = "200";
      this.addEventListener("mt-component-init", () => {
        this.mount = mount(OperationIfExists, {
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
window.MT.UI.Component.add("asset-upload-options-common", "mt-asset-uploader-operation-if-exists");
