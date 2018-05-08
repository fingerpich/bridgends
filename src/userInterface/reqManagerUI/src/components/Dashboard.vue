<template>
  <div class="dashboard">
    <div class="header">
      <h4>Bridgends</h4>
    </div>

    <div class="container">
      <request-selector></request-selector>
      <div v-if="selectedReq">
        <h3>Respond With</h3>
        <div class="selectRespondWay">
          <el-radio v-for="opt in respondWays" v-model="respondWay" :key="opt" :value="opt" :label="opt" border></el-radio>
        </div>
        <div class="respondWith" v-if="respondWay.type === RespondType.MOCK">
          <div v-if="selectedReq.mockID"> mock with this id {{selectedReq.mockID}} </div>
          <el-button icon="el-icon-plus" circle @click="dialogTableVisible = true">add mock</el-button>
        </div>
        <div class="respondWith" v-if="respondWay.type === RespondType.CACHE">
          <!--<h4>cache</h4>-->
          <div v-if="selectedReq.cacheID">
            <h5>It will response via cache </h5>
            <small>{{selectedReq.cacheID}}</small>
          </div>
        </div>
        <div class="respondWith" v-if="respondWay.type === RespondType.API">
          <h4>API</h4>
          <api-check></api-check>
          <handle-api-fail></handle-api-fail>
        </div>

        <el-dialog title="Add new respond way" :visible.sync="dialogTableVisible">
          <el-select v-model="newWay.type" placeholder="Respond with">
            <el-option key="API" value="API" label="API">API</el-option>
            <el-option key="Mock" value="Mock" label="Mock">Mock</el-option>
          </el-select>

          <el-input placeholder="enterName" v-model="newWay.name">
            <template slot="prepend">{{newWay.type}}</template>
          </el-input>

          <div v-show="newWay.type==='API'">
            <api-check></api-check>
            <handle-api-fail></handle-api-fail>
          </div>
          <div v-show="newWay.type==='Mock'">
            <el-input
              type="textarea"
              :rows="2"
              placeholder="Please input"
              v-model="newWay.mock">
            </el-input>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import RespondType from "../../../../requestManager/respondType.js"
  import RequestSelector from "./reqSelector";
  import ApiCheck from "./ApiTester";
  import HandleApiFail from "./ApiFaulure";

  export default {
    name: 'Dashboard',
    components: {HandleApiFail, ApiCheck, RequestSelector},
    computed: {
      selectedReq() {
        return this.$store.getters.selectedRequest;
      },
      respondOptions() {
        return this.$store.getters.respondOptions;
      },
      respondWay: {
        get: function () {
          return this.$store.getters.selectedRequest.respondWay.type;
        },
        set: function (value) {
          return this.$store.commit('updateRespondWay', value);
        }
      },
    },
    created () {},
    data () {
      return {
        respondWays:['Mock','Cache','API'],
        dialogTableVisible: false,
        newWay: {
          type: ''
        },
        RespondType: RespondType
      }
    },
    methods: {
      onChoose (ev) {
        this.$store.commit('updateRespondWay', this.selectedReq.priorities[ev.oldIndex]);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .header{
    padding: 1px 20px;
    margin: 0 0 30px;
    color: #777;
    text-shadow: 0 0 7px #ccc;
    text-align: left;
    box-shadow: 0 0 5px 0 #ccc;
  }
  .container{
    display: flex;
    >div{
      flex:50%;
    }
    .respondWith {
      padding: 10px;
    }
  }

</style>
