<template>
  <div class="dashboard">
    <div class="header">
      <h4>Bridgends</h4>
    </div>

    <div class="container" :class="{showDetail: showDetail}">
      <request-selector></request-selector>
      <div class="respondContainer" v-if="selectedRequest">
        <div class="fixed">
          <el-button class="backtolist" v-on:click="showDetail=false">back to list</el-button>

          <div class="url">{{(selectedRequest.isContainer? 'All requests started with ': 'Settings for ')}}</div>
          <h5>{{selectedRequest.req.url}}</h5>
          <div>Will be sent to</div>
          <api-target-selector></api-target-selector>

          <div v-if="selectedRequest.isContainer">
            <h2> </h2>
            <div>And responds</div>
            <el-cascader
              placeholder="Try searching: another api"
              :options="containerRespondOptions"
              expand-trigger="hover"
              :value="respondW"
              @input="containerRespondChanged"
              filterable
            ></el-cascader>
            <el-button @click="removeMock" v-if="isUsingMock" icon="el-icon-delete"></el-button>
            <el-button @click="editMock" v-if="isUsingMock" icon="el-icon-edit"></el-button>
          </div>
          <div v-else>
            <h3>Respond With</h3>
            <div class="selectRespondWay">
              <el-radio v-for="opt in respondWays" v-model="respondWayType" :key="opt" :value="opt" :label="opt" border></el-radio>
            </div>

            <!--MOCK-->
            <div class="respondWith" v-if="respondWayType === RespondType.MOCK">
              <div v-if="!selectedRequest.respond">
                there is no mock please add a new one, this still is using {{selectedRequest.lastRespondWay}} to respond requests
              </div>
              <div class="handleMock" >
                <h4>Mock</h4>
                <el-select v-if="mocks && mocks.length" v-model="selectedMock" placeholder="Select">
                  <el-option v-for="m in mocks" :key="m.name" :label="m.name" :value="m.name"></el-option>
                </el-select>
                <el-button icon="el-icon-plus" @click="showMockEditor = true"></el-button>
                <div v-if="selectedMock">
                  <h5>respond body</h5>
                  <long-text :text="selectedRequest.respond && selectedRequest.respond.body"></long-text>
                  <el-button icon="el-icon-delete" @click="removeMock"></el-button>
                  <el-button icon="el-icon-edit" @click="editMock"></el-button>
                </div>
              </div>
            </div>

            <!--CACHE-->
            <div class="respondWith" v-if="respondWayType === RespondType.CACHE">
              <h4>Cache</h4>
              <div v-if="selectedRequest.respond">
                <long-text :text="selectedRequest.respond && selectedRequest.respond.body"></long-text>
                <el-button v-on:click="clearCache">clear cache</el-button>
              </div>
              <div v-else>
                This request has not cached yet, this still is using {{selectedRequest.lastRespondWay}} to respond requests
              </div>
            </div>

            <!--API-->
            <div class="respondWith" v-if="respondWayType === RespondType.API">
              <h4>API</h4>
              <api-check></api-check>
              <div class="asfaf">
                <handle-api-fail></handle-api-fail>
              </div>
              <!--<label>add another api option</label>-->
              <!--<el-button icon="el-icon-plus"></el-button>-->
            </div>
          </div>
        </div>
        <new-mock-modal @close="cancelNewMock" :visibility="showMockEditor" :mock="editingMock" @saved="showMockEditor=false"></new-mock-modal>
      </div>
    </div>
  </div>
</template>

