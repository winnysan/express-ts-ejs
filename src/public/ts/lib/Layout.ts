import Helper from './Helper'

/**
 * Navigation
 */

const hamburgerBtnEl = Helper.selectElement<HTMLButtonElement>('#hamburger')
const navigationEl = Helper.selectElement<HTMLUListElement>('.navigation')
const overlayEl = Helper.selectElement<HTMLDivElement>('#overlay')
const dropdownBtnEl = Helper.selectElement<HTMLButtonElement>('.dropdown__button')
const dropdownMenuEl = Helper.selectElement<HTMLUListElement>('.dropdown__menu')
const searchOverlayEl = Helper.selectElement<HTMLButtonElement>('#search-overlay')
const openSearchEl = Helper.selectElement<HTMLButtonElement>('#search-open')
const closeSearchEl = Helper.selectElement<HTMLButtonElement>('#search-close')
const searchInputEl = Helper.selectElement<HTMLInputElement>('#search-input')
const searchBtn = Helper.selectElement<HTMLButtonElement>('#search-button')

/**
 * Mobile menu
 */
hamburgerBtnEl?.addEventListener('click', () => {
  navigationEl?.classList.toggle('active')
  overlayEl?.classList.toggle('active')
})

overlayEl?.addEventListener('click', () => {
  navigationEl?.classList.remove('active')
  overlayEl?.classList.remove('active')
})

/**
 * Dropdown menu
 */
dropdownBtnEl?.addEventListener('click', event => {
  event.stopPropagation()

  dropdownMenuEl?.classList.toggle('active')
  dropdownBtnEl?.classList.toggle('active')
})

document.addEventListener('click', event => {
  const target = event.target as Node

  if (!dropdownBtnEl?.contains(target) && !dropdownBtnEl?.contains(target)) {
    dropdownMenuEl?.classList.remove('active')
  }
})

/**
 * Search
 */

openSearchEl?.addEventListener('click', () => searchOverlayEl?.classList.toggle('active'))

closeSearchEl?.addEventListener('click', () => searchOverlayEl?.classList.remove('active'))

window.addEventListener('keyup', event => {
  if (event.key === 'Escape') searchOverlayEl?.classList.remove('active')
})

searchInputEl?.addEventListener('input', () => {
  if (searchBtn) {
    if (searchInputEl.value.trim() === '') searchBtn.disabled = true
    else searchBtn.disabled = false
  }
})

/**
 * Set year to footer
 */
const dateEl = Helper.selectElement<HTMLSpanElement>('#date')

if (dateEl) dateEl.innerText = new Date().toLocaleDateString()
