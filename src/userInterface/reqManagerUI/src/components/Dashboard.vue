<template>
  <div class="hello">
    <h1>Bridgends</h1>
    <el-table :data="reqList" style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column prop="status" label="status" width="180"></el-table-column>
      <el-table-column prop="formatedDate" label="Date" width="180"></el-table-column>
      <el-table-column prop="freq" label="Frequency" width="180"></el-table-column>
      <el-table-column prop="req.baseUrl" label="url"></el-table-column>
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
  created () {},
  data () {
    return {
    }
  },
  methods: {
    tableRowClassName({row, rowIndex}) {
      return (row.updateTime>0) ? 'flash' : '';
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.el-table th{
  text-align: center;
}

@mixin keyframes($name) {
  @-webkit-keyframes #{$name} { @content; }
  @-moz-keyframes #{$name} { @content; }
  @-ms-keyframes #{$name} { @content; }
  @keyframes #{$name} { @content; }
}
@include keyframes(flash) {
  0% { background-color: #ffccf2; }
  50% { background-color: #ccffcc; }
  100% { background-color: #ccffff; }
}


</style>
