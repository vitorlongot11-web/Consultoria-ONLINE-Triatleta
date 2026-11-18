(function () {
  var NUMBER = "5531982755775";
  document.documentElement.classList.add("js");

  // WhatsApp links: every element with data-wa opens a chat with a ready message
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.href = "https://wa.me/" + NUMBER + "?text=" + encodeURIComponent(el.getAttribute("data-wa"));
    el.target = "_blank";
    el.rel = "noopener";
  });

  // Nav gets a solid background after scrolling
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 24); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  items.forEach(function (el) { io.observe(el); });
})();
