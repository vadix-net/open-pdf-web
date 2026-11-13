// Launch animation (Figma "Open PDF – Glass 2026" ▸ Launch animation).
// Runs before the app bundle: applies the saved theme and glass hint so the
// first paint is already right, plays the 1.0 s intro, and dissolves it once
// the app has painted (App.tsx calls window.__openpdfReady).
//   tile 0–180 · sheen 120–320 · page 240–440 · fold 360–460
//   lines 440/500/560 (+140) · wordmark 520–700 · hold to 800 · dissolve 800–1000
(function () {
  var root = document.documentElement;
  try {
    var theme = localStorage.getItem("openpdf.theme");
    if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  } catch (e) {
    /* no storage: default theme */
  }
  var mq = function (q) {
    return !!(window.matchMedia && window.matchMedia(q).matches);
  };
  root.dataset.glass = mq("(prefers-reduced-transparency: reduce)") || mq("(forced-colors: active)") ? "off" : "on";

  var splash = document.getElementById("splash");
  if (!splash) return;
  var forced = /[?&]splash=1\b/.test(location.search);
  // Windows "Animation effects" off → prefers-reduced-motion; automated tests
  // (navigator.webdriver) skip it unless they ask for it.
  var skip = !forced && (mq("(prefers-reduced-motion: reduce)") || navigator.webdriver);
  if (skip) {
    splash.remove();
    window.__openpdfReady = function () {};
    return;
  }
  var MIN = 800, DISSOLVE = 200, MAX_WAIT = 6000;
  var start = performance.now();
  var ready = false, done = false;
  splash.classList.add("sp-play");

  function dissolve() {
    if (done) return;
    done = true;
    splash.classList.add("sp-out");
    setTimeout(function () {
      splash.remove();
      root.dataset.splashMs = String(Math.round(performance.now() - start));
    }, DISSOLVE);
  }
  function maybeDissolve() {
    var elapsed = performance.now() - start;
    if (ready && elapsed >= MIN) dissolve();
    else if (ready) setTimeout(dissolve, MIN - elapsed);
  }
  window.__openpdfReady = function () {
    ready = true;
    maybeDissolve();
  };
  setTimeout(dissolve, MAX_WAIT); // never trap the user behind the animation
})();
