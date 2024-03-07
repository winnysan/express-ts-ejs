const greetingEl: HTMLElement | null = document.querySelector('#greeting')

if (greetingEl) greetingEl.innerText = 'Hello'

const one: number = 1
const two: number = 2

console.log(`${one} + ${two} = ${one + two}`)
