(function(){
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function limita(v){ return Math.max(0, Math.min(1, v)); }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* menu */
  var topo = document.getElementById('topo');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function fecha(){ menu.classList.remove('aberto'); burger.setAttribute('aria-expanded','false'); burger.setAttribute('aria-label','Abrir menu'); document.body.style.overflow=''; }
  burger.addEventListener('click', function(){
    var abre = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abre);
    burger.setAttribute('aria-expanded', abre);
    burger.setAttribute('aria-label', abre ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = abre ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', fecha); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && menu.classList.contains('aberto')) { fecha(); burger.focus(); } });
  window.addEventListener('resize', function(){ if (window.innerWidth > 820) fecha(); });

  /* grânulos de pigmento na ilustração da pele */
  var graos = document.getElementById('graos');
  var lista = [];
  (function cria(){
    var semente = 11;
    function rnd(){ semente = (semente * 9301 + 49297) % 233280; return semente / 233280; }
    var focos = [[.22,.22],[.55,.28],[.8,.2],[.4,.5]];
    for (var i = 0; i < 90; i++) {
      var f = focos[i % focos.length];
      var x = f[0] + (rnd() - .5) * .28, y = f[1] + (rnd() - .5) * .26;
      var t = 4 + rnd() * 9;
      var d = document.createElement('span');
      d.className = 'grao';
      d.style.left = (limita(x) * 100) + '%';
      d.style.top = (limita(y) * 100) + '%';
      d.style.width = d.style.height = t + 'px';
      d.style.opacity = (.45 + rnd() * .5).toFixed(2);
      d.dataset.fica = rnd() < .22 ? '1' : '0';
      d.dataset.op = d.style.opacity;
      graos.appendChild(d); lista.push(d);
    }
  })();
  var peleProg = document.getElementById('peleProg');
  var pele = document.getElementById('pele');
  var maxPele = 0;
  function tratarPele(){
    var r = pele.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduz ? 1 : limita((vh * .85 - r.top) / (vh * .7));
    p = Math.max(p, maxPele);
    if (p === maxPele && p !== 0) return;
    maxPele = p;
    peleProg.style.width = (p * 100) + '%';
    lista.forEach(function(g, i){
      var limiar = (i % 10) / 10 * .8;
      var k = limita((p - limiar) / .25);
      if (g.dataset.fica === '1') {
        g.style.opacity = (g.dataset.op * (1 - k * .55)).toFixed(2);
        g.style.transform = 'scale(' + (1 - k * .3).toFixed(2) + ')';
      } else {
        g.style.opacity = (g.dataset.op * (1 - k)).toFixed(2);
        g.style.transform = 'scale(' + (1 - k * .8).toFixed(2) + ')';
      }
    });
  }

  /* pigmento do título vai clareando */
  var mancha = document.querySelector('.mancha__pig');
  var iniciou = false;
  setTimeout(function(){ iniciou = true; mancha.style.setProperty('--pig', reduz ? .15 : .45); }, reduz ? 0 : 1600);
  function clarearTitulo(){
    if (!iniciou) return;
    var p = limita(window.scrollY / 380);
    mancha.style.setProperty('--pig', (.45 - p * .4).toFixed(2));
  }

  /* reveal + UV */
  var uv = document.querySelector('.uv');
  var uvNum = document.getElementById('uvNum');
  function contaUV(){
    if (reduz) { uvNum.textContent = '11+'; return; }
    var n = 0, it = setInterval(function(){ n++; uvNum.textContent = n; if (n >= 11) { clearInterval(it); uvNum.textContent = '11+'; } }, 150);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(ents){
      ents.forEach(function(e){
        if (!e.isIntersecting) return;
        e.target.classList.add('on');
        if (e.target === uv) contaUV();
        io.unobserve(e.target);
      });
    }, {threshold: .25});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
    io.observe(uv);

    var links = {};
    menu.querySelectorAll('a[href^="#"]').forEach(function(a){ links[a.getAttribute('href').slice(1)] = a; });
    var ioS = new IntersectionObserver(function(ents){
      ents.forEach(function(e){
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function(k){ links[k].classList.remove('ativo'); });
          links[e.target.id].classList.add('ativo');
        }
      });
    }, {rootMargin: '-45% 0px -50% 0px'});
    ['melasma','tratamentos','sobre','duvidas'].forEach(function(id){ var s = document.getElementById(id); if (s) ioS.observe(s); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('on'); });
    uv.classList.add('on'); uvNum.textContent = '11+';
  }

  /* galeria contínua */
  var gal = document.getElementById('galeria');
  Array.prototype.slice.call(gal.children).forEach(function(f){ var c = f.cloneNode(true); c.setAttribute('aria-hidden','true'); c.querySelector('img').alt = ''; gal.appendChild(c); });

  var tic = false;
  function rola(){
    if (tic) return; tic = true;
    requestAnimationFrame(function(){ topo.classList.toggle('rolou', window.scrollY > 10); tratarPele(); clarearTitulo(); tic = false; });
  }
  window.addEventListener('scroll', rola, {passive:true});
  window.addEventListener('resize', rola);
  rola();

  /* ficha -> WhatsApp */
  var f = document.getElementById('ficha');
  var erro = document.getElementById('erro');
  f.nome.addEventListener('input', function(){ f.nome.classList.remove('invalido'); erro.textContent = ''; });
  f.addEventListener('submit', function(e){
    e.preventDefault();
    var nome = f.nome.value.trim();
    if (!nome) { f.nome.classList.add('invalido'); erro.textContent = 'Me conta seu nome para eu saber com quem estou falando.'; f.nome.focus(); return; }
    var qs = Array.prototype.slice.call(f.querySelectorAll('input[name="queixa"]:checked')).map(function(i){ return i.value; });
    var msg = 'Olá, Dra. Vitória! Me chamo ' + nome + ' e gostaria de agendar uma avaliação.';
    if (qs.length) msg += '\nO que mais me incomoda: ' + qs.join(', ') + '.';
    if (f.tempo.value) msg += '\nHá quanto tempo: ' + f.tempo.value.toLowerCase() + '.';
    msg += '\n(Mensagem enviada pelo site)';
    window.open('https://wa.me/558894261990?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();
