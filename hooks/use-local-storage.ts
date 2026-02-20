import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      console.log(
        `[useLocalStorage] Loading "${key}":`,
        item ? JSON.parse(item) : "not found",
      );
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
    setIsInitialized(true);
  }, [key]);

  useEffect(() => {
    if (isInitialized) {
      try {
        console.log(`[useLocalStorage] Saving "${key}":`, storedValue);
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.log(error);
      }
    }
  }, [key, storedValue, isInitialized]);

  return [storedValue, setStoredValue] as const;
}
