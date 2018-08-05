<template>
  <div class="handleMock" >
    <h4>Mock</h4>
    <el-select v-if="mocks && mocks.length" v-model="selectedMock" placeholder="Select">
      <el-option v-for="m in mocks" :key="m.name" :label="m.name" :value="m.name"></el-option>
    </el-select>
    <el-button icon="el-icon-plus" @click="dialogTableVisible = true"></el-button>
    <div v-if="selectedMock">
      <h5>respond body</h5>
      <long-text :text="selectedRequest.respond && selectedRequest.respond.body"></long-text>
      <el-button icon="el-icon-delete" @click="removeMock"></el-button>
      <el-button icon="el-icon-edit" @click="editMock"></el-button>
    </div>
    <el-dialog title="New Mock" :visible.sync="dialogTableVisible">
      <el-row>
        <el-col :span="12">
          <el-input placeholder="enterName" v-model="newMock.name"></el-input>
        </el-col>
        <el-col :span="8">
          <el-select v-model="newMock.statusCode" placeholder="status">
            <el-option v-for="item in httpStatus" :key="item" :label="item" :value="item" ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input
            type="textarea"
            placeholder="header"
            v-model="newMock.headers">
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
</template>

<script>
  import RespondType from "../../../../requestManager/respondType.js"
  import LongText from "./longText";

  export default {
    name: 'handleMock',
    components: {LongText},
    computed: {
      selectedRequest() {
        return this.$store.getters.selectedRequest;
      },
      selectedMock: {
        get: function() {
          return this.$store.getters.respondWay.name;
        },
        set: function (value) {
          this.$store.dispatch('changeRespondWay', this.mocks.filter(m => m.name === value)[0]);
        }
      },
      mocks() {
        return this.$store.getters.getMocks;
      },
    },
    created () {},
    data () {
      return {
        httpStatus: [200, 403, 400, 503],
        respondWays: [RespondType.MOCK,RespondType.CACHE,RespondType.API],
        dialogTableVisible: false,
        newMock: {
          statusCode: 200,
          name: '',
          body: '',
          headers: '',
        },
        newMockError: '',
        isEditing: false,
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
            this.$socket.emit('editMock', {req: this.selectedRequest.req, newMock: this.newMock});
          } else {
            this.$socket.emit('addNewMock', {req: this.selectedRequest.req, newMock: this.newMock});
          }
          this.dialogTableVisible = false;
          this.isEditing = false;
        }
      },
      removeMock () {
        this.$socket.emit('removeMock', {req: this.selectedRequest.req, mock: this.selectedMock});
      },
      editMock () {
        this.newMock = {
          name: this.selectedMock,
          ...this.selectedRequest.respond
        };
        this.isEditing = true;
        this.dialogTableVisible = true;
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .bodyTextArea {
    textarea {
      min-height: 200px!important;
    }
  }
</style>
