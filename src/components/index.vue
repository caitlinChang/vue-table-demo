<template>
  <div class="table">
    <div class="table-left">
      <table-component prefixClass='left-fixed' :columns="leftColumns" :data="tableData" />
    </div>
    <div class="table-middle">
      <div class="table-middle__content" :style="{'min-width':minWidth + 'px'}">
        <table-component prefixClass='main' :columns="columns" :data="tableData" />
      </div>
    </div>
    <div class="table-right">
      <table-component prefixClass='right-fixed' :columns="rightColumns" :data="tableData" />
    </div>
  </div>
</template>

<script>
  import TableComponent from './table-component'
  export default {
    props:{
      columns:{
        type:Array,
        default:() => []
      },
      tableData:{
        type:Array,
        default:() => []
      }
    },
    components:{
      TableComponent
    },
    data(){
      return {
        isAnyFixed:false
      }
    },
    computed:{
      leftColumns(){
        return this.columns.filter(column => column.fixed === 'left')
      },
      rightColumns(){
        return this.columns.filter(column => column.fixed === 'right')
      },
      minWidth(){
        return this.columns.length * 100
      }
    },
    mounted(){
      this.$nextTick(() => {
        this.isAnyFixed = this.leftColumns.length || this.rightColumns.length 
        if(this.isAnyFixed){
          this.handleWindowResize()

        }
      })
    },
    updated(){

    },
    methods:{
      handleWindowResize(){
        // 异步更新
        // 没有做唯一性处理
        const tableHead = document.getElementsByClassName('table-head')[0]
        const tableRows = 

      }
    }
    
  }
</script>

<style scoped>
.table{
  display:flex;
  position: relative;
}
.table-left{
  position: absolute;
  left:0;
  top:0;
  z-index: 1;
  background: #fff;
}
.table-right{
  position: absolute;
  right:0;
  top:0;
  z-index: 1;
  background: #fff;
}
.table-middle{
  width:1000px;
  overflow: scroll;
}
</style>