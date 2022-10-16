<script>
  import { seed } from "../store/wallet"

  import Dropdown from "./Dropdown.svelte"
  import ContactModal from "./ContactModal.svelte"
  import Rss from "../icons/Rss.svelte"
  import Login from "../icons/Login.svelte"

  export let isOracle

  let showMenu = false
  let showContact = false

  function openContact() {
    showMenu = false
    showContact = true
  }
</script>

<div class="dropdown-menu">
  <img src="/icons/menu.svg" alt="" on:click={() => (showMenu = true)} style={showMenu ? "opacity: 100%;" : ""} />

  <Dropdown bind:show={showMenu} position="">
    <div class="menu">
      {#if !$seed}
        <a
          href="#/login"
          on:click={() => {
            showMenu = false
          }}
        >
          <Login />
          Log in</a
        >
      {/if}

      {#if $seed}
        <a
          href="#/options"
          on:click={() => {
            showMenu = false
          }}
        >
          <img src="/icons/gear.svg" alt="" />
          Settings</a
        >
      {/if}

      <a href="https://blog.vala.ai/"> <Rss />Blog</a>
      <a href="https://docs.vala.ai/"> <img src="/icons/questionmark.svg" alt="" />FAQ</a>
      <button on:click={openContact}> <img src="/icons/speechbubble.svg" alt="" />Contact</button>

      {#if $seed}
        <a
          href="#/logout"
          on:click={() => {
            showMenu = false
          }}
        >
          <img src="/icons/logout.svg" alt="" />Logout</a
        >
      {/if}

      {#if isOracle}
        <div />
        <a
          href="#/create"
          class="oracle"
          on:click={() => {
            showMenu = false
          }}>Create a new Market</a
        >
      {:else}
        <div />
        <a
          href="#/oracle"
          class="oracle"
          on:click={() => {
            showMenu = false
          }}>Become an Oracle</a
        >
      {/if}
    </div>
  </Dropdown>
</div>

<ContactModal bind:show={showContact} />

<style>
  .dropdown-menu {
    /* position: relative; */
  }

  .menu :global(svg) {
    width: 1rem;
  }

  img {
    height: 1rem;
    cursor: pointer;
    opacity: 50%;
    transition: all 0.2s ease-in;
  }

  img:hover {
    opacity: 100%;
  }

  a,
  button {
    display: flex;
    align-items: center;
    gap: 0.6875rem;
  }

  .menu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1.6875rem;
    border-radius: 0.375rem;
    /* background: rgba(50, 56, 65, 0.6); */
    background: rgba(50, 56, 65, 1);
    box-shadow: 0px 0.25rem 1.5rem rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(1.5rem); /* FIXME: Can't be properly animated/faded yet */
    color: #ffffff80;
    gap: 1rem;
    min-width: 11.5rem;
    position: absolute;
    right: -2rem;
    top: 2rem;
  }

  .oracle {
    color: #dca52a;
    white-space: nowrap;
  }
</style>
