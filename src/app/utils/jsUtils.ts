import { fromEvent, throttleTime } from 'rxjs';

export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function saveToLocalStorage(value: any, key: string) {
  const jsonValue = JSON.stringify(value);
  localStorage.setItem(key, jsonValue);
}

export function loadFromLocalStorage<T>(key: string): T | null {
  const storedData = localStorage.getItem(key);
  if (!storedData) return null;
  return JSON.parse(storedData);
}

export function subscribeToWindowResize() {
  return fromEvent(window, 'resize').pipe(
    throttleTime(250) // Throttle to execute at most once every 250ms
  );
}
