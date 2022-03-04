if (
  /^(edit-entry|edit-content-type-data)$/.test(
    document.documentElement.dataset.screenId || ""
  )
) {
  import("./main");
}

export {};
