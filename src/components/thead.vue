<template>
  <table border="0" :class="prefixClass + '__table-head'" >
    <colgroup>
      <col v-for="item in columns" :style="{'width':(item.width || table.cellMinWidth) + 'px'}" :key="item.key" class="table-tbody__col">
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
  }
</script>

<style>

</style>