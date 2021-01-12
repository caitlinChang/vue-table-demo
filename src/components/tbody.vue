<template>
  <div>
    <table :class="prefixClass + '__table-body'" border="0">
      <colgroup>
        <col v-for="item in columns" :key="item.key" :style="{'width':table.cellMinWidth + 'px'}" class="table-tbody__col">
      </colgroup>
      <tbody>
         <tr v-for="row in data" :key="row.id" :data-row-key="row.id" :class="prefixClass + '__table-row'">
          <td v-for="item in columns" :key="item.key">
            <span v-if="!item.type">
              {{ row[item.key] }}
            </span>
            <span v-if="item.type === 'selection'">
              <input type="checkbox" />
            </span>
          </td> 
        </tr>
      </tbody>
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
      data:{
        type:Array,
        default:() => []
      },
      prefixClass:{
        type:String,
        default:''
      }
    },
    inject:['table'],
  }
</script>

<style >
.table-tbody__col{
  /* width:100px; */
}
</style>