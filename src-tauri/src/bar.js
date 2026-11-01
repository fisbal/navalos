// MartinB gold title bar for the NavalOS Windows and Mac apps.
// Runs only inside the desktop app (Tauri adds it before the page loads); the web and Android versions never see it.
// Same look as every MartinB app: crest, Naval + gold OS, then gold minimize / maximize / close on the right.
(function () {
  if (window.top !== window || window.__mbBar) return;
  window.__mbBar = true;
  var BAR = 36;
  function call(action) {
    try { return window.__TAURI_INTERNALS__.invoke("mb_window", { action: action }); }
    catch (e) { return Promise.resolve(null); }
  }
  function build() {
    if (document.getElementById("mb-bar") || !document.body) return;
    var css = document.createElement("style");
    css.id = "mb-bar-css";
    css.textContent =
      "#mb-bar{position:fixed;top:0;left:0;right:0;height:" + BAR + "px;z-index:98;display:flex;align-items:center;gap:10px;" +
      "padding:0 0 0 12px;box-sizing:border-box;background:#0B0A08;border-bottom:1px solid rgba(212,173,98,.22);user-select:none;-webkit-user-select:none}" +
      "#mb-bar img{width:20px;height:20px;border-radius:5px;pointer-events:none}" +
      "#mb-bar .mb-name{flex:1;min-width:0;font:600 14px/1 'Segoe UI Semibold','Segoe UI',system-ui,sans-serif;color:#F3EFE6;letter-spacing:.02em;" +
      "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}" +
      "#mb-bar .mb-name b{color:#D4AD62;font-weight:700}" +
      "#mb-bar .mb-ctl{display:flex;height:100%}" +
      "#mb-bar .mb-ctl button{width:46px;height:100%;border:0;margin:0;padding:0;background:transparent;color:#D4AD62;display:grid;place-items:center;cursor:default}" +
      "#mb-bar .mb-ctl button:hover{background:rgba(212,173,98,.14)}" +
      "#mb-bar .mb-ctl #mb-close:hover{background:#C42B1C;color:#fff}" +
      "#mb-bar svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.2}" +
      "html.mb-desktop body{padding-top:" + BAR + "px!important}" +
      "html.mb-desktop .tabbar{top:" + BAR + "px!important}" +
      "@media print{#mb-bar{display:none!important}html.mb-desktop body{padding-top:0!important}}";
    document.head.appendChild(css);
    document.documentElement.classList.add("mb-desktop");

    var bar = document.createElement("div");
    bar.id = "mb-bar";
    bar.setAttribute("translate", "no");
    bar.className = "notranslate";
    bar.innerHTML =
      '<img src="/icon-192.png" alt="">' +
      '<span class="mb-name">Naval<b>OS</b></span>' +
      '<div class="mb-ctl">' +
      '<button id="mb-min" title="Réduire / Minimize" aria-label="Réduire"><svg viewBox="0 0 12 12"><path d="M1 6.5h10"/></svg></button>' +
      '<button id="mb-max" title="Agrandir / Maximize" aria-label="Agrandir"><svg viewBox="0 0 12 12" id="mb-maxicon"><rect x="1.5" y="1.5" width="9" height="9"/></svg></button>' +
      '<button id="mb-close" title="Fermer / Close" aria-label="Fermer"><svg viewBox="0 0 12 12"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9"/></svg></button>' +
      "</div>";
    document.body.insertBefore(bar, document.body.firstChild);

    function showState(s) {
      var max = s === "maximized";
      document.getElementById("mb-maxicon").innerHTML = max
        ? '<rect x="1.5" y="3.5" width="7" height="7"/><path d="M3.5 3.5V1.5h7v7h-2"/>'
        : '<rect x="1.5" y="1.5" width="9" height="9"/>';
      document.getElementById("mb-max").title = max ? "Restaurer / Restore" : "Agrandir / Maximize";
    }
    function refresh() { call("state").then(showState); }

    document.getElementById("mb-min").onclick = function () { call("minimize"); };
    document.getElementById("mb-max").onclick = function () { call("toggle_maximize").then(showState); };
    document.getElementById("mb-close").onclick = function () { call("close"); };
    // Drag the window by the bar; double-click maximizes or restores, like a normal Windows title bar.
    bar.addEventListener("mousedown", function (e) {
      if (e.button !== 0 || e.target.closest(".mb-ctl")) return;
      if (e.detail === 2) call("toggle_maximize").then(showState);
      else call("drag");
    });
    window.addEventListener("resize", refresh);
    refresh();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
