<template>
  <div>
    <!--- thead -->
    <table border="0" :class="prefixClass + '__table-head'">
      <colgroup>
        <col v-for="item in columns" :style="{'width':table.cellMinWidth + 'px'}" :key="item.key" class="table-tbody__col">
      </colgroup>
      <tr>
        <th v-for="item in columns" 
        :class="prefixClass + '__table-th'"
        :key="item.key"
        scope="col"
        >
          <span v-if="!item.type">
            {{ item.title }}
          </span>
          <span v-if="item.type === 'selection'">
            <input type="checkbox" />
          </span>
        </th>
      </tr>
    </table>
  </div>
</template>

<script>
  export default {
    props:{
      columns:{
        type:Array,
        default:() => []
      },
      prefixClass:{
        type:String,
        default:''
      },
      isFixedHead:{
        type:Boolean,
        default:true
      }
    },
    inject:['table'],
    computed:{
      fixedHeadStyle(){
        if(this.isFixedHead){
          return {
            // top:0,
            // left:0,
            // background:'#fff',
            // 'z-index':3,
            // 'border-bottom':'1px solid #eee'
          }
        }
        return ''
      }
    },
    data(){
      return {
      }
    },
  }
</script>

<style>

</style>