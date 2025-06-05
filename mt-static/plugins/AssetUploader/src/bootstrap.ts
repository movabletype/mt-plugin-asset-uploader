if (!/^(edit-author)$/.test(document.documentElement.dataset.screenId || "")) {
  import("./main");
}

export {};
