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
      }
    },
    inject:['table'],
    data(){
      return {
      }
    },
    watch:{
      'table.cellMinWidth':{
        handler(val){
          console.log('val =', val)
        },
        immediate:true,
      }
    },
  }
</script>

<style>

</style>