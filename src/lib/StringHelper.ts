class StringHelper {
  /**
   * Generates a diacritics-insensitive regular expression string.
   * @param str - The input string.
   * @returns A regex string with diacritics-insensitive characters.
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
   * Slugifies a string by removing diacritics and converting to a URL-friendly format.
   * @param str - The input string.
   * @returns A slugified string.
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
