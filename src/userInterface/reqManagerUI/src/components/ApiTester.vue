<template>
  <div class="CheckAPI">
    <el-select v-model="selectedTarget" placeholder="Select">
      <el-option v-for="item in targetOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
    <el-button>test</el-button>

    <p>
      <strong>{{ selectedReq.req.baseUrl }}</strong>
      <small>{{ selectedReq.req.params }}</small>
    </p>
    <p> status : {{ selectedReq.status}}</p>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
export default {
  name: 'apiCheck',
  computed: {
    selectedRequest() {
      return this.$store.getters.selectedRequest;
    },
    targetOptions() {
      return this.$store.getters.targetOptions;
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