<script>
  import RespondType from "../../../../requestManager/respondType.js"
  import RequestSelector from "./reqSelector";
  import HandleApiFail from "./ApiFailure";
  import ApiCheck from "./ApiCheck";
  import ApiTargetSelector from "./apiTargetSelector";
  import LongText from "./longText";
  import NewMockModal from "./NewMockModal";

  export default {
    name: 'Dashboard',
    components: {NewMockModal, LongText, ApiTargetSelector, ApiCheck, HandleApiFail, RequestSelector},
    computed: {
      selectedRequest() {
        const sr = this.$store.getters.selectedRequest;
        if (sr) {
          this.respondW = sr.isContainer? this.respondWay.split(RespondType.Delimiter) : this.respondWay.type;
          this.isUsingMock = this.respondW[0] === RespondType.MOCK_ALL;
        }
        this.showDetail = !!sr;
        return sr;
      },
      containerRespondOptions() {
        const requests = this.$store.getters.allRequests;
        const mocks = this.$store.getters.getMocks.map(m => ({value: m.name, label: m.name}));
        mocks.push({value: 'newMock', label: 'New Mock'});
        return [
          {value: RespondType.AS_THEY_SETTLED, label: 'As They Settled'},
          {value: RespondType.PRIORITY, label: 'With Priority', children:[
              {value: RespondType.MOCK_CACHE_API, label: 'Mock | Cache | Api'},
              {value: RespondType.CACHE_API_MOCK, label: 'Cache | Api | Mock'},
              {value: RespondType.API_CACHE_MOCK, label: 'Api | Cache | Mock'},
            ]},
          {value: RespondType.AS_ANOTHER_REQUEST, label: 'As Another Request',
            children: requests
              .filter(r => {
                return !r.isContainer && r.respondOptions.find(rw => rw.type === RespondType.CACHE)
              })
              .map(r => {
                return {value: r.req.url, label: r.req.url, title: r.req.url};
              })
          },
          {value: RespondType.MOCK_ALL, label: 'Like', children: mocks},
        ];
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
          return this.$store.getters.selectedRequest.respondWay;
        }
      },
      selectedMock: {
        get: function() {
          return this.$store.getters.respondWay.name;
        },
        set: function (value) {
          this.$store.dispatch('changeRespondWay', this.mocks.find(m => m.name === value));
        }
      },
      mocks() {
        return this.$store.getters.getMocks;
      },
    },

    created () {},
    data () {
      return {
        showDetail:false,
        respondWays: [RespondType.MOCK, RespondType.CACHE, RespondType.API],
        respondW: RespondType.API,
        RespondType: RespondType,
        showMockEditor: false,
        editingMock: null,
        lastWay: null,
        isUsingMock: false
      }
    },
    methods: {
      cancelNewMock() {
        this.respondW = this.lastWay;
        this.showMockEditor = false;
      },
      containerRespondChanged: function (value) {
        const joined = value.join(RespondType.Delimiter);
        if (value[0] === RespondType.MOCK_ALL && value[1] === 'newMock') {
          // add new mock
          this.lastWay = this.respondW;
          this.respondW = value;
          this.showMockEditor = true;
        } else {
          this.isUsingMock = value[0] === RespondType.MOCK_ALL;
          this.$socket.emit('ChangeContainerResWay', {respondWay: joined, req: this.selectedRequest.req});
        }
      },
      clearCache: function() {
        this.$socket.emit('clearCache', {req: this.selectedRequest.req});
      },
      removeMock () {
        this.$socket.emit('removeMock', {req: this.selectedRequest.req, mock: this.selectedMock});
      },
      editMock () {
        this.editingMock = {
          name: this.selectedMock,
          ...this.selectedRequest.respond
        };
        this.showMockEditor = true;
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .header{
    padding: 17px 20px;
    margin: 0;
    color: #bbb;
    background: #f5f5f5;
    h4{
      font-weight: normal;
      margin: 0;
    }
  }
  .el-tree-node__children{
    margin: 0 0 0 10px;
  }
  .el-cascader-menu{
    max-width: 160px;
  }
  .container{
    display: flex;
    .requestSelector{
      transition: width 0.3s ease;
      width:100%;
    }
    .respondContainer{
      width: 0%;
      padding-top: 50px;
      overflow: hidden;
      position: relative;
      .fixed{
        position: fixed;
      }
      .url{

      }
    }
    &.showDetail{
      .requestSelector{
        width: 0%;
        overflow: hidden;
      }
      .respondContainer{
        width:100%;
        .fixed{
          width: 100%;
        }
      }
    }
    @media screen and (min-width: 900px) {
      .backtolist{
        display: none;
      }
      &.showDetail{
        .requestSelector {
          width: 60%!important;
        }
        .respondContainer{
          width:40%;
          .fixed{
            width: 40%;
          }
        }
      }
    }

    .respondWith {
      padding: 10px;
    }
  }
</style>
