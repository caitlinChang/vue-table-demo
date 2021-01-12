<template>
  <div id="table" class="table">
    <div class="table-left">
      <table-component prefixClass='left' :columns="leftColumns" :data="tableData" />
    </div>
    <div class="table-middle">
      <div class="table-middle__content" :style="{'min-width':minWidth + 'px'}">
        <table-component prefixClass='main' :columns="columns" :data="tableData" />
      </div>
    </div>
    <div class="table-right">
      <table-component prefixClass='right' :columns="rightColumns" :data="tableData" />
    </div>
  </div>
</template>

<script>
  import TableComponent from './table-component'
  import { debounce } from './util'
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
        isAnyFixed:false,
        resizeEvent:null,
        tableAutoWidth:1000,
      }
    },
    provide(){
      return {
        table:this
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
        return Math.max(this.columns.length * this.cellMinWidth, this.tableAutoWidth)
      },
      cellMinWidth(){
        // 均分
        let minWidth = 100
        let computedWidth = Math.ceil(this.tableAutoWidth / this.columns.length)
        return Math.max(minWidth,computedWidth)
      }
    },
    created(){
      this.debounceWindowResize = debounce(this.handleWindowResize,150)
    },
    mounted(){
      this.$nextTick(() => {
        this.isAnyFixed = this.leftColumns.length || this.rightColumns.length 
        if(this.isAnyFixed){
          this.handleWindowResize()
          this.resizeEvent = window.addEventListener('resize',this.debounceWindowResize)
        }
      })
    },
    updated(){
      this.$nextTick(() => {
        if(this.isAnyFixed){
          this.handleWindowResize()
          if(!this.resizeEvent){
            this.resizeEvent = window.addEventListener('resize',this.debounceWindowResize)
          }
        }
      })
    },
    methods:{
      handleWindowResize(){
        // 获取table宽度
        const table = document.getElementById('table')
        const width = table.getBoundingClientRect().width
        this.tableAutoWidth = width
        // 异步更新
        this.updateHeadSize()
        this.updateRowSize()
      },
      /**
      * 更新表头
      **/
      updateHeadSize(){
        const headClass = 'main-head__table-head'
        const leftHeadClass = 'left-head__table-head'
        const rightHeadClass = 'right-head__table-head'
        const tableHead = document.getElementsByClassName(headClass)[0]
        const leftHead = document.getElementsByClassName(leftHeadClass)[0]
        const rightHead = document.getElementsByClassName(rightHeadClass)[0]
        let height = tableHead.getBoundingClientRect().height
        leftHead.style.height = height + 'px'
        rightHead.style.height = height + 'px'
      },
      /**
      * 更新表格行
      **/
      updateRowSize(){
        const rows = document.querySelectorAll('.main-body__table-row')
        const leftTableRows = document.querySelectorAll('.left-body__table-row')
        const rightTableRows = document.querySelectorAll('.right-body__table-row')
        const heightObj = new Map()
        Array.prototype.forEach.call(rows,function(row){
          let height = row.getBoundingClientRect().height
          let dataRowKey = row.dataset.rowKey
          heightObj.set(dataRowKey,height)
        })
        let count = 0
        heightObj.forEach((height,rowKey) => {
          leftTableRows[count].setAttribute('data-row-key',rowKey)
          leftTableRows[count].style.height = height + 'px'
          rightTableRows[count].setAttribute('data-row-key',rowKey)
          rightTableRows[count].style.height = height + 'px'
          count ++
        })
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
  /* width:1000px; */
  overflow: scroll;
}
</style>