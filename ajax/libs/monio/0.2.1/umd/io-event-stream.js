(function UMD(name, context, dependencies, definition) {
  if (typeof define === "function" && define.amd) {
    dependencies = Object.keys(dependencies).map(p => p.replace(/^\.\//, ""));
    define(name, dependencies, definition);
  } else if (typeof module !== "undefined" && module.exports) {
    dependencies = Object.keys(dependencies).map(p => require(p));
    module.exports = definition(...dependencies);
  } else {
    dependencies = Object.values(dependencies).map(n => context[n]);
    context[name] = definition(...dependencies);
  }
})("IOEventStream", typeof globalThis != "undefined" ? globalThis : typeof global != "undefined" ? global : typeof window != "undefined" ? window : typeof self != "undefined" ? self : new Function("return this")(), {
  "./lib/util.js": "MonioUtil",
  "./io.js": "IO"
}, function DEF(MonioUtil, IO) {
  "use strict";

  var _exp = {};
  var {
    isFunction,
    curry
  } = MonioUtil;
  _exp = curry(ioEventStream); // **************************

  function ioEventStream(el, evtName) {
    return IO(() => {
      var {
        pr,
        next
      } = getDeferred(); // setup event listener

      if (isFunction(el.addEventListener)) {
        el.addEventListener(evtName, handler, false);
      } else if (isFunction(el.addListener)) {
        el.addListener(evtName, handler);
      } else if (isFunction(el.on)) {
        el.on(evtName, handler);
      } // setup event unlistener


      var eventUnlisten = isFunction(el.removeEventListener) ? el.removeEventListener.bind(el, evtName, handler, false) : isFunction(el.removeListener) ? el.removeListener.bind(el, evtName, handler) : isFunction(el.off) ? el.off.bind(el, evtName, handler) : () => {};
      return eventStream(); // ****************************

      async function* eventStream() {
        try {
          while (true) {
            yield pr;
          }
        } finally {
          eventUnlisten();
        }
      }

      function handler(evt) {
        var f = next;
        ({
          pr,
          next
        } = getDeferred());
        f(evt);
      }
    });
  }

  function getDeferred() {
    var next;
    var pr = new Promise(res => next = res);
    return {
      pr,
      next
    };
  }

  return _exp;
});