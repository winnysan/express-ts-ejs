import Helper from './Helper'

/**
 * Set year to footer
 */
const dateEl = Helper.selectElement<HTMLSpanElement>('#date')

if (dateEl) dateEl.innerText = new Date().toLocaleDateString()

/**
 * Nav styles on scroll
 */

const scrollHeader = () => {
  const headerEl = Helper.selectElement<HTMLDivElement>('#header')
  if (window.scrollY >= 15) {
    headerEl?.classList.add('activated')
  } else {
    headerEl?.classList.remove('activated')
  }
}

window.addEventListener('scroll', scrollHeader)

/*
 * Open menu
 */

const menuToggleIconEl = Helper.selectElement<HTMLButtonElement>('#menu-toggle-icon')

const toggleMenu = () => {
  const mobileMenuEl = Helper.selectElement<HTMLDivElement>('#menu')
  mobileMenuEl?.classList.toggle('activated')
  menuToggleIconEl?.classList.toggle('activated')
}

menuToggleIconEl?.addEventListener('click', toggleMenu)

/*
 * Open search pop-up
 */

const searchFormOpenBtnEl = Helper.selectElement<HTMLButtonElement>('#search-icon')
const searchFormCloseBtnEl = Helper.selectElement<HTMLButtonElement>('#search-form-close-btn')
const searchFormContainerEl = Helper.selectElement<HTMLDivElement>('#search-form-container')

searchFormOpenBtnEl?.addEventListener('click', () => searchFormContainerEl?.classList.add('activated'))
searchFormCloseBtnEl?.addEventListener('click', () => searchFormContainerEl?.classList.remove('activated'))

window.addEventListener('keyup', event => {
  if (event.key === 'Escape') searchFormContainerEl?.classList.remove('activated')
})
