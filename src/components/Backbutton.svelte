<script>
  export let to
</script>

<nav>
  <div>
    <a href={to}><img src="./icons/arrow-circle-left.svg" alt="back" /></a>
  </div>
</nav>

<style>
  nav {
    width: 100%;
    height: 1.6rem;
    display: flex;
    justify-content: center;
    margin: 1rem 0rem;
  }

  nav > div {
    width: min(90%, 50rem);
    display: flex;
    justify-content: start;
  }

  img {
    height: 1.6rem;
  }
</style>
