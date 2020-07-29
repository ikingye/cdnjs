(function UMDBundle(context, umdDefs) {
  for (let [name, dependencies, definition] of umdDefs) {
    if (typeof define === "function" && define.amd) {
      dependencies = Object.keys(dependencies).map(p => p.replace(/^\.\//, ""));
      define(name, dependencies, definition);
    } else if (typeof module !== "undefined" && module.exports) {
      dependencies = Object.keys(dependencies).map(p => require(p));
      module.exports[name] = definition(...dependencies);
    } else {
      dependencies = Object.values(dependencies).map(n => context[n]);
      context[name] = definition(...dependencies);
    }
  }
})(typeof globalThis != "undefined" ? globalThis : typeof global != "undefined" ? global : typeof window != "undefined" ? window : typeof self != "undefined" ? self : new Function("return this")(), [["Nothing", {}, function DEF() {
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
}], ["Just", {}, function DEF() {
  "use strict";

  var _exp = {};
  var brand = {};
  _exp = Object.assign(Just, {
    of: Just,
    pure: Just,
    unit: Just,
    is
  }); // **************************

  function Just(val) {
    var publicAPI = {
      map,
      chain,
      flatMap: chain,
      bind: chain,
      ap,
      concat,
      _inspect,
      _is,
      [Symbol.toStringTag]: "Just"
    };
    return publicAPI; // *********************

    function map(fn) {
      return Just(fn(val));
    } // aka: bind, flatMap


    function chain(fn) {
      return fn(val);
    }

    function ap(m) {
      return m.map(val);
    }

    function concat(m) {
      return m.map(v => val.concat(v));
    }

    function _inspect() {
      return `${publicAPI[Symbol.toStringTag]}(${_serialize(val)})`;
    }

    function _serialize(val) {
      return typeof val == "string" ? `"${val}"` : typeof val == "undefined" ? "" : typeof val == "function" ? val.name || "anonymous function" : val && typeof val._inspect == "function" ? val._inspect() : Array.isArray(val) ? `[${val.map(v => v == null ? String(v) : _serialize(v))}]` : String(val);
    }

    function _is(br) {
      return br === brand;
    }
  }

  function is(val) {
    return val && typeof val._is == "function" && val._is(brand);
  }

  return _exp;
}], ["Maybe", {
  "./just.js": "Just",
  "./nothing.js": "Nothing"
}, function DEF(Just, Nothing) {
  "use strict";

  var _exp = {};
  var brand = {};
  Object.assign(MaybeJust, Just);
  Object.assign(MaybeNothing, Nothing);
  _exp = Object.assign(Maybe, {
    Just: MaybeJust,
    Nothing: MaybeNothing,
    of: Maybe,
    pure: Maybe,
    unit: Maybe,
    is,
    from
  }); // **************************

  function MaybeJust(val) {
    return Maybe(val);
  }

  function MaybeNothing() {
    return Maybe(Nothing());
  }

  function Maybe(val) {
    var mn = val;
    var isJust = MaybeJust.is(mn);
    var isNothing = MaybeNothing.is(mn);

    if (!(isJust || isNothing)) {
      mn = Just(val);
      isJust = true;
    } else if (isJust) {
      // intentional monad violation, to extract its value
      val = mn.chain(v => v);
    } // isNothing
    else {
        val = void 0;
      }

    var publicAPI = {
      map,
      chain,
      flatMap: chain,
      bind: chain,
      ap,
      concat,
      fold,
      _inspect,
      _is,

      get [Symbol.toStringTag]() {
        return `Maybe:${mn[Symbol.toStringTag]}`;
      }

    };
    return publicAPI; // *********************

    function map(fn) {
      return isJust ? Maybe(mn.map(fn)) : publicAPI;
    }

    function chain(fn) {
      return isJust ? mn.chain(fn) : publicAPI;
    }

    function ap(m) {
      return isJust ? m.map(val) : publicAPI;
    }

    function concat(m) {
      return isJust ? m.map(v => val.concat(v)) : publicAPI;
    }

    function fold(asNothing, asJust) {
      return isJust ? asJust(val) : asNothing(val);
    }

    function _inspect() {
      var v = isJust ? mn._inspect().match(/^Just\((.*)\)$/)[1] : "";
      return `${publicAPI[Symbol.toStringTag]}(${v})`;
    }

    function _is(br) {
      return br === brand || mn._is(br);
    }
  }

  function is(val) {
    return val && typeof val._is == "function" && val._is(brand);
  }

  function from(val) {
    return MaybeNothing.isEmpty(val) ? MaybeNothing() : Maybe(val);
  }

  return _exp;
}], ["MonioUtil", {}, function DEF() {
  "use strict";

  var _exp = {};
  _exp = {
    isFunction,
    isPromise,
    curry
  };
  _exp.isFunction = isFunction;
  _exp.isPromise = isPromise;
  _exp.curry = curry; // **************************

  function isFunction(v) {
    return v && typeof v == "function";
  }

  function isPromise(v) {
    return v && typeof v.then == "function";
  }

  function curry(fn, arity = fn.length) {
    return function nextCurried(prevArgs) {
      return (...nextArgs) => {
        var args = [...prevArgs, ...nextArgs];

        if (args.length >= arity) {
          return fn(...args);
        } else {
          return nextCurried(args);
        }
      };
    }([]);
  }

  return _exp;
}], ["Either", {
  "./just.js": "Just"
}, function DEF(Just) {
  "use strict";

  var _exp = {};
  var brand = {};
  Left.is = LeftIs;
  Right.is = RightIs;
  _exp = Object.assign(Either, {
    Left,
    Right,
    of: Right,
    pure: Right,
    unit: Right,
    is,
    fromFoldable
  }); // **************************

  function Left(val) {
    return LeftOrRight(val,
    /*isRight=*/
    false);
  }

  function LeftIs(val) {
    return is(val) && !val._is_right();
  }

  function Right(val) {
    return LeftOrRight(val,
    /*isRight=*/
    true);
  }

  function RightIs(val) {
    return is(val) && val._is_right();
  }

  function Either(val) {
    return LeftOrRight(val,
    /*isRight=*/
    true);
  }

  function LeftOrRight(val, isRight = true) {
    var publicAPI = {
      map,
      chain,
      flatMap: chain,
      bind: chain,
      ap,
      concat,
      fold,
      _inspect,
      _is,
      _is_right,

      get [Symbol.toStringTag]() {
        return `Either:${isRight ? "Right" : "Left"}`;
      }

    };
    return publicAPI; // *********************

    function map(fn) {
      return isRight ? LeftOrRight(fn(val), isRight) : publicAPI;
    }

    function chain(fn) {
      return isRight ? fn(val) : publicAPI;
    }

    function ap(m) {
      return isRight ? m.map(val) : publicAPI;
    }

    function concat(m) {
      return isRight ? m.map(v => val.concat(v)) : publicAPI;
    }

    function fold(asLeft, asRight) {
      return isRight ? asRight(val) : asLeft(val);
    }

    function _inspect() {
      var v = Just(val)._inspect().match(/^Just\((.*)\)$/)[1];

      return `${publicAPI[Symbol.toStringTag]}(${v})`;
    }

    function _is(br) {
      return br === brand;
    }

    function _is_right() {
      return isRight;
    }
  }

  function is(val) {
    return val && typeof val._is == "function" && val._is(brand);
  }

  function fromFoldable(m) {
    return m.fold(Left, Right);
  }

  return _exp;
}], ["IO", {
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
}], ["IOEventStream", {
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
}], ["AsyncEither", {
  "./lib/util.js": "MonioUtil",
  "./either.js": "Either"
}, function DEF(MonioUtil, Either) {
  "use strict";

  var _exp = {};
  var {
    isPromise
  } = MonioUtil;
  var brand = {};
  _exp = Object.assign(AsyncEither, {
    Left: AsyncLeft,
    Right: AsyncRight,
    of: AsyncRight,
    pure: AsyncRight,
    unit: AsyncRight,
    is,
    fromFoldable,
    fromPromise
  }); // **************************

  function AsyncLeft(v) {
    return AsyncEither(Either.Left(v));
  }

  function AsyncRight(v) {
    return AsyncEither(Either.Right(v));
  }

  function AsyncEither(v) {
    return fromPromise(isPromise(v) ? v : Either.Left.is(v) ? Promise.reject(v) : Promise.resolve(v));
  }

  function fromPromise(pr) {
    pr = splitPromise(pr);
    var publicAPI = {
      map,
      chain,
      flatMap: chain,
      bind: chain,
      ap,
      concat,
      fold,
      _inspect,
      _is,
      [Symbol.toStringTag]: "AsyncEither"
    };
    return publicAPI; // *********************

    function map(v) {
      var handle = m => {
        var _doMap = fn => {
          // note: intentionally using chain() here
          var res = m.chain(fn);
          return isPromise(res) ? splitPromise(res) : m._is_right() ? res : Promise.reject(res);
        };

        return isPromise(v) ? v.then(_doMap) : _doMap(v);
      };

      return AsyncEither(pr.then(handle, handle));
    }

    function chain(v) {
      var handle = m => {
        var _doChain = fn => {
          var res = m.chain(fn);
          return is(res) ? res.fold(v => v, v => v) : Either.is(res) ? res.fold(e => Promise.reject(e), v => v) : res;
        };

        return isPromise(v) ? v.then(_doChain) : _doChain(v);
      };

      return AsyncEither(pr.then(handle, handle));
    }

    function ap(m) {
      return m.map(pr);
    }

    function concat(m) {
      return m.map(v => pr.then(val => val.concat(v)));
    }

    function fold(asLeft, asRight) {
      var handle = whichSide => m => m.fold(v => Promise.reject(whichSide(v)), whichSide);

      return pr.then(handle(asRight), handle(asLeft));
    }

    function _inspect() {
      return `${publicAPI[Symbol.toStringTag]}(Promise)`;
    }

    function _is(br) {
      return br === brand;
    }
  }

  function is(val) {
    return val && typeof val._is == "function" && val._is(brand);
  }

  function fromFoldable(m) {
    return m.fold(AsyncEither.Left, AsyncEither.Right);
  }

  function splitPromise(pr) {
    return pr.then(v => Either.is(v) ? v : Either.Right(v), v => Promise.reject(Either.is(v) ? v : Either.Left(v)));
  }

  function toPromise(m) {
    return new Promise((res, rej) => m.fold(v => rej(Either.Left(v)), v => res(Either.Right(v))));
  }

  return _exp;
}], ["Monio", {
  "./just.js": "Just",
  "./nothing.js": "Nothing",
  "./maybe.js": "Maybe",
  "./either.js": "Either",
  "./async-either.js": "AsyncEither",
  "./io.js": "IO",
  "./io-event-stream.js": "IOEventStream"
}, function DEF(Just, Nothing, Maybe, Either, AsyncEither, IO, IOEventStream) {
  "use strict";

  var _exp = {};
  _exp.Just = Just;
  _exp.Nothing = Nothing;
  _exp.Maybe = Maybe;
  _exp.Either = Either;
  _exp.AsyncEither = AsyncEither;
  _exp.IO = IO;
  _exp.Reader = IO;
  _exp.RIO = IO;
  _exp.IOEventStream = IOEventStream;
  return _exp;
}]]);