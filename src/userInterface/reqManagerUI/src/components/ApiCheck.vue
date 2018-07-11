<template>
  <div class="CheckAPI">
    <div><strong>{{ selectedRequest.req.baseUrl }}</strong></div>
    <div><small>{{ selectedRequest.req.params }}</small></div>
    <p>
      <span>status: </span><small>{{ selectedRequest.status}}</small>
    </p>
    <p v-if="selectedRequest.respond">
      <span>t:</span><small>{{respondTime}}s</small>
      <strong>body</strong>
      <long-text :text="selectedRequest.respond && selectedRequest.respond.body"></long-text>
    </p>
    <!--<el-button @click="testAPI">test</el-button>-->
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import LongText from "./longText";
  import axios from "axios";
  export default {
    name: 'apiCheck',
    components: {LongText},
    computed: {
      selectedRequest() {
        return this.$store.getters.selectedRequest;
      },
      respondTime() {
        if (this.selectedRequest.apiRespond) {
          return +(this.selectedRequest.apiRespond.reqTime - this.selectedRequest.apiRespond.reqTime).toFixed(5);
        } else return '';
      },
    },
    created () {},
    data () {
      return {
      }
    },
    methods: {
      testAPI () {
        this.$socket.emit('testApi', this.selectedRequest.req.url);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .CheckAPI{
    padding: 10px;
    line-height: 23px;
  }
  code{
    display: block;
    max-height: 125px;
    line-height: 14px;
    font-size: 11px;
    overflow-y: auto;
    overflow-x: hidden;
    max-width: 500px;
    padding: 10px;
    margin: auto;
  }
</style>
