<script>
  import { BoostPowJobModel } from "../utils/boostPow"

  async function boost() {
    const model = BoostPowJobModel.fromObject({
      content: Buffer.from("hello world", "utf8").toString("hex"),
      diff: 1,
      category: Buffer.from("B", "utf8").toString("hex"),
      additionalData: Buffer.from(`{ "foo": 1234 }`, "utf8").toString("hex"),
      userNonce: Buffer.from("1234", "utf8").toString("hex"),
      tag: Buffer.from("funny-animals", "utf8").toString("hex")
    })

    console.log(model.toASM())
  }
</script>

<button on:click={boost}> Add PoW Reputation </button>
