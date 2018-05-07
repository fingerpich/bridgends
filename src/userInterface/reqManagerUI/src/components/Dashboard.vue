<template>
  <div class="dashboard">
    <div class="header">
      <h4>Bridgends</h4>
    </div>

    <div class="container">
      <request-selector></request-selector>
      <div>
      <div v-if="selectedReq">
        <h3>
          Respond With
          <el-button type="primary" icon="el-icon-plus" circle></el-button>
        </h3>
        <draggable v-on:choose="onChoose" v-model="priorities" :options="{draggable:'.item'}">
          <div v-for="element in priorities" :key="element" class="item">
            {{element}}
          </div>
        </draggable>

        <div class="respondWith" v-if="showWayToRespond === 'mock'">
          <!--<h4>mock</h4>-->
          <div v-if="selectedReq.mockID"> mock with this id {{selectedReq.mockID}} </div>
          <!--<el-button v-else type="primary">respond mock</el-button>-->
        </div>
        <div class="respondWith" v-if="showWayToRespond === 'cache'">
          <!--<h4>cache</h4>-->
          <div v-if="selectedReq.cacheID">
            It has been cached {{selectedReq.cacheID}}
          </div>
        </div>
        <div class="respondWith" v-if="showWayToRespond === 'API'">
          <h4>API</h4>
          <el-select v-model="selectedTarget" placeholder="Select">
            <el-option v-for="item in options"
                       :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-button type="primary">test</el-button>
          <p>
            <strong>{{ selectedReq.req.baseUrl }}</strong>
            <small>{{ selectedReq.req.params }}</small>
          </p>
          <p> status : {{ selectedReq.status}}</p>

        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import RequestSelector from "./reqSelector";
  import draggable from 'vuedraggable'
  export default {
    name: 'Dashboard',
    components: {RequestSelector, draggable},
    computed: {
      selectedReq() {
        return this.$store.getters.selectedRequest;
      },
      showWayToRespond () {
        return this.$store.getters.respondWay;
      },
      priorities: {
        get() {
          return this.$store.getters.selectedRequest.priorities;
        },
        set(list) {
          this.$store.commit('reorderRespondList', list)
        }
      }
    },
    created () {},
    data () {
      return {
        options: [
          {label:'165.1654.1654.21', value: 'http://231.21621.23152.231'},
          {label:'165.21.66.216', value: 'http://231.21621.23152.321'}
        ],
        selectedTarget: 'http://231.21621.23152.321',
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
