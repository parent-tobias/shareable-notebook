import { KV } from "./KV";

const db = new KV('svelte-idb', 'gigwidget');


export function makeIndexedDBStore(dbKey, initialValue, crossTab){
  function makeStoreMaker(dbKey, initialValue, crossTab){
    const lsKey = `store-notify: ${dbKey}`;
    let curr = initialValue;
    const subscribers = new Set();
    
    function getCurrentValue(){
      db.get(dbKey).then((v)=>{
        curr = v || [];
        subscribers.forEach((cb)=>cb(curr))
      });
    }

    getCurrentValue();
    
    function storageChanged(event) {
      if(event.storageArea === localStorage && event.key === lsKey) {
        getCurrentValue();
      }
    }
    if(crossTab){
      window.addEventListener("storage", storageChanged, false);
    }

    async function get(){
      return await db.get(dbKey);
    }

    function set(v){
      curr = v;
      subscribers.forEach((cb)=>cb(curr));
      db.set(dbKey, v).then((v)=>{
        if(crossTab){
          const n = +localStorage.getItem(lsKey) || 0;
          localStorage.setItem(lsKey, `${n+1}`)
        }
      });
    }

    function subscribe(subscriber){
      subscriber(curr);
      subscribers.add(subscriber);
      function unsubscribe(){
        subscribers.delete(subscriber)
      }
      return unsubscribe;
    }
    return {get, set, subscribe}
  }
  return makeStoreMaker(dbKey, initialValue, crossTab);
}