<script>
  import { onMount } from "svelte"

  export let value
  export let editable = true

  let textarea

  function resizeTextArea() {
    textarea.style.height = ""
    textarea.style.height = Math.min(textarea.scrollHeight, 350) + "px"
  }

  onMount(resizeTextArea)
</script>

<textarea
  class="details"
  bind:this={textarea}
  bind:value
  placeholder="Description"
  disabled={!editable}
  on:input={resizeTextArea}
/>

<style>
  textarea {
    background-color: #ffffff00;
    width: 100%;
    resize: none;
  }
</style>
