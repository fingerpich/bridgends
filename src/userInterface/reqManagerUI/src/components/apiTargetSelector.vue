<template>
  <div class="targetSelector">
    <div v-if="!showAddTarget">
      <el-button v-show="!showHeaders" icon="el-icon-news" class="showManageHeader" v-on:click="showHeaders=true"></el-button>
      <el-button v-show="showHeaders" class="showManageHeader" v-on:click="showHeaders=false">Hide Headers</el-button>
      <el-select v-model="selectedTarget" placeholder="Select">
        <el-option v-for="target in targets" :key="target" :label="target" :value="target"></el-option>
      </el-select>
      <div class="headerCrud" v-if="showHeaders">
        <h5>Headers</h5>
        <JsonEditor is-edit="true" v-model="headers" ></JsonEditor>
      </div>
    </div>
    <div v-else>
      <el-button icon="el-icon-check" v-on:click="addNewTarget"></el-button>
      <el-input placeholder="192.168.1.152:8085" v-model="newTarget"></el-input>
      <el-button icon="el-icon-close" v-on:click="showAddTarget=false"></el-button>
    </div>
  </div>
</template>

<script>
  const ADD_NEW = 'Add New';
export default {
  name: 'apiTargetSelector',
  computed: {
    selectedRequest() {
      return this.$store.getters.selectedRequest;
    },
    targets() {
      return [...this.$store.getters.getAllTargets, ADD_NEW];
    },
    apis() {
      return this.$store.getters.getAPIs;
    },
    headers: {
      get: function () {
      // @input="d => this.newHeader = d" :value="headers"
        return this.$store.getters.getHeaders;
      }, set: function (value) {
        this.$socket.emit('setHeader', {req: this.selectedRequest.req, headers: value});
      }
    },
    selectedTarget: {
      get: function () {
        return this.$store.getters.getSelectedRequestTarget;
      },
      set: function (value) {
        if (value === ADD_NEW) {
          this.showAddTarget = true;
        } else {
          this.$store.dispatch('changeTarget', value);
        }
      }
    },
  },
  created () {

  },
  data () {
    return {
      newTarget: '',
      showHeaders: false,
      showAddTarget: false,
    }
  },
  methods: {
    test () {

    },
    addNewTarget() {
      this.$store.dispatch('changeTarget', this.newTarget);
      this.showAddTarget = false;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.targetSelector{
  .el-input{
    width: inherit;
  }
  .el-button{
    margin: 0;
  }
  textarea{
    margin: 6px 0;
    width: 307px;
    height: 60px;
  }
  .headerCrud{
    width: 331px;
    border-radius: 6px;
    margin: 4px auto;
    border: 1px solid #ececec;
    select.f-input-m{
      display: none;
    }
    .block_content{
      margin: 0 10px;
    }
    h5{
      margin: 2px;
    }
  }
}
</style>
