<template>
  <div>
    <el-dialog @close="onClose" title="New Mock" :visible.sync="visibility">
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
      <div class="botheditor">
        <el-input
          class="bodyTextArea"
          type="textarea"
          placeholder="body"
          v-model="newMock.body">
        </el-input>
        <JsonEditor is-edit="true" @input="(t) => newMock.body = JSON.stringify(t)" :value="strmockbody" ></JsonEditor>
      </div>
      <h3>
        <small>{{newMockError}}</small>
      </h3>
      <el-button type="success" v-on:click="saveNewMock">Save</el-button>
    </el-dialog>
  </div>
</template>

<script>

  export default {
    props:{
      mock: Object,
      visibility: Boolean
    },
    name: 'NewMockModal',
    components: {},
    computed: {
      strmockbody() {
        try {
          return JSON.parse(this.newMock.body);
        } catch(e) {
          return {};
        }
      },
      selectedRequest() {
        return this.$store.getters.selectedRequest;
      },
      mocks() {
        return this.$store.getters.getMocks;
      },
    },
    created () {
      if (this.mock) {
        this.isEditing = true;
        this.newMock = this.mock || this.initMockData();
      }
    },
    data () {
      return {
        httpStatus: [200, 403, 400, 503],
        newMock: this.initMockData(),
        newMockError: '',
        isEditing: false,
      }
    },
    methods: {
      onClose() {
        this.$emit('close');
      },
      initMockData() {
        return {
          statusCode: 200,
          name: '',
          body: '',
          headers: '',
        }
      },
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
          this.newMock = this.initMockData();
          this.isEditing = false;
          this.$emit('saved');
        }

      },
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
  .botheditor{
    display: flex;
    border: 1px solid silver;
    > *{
      width:50%;
    }
  }
</style>

