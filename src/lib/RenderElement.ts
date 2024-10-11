/**
 * Represents a single HTML element node with optional attributes, children, and inner content.
 */
export interface ElementNode {
  /** The HTML tag name (e.g., 'div', 'input', 'button'). */
  element: string

  /** An object containing key-value pairs of HTML attributes (e.g., { type: 'text', name: 'username' }). */
  attr?: { [key: string]: string }

  /**
   * The children of this element, which can be a single ElementData,
   * an array of ElementData, or a nested array of ElementData.
   */
  children?: ElementData

  /** The inner text or HTML content of the element. */
  content?: string
}

/**
 * Defines the possible types for element data used in rendering HTML.
 * It can be a single ElementNode, an array of ElementNodes, or a nested array of ElementNodes.
 */
export type ElementData = ElementNode | ElementNode[] | ElementNode[][]

/**
 * A class responsible for rendering HTML elements based on a provided ElementData structure.
 */
class RenderElement {
  /** The root element data to be rendered into HTML. */
  private element: ElementData

  /**
   * Creates an instance of RenderElement.
   * @param element - The ElementData object representing the HTML structure to render.
   */
  constructor(element: ElementData) {
    this.element = element
  }

  /**
   * Converts the ElementData into an HTML string.
   * This method is automatically called when the instance is used in a string context.
   * @returns The rendered HTML string.
   */
  public toString(): string {
    return this.renderElement(this.element)
  }

  /**
   * Recursively renders an ElementData object into an HTML string.
   * @param element - The ElementData to render.
   * @returns The rendered HTML string for the given element.
   */
  private renderElement(element: ElementData): string {
    // If the element is an array, recursively render each child and concatenate the results.
    if (Array.isArray(element)) {
      return element.map(e => this.renderElement(e)).join('')
    } else {
      let attrs = ''

      // If the element has attributes, iterate over them and construct the attribute string.
      if (element.attr) {
        for (const attr in element.attr) {
          if (Object.prototype.hasOwnProperty.call(element.attr, attr)) {
            attrs += ` ${attr}="${element.attr[attr]}"`
          }
        }
      }

      let content = ''

      // If the element has children, render them recursively.
      if (element.children) {
        content = this.renderChildren(element.children)
      }
      // If the element has inner content, use it directly.
      else if (element.content) {
        content = element.content
      }

      // Construct and return the complete HTML tag with attributes and content.
      return `<${element.element}${attrs}>${content}</${element.element}>`
    }
  }

  /**
   * Recursively renders the children of an ElementData object into an HTML string.
   * @param children - The children ElementData to render.
   * @returns The concatenated HTML string for all children.
   */
  private renderChildren(children: ElementData): string {
    // If children is an array, recursively render each child and concatenate the results.
    if (Array.isArray(children)) {
      return children.map(child => this.renderChildren(child)).join('')
    } else {
      // If children is a single ElementData object, render it directly.
      return this.renderElement(children)
    }
  }
}

export default RenderElement
