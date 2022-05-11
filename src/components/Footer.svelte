<script>
  import Logo from "../components/Logo.svelte"
  import Twetch from "../icons/Twetch.svelte"
  import Twitter from "../icons/Twitter.svelte"
  import Github from "../icons/Github.svelte"
</script>

<footer>
  <div class="logo">
    <Logo greyscale={true} />
  </div>
  <div class="media_icons">
    <a href="https://github.com/valapm"><Github /></a>
    <a href="https://twitter.com/valamarkets"><Twitter /></a>
    <a href="https://twetch.com/u/43"><Twetch /></a>
  </div>
</footer>

<style>
  footer {
    height: 10rem;
    padding: 3.125rem 12.5rem;
    background-color: #1f2329;
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 10rem;
    align-items: center;
  }

  .logo :global(svg):first-child {
    height: 1.8rem !important;
  }

  .logo :global(svg):nth-child(2) {
    height: 1.2rem !important;
  }

  .media_icons {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .media_icons :global(svg) {
    height: 1.5rem;
  }
</style>
