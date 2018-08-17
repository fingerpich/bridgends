<template>
  <div class="targetSelector">
    <div v-if="!showAddTarget">
      <el-button icon="el-icon-news" class="showManageHeader" v-on:click="showHeaders=true">header</el-button>
      <el-select v-model="selectedTarget" placeholder="Select">
        <el-option v-for="target in targets" :key="target" :label="target" :value="target"></el-option>
      </el-select>
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
  created () {},
  data () {
    return {
      newTarget: '',
      showAddTarget: false
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
}
</style>
