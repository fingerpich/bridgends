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

        <!--MOCK-->
        <div class="respondWith" v-if="respondWayType === RespondType.MOCK">
          <div v-if="selectedRequest.mockID"> mock with this id {{selectedRequest.mockID}} </div>
          <el-button icon="el-icon-plus" circle @click="dialogTableVisible = true">add mock</el-button>
        </div>

        <!--CACHE-->
        <div class="respondWith" v-if="respondWayType === RespondType.CACHE">
          <long-text :text="selectedRequest.respond && selectedRequest.respond.body"></long-text>
        </div>

        <!--API-->
        <div class="respondWith" v-if="respondWayType === RespondType.API">
          <h4>API</h4>
          <api-target-selector></api-target-selector>
          <api-check></api-check>
          <!--<handle-api-fail></handle-api-fail>-->
          <!--<label>add another api option</label>-->
          <!--<el-button icon="el-icon-plus"></el-button>-->
        </div>

        <el-dialog title="New Mock" :visible.sync="dialogTableVisible">
          <el-row>
            <el-col :span="12">
              <el-input placeholder="enterName" v-model="newMock.name"></el-input>
            </el-col>
            <el-col :span="8">
              <el-select v-model="newMock.status" placeholder="status">
                <el-option v-for="item in httpStatus" :key="item" :label="item" :value="item" ></el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input
                type="textarea"
                placeholder="header"
                v-model="newMock.header">
              </el-input>
            </el-col>
          </el-row>

          <el-input
            class="bodyTextArea"
            type="textarea"
            placeholder="body"
            v-model="newMock.body">
          </el-input>
          <h3>
            <small>{{newMockError}}</small>
          </h3>
          <el-button type="success" v-on:click="saveNewMock">Save</el-button>
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
          this.$store.dispatch('changeRespondWayType', value);
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
    created () {},
    data () {
      return {
        httpStatus: [200, 403, 400, 503],
        respondWays: [RespondType.MOCK,RespondType.CACHE,RespondType.API],
        dialogTableVisible: false,
        newMock: {
          status: 200,
          name: '',
          body: '',
          header: '',
        },
        newMockError: '',
        respondW: RespondType.API,
        RespondType: RespondType
      }
    },
    methods: {
      saveNewMock () {
        if (!this.newMock.name) {
          this.newMockError = 'please fill out name field(name and body is required)';
        } else if (!this.newMock.body) {
          this.newMockError = 'please fill out body field(name and body is required)';
        } else {
          this.$socket.emit('addNewMock', this.newMock);
        }
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
  .bodyTextArea {
    textarea {
      min-height: 200px!important;
    }
  }

</style>
