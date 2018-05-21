<template>
  <div class="targetSelector">
    <el-select v-model="selectedTarget" placeholder="Select">
      <el-option v-for="item in apis" :key="item.target" :label="item.target" :value="item.target"></el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'apiTargetSelector',
  computed: {
    selectedRequest() {
      return this.$store.getters.selectedRequest;
    },
    apis() {
      return this.$store.getters.getAPIs;
    },
    selectedTarget: {
      get: function () {
        return this.$store.getters.selectedRequest.respondWay.target;
      },
      set: function (value) {
        this.$store.dispatch('changeRespondWay', this.$store.getters.getAPIs.filter(api => api.target === value)[0]);
      }
    },
  },
  created () {},
  data () {
    return {
    }
  },
  methods: {
    test () {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
