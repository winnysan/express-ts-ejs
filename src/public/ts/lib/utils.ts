/**
 * Helper function to select an element and cast it to the correct type.
 * @template T - The type of the HTMLElement.
 * @param {string} selector - The CSS selector of the element to select.
 * @returns {T | null} The selected element cast to the correct type, or null if not found.
 */
export function selectElement<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null
}

/**
 * Saves a value to localStorage.
 *
 * @param {string} key - The key under which the value will be stored in localStorage.
 * @param {any} value - The value to be stored. Can be any type that can be serialized to JSON.
 *
 * @example
 * saveToLocalStorage('user', { name: 'Alice', age: 30 });
 */
export function saveToLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * Loads a value from localStorage.
 *
 * @param {string} key - The key under which the value is stored in localStorage.
 * @returns {T | undefined} The loaded value of type T, or undefined if the value does not exist.
 *
 * @template T - The type of the value being loaded from localStorage.
 *
 * @example
 * const user = loadFromLocalStorage<{ name: string, age: number }>('user');
 * console.log(user?.name); // Logs the user's name if the value exists
 */
export function loadFromLocalStorage<T>(key: string): T | undefined {
  const storedValue = localStorage.getItem(key)
  return storedValue ? JSON.parse(storedValue) : undefined
}
