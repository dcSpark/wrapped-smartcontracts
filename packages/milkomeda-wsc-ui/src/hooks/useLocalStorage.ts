import * as LocalStorage from "../utils/localstorage";
import { useState, useEffect } from "react";
// export const useLocalStorage = (storageKey: string) => {
//   const [data, setData] = useState(LocalStorage.get(storageKey));
//
//   const add = (item: any) => {
//     const newItems = LocalStorage.add(storageKey, item);
//     setData(newItems);
//   };
//
//   const update = (items: any) => {
//     const newItems = LocalStorage.save(storageKey, items);
//     setData(newItems);
//   };
//
//   const remove = (item: any) => {
//     const newItems = LocalStorage.remove(storageKey, item);
//     setData(newItems);
//   };
//
//   const clear = () => {
//     const newItems = LocalStorage.save(storageKey, []);
//     setData(newItems);
//   };
//
//   return { data, add, remove, update, clear };
// };

function getStorageValue(key, defaultValue) {
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved as string);
  return initial || defaultValue;
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
