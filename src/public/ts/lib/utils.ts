/**
 * Helper function to select an element and cast it to the correct type.
 * @template T - The type of the HTMLElement.
 * @param {string} selector - The CSS selector of the element to select.
 * @returns {T | null} The selected element cast to the correct type, or null if not found.
 */
export function selectElement<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null
}
