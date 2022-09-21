<script>
  import Logo from "../components/Logo.svelte"
  import Twetch from "../icons/Twetch.svelte"
  import Twitter from "../icons/Twitter.svelte"
  import Github from "../icons/Github.svelte"
  import Telegram from "../icons/Telegram.svelte"
</script>

<footer>
  <div>
    <div class="logo">
      <Logo greyscale={true} />
    </div>
    <div class="media_icons">
      <a href="https://t.me/valamarkets"><Telegram /></a>
      <a href="https://github.com/valapm"><Github /></a>
      <a href="https://twitter.com/valamarkets"><Twitter /></a>
      <a href="https://twetch.com/u/43"><Twetch /></a>
    </div>
  </div>
</footer>

<style>
  footer {
    height: 10rem;
    padding: 3.125rem 0;
    background-color: #1f2329;
    width: 100%;
    margin-top: 10rem;
    display: flex;
    justify-content: center;
  }

  footer > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: min(65rem, 90%);
  }

  .logo {
    height: 1.8rem;
    overflow: hidden;
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
