<template>
  <div class="table-wrapper" :style="{height:this.height + 'px',overflow:'scroll'}" @scroll="scrollEvent">
    <div class="table-overlay" ref="table-overlay" :style="{height:overHeight}" ></div>
    <div class="table-content" ref="table-content" :style="{transform:`translate3d(0,${offset}px,0)`}">
      <div id="table" class="table">
        <div class="table-left">
          <table-component prefixClass='left' :columns="leftColumns" :data="visibleData" />
        </div>
        <div class="table-middle">
          <div class="table-middle__content" :style="{'width':innerTableWidth + 'px'}">
            <table-component prefixClass='main' :columns="columns" :data="visibleData" />
          </div>
        </div>
        <div class="table-right">
          <table-component prefixClass='right' :columns="rightColumns" :data="visibleData" />
        </div>
      </div>
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
      },
      height:{
        type:[Number,String],
        default:'auto'
      },
      // 是否启用虚拟滚动
      isVirtualScroll:{
        type:Boolean,
        default:false
      }
    },
    components:{
      TableComponent
    },
    data(){
      return {
        wrapper:null,

        debounceWindowResize:null,
        isAnyFixed:false,
        resizeEvent:null,
        innerTableWidth:1000,
        cellMinWidth:100,
        scrollEvent:null,

        // 虚拟滚动状态
        visibleData:[],
        offset:0,
        cellHeight:57,
        headHeight:34,
        bufferNum:20,//缓冲数量
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
      /** 占位框的高度 */
      overHeight(){
        return this.tableData.length * this.cellHeight + this.headHeight + 'px'
      },
      /** 用户自定义宽度之和 */
      sumCustomWidth(){
        return this.columns.reduce((prev,cur) => {
          return prev + (cur.width || 0)
        },0)
      },
      /** 非用户自定义宽度的列数 数量 */
      num(){
        return (this.columns.filter(item => item.width === undefined) || []).length
      }
    },
    created(){
      this.debounceWindowResize = debounce(this.handleWindowResize,150)
      this.scrollEvent = debounce(this.handleScroll,16)
    },
    mounted(){
      this.wrapper = document.getElementsByClassName('table-wrapper')[0]
      this.visibleData = this.tableData.slice(0,10 + this.bufferNum) || []
      this.setSize()
      this.$nextTick(() => {
        this.isAnyFixed = this.leftColumns.length || this.rightColumns.length 
        if(this.isAnyFixed){
          this.handleWindowResize()
          this.resizeEvent = window.addEventListener('resize',this.debounceWindowResize)
        }else{
          this.resizeEvent = window.addEventListener('resize',debounce(this.setSize,16))
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
        }else{
          this.setSize()
          this.resizeEvent = window.addEventListener('resize',debounce(this.setSize,16))
        }
      })
    },
    methods:{
      /** resize 事件 */
      handleWindowResize(){
        // 获取table宽度
        this.setSize()
        // 异步更新
        this.updateHeadSize()
        this.updateRowSize()
      },
      setSize(){
        const table = document.getElementById('table')
        let width = table.getBoundingClientRect().width
        let computedWidth = (this.cellMinWidth * this.num) + this.sumCustomWidth
        if(width > computedWidth){
          this.innerTableWidth = width 
          this.$nextTick(() => {
            this.cellMinWidth = Math.ceil((width - this.sumCustomWidth)/ this.num)
          })
        }else{
          this.$nextTick(() => {
            this.innerTableWidth = (this.cellMinWidth * this.num) + this.sumCustomWidth
          })
        }
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
      },
      /**
      * 虚拟滚动更新列表
      **/
      updateScrollList(){

      },
      /** 滚动事件 */
      handleScroll(){
        if(!this.wrapper){
          this.wrapper = document.getElementsByClassName('table-wrapper')[0]
        }
        let scrollTop = this.wrapper.scrollTop
        if(scrollTop <= this.headHeight){
          this.offset = 0
        }else{
          scrollTop = Math.max(scrollTop - this.headHeight, 0)
          // 可视区域的
          let start = Math.floor(scrollTop / this.cellHeight)
          // 实际渲染的
          let initialStart = this.getStart(start) // 偏移的量
          // 10 是可视区域显示的数据
          const end = Math.min(start + 10 + this.bufferNum,this.tableData.length)
          this.offset = this.getOffset(scrollTop,start)
          this.visibleData = this.tableData.slice(initialStart,end)
        }
      },
      getStart(start){
        if(start < this.bufferNum) return 0
        return start - this.bufferNum
      },
      getOffset(scrollTop,start){
        if(start < this.bufferNum){
          return 0
        }else{
          return scrollTop - (scrollTop % this.cellHeight) - (this.bufferNum * this.cellHeight)
        }
      }
    }
    
  }
</script>

<style>
.table-wrapper{
  border:1px solid #eee;
  overflow-y: scroll;
  overflow-x:hidden;
  position: relative;
}
.table-overlay{
  width:100%;
  position: absolute;
  z-index: -1;
}
.table-content{
  position: absolute;
  width:100%;
  left:0;
  right:0;
  z-index:2;
  overflow: hidden;
}
.table{
  position: relative;
  display: flex;
  overflow: hidden;
  z-index:2;
}
.table-left{
  position: absolute;
  left:0;
  top:0;
  z-index: 3;
  background: #fff;
}
.table-right{
  position: absolute;
  right:0;
  top:0;
  z-index: 3;
  background: #fff;
}
.table-middle{
  width:100%;
  overflow-x: scroll;
}
</style>