class ReactiveEffect {
  private activeEffect: (() => void) | null = null
  private dep: Set<() => void> = new Set()

  /**
   * Tracks the currently active effect by adding it to the dependency set.
   */
  track() {
    if (this.activeEffect) {
      this.dep.add(this.activeEffect)
    }
  }

  /**
   * Triggers all effects stored in the dependency set, causing them to re-run.
   */
  trigger() {
    this.dep.forEach(effect => effect())
  }

  /**
   * Registers and immediately runs a reactive effect function.
   * @param {() => void} fn - The effect function to be registered and executed.
   */
  effect(fn: () => void) {
    this.activeEffect = fn
    if (this.activeEffect) this.activeEffect()
    this.activeEffect = null
  }
}

/**
 * Represents a reactive system that allows defining reactive effects.
 *
 * Example usage:
 * ```typescript
 * const reactive = new Reactive();
 * reactive.effect(() => {
 *   // Reactive code here
 * });
 * ```
 */
class Reactive {
  private effectManager: ReactiveEffect

  constructor() {
    this.effectManager = new ReactiveEffect()
  }

  /**
   * Creates a reactive proxy for a given object.
   * @template T
   * @param {T} target - The object to be made reactive.
   * @returns {T} The reactive proxy object.
   */
  reactive<T extends object>(target: T): T {
    const handler: ProxyHandler<T> = {
      /**
       * Intercepts property access on the target object and tracks dependencies.
       * @param {T} target - The target object.
       * @param {string | symbol} key - The property key being accessed.
       * @param {any} receiver - The proxy or object that called the method.
       * @returns {any} The value of the accessed property.
       */
      get: (target: T, key: string | symbol, receiver: any) => {
        const result = Reflect.get(target, key, receiver)
        this.effectManager.track()
        return result
      },
      /**
       * Intercepts property assignments on the target object and triggers updates.
       * @param {T} target - The target object.
       * @param {string | symbol} key - The property key being set.
       * @param {any} value - The new value being assigned.
       * @param {any} receiver - The proxy or object that called the method.
       * @returns {boolean} True if the operation was successful, otherwise false.
       */
      set: (target: T, key: string | symbol, value: any, receiver: any) => {
        const result = Reflect.set(target, key, value, receiver)
        this.effectManager.trigger()
        return result
      },
    }

    return new Proxy(target, handler)
  }

  /**
   * Registers a reactive effect function that automatically re-runs when dependencies change.
   * @param {() => void} fn - The effect function to be registered.
   */
  effect(fn: () => void) {
    this.effectManager.effect(fn)
  }
}

export default Reactive
