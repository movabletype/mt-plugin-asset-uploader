import { mount, unmount } from "svelte";
import Destination from "./Destination.svelte";
customElements.define(
  "mt-asset-uploader-upload-destination",
  class extends HTMLElement {
    mount: ReturnType<typeof mount> | undefined;
    connectedCallback() {
      this.style.order = "100";
      this.addEventListener("mt-component-init", () => {
        this.mount = mount(Destination, {
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
window.MT.UI.Component.add("asset-upload-options-destination").then(({ resolve }) => {
  resolve("mt-asset-uploader-upload-destination");
});
