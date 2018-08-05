<template>
  <div class="dashboard">
    <div class="header">
      <h4>Bridgends</h4>
    </div>

    <div class="container" :class="{showDetail: showDetail}">
      <request-selector></request-selector>
      <div class="respondContainer" v-if="selectedRequest">
        <el-button class="backtolist" v-on:click="showDetail=false">back to list</el-button>
        <div>{{selectedRequest.req.url}}</div>
        <div>|
          <el-button class="showManageHeader" v-on:click="showDetail=false">h</el-button>
        </div>
        <api-target-selector></api-target-selector>
        <h3>Respond With</h3>
        <div class="selectRespondWay">
          <el-radio v-for="opt in respondWays" v-model="respondWayType" :key="opt" :value="opt" :label="opt" border></el-radio>
        </div>

        <!--MOCK-->
        <div class="respondWith" v-if="respondWayType === RespondType.MOCK">
          <div v-if="!selectedRequest.respond">
            there is no mock please add a new one, this still is using {{selectedRequest.lastRespondWay}} to respond requests
          </div>
          <handle-mock ></handle-mock>
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
  </div>
</template>

<script>
  import RespondType from "../../../../requestManager/respondType.js"
  import RequestSelector from "./reqSelector";
  import HandleApiFail from "./ApiFailure";
  import ApiCheck from "./ApiCheck";
  import ApiTargetSelector from "./apiTargetSelector";
  import LongText from "./longText";
  import HandleMock from "./handleMocks";

  export default {
    name: 'Dashboard',
    components: {HandleMock, LongText, ApiTargetSelector, ApiCheck, HandleApiFail, RequestSelector},
    computed: {
      selectedRequest() {
        const sr = this.$store.getters.selectedRequest;
        if (sr) {
          this.respondW = this.respondWay;
        }
        this.showDetail = !!sr;
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
        }
      },
    },
    created () {},
    data () {
      return {
        showDetail:false,
        respondWays: [RespondType.MOCK, RespondType.CACHE, RespondType.API],
        respondW: RespondType.API,
        RespondType: RespondType
      }
    },
    methods: {
      clearCache: function() {
        this.$socket.emit('clearCache', {req: this.selectedRequest.req});
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .header{
    padding: 17px 20px;
    margin: 0 0 30px;
    background: #797979;
    h4{
      font-weight: normal;
      margin: 0;
    }
  }
  .container{
    display: flex;
    .requestSelector{
      transition: width 0.3s ease;
      width:100%;
    }
    .respondContainer{
      width: 0%;
      overflow: hidden;
    }
    &.showDetail{
      .requestSelector{
        width: 0%;
        overflow: hidden;
      }
      .respondContainer{
        width:100%;
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
        }
      }
    }

    .respondWith {
      padding: 10px;
    }
  }
</style>
