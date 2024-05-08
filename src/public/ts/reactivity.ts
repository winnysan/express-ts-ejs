// @ts-nocheck
let activeEffect = null
let dep = new Set()

// Observer pattern

// Register effects to the "deps" (Set)
function track() {
  if (activeEffect) {
    dep.add(activeEffect)
  }
}

// Exexute all the effects
function trigger() {
  dep.forEach(effect => effect())
}

function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      track()
      return result
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      trigger()
      return result
    },
  }

  return new Proxy(target, handler)
}

// Watcher
function effect(fn) {
  activeEffect = fn
  if (activeEffect) activeEffect()
  activeEffect = null
}

export { effect, reactive }
