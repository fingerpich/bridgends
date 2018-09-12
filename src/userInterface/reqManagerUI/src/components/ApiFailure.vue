<template>
  <div class="HandleApiFail">
    <div v-show="options.length > 0">
      <div><small>If it could not answer respond with</small></div>
      <el-cascader
        v-if="options"
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
          const mockObj = {label: 'Mock', value: RespondType.MOCK};
          if (mocks.length > 1) {
            mockObj.children = mocks.map((m) => {return {value: m.name, label: m.name}});
          } else {
            mockObj.value = mocks[0].name;
          }
          options.push(mockObj);
        }
        if (cache) {
          const cacheObj = {value: RespondType.CACHE, label: 'cache'};
          options.push(cacheObj);
        }
        if (requests.length > 1) {
          const anotherRequests = {label: 'As Request', value: RespondType.API};
          anotherRequests.children = requests
            .filter(r => r !== selectedReq)
            .map(r => {
              return {value: r.req.url, label: r.req.url};
            });
          options.push(anotherRequests);
        }
        return options;
      }
    },
    alternativeWay: {
      get: function () {
        let av = this.$store.getters.selectedRequest.respondWay.alternativeWay
        if (av) {
          if (av.type !== RespondType.CACHE) {
            return [av.type, av.data];
          }
          return [av.data];
        } else {
          return [];
        }
      },
      set: function (value) {
        const obj = {};
        if (value.length > 1){
          obj.type = value[0];
          obj.data = value[1];
        } else {
          obj.type = RespondType.CACHE;
          obj.data = value[0];
        }
        return this.$store.dispatch('changeAlternativeWay', obj);
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
