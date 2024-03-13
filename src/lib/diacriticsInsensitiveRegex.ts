/**
 * Diacritics insensitive regular expression
 * @param string
 * @returns regex string
 */
const diacriticsInsensitiveRegex = (string: string): string => {
  return string
    .replace(/a/g, '[a,á,à,ä,â]')
    .replace(/A/g, '[A,a,á,à,ä,â]')
    .replace(/e/g, '[e,é,ë,è]')
    .replace(/E/g, '[E,e,é,ë,è]')
    .replace(/i/g, '[i,í,ï,ì]')
    .replace(/I/g, '[I,i,í,ï,ì]')
    .replace(/o/g, '[o,ó,ö,ò]')
    .replace(/O/g, '[O,o,ó,ö,ò]')
    .replace(/u/g, '[u,ü,ú,ù]')
    .replace(/U/g, '[U,u,ü,ú,ù]')
    .replace(/y/g, '[y,ý]')
    .replace(/Y/g, '[Y,ý]')
    .replace(/c/g, '[c,č]')
    .replace(/C/g, '[C,č]')
    .replace(/d/g, '[d,ď]')
    .replace(/D/g, '[D,ď]')
    .replace(/l/g, '[l,ĺ,ľ]')
    .replace(/L/g, '[L,ĺ,ľ]')
    .replace(/n/g, '[n,ň]')
    .replace(/N/g, '[N,ň]')
    .replace(/r/g, '[r,ř]')
    .replace(/R/g, '[R,ř]')
    .replace(/s/g, '[s,š]')
    .replace(/S/g, '[S,š]')
    .replace(/t/g, '[t,ť]')
    .replace(/T/g, '[T,ť]')
    .replace(/z/g, '[z,ž]')
    .replace(/Z/g, '[Z,ž]')
}

export default diacriticsInsensitiveRegex
