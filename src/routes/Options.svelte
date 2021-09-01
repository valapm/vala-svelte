<script>
  import { testnet } from "../config"
  import { email } from "../store/profile"
</script>

<div class="options">
  Logged in as {$email}
</div>

<style>
  .options {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
