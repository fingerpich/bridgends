<template>
  <div class="dashboard">
    <div class="header">
      <h4>Bridgends</h4>
    </div>

    <div class="container" :class="{showDetail: showDetail}">
      <request-selector></request-selector>
      <div class="respondContainer" v-if="selectedRequest">
        <el-button class="backtolist" v-on:click="showDetail=false">back to list</el-button>
        <h3>Respond With</h3>
        <div class="selectRespondWay">
          <el-radio v-for="opt in respondWays" v-model="respondWayType" :key="opt" :value="opt" :label="opt" border></el-radio>
        </div>

        <!--MOCK-->
        <div class="respondWith" v-if="respondWayType === RespondType.MOCK">
          <handle-mock ></handle-mock>
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
      transition: width 0.3s ease;
      width:100%;
    }
    .respondContainer{
      width:100%;
    }
    &.showDetail{
      .requestSelector{
        width: 0;
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
