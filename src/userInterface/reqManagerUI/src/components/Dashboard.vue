<template>
  <div class="hello">
    <h1>Bridgends</h1>
    <el-table
      :data="reqList"
      style="width: 100%">
      <el-table-column
        prop="status"
        label="status"
        width="180">
      </el-table-column>
      <el-table-column
        prop="lastUsed"
        label="Date"
        width="180">
      </el-table-column>
      <el-table-column
        prop="freq"
        label="Frequency"
        width="180">
      </el-table-column>
      <el-table-column
        prop="req.url"
        label="url">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
export default {
  name: 'Dashboard',
  computed: mapGetters({
    reqList: 'allRequests',
  }),
  created () {
    this.loadRequests()
  },
  data () {
    return {
    }
  },
  methods: {
    loadRequests () {
      this.$store.dispatch('loadRequests', {});
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.el-table th{
  text-align: center;
}
</style>
