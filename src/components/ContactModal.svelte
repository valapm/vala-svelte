<script>
  import Twetch from "../icons/Twetch.svelte"
  import Twitter from "../icons/Twitter.svelte"
  import Github from "../icons/Github.svelte"
  import Letter from "../icons/Letter.svelte"
  import Modal from "./Modal.svelte"

  export let show
</script>

<Modal bind:open={show}>
  <div class="modal">
    <table>
      <tbody>
        <tr>
          <td><Letter /></td>
          <td><a href="mailto:info@vala.ai">info@vala.ai</a></td>
        </tr>
        <tr>
          <td><Github /></td>
          <td><a href="https://github.com/valapm">valapm</a></td>
        </tr>
        <tr>
          <td><Twitter /></td>
          <td><a href="https://twitter.com/valamarkets">@valamarkets</a></td>
        </tr>
        <tr>
          <td><Twetch /></td>
          <td><a href="https://twetch.com/u/43">u/43</a></td>
        </tr>
      </tbody>
    </table>
  </div></Modal
>

<style>
  .modal {
    padding: 2.375rem;
    color: #ffffff;
    max-width: 100%;
  }

  .modal :global(svg) {
    height: 1.5rem;
    width: auto;
  }

  table {
    border-collapse: separate;
    border-spacing: 2rem 1rem;
  }

  tr:first-of-type :global(svg) {
    height: 1.1rem;
  }

  td:first-of-type {
    display: flex;
    justify-content: flex-end;
  }

  td {
    font-weight: 500;
  }
</style>
