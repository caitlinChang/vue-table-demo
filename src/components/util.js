export const debounce = function(fn,delay){
  let timer = null, previous = 0
  const debounced = function(){
    let now = new Date()
    if(now - previous > delay){
      if(timer){
        clearTimeout(timer)
        timer = null
      }
      previous = now
      fn()
    }else if(!timer){
      timer = setTimeout(() => {
        previous = now
        fn()
      }, delay);
    }
  }
  return debounced
}