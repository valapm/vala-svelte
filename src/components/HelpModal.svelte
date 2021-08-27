<script>
  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon/icon.js"
  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog"

  export let label = ""
  export let content

  let modal
</script>

<sl-dialog bind:this={modal} {label}>
  <svelte:component this={content} />
</sl-dialog>

<sl-icon-button name="question-circle-fill" label="Oracles" on:click={() => modal.show()} />

<style>
  sl-icon-button::part(base) {
    color: var(--sl-color-gray-400);
  }

  sl-icon-button::part(base):hover,
  sl-icon-button::part(base):focus,
  sl-icon-button::part(base):active {
    color: var(--sl-color-gray-500);
  }
</style>
