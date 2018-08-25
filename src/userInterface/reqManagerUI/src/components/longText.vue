<template>
  <div class="longText">
    <code v-loading='!text' v-html="prettyText"></code>
  </div>
</template>

<script>
export default {
  props:['text'],
  name: 'longText',
  computed: {
    prettyText() {
      try{
        const t = JSON.parse(this.text);
        return JSON.stringify(t, null, 2);
      } catch (e) {
        return this.text;
      }
    }
  },
  created () {},
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  code{
    display: block;
    max-height: 125px;
    line-height: 14px;
    font-size: 11px;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 125px;
    white-space: pre;
    max-width: 250px;
    text-align: left;
    margin: auto;
  }
  .el-loading-mask {
    background: none;
  }
</style>
