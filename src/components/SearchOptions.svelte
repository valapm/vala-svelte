<script>
  import Dropdown from "./Dropdown.svelte"

  export let sortOptions
  export let filterOptions

  export let filter = 0
  export let sort = 0
  export let direction = "desc"

  let showFilter = false
  let showSort = false

  let directionButton
</script>

<div class="main">
  <div class="left">
    <div>
      <button class="selected" on:click={() => (showFilter = true)}>{filterOptions[filter]}</button>
      <Dropdown bind:show={showFilter}>
        <div id="filter_select">
          {#each filterOptions as option, index}
            <button
              class={index === filter ? "selected" : ""}
              on:click={() => {
                filter = index
                showFilter = false
              }}>{option}</button
            >
          {/each}
        </div>
      </Dropdown>
    </div>
    <span>by</span>
    <div>
      <button class="selected" on:click={() => (showSort = true)}>{sortOptions[sort]}</button>
      <Dropdown bind:show={showSort}>
        <div id="sort_select">
          {#each sortOptions as option, index}
            <button
              class={index === sort ? "selected" : ""}
              on:click={() => {
                sort = index
                showSort = false
              }}>{option}</button
            >
          {/each}
        </div>
      </Dropdown>
    </div>
  </div>
  <div>
    <button
      class="selected direction"
      bind:this={directionButton}
      on:click={() => {
        direction = direction === "desc" ? "asc" : "desc"
        directionButton.style.transition = "none"
        directionButton.style.color = "white"
        setTimeout(() => {
          directionButton.style.transition = "color 0.3s linear"
          directionButton.style.color = "#01a781"
        }, 200)
      }}>{direction}</button
    >
  </div>
</div>

<style>
  .main {
    display: flex;
    align-items: center;
    background-color: transparent;
    padding: 0 0.1875rem;
    justify-content: space-between;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 0.8125rem;
  }

  .left > div,
  .main > div {
    position: relative;
  }

  span {
    opacity: 50%;
  }

  #sort_select,
  #filter_select,
  #direction_select {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #323841;
    display: flex;
    flex-direction: column;
    border-radius: 0.375rem;
    padding: 0.5625rem;
    gap: 0.1875rem;
    white-space: nowrap;
    z-index: 10;
    align-items: flex-start;
    font-weight: 400;
    color: white;
  }

  #sort_select button,
  #filter_select button {
    opacity: 50%;
  }

  .selected {
    color: #01a781;
    font-weight: 700;
    opacity: 100% !important;
  }

  #sort_select,
  #filter_select {
    transform: translate(-0.5625rem, -0.5625rem);
  }

  .direction {
    font-family: "Roboto Mono", sans-serif;
    transition: color 0.3s linear;
  }
</style>
