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
})("Nothing", typeof globalThis != "undefined" ? globalThis : typeof global != "undefined" ? global : typeof window != "undefined" ? window : typeof self != "undefined" ? self : new Function("return this")(), {}, function DEF() {
  "use strict";

  var _exp = {};
  var brand = {};
  _exp = Object.assign(Nothing, {
    of: Nothing,
    pure: Nothing,
    unit: Nothing,
    is,
    isEmpty
  }); // **************************

  function Nothing() {
    var publicAPI = {
      map: noop,
      chain: noop,
      flatMap: noop,
      bind: noop,
      ap: noop,
      concat: noop,
      _inspect,
      _is,
      [Symbol.toStringTag]: "Nothing"
    };
    return publicAPI; // *********************

    function noop() {
      return publicAPI;
    }

    function _inspect() {
      return `${publicAPI[Symbol.toStringTag]}()`;
    }

    function _is(br) {
      return br === brand;
    }
  }

  function is(val) {
    return val && typeof val._is == "function" && val._is(brand);
  } // default isEmpty(), can be overidden


  function isEmpty(val) {
    return val == null; // null or undefined
  }

  return _exp;
});