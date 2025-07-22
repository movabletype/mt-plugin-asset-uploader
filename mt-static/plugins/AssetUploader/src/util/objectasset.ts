import type { InsertMethod } from "../context";

declare global {
  interface Window {
    removeAssetFromList: (id: string) => void;
  }
}

export const addToObjectAsset = (data: Parameters<InsertMethod>[0]) => {
  const includeAssetIds = document.querySelector<HTMLInputElement>("#include_asset_ids");
  const assetList = document.querySelector<HTMLUListElement>("#asset-list");
  if (!assetList || !includeAssetIds) {
    return;
  }

  document.querySelector("#empty-asset-list")?.remove();

  data.forEach(({ asset }) => {
    const id = `list-asset-${asset.id}`;
    if (document.querySelector(`#${id}`)) {
      return;
    }

    includeAssetIds.value = includeAssetIds.value
      .split(",")
      .filter(Boolean) // Remove empty values
      .concat(asset.id)
      .join(",");

    const li = document.createElement("li");
    li.id = id;
    li.className = `asset-type-${asset.class}`;

    const a = document.createElement("a");
    a.href =
      window.CMSScriptURI + `?__mode=view&_type=asset&blog_id=${asset.blog_id}&id=${asset.id}`;
    a.className = "asset-title";
    a.textContent = asset.file_name;

    const col = document.createElement("div");
    col.className = "col text-truncate";
    col.appendChild(a);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "close";
    removeButton.setAttribute("aria-label", "Close");
    removeButton.onclick = () => {
      window.removeAssetFromList(asset.id);
    };
    removeButton.innerHTML = '<span aria-hidden="true">&times;</span>';

    const removeButtonCol = document.createElement("div");
    removeButtonCol.className = "col-1";
    removeButtonCol.appendChild(removeButton);

    const row = document.createElement("div");
    row.className = "row";
    row.appendChild(col);
    row.appendChild(removeButtonCol);
    li.appendChild(row);

    if (asset.class === "image") {
      const img = document.createElement("img");
      img.src = asset.thumbnail_url;
      img.className = "list-image";
      img.style.display = "none";
      img.style.width = "110px";
      img.id = `list-image-${asset.id}`;

      li.addEventListener("mouseover", () => {
        img.style.display = "block";
      });
      li.addEventListener("mouseout", () => {
        img.style.display = "none";
      });
      li.appendChild(img);
    }

    assetList.appendChild(li);
  });
};
