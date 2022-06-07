<script>
  import Dropdown from "./Dropdown.svelte"
  import ContactModal from "./ContactModal.svelte"

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
      <a href="#/options">
        <img src="/icons/gear.svg" alt="" />
        Settings</a
      >
      <a href="https://docs.vala.ai/"> <img src="/icons/questionmark.svg" alt="" />FAQ</a>
      <button on:click={openContact}> <img src="/icons/speechbubble.svg" alt="" />Contact</button>
      <a href="#/logout"> <img src="/icons/logout.svg" alt="" />Logout</a>

      {#if !isOracle}
        <div />
        <a href="#/oracle" class="oracle">Become an Oracle</a>
      {/if}
    </div>
  </Dropdown>
</div>

<ContactModal bind:show={showContact} />

<style>
  .dropdown-menu {
    /* position: relative; */
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
