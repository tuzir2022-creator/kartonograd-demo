(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* выбор шрифта заголовков (для согласования) */
  function setFont(f) {
    root.setAttribute('data-hfont', f);
    $$('.fontbar button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.font === f)); });
    try { localStorage.setItem('kg-hfont', f); } catch (e) {}
  }
  $$('.fontbar button').forEach(function (b) { b.addEventListener('click', function () { setFont(b.dataset.font); }); });
  try { var saved = localStorage.getItem('kg-hfont'); if (saved) setFont(saved); } catch (e) {}

  /* полоса «Подарок к Новому году» */
  $('#ny-close').addEventListener('click', function () { $('#ny-strip').hidden = true; });

  /* меню на телефоне */
  var burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });

  /* вкладки коллекции */
  var figs = $('#figs');
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      $$('.tab').forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
      var f = t.dataset.f;
      figs.classList.toggle('filtered', f !== 'all');
      $$('.fig', figs).forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.c.split(' ').indexOf(f) > -1); });
    });
  });

  /* корзина (демо: настоящую подключит заказчик в Тильде) */
  var cart = [], discount = 0, dlg = $('#cart');
  var fmt = function (n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; };
  function render() {
    var sum = cart.reduce(function (s, i) { return s + i.price; }, 0);
    var c = $('#cart-count'); c.textContent = cart.length; c.dataset.n = cart.length;
    var list = $('#cart-list');
    list.innerHTML = cart.length ? '' : '<li class="muted">Пока пусто</li>';
    cart.forEach(function (i) { var li = document.createElement('li'); li.innerHTML = '<span></span><span></span>'; li.children[0].textContent = 'Набор «' + i.name + '»'; li.children[1].textContent = fmt(i.price); list.appendChild(li); });
    $('#cart-sum').textContent = fmt(Math.round(sum * (1 - discount)));
  }
  var toastT;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  $$('.add').forEach(function (b) {
    b.addEventListener('click', function () { cart.push({ name: b.dataset.name, price: +b.dataset.price }); render(); toast('Добавлено: «' + b.dataset.name + '»'); });
  });
  $('#cart-open').addEventListener('click', function () { if (dlg.showModal) dlg.showModal(); });
  $('#promo-btn').addEventListener('click', function () { toast('Промокоды подключит заказчик в Тильде'); });
  render();

  /* закреплённая кнопка на телефоне: после первого экрана, скрыта в блоке наборов */
  var sticky = $('#sticky'), pastHero = false, inSets = false;
  function upd() { sticky.classList.toggle('on', pastHero && !inSets); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; upd(); }).observe($('.hero'));
    new IntersectionObserver(function (e) { inSets = e[0].isIntersecting; upd(); }, { threshold: 0.15 }).observe($('#sets'));
  }

  /* неразрывный пробел после коротких слов */
  (function () {
    var re = /(^|[\s(«])([А-Яа-яЁёA-Za-z]{1,3}|[–-]) /g;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentNode.nodeName; return (p === 'SCRIPT' || p === 'STYLE' || !n.nodeValue.trim()) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) { var v = n.nodeValue, o; do { o = v; v = v.replace(re, '$1$2 '); } while (v !== o); n.nodeValue = v; });
  })();

  /* плавное появление блоков */
  var items = $$('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { threshold: 0.1 });
  items.forEach(function (el) { io.observe(el); });
  setTimeout(function () { items.forEach(function (el) { el.classList.add('is-in'); }); }, 2500);
})();
