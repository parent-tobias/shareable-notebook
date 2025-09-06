const Observable = (initialValue) => {
  let value = initialValue;
  let subscribers = [];
  const subscribe = (fn)=>{
    subscribers = [...subscribers, fn];
    return function(){
      subscribers = subscribers.filter((func)=>func!==fn)
    }
  }
  return {
    get value(){ return value; },
    set value(val){
      const oldValue = value;
      value = val;
      subscribers.forEach((subscriber) => subscriber(value, oldValue));
    },
    subscribe,
  }
}

export default Observable;