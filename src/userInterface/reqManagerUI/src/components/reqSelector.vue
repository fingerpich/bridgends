<template>
  <div class="requestSelector">
    <el-table :data="reqList"  :default-sort = "{prop: 'req.baseUrl', order: 'descending'}"
              highlight-current-row @current-change="handleCurrentChange" style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column width="300" sortable prop="req.baseUrl" label="url"></el-table-column>
      <el-table-column sortable prop="status" label="status"></el-table-column>
      <el-table-column sortable prop="formatedDate" label="Date"></el-table-column>
      <el-table-column sortable prop="freq" label="Frequency"></el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
export default {
  name: 'RequestSelector',
  computed: mapGetters({
    reqList: 'allRequests',
    currentRow: 'selectedRequest',
  }),
  created () {},
  data () {
    return {
    }
  },
  methods: {
    tableRowClassName({row, rowIndex}) {
      let className = '';
      if (row && this.currentRow) {
        if (row.req.url === this.currentRow.req.url) {
          className += 'active ';
        }
        className += (row.updateTime > 0) ? 'flash' : '';
      }
      return className;
    },
    handleCurrentChange(val) {
      if (val) {
        this.$store.dispatch('setSelectedRequest', val);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.el-table th{
  text-align: center!important;
  padding: 0!important;
}
.cell{
  padding: 0!important;
}
.active td{
  background: #a0cdff!important;
}

@mixin keyframes($name) {
  @-webkit-keyframes #{$name} { @content; }
  @-moz-keyframes #{$name} { @content; }
  @-ms-keyframes #{$name} { @content; }
  @keyframes #{$name} { @content; }
}
@include keyframes(flashing) {
  0% { background-color: #00ff22; }
  50% { background-color: #c9ffce; }
  100% { background-color: #ffffff; }
}
.flash{
  animation-name: flashing;
  animation-duration: 0.3s;
}
.el-table .cell {
  word-break: normal;
}

</style>
