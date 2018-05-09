<template>
  <div class="targetSelector">
    <el-select v-model="selectedTarget" placeholder="Select">
      <el-option v-for="item in apis" :key="item.target" :label="item.target" :value="item.target"></el-option>
    </el-select>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
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
        return this.$store.commit('updateApiTarget', value);
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
