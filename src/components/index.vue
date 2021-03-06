<template>
  <div class="table-wrapper" id="table" :style="{height:this.height + 'px',overflow:'hidden'}">
      <div class="table-content-wrapper" ref="table-content-wrapper" :style="{height:this.height + 'px'}">
        <div class="table-header-wrapper" :style="{'width':innerTableWidth + 'px'}" >
          <table-head prefixClass="middle" :columns="columns" />
        </div>
        <div class="table-body-wrapper" ref="table-body-wrapper" tabindex="-1" :style="{height:this.height - this.headHeight + 'px','overflow-y':'auto','width':innerTableWidth + 'px'}" @scroll="scrollEvent">
          <div class="table-overlay" :style="{height:5700000 + 'px'}"></div>
          <div class="table-content" ref="content" :style="{transform:`translate3d(0,${offset}px,0)`}">
            <table-body prefixClass="middle" :columns="columns" :data="visibleData" />
          </div>
        </div>
      </div>
      <div class="table-fixed fixed-left">
          <table-head prefixClass="left" :columns="leftColumns" />
          <div class="table-body-wrapper__left" ref="table-body-wrapper__left" :style="{height:this.height - this.headHeight + 'px','overflow-y':'hidden'}">
              <div class="table-overlay" :style="{height:overHeight + 'px'}"></div>
              <div class="table-content" :style="{transform:`translate3d(0,${offset}px,0)`}">
                <table-body prefixClass="left" :columns="leftColumns" :data="visibleData" />
              </div>
          </div>
      </div>
      <div class="table-fixed fixed-right">
            <table-head prefixClass="right" :columns="rightColumns" />
            <div class="table-body-wrapper__right" ref="table-body-wrapper__right" :style="{height:this.height - this.headHeight + 'px','overflow-y':'hidden'}">
              <div class="table-overlay" :style="{height:overHeight + 'px'}"></div>
              <div class="table-content" :style="{transform:`translate3d(0,${offset}px,0)`}">
                <table-body prefixClass="right" :columns="rightColumns" :data="visibleData" />
              </div>
            </div>
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
        debounceWindowResize:null,
        isAnyFixed:false,
        resizeEvent:null,
        innerTableWidth:3000,
        cellMinWidth:100,
        scrollEvent:null,
        scrollBarWidth:0,

        // 虚拟滚动状态
        visibleData:[],
        offset:0,
        cellHeight:57,
        headHeight:34,
        visibleCount:10,
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
      this.debounceWindowResize = debounce(this.handleWindowResize,16)
      this.scrollEvent = debounce(this.handleScroll,16)

    },
    mounted(){
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
      getScrollBarWidth(){
        const oP = document.createElement('p');
        let styles = {
            width: '100px',
            height: '100px',
            overflowY: 'scroll'
        }, i, scrollbarWidth;
        for (i in styles) oP.style[i] = styles[i];
        document.body.appendChild(oP);
        scrollbarWidth = oP.offsetWidth - oP.clientWidth;
        oP.remove();
        return scrollbarWidth;
      },
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
      /** 滚动事件 */
      handleScroll(){
          const scrollTop = this.$refs['table-body-wrapper'].scrollTop
           // 可视区域的
          let start = Math.floor(scrollTop / this.cellHeight)
          // 实际渲染的
          let initialStart = this.getStart(start) // 偏移的量
          // visibleCount 是可视区域显示的数据
          const end = Math.min(start + this.visibleCount + this.bufferNum,this.tableData.length)
          this.offset = this.getOffset(scrollTop,start)
          this.visibleData = this.tableData.slice(initialStart,end)

          window.requestAnimationFrame(() => {
            this.$refs['table-body-wrapper__right'].scrollTop = scrollTop
            this.$refs['table-body-wrapper__left'].scrollTop = scrollTop
          })
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
.middle__table-head,.left__table-head,.right__table-head{
  border-bottom:1px solid #eee;
}
.table-fixed{
  position:absolute;
  top: 0;
  background-color: #fff;
  overflow: hidden;
  z-index: 4;
}
.fixed-right{
  right:0;
  border-left:1px solid #eee;
}
.fixed-left{
  left:0;
  border-right:1px solid #eee;
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
.table-body-wrapper__left,.table-body-wrapper__right,.table-body-wrapper{
  position: relative;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.table-body-wrapper__left::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.table-body-wrapper__right::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.table-body-wrapper::-webkit-scrollbar {
  display: none;
}
/* start */
.table-body-wrapper .table-overlay{
  width:100%;
  z-index: -1;
}
.table-body-wrapper .table-content{
  position: absolute;
  width:100%;
  left: 0;
  top:0;
  z-index: 2;
}
</style>