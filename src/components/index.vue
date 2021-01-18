<template>
  <div class="table-wrapper" id="table" :style="{height:this.height + 'px',overflow:'hidden'}">
      <div class="table-content-wrapper" :style="{height:this.height + 'px'}">
        <div class="table-header-wrapper" :style="{'width':innerTableWidth + 'px'}" >
          <table-head prefixClass="middle" :columns="columns" />
        </div>
        <div class="table-body-wrapper" :style="{height:this.height - this.headHeight + 'px','overflow-y':'auto','width':innerTableWidth + 'px'}" @scroll="handleScroll">
          <div class="table-overlay" :style="{height:overHeight + 'px'}"></div>
          <div class="table-content" :style="{transform:`translate3d(0,${offset}px,0)`}">
            <table-body prefixClass="middle" :columns="columns" :data="visibleData" />
          </div>
        </div>
      </div>
      <div class="table-fixed fixed-left">
          <table-head prefixClass="left" :columns="leftColumns" />
          <table-body prefixClass="left" :columns="leftColumns" :data="visibleData" />
      </div>
      <div class="table-fixed fixed-right">
            <table-head prefixClass="right" :columns="rightColumns" />
            <table-body prefixClass="right" :columns="rightColumns" :data="visibleData" />
      </div>
  </div>
  
</template>

<script>
  import TableHead from './thead'
  import TableBody from './tbody'
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
      TableHead,
      TableBody
    },
    data(){
      return {
        wrapper:null,

        debounceWindowResize:null,
        isAnyFixed:false,
        resizeEvent:null,
        innerTableWidth:3000,
        cellMinWidth:100,
        scrollEvent:null,

        // 虚拟滚动状态
        visibleData:[],
        offset:0,
        cellHeight:57,
        headHeight:34,
        visibleCount:16,
        bufferNum:10,//缓冲数量
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
        return this.tableData.length * this.cellHeight + 'px'
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
      this.wrapper = document.getElementsByClassName('table-body-wrapper')[0]
      this.visibleData = this.tableData.slice(0,this.visibleCount + this.bufferNum) || []
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
        const headClass = 'middle__table-head'
        const leftHeadClass = 'left__table-head'
        const rightHeadClass = 'right__table-head'
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
        // 1. 这里可以通过startIndex来取缓存，而不需要获取DOM
        const rows = document.querySelectorAll('.middle__table-row')
        const leftTableRows = document.querySelectorAll('.left__table-row')
        const rightTableRows = document.querySelectorAll('.right__table-row')
        const heightObj = new Map()
        Array.prototype.forEach.call(rows,function(row){
          let dataRowKey = row.dataset.rowKey
          let height = row.clientHeight
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
      updateScrollList(top){
        const leftBody = document.getElementsByClassName('left__table-body')[0]
        const rightBody = document.getElementsByClassName('right__table-body')[0]
        leftBody.style.bottom = top + 'px'
        rightBody.style.bottom = top + 'px'
      },
      /** 滚动事件 */
      handleScroll(){
        if(!this.wrapper){
          this.wrapper = document.getElementsByClassName('table-body-wrapper')[0]
        }
        let scrollTop = this.wrapper.scrollTop
        // this.updateScrollList(scrollTop)
        scrollTop = Math.max(scrollTop, 0)
        // 可视区域的
        let start = Math.floor(scrollTop / this.cellHeight)
        // 实际渲染的
        let initialStart = this.getStart(start) // 偏移的量
        // visibleCount 是可视区域显示的数据
        const end = Math.min(start + this.visibleCount + this.bufferNum,this.tableData.length)
        this.offset = this.getOffset(scrollTop,start)
        this.visibleData = this.tableData.slice(initialStart,end)
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
@import url('./style/virtual-scroll.css');
.table-wrapper{
  border:1px solid #eee;
  overflow: hidden;
  position: relative;
}
.table-fixed{
  position:absolute;
  top: 0;
  background-color: #fff;
  overflow: hidden;
}
.fixed-right{
  right:0;
}
.fixed-left{
  left:0;
}
.table-header-wrapper{
  position: relative;
}
.table-content-wrapper{
  width:100%;
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
}
.left__table-body,.right__table-body{
  position: relative;
}
</style>