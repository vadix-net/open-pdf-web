// Plugin sandbox bootstrap. Runs inside a sandboxed iframe with an opaque
// origin: no cookies, no storage, no Tauri IPC, no parent DOM. The only
// channel is postMessage to the host, which enforces manifest permissions.
(function () {
  "use strict";
  var nextId = 1;
  var pending = {};

  function call(method) {
    var params = Array.prototype.slice.call(arguments, 1);
    return new Promise(function (resolve, reject) {
      var id = nextId++;
      pending[id] = { resolve: resolve, reject: reject };
      parent.postMessage({ type: "openpdf:api", id: id, method: method, params: params }, "*");
    });
  }

  var openpdf = {
    getDocInfo: function () { return call("getDocInfo"); },
    getPageText: function (pageIndex) { return call("getPageText", pageIndex); },
    getAnnotationsJson: function () { return call("getAnnotationsJson"); },
    log: function (text) { parent.postMessage({ type: "openpdf:log", text: String(text) }, "*"); },
  };

  window.addEventListener("message", function (ev) {
    var msg = ev.data || {};
    if (msg.type === "openpdf:api-result") {
      var p = pending[msg.id];
      if (!p) return;
      delete pending[msg.id];
      if (msg.error) p.reject(new Error(msg.error));
      else p.resolve(msg.result);
    } else if (msg.type === "openpdf:run") {
      Promise.resolve()
        .then(function () {
          // The plugin body is an async function receiving the API object.
          var fn = new Function(
            "openpdf",
            "return (async function(){\n" + msg.code + "\n})();"
          );
          return fn(openpdf);
        })
        .then(function (result) {
          parent.postMessage(
            { type: "openpdf:done", result: result == null ? "" : String(result) },
            "*"
          );
        })
        .catch(function (err) {
          parent.postMessage(
            { type: "openpdf:error", message: err && err.message ? err.message : String(err) },
            "*"
          );
        });
    }
  });

  parent.postMessage({ type: "openpdf:ready" }, "*");
})();
