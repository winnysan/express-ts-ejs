import { effect, reactive } from './reactivity'

const dateEl: HTMLElement | null = document.querySelector('#date')

if (dateEl) dateEl.innerText = new Date().toLocaleDateString()

const one: number = 1
const two: number = 2

console.log(`${one} + ${two} = ${one + two}`)

// Reactivity
let total = reactive({ count: 0 })

const totalEl: HTMLSpanElement | null = document.querySelector('#total')

document.querySelector('#decrease')?.addEventListener('click', () => {
  total.count--
})
document.querySelector('#increase')?.addEventListener('click', () => {
  total.count++
})

effect(() => {
  if (totalEl) {
    totalEl.textContent = String(total.count)
  }
})
