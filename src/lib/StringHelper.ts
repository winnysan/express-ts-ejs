/**
 * Utility class for string manipulation, including generating diacritics-insensitive regex patterns and slugifying strings.
 */
class StringHelper {
  /**
   * Generates a diacritics-insensitive regular expression string.
   * @param str - The input string that will be converted into a regex pattern.
   * @returns {string} A regex pattern string with diacritics-insensitive characters.
   * @description This method replaces characters with their diacritic variants to create a regex pattern
   * that matches characters with diacritics as well as their base forms. This is useful for making searches
   * insensitive to diacritics.
   *
   * @example
   * const regex = StringHelper.diacriticsInsensitiveRegex('café');
   * // regex will match 'café', 'cafe', 'caffè', etc.
   */
  public static diacriticsInsensitiveRegex(str: string): string {
    return str
      .replace(/a/g, '[aáàäâãåæāăą]')
      .replace(/A/g, '[AÁÀÄÂÃÅÆĀĂĄ]')
      .replace(/e/g, '[eéèëêēĕėę]')
      .replace(/E/g, '[EÉÈËÊĒĔĖĘ]')
      .replace(/i/g, '[iíìïîīĭį]')
      .replace(/I/g, '[IÍÌÏÎĪĬĮ]')
      .replace(/o/g, '[oóòöôõøōŏő]')
      .replace(/O/g, '[OÓÒÖÔÕØŌŎŐ]')
      .replace(/u/g, '[uúùüûūŭů]')
      .replace(/U/g, '[UÚÙÜÛŪŬŮ]')
      .replace(/y/g, '[yýÿỳ]')
      .replace(/Y/g, '[YÝŸỲ]')
      .replace(/c/g, '[cçčć]')
      .replace(/C/g, '[CÇČĆ]')
      .replace(/d/g, '[dďḋ]')
      .replace(/D/g, '[DĎḊ]')
      .replace(/l/g, '[lĺļľł]')
      .replace(/L/g, '[LĹĻĽŁ]')
      .replace(/n/g, '[nñňń]')
      .replace(/N/g, '[NÑŇŃ]')
      .replace(/r/g, '[rřŕ]')
      .replace(/R/g, '[RŘŔ]')
      .replace(/s/g, '[sšś]')
      .replace(/S/g, '[SŠŚ]')
      .replace(/t/g, '[tťṭ]')
      .replace(/T/g, '[TŤṪ]')
      .replace(/z/g, '[zžźż]')
      .replace(/Z/g, '[ZŽŹŻ]')
  }

  /**
   * Slugifies a string, making it URL-friendly.
   * @param str - The input string to be converted into a slug.
   * @returns {string} A URL-friendly slug version of the input string.
   * @description This method converts the input string into a slug by removing diacritics, trimming whitespace,
   * converting to lowercase, and replacing spaces and non-alphanumeric characters with hyphens.
   *
   * @example
   * const slug = StringHelper.slugify('Hello World!');
   * // slug will be 'hello-world'
   */

  public static slugify(str: string): string {
    return String(str)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove non-alphanumeric characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
  }
}

export default StringHelper
