/**
 * Slugify string
 * @param string
 * @returns slugigy string
 */
const slugify = (string: string) => {
  return String(string)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default slugify
