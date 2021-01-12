<template>
  <div>
    <!--- thead -->
    <table border="0" :class="prefixClass + '__table-head'">
      <colgroup>
        <col class="table-tbody__col">
        <col v-for="item in columns" :key="item.key" class="table-tbody__col">
        <col class="table-tbody__col">
      </colgroup>
      <tr>
        <th v-for="item in columns" 
        class="table-head__title" 
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
    data(){
      return {
      }
    }
  }
</script>

<style scoped>
.table-tbody__col{
  width:100px;
}
</style>