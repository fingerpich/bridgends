<template>
  <div class="HandleApiFail">
    <div v-show="alternativeOptions.length > 0">
      <label>If it could not answer respond with</label>
      <el-select v-model="alternativeWay" placeholder="Select">
        <el-option v-for="item in alternativeOptions" v-if="item!==respondWay" :key="item" :label="item" :value="item"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
export default {
  name: 'HandleApiFail',
  computed: {
    alternativeOptions() {
      return this.$store.getters.alternativeOptions;
    },
    alternativeWay: {
      get: function () {
        return this.$store.getters.selectedRequest.respondWay.alternativeWay;
      },
      set: function (value) {
        return this.$store.commit('updateAlternativeWay', value);
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
