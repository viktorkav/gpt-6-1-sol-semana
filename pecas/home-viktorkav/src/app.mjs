import { matches } from './search.mjs';

const html = document.documentElement;
const form = document.querySelector('#archive-form');
const query = document.querySelector('#search');
const type = document.querySelector('#type');
const clear = document.querySelector('#clear-search');
const reset = document.querySelector('#reset-filters');
const more = document.querySelector('#load-more');
const empty = document.querySelector('#empty-state');
const count = document.querySelector('#result-count');
const filters = [...document.querySelectorAll('[data-theme]')].filter(x => x.tagName === 'BUTTON');
const entries = [...document.querySelectorAll('.archive-item')].map(element => ({
  element, title: element.dataset.title, description: element.dataset.description,
  theme: element.dataset.theme, type: element.dataset.type
}));
let theme = '', limit = 12, timeout;
function readLocation() {
  const params = new URL(location.href).searchParams;
  query.value = (params.get('q') || '').slice(0, 200);
  theme = filters.some(x => x.dataset.theme === params.get('theme')) ? params.get('theme') : '';
  type.value = [...type.options].some(x => x.value === params.get('type')) ? params.get('type') : '';
  limit = 12;
}
function writeLocation({ push = false, hash } = {}) {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries({ q: query.value.trim(), theme, type: type.value })) {
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
  }
  if (hash !== undefined) url.hash = hash;
  try { history[push ? 'pushState' : 'replaceState'](null, '', url); } catch { /* Local privacy policies may reject history; content still works. */ }
}
readLocation();

function update({ save = true, focusNew = false } = {}) {
  const options = { query: query.value, theme, type: type.value };
  const results = entries.filter(x => matches(x, options));
  const shown = new Set(results.slice(0, limit));
  let firstNew;
  for (const item of entries) {
    const willShow = shown.has(item);
    if (willShow && item.element.hidden) firstNew ||= item.element;
    item.element.hidden = !willShow;
  }
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
  clear.hidden = !query.value;
  reset.hidden = !(query.value || theme || type.value);
  empty.hidden = results.length > 0;
  more.hidden = results.length <= limit;
  count.textContent = results.length ? `${Math.min(limit, results.length)} de ${results.length} ${query.value || theme || type.value ? 'resultados' : 'itens no acervo'}` : 'Nenhum resultado';
  if (save) writeLocation();
  if (focusNew && firstNew) firstNew.focus();
}
function resetAll() {
  clearTimeout(timeout); query.value = ''; type.value = ''; theme = ''; limit = 12; update(); query.focus();
}
function searchNow() { clearTimeout(timeout); limit = 12; update(); }
form.addEventListener('submit', event => { event.preventDefault(); searchNow(); });
query.addEventListener('input', () => { clearTimeout(timeout); timeout = setTimeout(searchNow, 100); });
clear.addEventListener('click', () => { query.value = ''; searchNow(); query.focus(); });
type.addEventListener('change', searchNow);
filters.forEach(button => button.addEventListener('click', () => { theme = button.dataset.theme; searchNow(); }));
reset.addEventListener('click', resetAll);
document.querySelector('#empty-reset').addEventListener('click', resetAll);
more.addEventListener('click', () => { limit += 12; update({ focusNew: true }); });

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function menuState(open, restoreFocus = false) {
  nav.dataset.open = String(open); menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('span').textContent = open ? '−' : '+';
  if (open) nav.querySelector('a').focus();
  if (restoreFocus) menu.focus();
}
menuState(false);
menu.addEventListener('click', () => menuState(menu.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menuState(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') menuState(false, true); });
const small = matchMedia('(max-width: 640px)');
small.addEventListener('change', () => menuState(false));

// Failed media keeps context and a working destination. A fallback is not a screenshot.
for (const img of document.querySelectorAll('.media-frame img')) {
  function fail() {
    img.hidden = true;
    const frame = img.closest('.media-frame');
    if (frame.querySelector('.media-error')) return;
    const label = document.createElement('p');
    label.className = 'media-error';
    label.textContent = 'Imagem indisponível. O conteúdo continua no link abaixo.';
    frame.append(label);
  }
  img.addEventListener('error', fail, { once: true });
  if (img.complete && !img.naturalWidth) fail();
}

const trailButtons = [...document.querySelectorAll('[data-trail]')];
const trailPanels = [...document.querySelectorAll('[data-trail-panel]')];
const trailStatus = document.querySelector('#trail-status');
const scene = document.querySelector('.discovery-scene');
function chooseTrail(id, announce = true) {
  const panel = trailPanels.find(x => x.dataset.trailPanel === id);
  if (!panel) return;
  trailButtons.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.trail === id)));
  trailPanels.forEach(x => { x.hidden = x !== panel; x.classList.remove('changed'); });
  scene.dataset.selectedTrail = id;
  if (announce) {
    // User-triggered response only. CSS disables it for reduced motion.
    panel.classList.add('changed');
    const label = trailButtons.find(x => x.dataset.trail === id).textContent.trim();
    trailStatus.textContent = `${label}: ${panel.querySelector('h2').textContent} Recomendação e próximo destino atualizados.`;
  }
}
trailButtons.forEach(button => button.addEventListener('click', () => chooseTrail(button.dataset.trail)));
document.querySelectorAll('[data-explore-theme]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  clearTimeout(timeout); query.value = ''; type.value = ''; theme = link.dataset.exploreTheme; limit = 12;
  update({ save:false });
  writeLocation({ push:true, hash:'acervo' });
  document.querySelector('#acervo').scrollIntoView({ block:'start' });
  query.focus({ preventScroll:true });
  // Native document scrolling; the href remains useful without JavaScript.
}));
function chooseForTheme() {
  const matching = trailPanels.find(panel => panel.querySelector('[data-explore-theme]').dataset.exploreTheme === theme);
  chooseTrail(matching?.dataset.trailPanel || 'ia', false);
}
window.addEventListener('popstate', () => { readLocation(); update({ save:false }); chooseForTheme(); });
chooseForTheme();
const sceneArt = document.querySelector('.scene-art img');
function sceneArtFail() { document.querySelector('.scene-art').hidden = true; document.querySelector('.scene-art-error').hidden = false; }
sceneArt.addEventListener('error', sceneArtFail, { once:true });
if (sceneArt.complete && !sceneArt.naturalWidth) sceneArtFail();
update({ save: false });
html.classList.add('enhanced');
