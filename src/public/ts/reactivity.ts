import Reactive from './lib/reactive'
import { loadFromLocalStorage, saveToLocalStorage, selectElement } from './lib/utils'

const reactive = new Reactive()

const initialCount = loadFromLocalStorage<number>('totalCount') || 0

let total = reactive.reactive({ count: initialCount })

const totalEl = selectElement<HTMLSpanElement>('#total')
const decreaseButton = selectElement<HTMLButtonElement>('#decrease')
const increaseButton = selectElement<HTMLButtonElement>('#increase')

decreaseButton?.addEventListener('click', () => {
  total.count--
  saveToLocalStorage('totalCount', total.count)
})
increaseButton?.addEventListener('click', () => {
  total.count++
  saveToLocalStorage('totalCount', total.count)
})

reactive.effect(() => {
  if (totalEl) {
    totalEl.textContent = String(total.count)
  }
})
