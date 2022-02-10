<script>
  export let oracle
</script>

<a id="oracle" href="#/oracle/{oracle.pubKey}">
  <img src="https://twetch.com/favicon.ico" alt="icon" />
  <h2>{oracle.oracleStateByCurrentstateid.domain}</h2>
</a>

<style>
  #oracle {
    width: 100%;
    background-color: #323841;
    display: flex;
    gap: 1rem;
    padding: 2rem;
    align-items: center;
    border-radius: 0.375rem;
  }

  img {
    height: 2.75rem;
  }

  h2 {
    font-size: 2.125rem;
    font-weight: 700;
  }
</style>
