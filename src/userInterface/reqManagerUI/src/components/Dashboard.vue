<template>
  <div class="dashboard">
    <div class="header">
      <h4>Bridgends</h4>
    </div>

    <div class="container">
      <request-selector></request-selector>
      <div class="respondContainer" v-if="selectedRequest">
        <h3>Respond With</h3>
        <div class="selectRespondWay">
          <el-radio v-for="opt in respondWays" v-model="respondWayType" :key="opt" :value="opt" :label="opt" border></el-radio>
        </div>
        <div class="respondWith" v-if="respondWayType === RespondType.MOCK">
          <div v-if="selectedRequest.mockID"> mock with this id {{selectedRequest.mockID}} </div>
          <el-button icon="el-icon-plus" circle @click="dialogTableVisible = true">add mock</el-button>
        </div>
        <div class="respondWith" v-if="respondWayType === RespondType.CACHE">
          <!--<h4>cache</h4>-->
          <div v-if="selectedRequest.cacheID">
            <h5>It will response via cache </h5>
            <long-text :text="selectedRequest.cacheContent"></long-text>
            <small>{{selectedRequest.cacheID}}</small>
          </div>
        </div>
        <div class="respondWith" v-if="respondWayType === RespondType.API">
          <h4>API</h4>
          <api-target-selector></api-target-selector>
          <api-check></api-check>
          <!--<handle-api-fail></handle-api-fail>-->
          <!--<label>add another api option</label>-->
          <!--<el-button icon="el-icon-plus"></el-button>-->
        </div>

        <el-dialog title="Add new mock" :visible.sync="dialogTableVisible">
          <el-input placeholder="enterName" v-model="newMock.name"></el-input>
          <el-input
            type="textarea"
            placeholder="respond"
            v-model="newMock.mock">
          </el-input>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import axios from 'axios'
  import RespondType from "../../../../requestManager/respondType.js"
  import RequestSelector from "./reqSelector";
  import HandleApiFail from "./ApiFaulure";
  import ApiCheck from "./ApiCheck";
  import ApiTargetSelector from "./apiTargetSelector";
  import LongText from "./longText";

  export default {
    name: 'Dashboard',
    components: {LongText, ApiTargetSelector, ApiCheck, HandleApiFail, RequestSelector},
    computed: {
      selectedRequest() {
        const sr = this.$store.getters.selectedRequest;
        if (sr) {
          this.respondW = this.respondWay;
        }
        return sr;
      },
      respondOptions() {
        return this.$store.getters.respondOptions;
      },
      respondWayType: {
        get: function () {
          return this.respondW;
        },
        set: function (value) {
          this.respondW = value;
          if (value === RespondType.CACHE) {
            if(this.selectedRequest.cacheID && !this.selectedRequest.cacheContent) {
              axios.get('/getCacheContent').then(content => {
                this.$store.commit('setCacheContent', content);
              })
            }
          }
          this.$store.commit('updateRespondWay', value);
        }
      },
      respondWay: {
        get: function () {
          return this.$store.getters.selectedRequest.respondWay.type;
        },
        set: function (value) {
          this.$store.commit('updateRespondWay', value);
        }
      },
    },
    created () {
      this.respondW = this.respondWay.type;
    },
    data () {
      return {
        respondWays:[RespondType.MOCK,RespondType.CACHE,RespondType.API],
        dialogTableVisible: false,
        newMock: {
          type: ''
        },
        respondW: RespondType.API,
        RespondType: RespondType
      }
    },
    methods: {
      onChoose (ev) {
        this.$store.commit('updateRespondWay', this.selectedRequest.priorities[ev.oldIndex]);
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
    .requestSelector{
      flex:60%;
      width:60%;
    }
    .respondContainer{
      flex:40%;
      width:40%;
    }
    .respondWith {
      padding: 10px;
    }
  }

</style>
