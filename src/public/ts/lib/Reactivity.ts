import Helper from './Helper'
import Reactive from './Reactive'

/**
 * Class for initializing reactivity within the application.
 */
class Reactivity {
  /**
   * Initializes the reactivity system, sets up counter controls, and registers reactive effects.
   * @description Sets up reactive data bindings for a counter and updates the DOM on changes.
   */
  static initialize(): void {
    const reactive = new Reactive()

    /**
     * Counter initialization
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
     * Register a reactive effect to update the UI when the counter changes.
     * @description Updates the total count in the DOM whenever the count value changes.
     */
    reactive.effect(() => {
      if (totalEl) {
        totalEl.textContent = String(total.count)
      }
    })

    if (window.env === 'development') console.log(window.localization.getLocalizedText('reactivityHasBeenInitialized'))
  }
}

export default Reactivity
