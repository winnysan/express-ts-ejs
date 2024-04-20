const dateEl: HTMLElement | null = document.querySelector('#date')

if (dateEl) dateEl.innerText = new Date().toLocaleDateString()

const one: number = 1
const two: number = 2

console.log(`${one} + ${two} = ${one + two}`)
