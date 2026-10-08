/** Literal local search. No remote service, regex from users, or generated answers. */
export function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}
export function matches(item, { query = '', theme = '', type = '' } = {}) {
  if (theme && item.theme !== theme) return false;
  if (type && item.type !== type) return false;
  const text = normalize(`${item.title} ${item.description || ''} ${item.theme}`);
  return normalize(query).split(/\s+/).filter(Boolean).every(word => text.includes(word));
}
