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
})("IO", typeof globalThis != "undefined" ? globalThis : typeof global != "undefined" ? global : typeof window != "undefined" ? window : typeof self != "undefined" ? self : new Function("return this")(), {
  "./lib/util.js": "MonioUtil",
  "./either.js": "Either"
}, function DEF(MonioUtil, Either) {
  "use strict";

  var _exp = {};
  var {
    isPromise
  } = MonioUtil;
  var brand = {};
  _exp = Object.assign(IO, {
    of,
    is,
    do: $do,
    doEither
  });
  _exp.RIO = IO;
  _exp.Reader = IO; // **************************

  function IO(effect) {
    var publicAPI = {
      map,
      chain,
      flatMap: chain,
      bind: chain,
      ap,
      concat,
      run,
      _inspect,
      _is,
      [Symbol.toStringTag]: "IO"
    };
    return publicAPI; // *********************

    function map(fn) {
      return IO(v => {
        var res = effect(v);
        return isPromise(res) ? res.then(fn) : fn(res);
      });
    }

    function chain(fn) {
      return IO(v => {
        var res = effect(v);
        return isPromise(res) ? res.then(fn).then(v2 => v2.run(v)) : fn(res).run(v);
      });
    }

    function ap(m) {
      return m.map(effect);
    }

    function concat(m) {
      return IO(v => {
        var res = effect(v);
        var res2 = m.run(v);
        return isPromise(res) || isPromise(res2) ? Promise.all([res, res2]).then(([v1, v2]) => v1.concat(v2)) : res.concat(res2);
      });
    }

    function run(v) {
      return effect(v);
    }

    function _inspect() {
      return `${publicAPI[Symbol.toStringTag]}(${typeof effect == "function" ? effect.name || "anonymous function" : effect && typeof effect._inspect == "function" ? effect._inspect() : val})`;
    }

    function _is(br) {
      return br === brand;
    }
  }

  function of(v) {
    return IO(() => v);
  }

  function is(v) {
    return v && typeof v._is == "function" && v._is(brand);
  }

  function processNext(next, respVal, outerV) {
    return new Promise(async (resv, rej) => {
      try {
        await monadFlatMap(isPromise(respVal) ? await respVal : respVal, v => IO(() => next(v).then(resv, rej))).run(outerV);
      } catch (err) {
        rej(err);
      }
    });
  }

  function $do(block) {
    return IO(outerV => {
      var it = getIterator(block, outerV);
      return async function next(v) {
        var resp = it.next(isPromise(v) ? await v : v);
        resp = isPromise(resp) ? await resp : resp;
        return resp.done ? resp.value : processNext(next, resp.value, outerV);
      }();
    });
  }

  function doEither(block) {
    return IO(outerV => {
      var it = getIterator(block, outerV);
      return async function next(v) {
        try {
          v = isPromise(v) ? await v : v;
          let resp = Either.Left.is(v) ? it.throw(v) : it.next(v);
          resp = isPromise(resp) ? await resp : resp;
          let respVal = resp.done ? isPromise(resp.value) ? await resp.value : resp.value : resp.value;
          return resp.done ? Either.Right.is(respVal) ? respVal : Either.Right(respVal) : processNext(next, respVal, outerV).catch(next);
        } catch (err) {
          throw Either.Left.is(err) ? err : Either.Left(err);
        }
      }();
    });
  }

  function getIterator(block, v) {
    return typeof block == "function" ? block(v) : block && typeof block == "object" && typeof block.next == "function" ? block : undefined;
  }

  function monadFlatMap(m, fn) {
    return m["flatMap" in m ? "flatMap" : "chain" in m ? "chain" : "bind"](fn);
  }

  return _exp;
});