<template>
  <div class="dashboard">
    <h1>Bridgends</h1>
    <div class="container">
      <request-selector></request-selector>
      <div v-if="selectedReq">
        <h2>bridgends s</h2>

        <div v-if="selectedReq.mockID"> mock with this id {{selectedReq.mockID}} </div>
        <button v-else> add mock </button>

        <div v-if="selectedReq.cacheID">
          it has been cached {{selectedReq.cacheID}}
        </div>
      </div>
      <div v-if="selectedReq">
        <h3>Server</h3>
        <div>
          <p>
            <strong>{{ selectedReq.req.baseUrl }}</strong>
            <small>{{ selectedReq.req.params }}</small>
          </p>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import RequestSelector from "./reqSelector";
export default {
  name: 'Dashboard',
  components: {RequestSelector},
  computed: mapGetters({
    selectedReq: 'selectedRequest',
  }),
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
.container{
  display: flex;
  >div {
    flex: 33%;
  }
}

</style>
