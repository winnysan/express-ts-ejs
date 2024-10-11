import { IconData, icons } from '../assets/icons'

/**
 * Interface representing options for configuring an icon.
 */
interface IconOptions {
  /** The size of the icon in rem units. */
  size?: number
  /** The color of the icon. Uses 'currentColor' by default. */
  color?: string
  /** The stroke width of the icon. */
  stroke?: number
}

/**
 * Class representing an SVG icon.
 */
class Icon {
  private size: number
  private color: string
  private stroke: number
  private name: string

  /**
   * Creates an instance of an Icon.
   * @param {string} name - The name of the icon.
   * @param {IconOptions} [options] - Optional configuration for the icon.
   */
  constructor(name: string, options?: IconOptions) {
    this.name = name
    this.size = options?.size || 1
    this.color = options?.color || 'currentColor'
    this.stroke = options?.stroke || 1
  }

  /**
   * Retrieves the icon data for the specified icon name.
   * @private
   * @returns {IconData | undefined} - The data for the icon or undefined if not found.
   */
  private getIconData(): IconData | undefined {
    return icons.find(icon => icon.name === this.name)
  }

  /**
   * Converts the icon data into an SVG string.
   * @public
   * @returns {string} - The SVG representation of the icon.
   * @throws {Error} - Throws an error if the icon data is not found.
   */
  public toSVG(): string {
    const iconData = this.getIconData()

    if (!iconData) {
      throw new Error(`Icon with name "${this.name}" not found.`)
    }

    const { attributes, vectors } = iconData

    const svgAttributes: { [key: string]: string | undefined } = {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: this.color !== 'none' ? this.color : undefined,
      stroke: this.color !== 'none' ? this.color : undefined,
      'stroke-width': this.stroke.toString(),
      style: `width: ${this.size}rem; height: ${this.size}rem;`,
      ...attributes,
    }

    // Filters out undefined values.
    const attrsString = Object.entries(svgAttributes)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')

    const vectorsString = vectors.join('\n')

    return `<svg ${attrsString}>
      ${vectorsString}
    </svg>`
  }
}

export default Icon
