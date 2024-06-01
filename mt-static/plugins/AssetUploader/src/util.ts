export async function fetchAssets(params) {
  const body = new FormData();
  body.set("__mode", "dialog_list_asset");
  body.set("json", "1");

  for (let k in params) {
    body.set(k, params[k]);
  }

  const res = await fetch(window.CMSScriptURI, {
    method: "POST",
    credentials: "include",
    body
  });
  const data = await res.json();
  const div = document.createElement("div");
  div.innerHTML = `<table>${data.html}</table>`;
  return [...div.querySelectorAll<HTMLInputElement>(`input[type="hidden"]`)].map((input) =>
    JSON.parse(input.value)
  );
}
