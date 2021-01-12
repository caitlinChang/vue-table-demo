<template>
  <div class="table-body">
    <table-head :prefixClass="prefixClass + '-head'" :columns="columns" />
    <table-body :prefixClass="prefixClass + '-body'" :columns="columns" :data="data" />
  </div>
</template>

<script>
  import TableHead from './thead'
  import TableBody from './tbody'
  export default {
    components:{
      TableHead,
      TableBody
    },
    props:{
      columns:{
        type:Array,
        default:() => []
      },
      data:{
        type:Array,
        default:() => []
      },
      prefixClass:{
        type:String,
        default:''
      }
    },
  }
</script>

<style scoped>
</style>