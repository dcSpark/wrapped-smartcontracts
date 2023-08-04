import { useState, useEffect } from "react";

function getStorageValue(key: string, defaultValue: unknown) {
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved as string);
  return initial || defaultValue;
}

export const useLocalStorage = (key: string, defaultValue: unknown) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
