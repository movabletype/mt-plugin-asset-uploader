import { fetchAssets } from "./util";

describe("fetchAssets", () => {
  it("should fetch assets", async () => {
    window.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        assets: [],
      }),
    });

    const assets = await fetchAssets({});
    expect(assets).toEqual([]);
  });
});
