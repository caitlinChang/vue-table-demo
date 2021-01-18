/** 节流函数 */
export const debounce = function(fn,delay){
  let timer = null, previous = 0
  const debounced = function(){
    let now = new Date(),self = this, args = arguments
    if(now - previous > delay){
      if(timer){
        clearTimeout(timer)
        timer = null
      }
      previous = now
      fn.apply(self,args)
    }else if(!timer){
      timer = setTimeout(() => {
        previous = now
        fn.apply(self,args)
      }, delay);
    }
  }
  return debounced
}
/** 列表项高度缓存 */
export const _cache = {}