import Helper from './Helper'

/**
 * Carousel class for managing a responsive image carousel.
 */
class Carousel {
  private el: HTMLDivElement | null = null
  private items: HTMLCollectionOf<HTMLElement> = {} as HTMLCollectionOf<HTMLElement>
  private nav: HTMLCollectionOf<HTMLElement> = {} as HTMLCollectionOf<HTMLElement>
  private mobile: number = 640
  private size: number = 1
  private gap: number = 24
  private width: number = 0
  private startX: number = 0
  private endX: number = 0

  /**
   * Creates an instance of Carousel.
   * @param {string} carouselId - The ID of the carousel element.
   * @param {number} [size=1] - The number of items to display in the carousel.
   */
  constructor(carouselId: string, size: number = 1) {
    this.el = Helper.selectElement<HTMLDivElement>(carouselId)
    this.size = size
    this.items = this.el?.getElementsByClassName('carousel-item') as HTMLCollectionOf<HTMLElement>
    this.nav = this.el?.parentElement?.getElementsByClassName('carousel-nav') as HTMLCollectionOf<HTMLElement>

    if (this.el && this.items.length > 0 && this.nav.length > 0) {
      this.initialize()
    }
  }

  /**
   * Initializes the carousel, setting the minimum number of items, width, and event listeners.
   * @private
   */
  private initialize() {
    this.setMinItems()

    this.size = window.innerWidth > this.mobile ? this.size : 1

    this.width = this.getSize()

    window.onload = () => {
      this.el!.style.height = this.items[0].clientHeight + 'px'

      const imgHeight = this.items[0].querySelector('img')?.height

      if (imgHeight) {
        for (let i = 0; i < this.nav.length; i++) {
          const navHeight = this.nav[i].clientHeight
          const topPosition = imgHeight / 2 - navHeight / 2

          this.nav[i].style.top = `${topPosition}px`
        }
      }
    }

    this.clone('prev')
    this.build()

    for (let i = 0; i < this.nav.length; i++) {
      this.nav[i].addEventListener('click', () => this.move(this.nav[i]))
    }

    this.addTouchEvents()

    console.log('Carousel has been initialized')
  }

  /**
   * Sets minimum items in the carousel by cloning existing items if necessary.
   * @private
   */
  private setMinItems() {
    const minItems = this.size + 2

    if (this.items.length < minItems) {
      let itemLength = this.items.length

      for (let i: number = 0; i < itemLength; i++) {
        let clone = this.items[i].cloneNode(true)
        this.el!.append(clone)
      }
    }

    if (this.items.length < minItems) {
      this.setMinItems()
    }
  }

  /**
   * Calculates the width of each item in the carousel based on the container size and number of items.
   * @returns {number} - The calculated width of each item.
   * @private
   */
  private getSize(): number {
    let width = this.el!.clientWidth

    if (this.size > 1) {
      let diff = this.gap / (this.size / (this.size - 1))
      return width / this.size - diff
    } else {
      return width / this.size
    }
  }

  /**
   * Builds the layout of the carousel items, positioning them accordingly.
   * @private
   */
  private build() {
    let left = this.width * -1
    for (let i: number = 0; i < this.items.length; i++) {
      this.items[i].style.width = this.width + 'px'
      this.items[i].style.left = left + 'px'
      left = left + this.width
      if (i > 0) {
        left = left + this.gap
      }
    }
  }

  /**
   * Clones an item in the carousel in the specified direction (next or prev).
   * @param {string} direction - The direction to clone the item ('next' or 'prev').
   * @private
   */
  private clone(direction: string = 'next') {
    let item: HTMLElement | null = null

    if (direction === 'next') {
      item = this.items[0]
    } else if (direction === 'prev') {
      item = this.items[this.items.length - 1]
    }

    if (item) {
      let clone = item.cloneNode(true)

      if (direction === 'next') {
        this.el!.append(clone)
      } else if (direction === 'prev') {
        this.el!.prepend(clone)
      }

      item.remove()
    }
  }

  /**
   * Moves the carousel in the specified direction based on the clicked navigation element.
   * @param {HTMLElement} element - The clicked navigation element.
   * @private
   */
  private move(element: HTMLElement) {
    let direction = element.getAttribute('data-dir')

    if (direction === 'next') {
      this.next()
    } else if (direction === 'prev') {
      this.prev()
    }
  }

  /**
   * Moves the carousel to the next item by cloning the next item and rebuilding the layout.
   * @private
   */
  private next() {
    this.clone('next')
    this.build()
  }

  /**
   * Moves the carousel to the previous item by cloning the previous item and rebuilding the layout.
   * @private
   */
  private prev() {
    this.clone('prev')
    this.build()
  }

  /**
   * Adds touch event listeners for swipe functionality on the carousel.
   * @private
   */
  private addTouchEvents() {
    if (this.el) {
      this.el.addEventListener('touchstart', event => this.handleTouchStart(event))
      this.el.addEventListener('touchend', event => this.handleTouchEnd(event))
    }
  }

  /**
   * Handles the touch start event by recording the starting position of the touch.
   * @param {TouchEvent} event - The touch start event.
   * @private
   */
  private handleTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX
  }

  /**
   * Handles the touch end event by recording the ending position of the touch and evaluating the swipe direction.
   * @param {TouchEvent} event - The touch end event.
   * @private
   */
  private handleTouchEnd(event: TouchEvent) {
    this.endX = event.changedTouches[0].clientX
    this.handleSwipe()
  }

  /**
   * Evaluates the swipe direction and triggers the next or previous item based on the swipe.
   * @private
   */
  private handleSwipe() {
    if (this.startX > this.endX + 50) {
      this.next()
    } else if (this.startX < this.endX - 50) {
      this.prev()
    }
  }
}

export default Carousel
