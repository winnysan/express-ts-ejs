import Helper from './lib/Helper'
import Reactive from './lib/Reactive'

const reactive = new Reactive()

/**
 * Counter
 */
const initialCount = Helper.loadFromLocalStorage<number>('totalCount') || 0

let total = reactive.reactive({ count: initialCount })

const totalEl = Helper.selectElement<HTMLSpanElement>('#total')
const decreaseButton = Helper.selectElement<HTMLButtonElement>('#decrease')
const increaseButton = Helper.selectElement<HTMLButtonElement>('#increase')

decreaseButton?.addEventListener('click', () => {
  total.count--

  Helper.saveToLocalStorage('totalCount', total.count)
})

increaseButton?.addEventListener('click', () => {
  total.count++

  Helper.saveToLocalStorage('totalCount', total.count)
})

/**
 * Registers a reactive effect
 */
reactive.effect(() => {
  if (totalEl) {
    totalEl.textContent = String(total.count)
  }
})
