import Reactive from './lib/reactive'
import { selectElement } from './lib/utils'

const reactive = new Reactive()

let total = reactive.reactive({ count: 0 })

const totalEl = selectElement<HTMLSpanElement>('#total')
const decreaseButton = selectElement<HTMLButtonElement>('#decrease')
const increaseButton = selectElement<HTMLButtonElement>('#increase')

decreaseButton?.addEventListener('click', () => {
  total.count--
})
increaseButton?.addEventListener('click', () => {
  total.count++
})

reactive.effect(() => {
  if (totalEl) {
    totalEl.textContent = String(total.count)
  }
})
