<template>
  <div class="requestSelector">
    <div class="pad10">
      <el-input class="filterReq"
        placeholder="Filter URL"
        v-model="filterText">
      </el-input>
      <el-tree
        class="filter-tree"
        :data="reqTree"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        ref="treeReq">
        <span class="node" slot-scope="{ node, data }" @click=" () => handleCurrentChange(data.req)">
          <span class="p name">{{node.label}}</span>
          <span class="p status">{{data.req.status}}</span>
          <span class="p status">{{data.req.formatedDate}}</span>
          <span class="p status">{{data.req.freq}}</span>
          <span class="p status">{{data.req.respondWay.type}}</span>
        </span>
      </el-tree>

      <el-table v-if="false" :data="reqList"  :default-sort = "{prop: 'req.baseUrl', order: 'descending'}"
                highlight-current-row @current-change="handleCurrentChange" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column width="300" sortable prop="req.baseUrl" label="url"></el-table-column>
        <el-table-column sortable prop="status" label="Status"></el-table-column>
        <el-table-column sortable prop="formatedDate" label="Date"></el-table-column>
        <el-table-column sortable prop="freq" label="Frequency"></el-table-column>
        <el-table-column sortable prop="respondWay.type" label="respond Way"></el-table-column>
      </el-table>
    </div>
    </div>
</template>

<script>
  import { mapGetters } from 'vuex'
export default {
  name: 'RequestSelector',
  computed: mapGetters({
    reqTree: 'treeRequests',
    reqList: 'allRequests',
    currentRow: 'selectedRequest',
  }),
  created () {},
  watch: {
    filterText(val) {
      this.$refs.treeReq.filter(val);
    }
  },
  data () {
    return {
      filterText: '',
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
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
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
.el-table tr{
  cursor: pointer;
}
.cell{
  padding: 0!important;
}
.active td{
  background: #a0cdff!important;
}
.pad10 {
  padding: 0 10px;
}

.flash {
  background: #00ff22;
}
.el-table .cell {
  word-break: normal!important;
}
.el-tree{
  margin: 10px 0;
}
.el-tree-node__content{
  height: inherit;
  padding: 11px 0;
}
.filterReq .el-input__inner{
  border: none;
  border-bottom: 1px solid #ddd;
}
.el-tree-node__expand-icon{
  padding: 0 6px !important;
  font-size: 20px;
}
  .node{
    display: flex;
    flex: 1 1 auto;
    font-size: 0.8rem;
    .p{
      flex: 1 1 auto;
      text-overflow: ellipsis;
      display: block;
      overflow: hidden;
      text-align: center;
      margin: 0px;
      max-width: 15%;
      &.name {
        text-align: left;
        max-width: 40%;
      }
    }
  }
</style>
