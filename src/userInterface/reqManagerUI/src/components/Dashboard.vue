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
          <h4>Mock</h4>
          <el-select v-if="mocks && mocks.length" v-model="selectedMock" placeholder="Select">
            <el-option v-for="m in mocks" :key="m.name" :label="m.name" :value="m.name"></el-option>
          </el-select>
          <el-button icon="el-icon-plus" @click="dialogTableVisible = true"></el-button>
          <div v-if="selectedMock">
            <long-text :text="selectedRequest.respond && selectedRequest.respond.body"></long-text>
            <el-button icon="el-icon-delete" @click="removeMock"></el-button>
            <el-button icon="el-icon-edit" @click="editMock"></el-button>
          </div>
        </div>

        <!--CACHE-->
        <div class="respondWith" v-if="respondWayType === RespondType.CACHE">
          <h4>Cache</h4>
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
      selectedMock: {
        get: function() {
          return this.mocks && this.mocks.filter(m => m.lastActivated)[0];
        },
        set: function (value) {
          this.respondW = value;
          this.$store.dispatch('changeRespondWayType', value);
        }
      },
      selectedRequest() {
        const sr = this.$store.getters.selectedRequest;
        if (sr) {
          this.respondW = this.respondWay;
        }
        return sr;
      },
      mocks() {
        return this.$store.getters.getMocks;
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
        isEditing: false,
        respondW: RespondType.API,
        RespondType: RespondType
      }
    },
    methods: {
      saveNewMock () {
        if (!this.newMock.name) {
          this.newMockError = 'Please fill out name field(name and body is required)';
        } else if (!this.newMock.body) {
          this.newMockError = 'Please fill out body field(name and body is required)';
        } else if (!this.isEditing && this.mocks.filter(m => m.name === this.newMock.name).length) {
          this.newMockError = 'There is another mock with the same name, please use a uniqe name';
        } else {
          if (this.isEditing) {
            this.$socket.emit('editMock', {url: this.selectedRequest.req.url, newMock: this.newMock});
          } else {
            this.$socket.emit('addNewMock', {url: this.selectedRequest.req.url, newMock: this.newMock});
          }
          this.dialogTableVisible = false;
          this.isEditing = false;
        }
      },
      removeMock () {
        this.$socket.emit('removeMock', {url: this.selectedRequest.req.url, mockName: this.selectedMock.name});
      },
      editMock () {
        this.newMock = {...this.selectedMock};
        this.isEditing = true;
        this.dialogTableVisible = true;
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
