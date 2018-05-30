<template>
  <div class="HandleApiFail">
    <div v-show="alternativeOptions.length > 0">
      <p><small>If it could not answer respond with</small></p>
      <el-cascader
        v-if="item!==respondWay"
        :options="options"
        v-model="alternativeWay">
      </el-cascader>
    </div>
  </div>
</template>

<script>
  import RespondType from "../../../../requestManager/respondType.js"
export default {
  name: 'HandleApiFail',
  computed: {
    options: {
      get: function () {
        const mocks = this.$store.getters.getMocks;
        const cache = this.$store.getters.getCache;
        const requests = this.$store.getters.allRequests;
        const selectedReq = this.$store.getters.selectedRequest;
        const options = [];
        if (mocks.length) {
          const mockObj = {label: 'Mock'};
          if (mocks.length > 1) {
            mockObj.children = mocks.map((m) => {return {value: `{name: "${m.name}", type: "${RespondType.MOCK}"}`, label: m.name}});
          } else {
            mockObj.value = mocks[0].name;
          }
          options.push(mockObj);
        }
        if (cache) {
          const cacheObj = {label: `{type: "${RespondType.CACHE}"}`, value: 'cache'};
          options.push(cacheObj);
        }
        if (requests.length > 1) {
          const anotherRequests = {label: 'As Another Request'};
          anotherRequests.children = requests
            .filter(r => r !== selectedReq)
            .map(r => {
              return {value: `{url: "${r.req.url}", type: "${RespondType.API}"}`, name: r.req.baseUrl};
            });
          options.push(anotherRequests);
        }
      }
    },
    alternativeWay: {
      get: function () {
        return this.$store.getters.selectedRequest.respondWay.alternativeWay;
      },
      set: function (value) {
        return this.$store.dispatch('changeAlternativeWay', value);
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
