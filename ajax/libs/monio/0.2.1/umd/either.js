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
})("Either", typeof globalThis != "undefined" ? globalThis : typeof global != "undefined" ? global : typeof window != "undefined" ? window : typeof self != "undefined" ? self : new Function("return this")(), {
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
});