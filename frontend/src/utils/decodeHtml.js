/**
 * Decodes HTML entities in a string
 * @param {string} html - The string containing HTML entities
 * @returns {string} The decoded string
 */
export function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}