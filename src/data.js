export const columns = [
  { type:'selection', fixed:'left' },
  { key:'creator', title:'创建人'},
  { key:'createTime', title:'创建时间' },
  { key:'location', title:'地点' },
  { key:'comment', title:'评论' },
  { key:'remark', title:'备注' },
  { key:'level', title:'评级' },
  { key:'type', title:'类型' },
  { key:'title1', title:'title1' },
  { key:'title2', title:'title2' },
  { key:'title3', title:'title3' },
  { key:'title4', title:'title4' },
  { key:'title5', title:'title5' },
  { key:'title6', title:'title6' },
  { key:'title7', title:'title7' },
  { key:'title8', title:'title8' },
  { key:'rightFixed', title:'操作', fixed:'right'}
]

const data = { id:0,creator:'lily',createTime:'2020/01/10',location:'深圳市福田区创意园',comment:'暂无评论',remark:'暂无备注',level:'A级',type:'人文科学',title1:'title1',title2:'title2',title3:'title3',title4:'title4',title5:'title5',title6:'title6',title7:'title7',title8:'title8',rightFixed:'查看' }

// 十万条数据
let totalData = []
for(let i=0;i<30;i++){
  const obj = {...data}
  obj.id = i
  totalData.push(obj)
}

export const tableData = totalData

