<script>
  export let num = 0

  // window.CSS.registerProperty({
  //   name: "--num",
  //   syntax: "<integer>",
  //   initialValue: 0,
  //   inherits: false
  // })
</script>

<div style="--num: {num}" class={$$props.class} />

<style>
  /* @property --num {
    syntax: "<integer>";
    initial-value: 0;
    inherits: false;
  }

  div {
    transition: --num 1s;
    counter-reset: num var(--num);
  }
  div::after {
    content: counter(num);
  } */

  @property --num {
    syntax: "<number>";
    initial-value: 0;
    inherits: false;
  }
  @property --v1 {
    syntax: "<integer>";
    initial-value: 0;
    inherits: false;
  }
  @property --v2 {
    syntax: "<integer>";
    initial-value: 0;
    inherits: false;
  }

  /* :global(body) {
    counter-set: v1 var(--v1) v2 var(--v2);
  } */

  div {
    transition: --num 1s;
    --v1: max(var(--num) - 0.5, 0);
    --v2: max((var(--num) - var(--v1)) * 100 - 0.5, 0);
    counter-reset: v1 var(--v1) v2 var(--v2);
  }
  div::before {
    content: counter(v1) "." counter(v2, decimal-leading-zero);
  }
</style>
