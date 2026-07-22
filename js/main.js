/* ============================================================
   LUMA RISE — shared site scripts
   Header scroll state, mobile nav, reveal-on-scroll, contact form
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector(".site-header");
  var overHero = header && header.hasAttribute("data-over-hero");

  function updateHeader() {
    if (!header) return;
    var scrolled = window.scrollY > 24;
    if (scrolled || !overHero || header.classList.contains("menu-open")) {
      header.classList.add("solid");
    } else {
      header.classList.remove("solid");
    }
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".nav-mobile");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.innerHTML = open ? iconClose : iconMenu;
      updateHeader();
    });
  }
  var iconMenu =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
  var iconClose =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

  /* ---------- Reveal on scroll ---------- */
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("revealed"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contact form (Formspree) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var statusEl = document.getElementById("form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    function setStatus(kind, html) {
      if (!statusEl) return;
      statusEl.className = "show " + kind;
      statusEl.innerHTML = html;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var endpoint = form.getAttribute("action") || "";

      if (endpoint.indexOf("YOUR_FORM_ID") !== -1) {
        /* Formspree not configured yet — fall back to visitor's email app */
        var val = function (id) {
          var el = form.querySelector("#" + id);
          return el ? el.value : "";
        };
        var body =
          "Name: " + val("name") +
          "\nEmail: " + val("email") +
          "\nPhone: " + val("phone") +
          "\nClinic/Organization: " + val("org") +
          "\nArea of interest: " + val("interest") +
          "\n\nMessage:\n" + val("message");
        window.location.href =
          "mailto:info@thelumarise.com?subject=" +
          encodeURIComponent("Website enquiry from " + (val("name") || "thelumarise.com")) +
          "&body=" + encodeURIComponent(body);
        setStatus(
          "success",
          'Your email app should open with your enquiry pre-filled. If it does not, email us directly at <a href="mailto:info@thelumarise.com">info@thelumarise.com</a>.'
        );
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (res.ok) {
            setStatus("success", "Thank you — your enquiry has been sent. Our team will reply shortly.");
            form.reset();
          } else {
            setStatus("error", 'Something went wrong. Please email us directly at <a href="mailto:info@thelumarise.com">info@thelumarise.com</a>.');
          }
        })
        .catch(function () {
          setStatus("error", 'Something went wrong. Please email us directly at <a href="mailto:info@thelumarise.com">info@thelumarise.com</a>.');
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
