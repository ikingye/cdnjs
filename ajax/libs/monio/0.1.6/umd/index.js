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
})("Monio", typeof globalThis != "undefined" ? globalThis : typeof global != "undefined" ? global : typeof window != "undefined" ? window : typeof self != "undefined" ? self : new Function("return this")(), {
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
});