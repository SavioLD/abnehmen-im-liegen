/* =============================================================
   Abnehmen im Liegen · Rottweil — Interaktion
============================================================= */
(function () {
  "use strict";

  /* Jahr im Footer */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Mobile-Menü */
  var burger = document.getElementById("burger");
  var mobile = document.getElementById("topbarMobile");
  if (burger && mobile) {
    burger.addEventListener("click", function () {
      var open = mobile.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobile.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================================================
     Mehrstufiges Vorqualifizierungs-Formular
  ========================================================= */
  var form = document.getElementById("leadForm");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll(".fstep"));
  var bars = Array.prototype.slice.call(document.querySelectorAll(".form-progress span"));
  var btnNext = document.getElementById("btnNext");
  var btnBack = document.getElementById("btnBack");
  var errBox = document.getElementById("formErr");
  var current = 0;

  function showStep(i, scroll) {
    steps.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); });
    bars.forEach(function (b, idx) {
      b.classList.toggle("is-active", idx === i);
      b.classList.toggle("is-done", idx < i);
    });
    btnBack.style.visibility = i === 0 ? "hidden" : "visible";
    var last = i === steps.length - 1;
    btnNext.querySelector("span").textContent = last ? "Jetzt kostenlos sichern" : "Weiter";
    if (errBox) errBox.classList.remove("is-show");
    current = i;
    // Beim Schrittwechsel sanft an den Formular-Anfang scrollen (nicht beim ersten Laden)
    if (scroll) {
      var top = form.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  function validateStep(i) {
    var step = steps[i];
    // Pflicht: mindestens eine Auswahl in Radio/Checkbox-Gruppen, die als required markiert sind
    var groups = step.querySelectorAll("[data-required-group]");
    for (var g = 0; g < groups.length; g++) {
      var name = groups[g].getAttribute("data-required-group");
      var checked = step.querySelectorAll('input[name="' + name + '"]:checked').length;
      if (checked === 0) return "Bitte triff mindestens eine Auswahl, um fortzufahren.";
    }
    // Pflicht-Textfelder
    var reqs = step.querySelectorAll("input[required], select[required], textarea[required]");
    for (var r = 0; r < reqs.length; r++) {
      var el = reqs[r];
      if (el.type === "checkbox") {
        if (!el.checked) return "Bitte bestätige die Einwilligung, um deine Anfrage zu senden.";
        continue;
      }
      if (!el.value.trim()) return "Bitte fülle alle Pflichtfelder (*) aus.";
      if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) return "Bitte gib eine gültige E-Mail-Adresse ein.";
    }
    return "";
  }

  btnNext.addEventListener("click", function () {
    var msg = validateStep(current);
    if (msg) {
      if (errBox) { errBox.textContent = msg; errBox.classList.add("is-show"); }
      return;
    }
    if (current < steps.length - 1) {
      showStep(current + 1, true);
    } else {
      form.requestSubmit ? form.requestSubmit() : form.submit();
    }
  });

  btnBack.addEventListener("click", function () {
    if (current > 0) showStep(current - 1, true);
  });

  /* Auto-Weiter bei Single-Choice (Radio) für flüssiges Funnel-Gefühl */
  form.querySelectorAll('.fstep input[type="radio"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (errBox) errBox.classList.remove("is-show");
      var step = steps[current];
      // nur auto-weiter, wenn dieser Schritt nur eine einzige Radiogruppe und keine Textfelder hat
      var autoStep = step.getAttribute("data-autonext") === "true";
      if (autoStep) {
        setTimeout(function () {
          if (validateStep(current) === "" && current < steps.length - 1) showStep(current + 1, true);
        }, 260);
      }
    });
  });

  /* Erfolg nach Redirect (?lead=ok) */
  var params = new URLSearchParams(window.location.search);
  if (params.get("lead") === "ok") {
    var card = document.getElementById("formCard");
    var done = document.getElementById("formDone");
    if (card) card.hidden = true;
    if (done) {
      done.hidden = false;
      var top = done.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  showStep(0);
})();
