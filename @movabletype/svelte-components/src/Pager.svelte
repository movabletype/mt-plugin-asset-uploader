<script lang="ts" context="module">
  export interface PagerData {
    readonly totalPages: number;
    readonly currentPage: number;
    readonly setPage: (page: number) => void;
  }
</script>

<script lang="ts">
  export let data: PagerData | undefined;

  let totalPages: number;
  let currentPage: number;
  let pages: number[];
  $: {
    totalPages = data?.totalPages ?? 0;
    currentPage = data?.currentPage ?? 0;

    pages = [];
    let inDots = false;
    for (let i = 1; i <= totalPages; i++) {
      if (i < 3 || i > totalPages - 2 || Math.abs(i - currentPage) < 2) {
        pages.push(i);
        inDots = false;
      } else if (!inDots) {
        pages.push(0);
        inDots = true;
      }
    }
  }
</script>

{#if data && totalPages && currentPage}
  <!-- svelte-ignore a11y_invalid_attribute -->
  <div class="row">
    <div class="col-auto mx-auto">
      <nav aria-label="object list">
        <ul class="pagination d-none d-md-flex">
          <li class="page-item">
            <a
              href="#"
              class="page-link"
              class:disabled={currentPage <= 1}
              on:click|preventDefault={() => currentPage > 1 && data.setPage(currentPage - 1)}
            >
              {window.trans("Previous")}
            </a>
          </li>
          {#each pages as page}
            {#if page === 0}
              <li class="page-item" aria-hidden="true">...</li>
            {:else if page === currentPage}
              <li class="page-item active">
                <a href="#" class="page-link" on:click|preventDefault>
                  {page} <span class="visually-hidden">(current)</span>
                </a>
              </li>
            {:else}
              <li class="page-item" class:first-last={page === 1 || page === totalPages}>
                <a href="#" class="page-link" on:click|preventDefault={() => data.setPage(page)}>
                  {page}
                </a>
              </li>
            {/if}
          {/each}
          <li class="page-item">
            <a
              href="#"
              class="page-link"
              class:disabled={currentPage === totalPages}
              on:click|preventDefault={() =>
                currentPage !== totalPages && data.setPage(currentPage + 1)}
            >
              {window.trans("Next")}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
{/if}
