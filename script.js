(function () {
  "use strict";
  var NUMBER = "5531982755775";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* WhatsApp: todo [data-wa] abre a conversa com mensagem pronta */
  $$("[data-wa]").forEach(function (el) {
    el.href = "https://wa.me/" + NUMBER + "?text=" + encodeURIComponent(el.getAttribute("data-wa"));
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* Navegação sólida ao rolar + barra de zonas (funciona sem GSAP) */
  var nav = $("#nav");
  var segs = $$(".zbar i");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("is-solid", y > 24);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    segs.forEach(function (s, i) {
      s.style.setProperty("--f", Math.min(1, Math.max(0, p * 5 - i)).toFixed(3));
    });
    ticking = false;
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  onScroll();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);

  /* FAQ com altura animada */
  $$("details").forEach(function (d) {
    var sum = $("summary", d), ans = $(".ans", d);
    var anim = null;
    sum.addEventListener("click", function (e) {
      e.preventDefault();
      if (anim) anim.cancel();
      var opening = !d.open;
      if (reduce || !ans.animate) { d.open = opening; return; }
      if (opening) {
        d.open = true;
        var h = ans.offsetHeight;
        anim = ans.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)" });
        anim.onfinish = function () { anim = null; };
      } else {
        var h0 = ans.offsetHeight;
        anim = ans.animate([{ height: h0 + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "cubic-bezier(.4,0,.6,1)" });
        anim.onfinish = function () { d.open = false; anim = null; };
        anim.oncancel = function () { anim = null; };
      }
    });
  });

  function showHero() { root.classList.add("ready"); }

  /* Sem GSAP ou com "reduzir movimento": conteúdo estático e pronto */
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    showHero();
    var mk = $("#marker");
    if (mk) { mk.style.left = "70%"; $("#markerLabel").textContent = "Sua performance"; }
    return;
  }

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  /* Rolagem suave (Lenis) ligada ao ScrollTrigger */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = $(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: id === "#topo" ? 0 : -60 });
      });
    });
  }

  /* Divide texto em palavras e letras (mantém acessibilidade) */
  function splitChars(el) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    var sr = document.createElement("span");
    sr.className = "sr";
    sr.textContent = text;
    el.textContent = "";
    el.appendChild(sr);
    var chars = [];
    text.split(" ").forEach(function (word, i, arr) {
      var w = document.createElement("span");
      w.className = "w";
      w.setAttribute("aria-hidden", "true");
      word.split("").forEach(function (ch) {
        var c = document.createElement("span");
        c.className = "c";
        c.textContent = ch;
        w.appendChild(c);
        chars.push(c);
      });
      el.appendChild(w);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return chars;
  }
  function splitWords(el) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";
    var out = [];
    text.split(" ").forEach(function (word, i, arr) {
      var s = document.createElement("span");
      s.className = "sw";
      s.setAttribute("aria-hidden", "true");
      s.textContent = word;
      el.appendChild(s);
      out.push(s);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return out;
  }

  function init() {
    /* 1. HERO: sequência única de entrada */
    var heroChars = splitChars($('h1[data-split="hero"]'));
    gsap.set(heroChars, { yPercent: 115 });
    showHero();
    var photo = $("#heroPhoto");
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(photo, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "power3.inOut" }, 0)
      .fromTo(photo.querySelector("img"), { scale: 1.25 }, { scale: 1, duration: 1.8 }, 0)
      .to(heroChars, { yPercent: 0, duration: 1.05, stagger: 0.028 }, 0.25)
      .from(".hero__who", { opacity: 0, y: 12, duration: 0.8 }, 0.2)
      .from(".hero__in", { opacity: 0, y: 18, duration: 0.9, stagger: 0.12 }, 1.0);

    /* marcador da zona: sai do conforto (Z2) e chega na performance (Z4) */
    var marker = $("#marker"), mLabel = $("#markerLabel");
    gsap.timeline({ delay: 1.8 })
      .to(marker, { left: "70%", duration: 1.6, ease: "power3.inOut" })
      .call(function () { mLabel.textContent = "Sua performance"; }, null, 0.85);

    /* parallax suave da foto do hero */
    gsap.to(photo.querySelector("img"), { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    /* 2. Títulos de seção: letras sobem em máscara quando entram */
    $$('h2[data-split]').forEach(function (h) {
      var chars = splitChars(h);
      gsap.set(chars, { yPercent: 115 });
      gsap.to(chars, {
        yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.016,
        scrollTrigger: { trigger: h, start: "top 85%", once: true }
      });
    });

    /* 3. Frase do problema acende palavra por palavra com o scroll */
    var st = $("#statement");
    var words = splitWords(st);
    gsap.to(words, {
      opacity: 1, ease: "none", stagger: 0.12,
      scrollTrigger: { trigger: st, start: "top 78%", end: "bottom 52%", scrub: true }
    });
    var lines = $$("#symptoms li");
    gsap.fromTo(lines, { "--l": 0 }, {
      "--l": 1, duration: 0.9, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: "#symptoms", start: "top 82%", once: true }
    });

    /* 4. Riscos desenhados sobre o que não existe */
    gsap.fromTo($$(".strike"), { "--s": 0 }, {
      "--s": 1, duration: 0.8, ease: "power3.inOut", stagger: 0.25,
      scrollTrigger: { trigger: ".duo", start: "top 70%", once: true }
    });

    /* 5. Linha do tempo preenche com o scroll; cada etapa acende */
    var tlEl = $("#timeline"), fill = $("#tlFill");
    gsap.fromTo(fill, { "--p": 0 }, {
      "--p": 1, ease: "none",
      scrollTrigger: { trigger: tlEl, start: "top 60%", end: "bottom 70%", scrub: true }
    });
    $$(".step").forEach(function (s) {
      ScrollTrigger.create({ trigger: s, start: "top 62%", onEnter: function () { s.classList.add("on"); }, onLeaveBack: function () { s.classList.remove("on"); } });
    });

    /* 6. Fotos da equipe: revelação + parallax interno */
    $$(".ph").forEach(function (ph) {
      var img = $("img", ph);
      gsap.fromTo(ph, { clipPath: "inset(0 0 100% 0)" }, {
        clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power3.inOut",
        scrollTrigger: { trigger: ph, start: "top 80%", once: true }
      });
      gsap.fromTo(img, { yPercent: -7 }, {
        yPercent: 7, ease: "none",
        scrollTrigger: { trigger: ph, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    /* 7. Preços contam até o valor */
    $$(".price b[data-to]").forEach(function (b) {
      var to = +b.getAttribute("data-to"), o = { v: 0 };
      ScrollTrigger.create({
        trigger: b, start: "top 88%", once: true,
        onEnter: function () {
          gsap.to(o, { v: to, duration: 1.4, ease: "power2.out", onUpdate: function () { b.textContent = Math.round(o.v); } });
        }
      });
    });

    /* 8. Botões magnéticos (só com mouse) */
    if (fine) {
      $$(".magnetic").forEach(function (btn) {
        var xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
        var yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
        btn.addEventListener("pointermove", function (e) {
          var r = btn.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
        });
        btn.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
      });
    }

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  var started = false;
  function go() { if (started) return; started = true; init(); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(go);
    setTimeout(go, 1800);
  } else { go(); }
})();
