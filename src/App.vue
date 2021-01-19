<template>
  <div id="app">
      <table-component :height="height" :columns="columns" :tableData="tableData" />
  </div>
</template>

<script>
import TableComponent from './components/index.vue'
import { columns, tableData } from './data'
export default {
  name: 'App',
  components: {
    TableComponent,
  },
  data(){
    return {
      columns,
      tableData,
      height:800
    }
  },
  mounted(){
    let height = window.innerHeight
    this.height = Math.min(500,height - 160)
  }
}
</script>

<style>
*{
  padding:0;
  margin:0;
}
html,body{
  width:100%;
  height:100%;
  overflow: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  overflow: hidden;
  margin:60px;
  /* margin-top: 60px; */
}
table{
  border-spacing: 0px;
}
th,td{
  /* border:1px solid #eee; */
  border-top:1px solid #eee;
  border-left:1px solid #eee;
  padding:5px 0;
  margin:0;
  font-size:16px;
  font-weight: 400;
}
thead,tbody,table{
  padding:0;
  margin:0;
  font-size:0;
  border:none;
}
</style>