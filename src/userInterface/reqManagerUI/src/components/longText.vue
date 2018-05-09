<template>
  <div class="longText">
    <code v-loading='!text'>{{decodeURI(text)}}</code>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
export default {
  props:['text'],
  name: 'longText',
  computed: {},
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
  }
</style>
