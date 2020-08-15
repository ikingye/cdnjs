(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@firebase/app')) :
    typeof define === 'function' && define.amd ? define(['exports', '@firebase/app'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.firebase = global.firebase || {}, global.firebase.firestore = global.firebase.firestore || {}), global.firebase.app));
}(this, (function (exports, app) { 'use strict';

    try {
                (function() {

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns navigator.userAgent string or '' if it's not defined.
     * @return user agent string
     */
    function getUA() {
        if (typeof navigator !== 'undefined' &&
            typeof navigator['userAgent'] === 'string') {
            return navigator['userAgent'];
        }
        else {
            return '';
        }
    }
    /**
     * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
     *
     * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
     * in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
     * wait for a callback.
     */
    function isMobileCordova() {
        return (typeof window !== 'undefined' &&
            // @ts-ignore Setting up an broadly applicable index signature for Window
            // just to deal with this case would probably be a bad idea.
            !!(window['cordova'] || window['phonegap'] || window['PhoneGap']) &&
            /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA()));
    }
    function isBrowserExtension() {
        var runtime = typeof chrome === 'object'
            ? chrome.runtime
            : typeof browser === 'object'
                ? browser.runtime
                : undefined;
        return typeof runtime === 'object' && runtime.id !== undefined;
    }
    /**
     * Detect React Native.
     *
     * @return true if ReactNative environment is detected.
     */
    function isReactNative() {
        return (typeof navigator === 'object' && navigator['product'] === 'ReactNative');
    }
    /** Detects Electron apps. */
    function isElectron() {
        return getUA().indexOf('Electron/') >= 0;
    }
    /** Detects Internet Explorer. */
    function isIE() {
        var ua = getUA();
        return ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
    }
    /** Detects Universal Windows Platform apps. */
    function isUWP() {
        return getUA().indexOf('MSAppHost/') >= 0;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var ERROR_NAME = 'FirebaseError';
    // Based on code from:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
    var FirebaseError = /** @class */ (function (_super) {
        __extends(FirebaseError, _super);
        function FirebaseError(code, message) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            _this.name = ERROR_NAME;
            // Fix For ES5
            // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(_this, FirebaseError.prototype);
            // Maintains proper stack trace for where our error was thrown.
            // Only available on V8.
            if (Error.captureStackTrace) {
                Error.captureStackTrace(_this, ErrorFactory.prototype.create);
            }
            return _this;
        }
        return FirebaseError;
    }(Error));
    var ErrorFactory = /** @class */ (function () {
        function ErrorFactory(service, serviceName, errors) {
            this.service = service;
            this.serviceName = serviceName;
            this.errors = errors;
        }
        ErrorFactory.prototype.create = function (code) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            var customData = data[0] || {};
            var fullCode = this.service + "/" + code;
            var template = this.errors[code];
            var message = template ? replaceTemplate(template, customData) : 'Error';
            // Service Name: Error message (service/code).
            var fullMessage = this.serviceName + ": " + message + " (" + fullCode + ").";
            var error = new FirebaseError(fullCode, fullMessage);
            // Keys with an underscore at the end of their name are not included in
            // error.data for some reason.
            // TODO: Replace with Object.entries when lib is updated to es2017.
            for (var _a = 0, _b = Object.keys(customData); _a < _b.length; _a++) {
                var key = _b[_a];
                if (key.slice(-1) !== '_') {
                    if (key in error) {
                        console.warn("Overwriting FirebaseError base field \"" + key + "\" can cause unexpected behavior.");
                    }
                    error[key] = customData[key];
                }
            }
            return error;
        };
        return ErrorFactory;
    }());
    function replaceTemplate(template, data) {
        return template.replace(PATTERN, function (_, key) {
            var value = data[key];
            return value != null ? String(value) : "<" + key + "?>";
        });
    }
    var PATTERN = /\{\$([^}]+)}/g;

    /**
     * Component for service name T, e.g. `auth`, `auth-internal`
     */
    var Component = /** @class */ (function () {
        /**
         *
         * @param name The public service name, e.g. app, auth, firestore, database
         * @param instanceFactory Service factory responsible for creating the public interface
         * @param type whether the service provided by the component is public or private
         */
        function Component(name, instanceFactory, type) {
            this.name = name;
            this.instanceFactory = instanceFactory;
            this.type = type;
            this.multipleInstances = false;
            /**
             * Properties to be added to the service namespace
             */
            this.serviceProps = {};
            this.instantiationMode = "LAZY" /* LAZY */;
        }
        Component.prototype.setInstantiationMode = function (mode) {
            this.instantiationMode = mode;
            return this;
        };
        Component.prototype.setMultipleInstances = function (multipleInstances) {
            this.multipleInstances = multipleInstances;
            return this;
        };
        Component.prototype.setServiceProps = function (props) {
            this.serviceProps = props;
            return this;
        };
        return Component;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var _a;
    /**
     * The JS SDK supports 5 log levels and also allows a user the ability to
     * silence the logs altogether.
     *
     * The order is a follows:
     * DEBUG < VERBOSE < INFO < WARN < ERROR
     *
     * All of the log types above the current log level will be captured (i.e. if
     * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
     * `VERBOSE` logs will not)
     */
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
        LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
        LogLevel[LogLevel["INFO"] = 2] = "INFO";
        LogLevel[LogLevel["WARN"] = 3] = "WARN";
        LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
        LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
    })(LogLevel || (LogLevel = {}));
    var levelStringToEnum = {
        'debug': LogLevel.DEBUG,
        'verbose': LogLevel.VERBOSE,
        'info': LogLevel.INFO,
        'warn': LogLevel.WARN,
        'error': LogLevel.ERROR,
        'silent': LogLevel.SILENT
    };
    /**
     * The default log level
     */
    var defaultLogLevel = LogLevel.INFO;
    /**
     * By default, `console.debug` is not displayed in the developer console (in
     * chrome). To avoid forcing users to have to opt-in to these logs twice
     * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
     * logs to the `console.log` function.
     */
    var ConsoleMethod = (_a = {},
        _a[LogLevel.DEBUG] = 'log',
        _a[LogLevel.VERBOSE] = 'log',
        _a[LogLevel.INFO] = 'info',
        _a[LogLevel.WARN] = 'warn',
        _a[LogLevel.ERROR] = 'error',
        _a);
    /**
     * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
     * messages on to their corresponding console counterparts (if the log method
     * is supported by the current log level)
     */
    var defaultLogHandler = function (instance, logType) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (logType < instance.logLevel) {
            return;
        }
        var now = new Date().toISOString();
        var method = ConsoleMethod[logType];
        if (method) {
            console[method].apply(console, __spreadArrays(["[" + now + "]  " + instance.name + ":"], args));
        }
        else {
            throw new Error("Attempted to log a message with an invalid logType (value: " + logType + ")");
        }
    };
    var Logger = /** @class */ (function () {
        /**
         * Gives you an instance of a Logger to capture messages according to
         * Firebase's logging scheme.
         *
         * @param name The name that the logs will be associated with
         */
        function Logger(name) {
            this.name = name;
            /**
             * The log level of the given Logger instance.
             */
            this._logLevel = defaultLogLevel;
            /**
             * The main (internal) log handler for the Logger instance.
             * Can be set to a new function in internal package code but not by user.
             */
            this._logHandler = defaultLogHandler;
            /**
             * The optional, additional, user-defined log handler for the Logger instance.
             */
            this._userLogHandler = null;
        }
        Object.defineProperty(Logger.prototype, "logLevel", {
            get: function () {
                return this._logLevel;
            },
            set: function (val) {
                if (!(val in LogLevel)) {
                    throw new TypeError("Invalid value \"" + val + "\" assigned to `logLevel`");
                }
                this._logLevel = val;
            },
            enumerable: false,
            configurable: true
        });
        // Workaround for setter/getter having to be the same type.
        Logger.prototype.setLogLevel = function (val) {
            this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
        };
        Object.defineProperty(Logger.prototype, "logHandler", {
            get: function () {
                return this._logHandler;
            },
            set: function (val) {
                if (typeof val !== 'function') {
                    throw new TypeError('Value assigned to `logHandler` must be a function');
                }
                this._logHandler = val;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "userLogHandler", {
            get: function () {
                return this._userLogHandler;
            },
            set: function (val) {
                this._userLogHandler = val;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * The functions below are all based on the `console` interface
         */
        Logger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.DEBUG], args));
            this._logHandler.apply(this, __spreadArrays([this, LogLevel.DEBUG], args));
        };
        Logger.prototype.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.VERBOSE], args));
            this._logHandler.apply(this, __spreadArrays([this, LogLevel.VERBOSE], args));
        };
        Logger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.INFO], args));
            this._logHandler.apply(this, __spreadArrays([this, LogLevel.INFO], args));
        };
        Logger.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.WARN], args));
            this._logHandler.apply(this, __spreadArrays([this, LogLevel.WARN], args));
        };
        Logger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.ERROR], args));
            this._logHandler.apply(this, __spreadArrays([this, LogLevel.ERROR], args));
        };
        return Logger;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics$1 = function(d, b) {
        extendStatics$1 = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics$1(d, b);
    };

    function __extends$1(d, b) {
        extendStatics$1(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var g, goog = goog || {}, k = commonjsGlobal || self;
    function aa() { }
    function ba(a) { var b = typeof a; return "object" != b ? b : a ? Array.isArray(a) ? "array" : b : "null"; }
    function ca(a) { var b = ba(a); return "array" == b || "object" == b && "number" == typeof a.length; }
    function n(a) { var b = typeof a; return "object" == b && null != a || "function" == b; }
    function da(a) { return Object.prototype.hasOwnProperty.call(a, ea) && a[ea] || (a[ea] = ++fa); }
    var ea = "closure_uid_" + (1E9 * Math.random() >>> 0), fa = 0;
    function ha(a, b, c) { return a.call.apply(a.bind, arguments); }
    function ja(a, b, c) { if (!a)
        throw Error(); if (2 < arguments.length) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function () { var e = Array.prototype.slice.call(arguments); Array.prototype.unshift.apply(e, d); return a.apply(b, e); };
    } return function () { return a.apply(b, arguments); }; }
    function p(a, b, c) { Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? p = ha : p = ja; return p.apply(null, arguments); }
    function ka(a, b) { var c = Array.prototype.slice.call(arguments, 1); return function () { var d = c.slice(); d.push.apply(d, arguments); return a.apply(this, d); }; }
    var q = Date.now;
    function r(a, b) { function c() { } c.prototype = b.prototype; a.S = b.prototype; a.prototype = new c; a.prototype.constructor = a; }
    function u() { this.j = this.j; this.i = this.i; }
    var la = 0;
    u.prototype.j = !1;
    u.prototype.ja = function () { if (!this.j && (this.j = !0, this.G(), 0 != la)) {
        var a = da(this);
    } };
    u.prototype.G = function () { if (this.i)
        for (; this.i.length;)
            this.i.shift()(); };
    var na = Array.prototype.indexOf ? function (a, b) { return Array.prototype.indexOf.call(a, b, void 0); } : function (a, b) { if ("string" === typeof a)
        return "string" !== typeof b || 1 != b.length ? -1 : a.indexOf(b, 0); for (var c = 0; c < a.length; c++)
        if (c in a && a[c] === b)
            return c; return -1; }, oa = Array.prototype.forEach ? function (a, b, c) { Array.prototype.forEach.call(a, b, c); } : function (a, b, c) { for (var d = a.length, e = "string" === typeof a ? a.split("") : a, f = 0; f < d; f++)
        f in e && b.call(c, e[f], f, a); };
    function pa(a) { a: {
        var b = qa;
        for (var c = a.length, d = "string" === typeof a ? a.split("") : a, e = 0; e < c; e++)
            if (e in d && b.call(void 0, d[e], e, a)) {
                b = e;
                break a;
            }
        b = -1;
    } return 0 > b ? null : "string" === typeof a ? a.charAt(b) : a[b]; }
    function ra(a) { return Array.prototype.concat.apply([], arguments); }
    function sa(a) { var b = a.length; if (0 < b) {
        for (var c = Array(b), d = 0; d < b; d++)
            c[d] = a[d];
        return c;
    } return []; }
    function ta(a) { return /^[\s\xa0]*$/.test(a); }
    var ua = String.prototype.trim ? function (a) { return a.trim(); } : function (a) { return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]; };
    function v(a, b) { return -1 != a.indexOf(b); }
    function xa(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
    var w;
    a: {
        var ya = k.navigator;
        if (ya) {
            var za = ya.userAgent;
            if (za) {
                w = za;
                break a;
            }
        }
        w = "";
    }
    function Aa(a, b, c) { for (var d in a)
        b.call(c, a[d], d, a); }
    function Ba(a) { var b = {}; for (var c in a)
        b[c] = a[c]; return b; }
    var Ca = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
    function Da(a, b) { var c, d; for (var e = 1; e < arguments.length; e++) {
        d = arguments[e];
        for (c in d)
            a[c] = d[c];
        for (var f = 0; f < Ca.length; f++)
            c = Ca[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c]);
    } }
    function Ea(a) { Ea[" "](a); return a; }
    Ea[" "] = aa;
    function Fa(a, b) { var c = Ga; return Object.prototype.hasOwnProperty.call(c, a) ? c[a] : c[a] = b(a); }
    var Ha = v(w, "Opera"), x = v(w, "Trident") || v(w, "MSIE"), Ia = v(w, "Edge"), Ja = Ia || x, Ka = v(w, "Gecko") && !(v(w.toLowerCase(), "webkit") && !v(w, "Edge")) && !(v(w, "Trident") || v(w, "MSIE")) && !v(w, "Edge"), La = v(w.toLowerCase(), "webkit") && !v(w, "Edge");
    function Ma() { var a = k.document; return a ? a.documentMode : void 0; }
    var Na;
    a: {
        var Oa = "", Pa = function () { var a = w; if (Ka)
            return /rv:([^\);]+)(\)|;)/.exec(a); if (Ia)
            return /Edge\/([\d\.]+)/.exec(a); if (x)
            return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a); if (La)
            return /WebKit\/(\S+)/.exec(a); if (Ha)
            return /(?:Version)[ \/]?(\S+)/.exec(a); }();
        Pa && (Oa = Pa ? Pa[1] : "");
        if (x) {
            var Qa = Ma();
            if (null != Qa && Qa > parseFloat(Oa)) {
                Na = String(Qa);
                break a;
            }
        }
        Na = Oa;
    }
    var Ga = {};
    function Ra(a) { return Fa(a, function () { {
        var b = 0;
        var e = ua(String(Na)).split("."), f = ua(String(a)).split("."), h = Math.max(e.length, f.length);
        for (var m = 0; 0 == b && m < h; m++) {
            var c = e[m] || "", d = f[m] || "";
            do {
                c = /(\d*)(\D*)(.*)/.exec(c) || ["", "", "", ""];
                d = /(\d*)(\D*)(.*)/.exec(d) || ["", "", "", ""];
                if (0 == c[0].length && 0 == d[0].length)
                    break;
                b = xa(0 == c[1].length ? 0 : parseInt(c[1], 10), 0 == d[1].length ? 0 : parseInt(d[1], 10)) || xa(0 == c[2].length, 0 == d[2].length) || xa(c[2], d[2]);
                c = c[3];
                d = d[3];
            } while (0 == b);
        }
    } return 0 <= b; }); }
    var Sa;
    if (k.document && x) {
        var Ta = Ma();
        Sa = Ta ? Ta : parseInt(Na, 10) || void 0;
    }
    else
        Sa = void 0;
    var Ua = Sa;
    var Va = !x || 9 <= Number(Ua), Wa = x && !Ra("9"), Xa = function () { if (!k.addEventListener || !Object.defineProperty)
        return !1; var a = !1, b = Object.defineProperty({}, "passive", { get: function () { a = !0; } }); try {
        k.addEventListener("test", aa, b), k.removeEventListener("test", aa, b);
    }
    catch (c) { } return a; }();
    function y(a, b) { this.type = a; this.a = this.target = b; this.defaultPrevented = !1; }
    y.prototype.b = function () { this.defaultPrevented = !0; };
    function A(a, b) {
        y.call(this, a ? a.type : "");
        this.relatedTarget = this.a = this.target = null;
        this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0;
        this.key = "";
        this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1;
        this.pointerId = 0;
        this.pointerType = "";
        this.c = null;
        if (a) {
            var c = this.type = a.type, d = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
            this.target = a.target || a.srcElement;
            this.a = b;
            if (b = a.relatedTarget) {
                if (Ka) {
                    a: {
                        try {
                            Ea(b.nodeName);
                            var e = !0;
                            break a;
                        }
                        catch (f) { }
                        e = !1;
                    }
                    e || (b = null);
                }
            }
            else
                "mouseover" ==
                    c ? b = a.fromElement : "mouseout" == c && (b = a.toElement);
            this.relatedTarget = b;
            d ? (this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX, this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0) : (this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX, this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY, this.screenX = a.screenX || 0, this.screenY = a.screenY || 0);
            this.button = a.button;
            this.key = a.key || "";
            this.ctrlKey = a.ctrlKey;
            this.altKey = a.altKey;
            this.shiftKey = a.shiftKey;
            this.metaKey =
                a.metaKey;
            this.pointerId = a.pointerId || 0;
            this.pointerType = "string" === typeof a.pointerType ? a.pointerType : Ya[a.pointerType] || "";
            this.c = a;
            a.defaultPrevented && this.b();
        }
    }
    r(A, y);
    var Ya = { 2: "touch", 3: "pen", 4: "mouse" };
    A.prototype.b = function () { A.S.b.call(this); var a = this.c; if (a.preventDefault)
        a.preventDefault();
    else if (a.returnValue = !1, Wa)
        try {
            if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode)
                a.keyCode = -1;
        }
        catch (b) { } };
    var C = "closure_listenable_" + (1E6 * Math.random() | 0), Za = 0;
    function $a(a, b, c, d, e) { this.listener = a; this.proxy = null; this.src = b; this.type = c; this.capture = !!d; this.ca = e; this.key = ++Za; this.Y = this.Z = !1; }
    function ab(a) { a.Y = !0; a.listener = null; a.proxy = null; a.src = null; a.ca = null; }
    function bb(a) { this.src = a; this.a = {}; this.b = 0; }
    bb.prototype.add = function (a, b, c, d, e) { var f = a.toString(); a = this.a[f]; a || (a = this.a[f] = [], this.b++); var h = cb(a, b, d, e); -1 < h ? (b = a[h], c || (b.Z = !1)) : (b = new $a(b, this.src, f, !!d, e), b.Z = c, a.push(b)); return b; };
    function db(a, b) { var c = b.type; if (c in a.a) {
        var d = a.a[c], e = na(d, b), f;
        (f = 0 <= e) && Array.prototype.splice.call(d, e, 1);
        f && (ab(b), 0 == a.a[c].length && (delete a.a[c], a.b--));
    } }
    function cb(a, b, c, d) { for (var e = 0; e < a.length; ++e) {
        var f = a[e];
        if (!f.Y && f.listener == b && f.capture == !!c && f.ca == d)
            return e;
    } return -1; }
    var eb = "closure_lm_" + (1E6 * Math.random() | 0), fb = {};
    function hb(a, b, c, d, e) { if (d && d.once)
        return ib(a, b, c, d, e); if (Array.isArray(b)) {
        for (var f = 0; f < b.length; f++)
            hb(a, b[f], c, d, e);
        return null;
    } c = jb(c); return a && a[C] ? a.va(b, c, n(d) ? !!d.capture : !!d, e) : kb(a, b, c, !1, d, e); }
    function kb(a, b, c, d, e, f) {
        if (!b)
            throw Error("Invalid event type");
        var h = n(e) ? !!e.capture : !!e;
        if (h && !Va)
            return null;
        var m = lb(a);
        m || (a[eb] = m = new bb(a));
        c = m.add(b, c, d, h, f);
        if (c.proxy)
            return c;
        d = mb();
        c.proxy = d;
        d.src = a;
        d.listener = c;
        if (a.addEventListener)
            Xa || (e = h), void 0 === e && (e = !1), a.addEventListener(b.toString(), d, e);
        else if (a.attachEvent)
            a.attachEvent(nb(b.toString()), d);
        else if (a.addListener && a.removeListener)
            a.addListener(d);
        else
            throw Error("addEventListener and attachEvent are unavailable.");
        return c;
    }
    function mb() { var a = ob, b = Va ? function (c) { return a.call(b.src, b.listener, c); } : function (c) { c = a.call(b.src, b.listener, c); if (!c)
        return c; }; return b; }
    function ib(a, b, c, d, e) { if (Array.isArray(b)) {
        for (var f = 0; f < b.length; f++)
            ib(a, b[f], c, d, e);
        return null;
    } c = jb(c); return a && a[C] ? a.wa(b, c, n(d) ? !!d.capture : !!d, e) : kb(a, b, c, !0, d, e); }
    function pb(a, b, c, d, e) { if (Array.isArray(b))
        for (var f = 0; f < b.length; f++)
            pb(a, b[f], c, d, e);
    else
        (d = n(d) ? !!d.capture : !!d, c = jb(c), a && a[C]) ? (a = a.c, b = String(b).toString(), b in a.a && (f = a.a[b], c = cb(f, c, d, e), -1 < c && (ab(f[c]), Array.prototype.splice.call(f, c, 1), 0 == f.length && (delete a.a[b], a.b--)))) : a && (a = lb(a)) && (b = a.a[b.toString()], a = -1, b && (a = cb(b, c, d, e)), (c = -1 < a ? b[a] : null) && rb(c)); }
    function rb(a) { if ("number" !== typeof a && a && !a.Y) {
        var b = a.src;
        if (b && b[C])
            db(b.c, a);
        else {
            var c = a.type, d = a.proxy;
            b.removeEventListener ? b.removeEventListener(c, d, a.capture) : b.detachEvent ? b.detachEvent(nb(c), d) : b.addListener && b.removeListener && b.removeListener(d);
            (c = lb(b)) ? (db(c, a), 0 == c.b && (c.src = null, b[eb] = null)) : ab(a);
        }
    } }
    function nb(a) { return a in fb ? fb[a] : fb[a] = "on" + a; }
    function sb(a, b) { var c = a.listener, d = a.ca || a.src; a.Z && rb(a); return c.call(d, b); }
    function ob(a, b) { if (a.Y)
        return !0; if (!Va) {
        if (!b)
            a: {
                b = ["window", "event"];
                for (var c = k, d = 0; d < b.length; d++)
                    if (c = c[b[d]], null == c) {
                        b = null;
                        break a;
                    }
                b = c;
            }
        b = new A(b, this);
        return sb(a, b);
    } return sb(a, new A(b, this)); }
    function lb(a) { a = a[eb]; return a instanceof bb ? a : null; }
    var tb = "__closure_events_fn_" + (1E9 * Math.random() >>> 0);
    function jb(a) { if ("function" == ba(a))
        return a; a[tb] || (a[tb] = function (b) { return a.handleEvent(b); }); return a[tb]; }
    function D() { u.call(this); this.c = new bb(this); this.J = this; this.C = null; }
    r(D, u);
    D.prototype[C] = !0;
    g = D.prototype;
    g.addEventListener = function (a, b, c, d) { hb(this, a, b, c, d); };
    g.removeEventListener = function (a, b, c, d) { pb(this, a, b, c, d); };
    g.dispatchEvent = function (a) { var b, c = this.C; if (c)
        for (b = []; c; c = c.C)
            b.push(c); c = this.J; var d = a.type || a; if ("string" === typeof a)
        a = new y(a, c);
    else if (a instanceof y)
        a.target = a.target || c;
    else {
        var e = a;
        a = new y(d, c);
        Da(a, e);
    } e = !0; if (b)
        for (var f = b.length - 1; 0 <= f; f--) {
            var h = a.a = b[f];
            e = ub(h, d, !0, a) && e;
        } h = a.a = c; e = ub(h, d, !0, a) && e; e = ub(h, d, !1, a) && e; if (b)
        for (f = 0; f < b.length; f++)
            h = a.a = b[f], e = ub(h, d, !1, a) && e; return e; };
    g.G = function () { D.S.G.call(this); if (this.c) {
        var a = this.c, c;
        for (c in a.a) {
            for (var d = a.a[c], e = 0; e < d.length; e++)
                ab(d[e]);
            delete a.a[c];
            a.b--;
        }
    } this.C = null; };
    g.va = function (a, b, c, d) { return this.c.add(String(a), b, !1, c, d); };
    g.wa = function (a, b, c, d) { return this.c.add(String(a), b, !0, c, d); };
    function ub(a, b, c, d) { b = a.c.a[String(b)]; if (!b)
        return !0; b = b.concat(); for (var e = !0, f = 0; f < b.length; ++f) {
        var h = b[f];
        if (h && !h.Y && h.capture == c) {
            var m = h.listener, l = h.ca || h.src;
            h.Z && db(a.c, h);
            e = !1 !== m.call(l, d) && e;
        }
    } return e && !d.defaultPrevented; }
    var vb = k.JSON.stringify;
    function wb() { this.b = this.a = null; }
    var yb = new /** @class */ (function () {
        function class_1(a, b, c) {
            this.f = c;
            this.c = a;
            this.g = b;
            this.b = 0;
            this.a = null;
        }
        class_1.prototype.get = function () { var a; 0 < this.b ? (this.b--, a = this.a, this.a = a.next, a.next = null) : a = this.c(); return a; };
        return class_1;
    }())(function () { return new xb; }, function (a) { a.reset(); }, 100);
    wb.prototype.add = function (a, b) { var c = yb.get(); c.set(a, b); this.b ? this.b.next = c : this.a = c; this.b = c; };
    function zb() { var a = Ab, b = null; a.a && (b = a.a, a.a = a.a.next, a.a || (a.b = null), b.next = null); return b; }
    function xb() { this.next = this.b = this.a = null; }
    xb.prototype.set = function (a, b) { this.a = a; this.b = b; this.next = null; };
    xb.prototype.reset = function () { this.next = this.b = this.a = null; };
    function Bb(a) { k.setTimeout(function () { throw a; }, 0); }
    function Cb(a, b) { Db || Eb(); Fb || (Db(), Fb = !0); Ab.add(a, b); }
    var Db;
    function Eb() { var a = k.Promise.resolve(void 0); Db = function () { a.then(Gb); }; }
    var Fb = !1, Ab = new wb;
    function Gb() { for (var a; a = zb();) {
        try {
            a.a.call(a.b);
        }
        catch (c) {
            Bb(c);
        }
        var b = yb;
        b.g(a);
        b.b < b.f && (b.b++, a.next = b.a, b.a = a);
    } Fb = !1; }
    function Hb(a, b) { D.call(this); this.b = a || 1; this.a = b || k; this.f = p(this.Ya, this); this.g = q(); }
    r(Hb, D);
    g = Hb.prototype;
    g.aa = !1;
    g.M = null;
    g.Ya = function () { if (this.aa) {
        var a = q() - this.g;
        0 < a && a < .8 * this.b ? this.M = this.a.setTimeout(this.f, this.b - a) : (this.M && (this.a.clearTimeout(this.M), this.M = null), this.dispatchEvent("tick"), this.aa && (Ib(this), this.start()));
    } };
    g.start = function () { this.aa = !0; this.M || (this.M = this.a.setTimeout(this.f, this.b), this.g = q()); };
    function Ib(a) { a.aa = !1; a.M && (a.a.clearTimeout(a.M), a.M = null); }
    g.G = function () { Hb.S.G.call(this); Ib(this); delete this.a; };
    function Jb(a, b, c) { if ("function" == ba(a))
        c && (a = p(a, c));
    else if (a && "function" == typeof a.handleEvent)
        a = p(a.handleEvent, a);
    else
        throw Error("Invalid listener argument"); return 2147483647 < Number(b) ? -1 : k.setTimeout(a, b || 0); }
    function Kb(a) { a.a = Jb(function () { a.a = null; a.c && (a.c = !1, Kb(a)); }, a.h); var b = a.b; a.b = null; a.g.apply(null, b); }
    var Lb = /** @class */ (function (_super) {
        __extends$1(Lb, _super);
        function Lb(a, b, c) {
            var _this = _super.call(this) || this;
            _this.g = null != c ? a.bind(c) : a;
            _this.h = b;
            _this.b = null;
            _this.c = !1;
            _this.a = null;
            return _this;
        }
        Lb.prototype.f = function (a) { this.b = arguments; this.a ? this.c = !0 : Kb(this); };
        Lb.prototype.G = function () { _super.prototype.G.call(this); this.a && (k.clearTimeout(this.a), this.a = null, this.c = !1, this.b = null); };
        return Lb;
    }(u));
    function E(a) { u.call(this); this.b = a; this.a = {}; }
    r(E, u);
    var Mb = [];
    function Nb(a, b, c, d) { Array.isArray(c) || (c && (Mb[0] = c.toString()), c = Mb); for (var e = 0; e < c.length; e++) {
        var f = hb(b, c[e], d || a.handleEvent, !1, a.b || a);
        if (!f)
            break;
        a.a[f.key] = f;
    } }
    function Ob(a) { Aa(a.a, function (b, c) { this.a.hasOwnProperty(c) && rb(b); }, a); a.a = {}; }
    E.prototype.G = function () { E.S.G.call(this); Ob(this); };
    E.prototype.handleEvent = function () { throw Error("EventHandler.handleEvent not implemented"); };
    function Pb() { this.a = !0; }
    function Qb(a, b, c, d, e, f) { a.info(function () { if (a.a)
        if (f) {
            var h = "";
            for (var m = f.split("&"), l = 0; l < m.length; l++) {
                var t = m[l].split("=");
                if (1 < t.length) {
                    var B = t[0];
                    t = t[1];
                    var z = B.split("_");
                    h = 2 <= z.length && "type" == z[1] ? h + (B + "=" + t + "&") : h + (B + "=redacted&");
                }
            }
        }
        else
            h = null;
    else
        h = f; return "XMLHTTP REQ (" + d + ") [attempt " + e + "]: " + b + "\n" + c + "\n" + h; }); }
    function Rb(a, b, c, d, e, f, h) { a.info(function () { return "XMLHTTP RESP (" + d + ") [ attempt " + e + "]: " + b + "\n" + c + "\n" + f + " " + h; }); }
    function F(a, b, c, d) { a.info(function () { return "XMLHTTP TEXT (" + b + "): " + Sb(a, c) + (d ? " " + d : ""); }); }
    function Tb(a, b) { a.info(function () { return "TIMEOUT: " + b; }); }
    Pb.prototype.info = function () { };
    function Sb(a, b) { if (!a.a)
        return b; if (!b)
        return null; try {
        var c = JSON.parse(b);
        if (c)
            for (a = 0; a < c.length; a++)
                if (Array.isArray(c[a])) {
                    var d = c[a];
                    if (!(2 > d.length)) {
                        var e = d[1];
                        if (Array.isArray(e) && !(1 > e.length)) {
                            var f = e[0];
                            if ("noop" != f && "stop" != f && "close" != f)
                                for (var h = 1; h < e.length; h++)
                                    e[h] = "";
                        }
                    }
                }
        return vb(c);
    }
    catch (m) {
        return b;
    } }
    var Ub = null;
    function Vb() { return Ub = Ub || new D; }
    function Wb(a) { y.call(this, "serverreachability", a); }
    r(Wb, y);
    function G(a) { var b = Vb(); b.dispatchEvent(new Wb(b, a)); }
    function Xb(a) { y.call(this, "statevent", a); }
    r(Xb, y);
    function H(a) { var b = Vb(); b.dispatchEvent(new Xb(b, a)); }
    function Yb(a) { y.call(this, "timingevent", a); }
    r(Yb, y);
    function I(a, b) { if ("function" != ba(a))
        throw Error("Fn must not be null and must be a function"); return k.setTimeout(function () { a(); }, b); }
    var Zb = { NO_ERROR: 0, Za: 1, gb: 2, fb: 3, bb: 4, eb: 5, hb: 6, Da: 7, TIMEOUT: 8, kb: 9 };
    var $b = { ab: "complete", ob: "success", Ea: "error", Da: "abort", mb: "ready", nb: "readystatechange", TIMEOUT: "timeout", ib: "incrementaldata", lb: "progress", cb: "downloadprogress", pb: "uploadprogress" };
    function ac() { }
    ac.prototype.a = null;
    function bc(a) { var b; (b = a.a) || (b = a.a = {}); return b; }
    function cc() { }
    var J = { OPEN: "a", $a: "b", Ea: "c", jb: "d" };
    function dc() { y.call(this, "d"); }
    r(dc, y);
    function ec() { y.call(this, "c"); }
    r(ec, y);
    var fc;
    function gc() { }
    r(gc, ac);
    fc = new gc;
    function K(a, b, c, d) { this.g = a; this.c = b; this.f = c; this.T = d || 1; this.J = new E(this); this.P = hc; a = Ja ? 125 : void 0; this.R = new Hb(a); this.B = null; this.b = !1; this.j = this.l = this.i = this.H = this.u = this.U = this.o = null; this.s = []; this.a = null; this.D = 0; this.h = this.m = null; this.N = -1; this.A = !1; this.O = 0; this.F = null; this.W = this.C = this.V = this.I = !1; }
    var hc = 45E3, ic = {}, jc = {};
    g = K.prototype;
    g.setTimeout = function (a) { this.P = a; };
    function kc(a, b, c) { a.H = 1; a.i = lc(L(b)); a.j = c; a.I = !0; mc(a, null); }
    function mc(a, b) { a.u = q(); M(a); a.l = L(a.i); var c = a.l, d = a.T; Array.isArray(d) || (d = [String(d)]); nc(c.b, "t", d); a.D = 0; a.a = oc(a.g, a.g.C ? b : null); 0 < a.O && (a.F = new Lb(p(a.Ca, a, a.a), a.O)); Nb(a.J, a.a, "readystatechange", a.Wa); b = a.B ? Ba(a.B) : {}; a.j ? (a.m || (a.m = "POST"), b["Content-Type"] = "application/x-www-form-urlencoded", a.a.ba(a.l, a.m, a.j, b)) : (a.m = "GET", a.a.ba(a.l, a.m, null, b)); G(1); Qb(a.c, a.m, a.l, a.f, a.T, a.j); }
    g.Wa = function (a) { a = a.target; var b = this.F; b && 3 == N(a) ? b.f() : this.Ca(a); };
    g.Ca = function (a) {
        try {
            if (a == this.a)
                a: {
                    var b = N(this.a), c = this.a.ua(), d = this.a.X();
                    if (!(3 > b || 3 == b && !Ja && !this.a.$())) {
                        this.A || 4 != b || 7 == c || (8 == c || 0 >= d ? G(3) : G(2));
                        pc(this);
                        var e = this.a.X();
                        this.N = e;
                        var f = this.a.$();
                        this.b = 200 == e;
                        Rb(this.c, this.m, this.l, this.f, this.T, b, e);
                        if (this.b) {
                            if (this.V && !this.C) {
                                b: {
                                    if (this.a) {
                                        var h, m = this.a;
                                        if ((h = m.a ? m.a.getResponseHeader("X-HTTP-Initial-Response") : null) && !ta(h)) {
                                            var l = h;
                                            break b;
                                        }
                                    }
                                    l = null;
                                }
                                if (l)
                                    F(this.c, this.f, l, "Initial handshake response via X-HTTP-Initial-Response"),
                                        this.C = !0, qc(this, l);
                                else {
                                    this.b = !1;
                                    this.h = 3;
                                    H(12);
                                    O(this);
                                    rc(this);
                                    break a;
                                }
                            }
                            this.I ? (tc(this, b, f), Ja && this.b && 3 == b && (Nb(this.J, this.R, "tick", this.Va), this.R.start())) : (F(this.c, this.f, f, null), qc(this, f));
                            4 == b && O(this);
                            this.b && !this.A && (4 == b ? uc(this.g, this) : (this.b = !1, M(this)));
                        }
                        else
                            400 == e && 0 < f.indexOf("Unknown SID") ? (this.h = 3, H(12)) : (this.h = 0, H(13)), O(this), rc(this);
                    }
                }
        }
        catch (t) { }
        finally { }
    };
    function tc(a, b, c) { for (var d = !0; !a.A && a.D < c.length;) {
        var e = vc(a, c);
        if (e == jc) {
            4 == b && (a.h = 4, H(14), d = !1);
            F(a.c, a.f, null, "[Incomplete Response]");
            break;
        }
        else if (e == ic) {
            a.h = 4;
            H(15);
            F(a.c, a.f, c, "[Invalid Chunk]");
            d = !1;
            break;
        }
        else
            F(a.c, a.f, e, null), qc(a, e);
    } 4 == b && 0 == c.length && (a.h = 1, H(16), d = !1); a.b = a.b && d; d ? 0 < c.length && !a.W && (a.W = !0, b = a.g, b.a == a && b.V && !b.F && (b.c.info("Great, no buffering proxy detected. Bytes received: " + c.length), xc(b), b.F = !0)) : (F(a.c, a.f, c, "[Invalid Chunked Response]"), O(a), rc(a)); }
    g.Va = function () { if (this.a) {
        var a = N(this.a), b = this.a.$();
        this.D < b.length && (pc(this), tc(this, a, b), this.b && 4 != a && M(this));
    } };
    function vc(a, b) { var c = a.D, d = b.indexOf("\n", c); if (-1 == d)
        return jc; c = Number(b.substring(c, d)); if (isNaN(c))
        return ic; d += 1; if (d + c > b.length)
        return jc; b = b.substr(d, c); a.D = d + c; return b; }
    g.cancel = function () { this.A = !0; O(this); };
    function M(a) { a.U = q() + a.P; yc(a, a.P); }
    function yc(a, b) { if (null != a.o)
        throw Error("WatchDog timer not null"); a.o = I(p(a.Ua, a), b); }
    function pc(a) { a.o && (k.clearTimeout(a.o), a.o = null); }
    g.Ua = function () { this.o = null; var a = q(); 0 <= a - this.U ? (Tb(this.c, this.l), 2 != this.H && (G(3), H(17)), O(this), this.h = 2, rc(this)) : yc(this, this.U - a); };
    function rc(a) { 0 == a.g.v || a.A || uc(a.g, a); }
    function O(a) { pc(a); var b = a.F; b && "function" == typeof b.ja && b.ja(); a.F = null; Ib(a.R); Ob(a.J); a.a && (b = a.a, a.a = null, b.abort(), b.ja()); }
    function qc(a, b) {
        try {
            var c = a.g;
            if (0 != c.v && (c.a == a || zc(c.b, a)))
                if (c.I = a.N, !a.C && zc(c.b, a) && 3 == c.v) {
                    try {
                        var d = c.ka.a.parse(b);
                    }
                    catch (sc) {
                        d = null;
                    }
                    if (Array.isArray(d) && 3 == d.length) {
                        var e = d;
                        if (0 == e[0])
                            a: {
                                if (!c.j) {
                                    if (c.a)
                                        if (c.a.u + 3E3 < a.u)
                                            Ac(c), Bc(c);
                                        else
                                            break a;
                                    Cc(c);
                                    H(18);
                                }
                            }
                        else
                            c.oa = e[1], 0 < c.oa - c.P && 37500 > e[2] && c.H && 0 == c.o && !c.m && (c.m = I(p(c.Ra, c), 6E3));
                        if (1 >= Dc(c.b) && c.ea) {
                            try {
                                c.ea();
                            }
                            catch (sc) { }
                            c.ea = void 0;
                        }
                    }
                    else
                        P(c, 11);
                }
                else if ((a.C || c.a == a) && Ac(c), !ta(b))
                    for (b = d = c.ka.a.parse(b), d = 0; d < b.length; d++)
                        if (e =
                            b[d], c.P = e[0], e = e[1], 2 == c.v)
                            if ("c" == e[0]) {
                                c.J = e[1];
                                c.ga = e[2];
                                var f = e[3];
                                null != f && (c.ha = f, c.c.info("VER=" + c.ha));
                                var h = e[4];
                                null != h && (c.pa = h, c.c.info("SVER=" + c.pa));
                                var m = e[5];
                                if (null != m && "number" === typeof m && 0 < m) {
                                    var l = 1.5 * m;
                                    c.D = l;
                                    c.c.info("backChannelRequestTimeoutMs_=" + l);
                                }
                                l = c;
                                var t = a.a;
                                if (t) {
                                    var B = t.a ? t.a.getResponseHeader("X-Client-Wire-Protocol") : null;
                                    if (B) {
                                        var z = l.b;
                                        !z.a && (v(B, "spdy") || v(B, "quic") || v(B, "h2")) && (z.f = z.g, z.a = new Set, z.b && (Ec(z, z.b), z.b = null));
                                    }
                                    if (l.A) {
                                        var qb = t.a ? t.a.getResponseHeader("X-HTTP-Session-Id") :
                                            null;
                                        qb && (l.na = qb, Q(l.B, l.A, qb));
                                    }
                                }
                                c.v = 3;
                                c.f && c.f.ta();
                                c.V && (c.N = q() - a.u, c.c.info("Handshake RTT: " + c.N + "ms"));
                                l = c;
                                var va = a;
                                l.la = Fc(l, l.C ? l.ga : null, l.fa);
                                if (va.C) {
                                    Gc(l.b, va);
                                    var wa = va, wc = l.D;
                                    wc && wa.setTimeout(wc);
                                    wa.o && (pc(wa), M(wa));
                                    l.a = va;
                                }
                                else
                                    Hc(l);
                                0 < c.g.length && Ic(c);
                            }
                            else
                                "stop" != e[0] && "close" != e[0] || P(c, 7);
                        else
                            3 == c.v && ("stop" == e[0] || "close" == e[0] ? "stop" == e[0] ? P(c, 7) : Jc(c) : "noop" != e[0] && c.f && c.f.sa(e), c.o = 0);
            G(4);
        }
        catch (sc) { }
    }
    function Kc(a) { if (a.K && "function" == typeof a.K)
        return a.K(); if ("string" === typeof a)
        return a.split(""); if (ca(a)) {
        for (var b = [], c = a.length, d = 0; d < c; d++)
            b.push(a[d]);
        return b;
    } b = []; c = 0; for (d in a)
        b[c++] = a[d]; return a = b; }
    function Lc(a, b) { if (a.forEach && "function" == typeof a.forEach)
        a.forEach(b, void 0);
    else if (ca(a) || "string" === typeof a)
        oa(a, b, void 0);
    else {
        if (a.L && "function" == typeof a.L)
            var c = a.L();
        else if (a.K && "function" == typeof a.K)
            c = void 0;
        else if (ca(a) || "string" === typeof a) {
            c = [];
            for (var d = a.length, e = 0; e < d; e++)
                c.push(e);
        }
        else
            for (e in c = [], d = 0, a)
                c[d++] = e;
        d = Kc(a);
        e = d.length;
        for (var f = 0; f < e; f++)
            b.call(void 0, d[f], c && c[f], a);
    } }
    function R(a, b) { this.b = {}; this.a = []; this.c = 0; var c = arguments.length; if (1 < c) {
        if (c % 2)
            throw Error("Uneven number of arguments");
        for (var d = 0; d < c; d += 2)
            this.set(arguments[d], arguments[d + 1]);
    }
    else if (a)
        if (a instanceof R)
            for (c = a.L(), d = 0; d < c.length; d++)
                this.set(c[d], a.get(c[d]));
        else
            for (d in a)
                this.set(d, a[d]); }
    g = R.prototype;
    g.K = function () { Mc(this); for (var a = [], b = 0; b < this.a.length; b++)
        a.push(this.b[this.a[b]]); return a; };
    g.L = function () { Mc(this); return this.a.concat(); };
    function Mc(a) { if (a.c != a.a.length) {
        for (var b = 0, c = 0; b < a.a.length;) {
            var d = a.a[b];
            S(a.b, d) && (a.a[c++] = d);
            b++;
        }
        a.a.length = c;
    } if (a.c != a.a.length) {
        var e = {};
        for (c = b = 0; b < a.a.length;)
            d = a.a[b], S(e, d) || (a.a[c++] = d, e[d] = 1), b++;
        a.a.length = c;
    } }
    g.get = function (a, b) { return S(this.b, a) ? this.b[a] : b; };
    g.set = function (a, b) { S(this.b, a) || (this.c++, this.a.push(a)); this.b[a] = b; };
    g.forEach = function (a, b) { for (var c = this.L(), d = 0; d < c.length; d++) {
        var e = c[d], f = this.get(e);
        a.call(b, f, e, this);
    } };
    function S(a, b) { return Object.prototype.hasOwnProperty.call(a, b); }
    var Nc = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^\\/?#]*)@)?([^\\/?#]*?)(?::([0-9]+))?(?=[\\/?#]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;
    function Oc(a, b) { if (a) {
        a = a.split("&");
        for (var c = 0; c < a.length; c++) {
            var d = a[c].indexOf("="), e = null;
            if (0 <= d) {
                var f = a[c].substring(0, d);
                e = a[c].substring(d + 1);
            }
            else
                f = a[c];
            b(f, e ? decodeURIComponent(e.replace(/\+/g, " ")) : "");
        }
    } }
    function T(a, b) { this.c = this.j = this.f = ""; this.h = null; this.i = this.g = ""; this.a = !1; if (a instanceof T) {
        this.a = void 0 !== b ? b : a.a;
        Pc(this, a.f);
        this.j = a.j;
        Qc(this, a.c);
        Rc(this, a.h);
        this.g = a.g;
        b = a.b;
        var c = new U;
        c.c = b.c;
        b.a && (c.a = new R(b.a), c.b = b.b);
        Sc(this, c);
        this.i = a.i;
    }
    else
        a && (c = String(a).match(Nc)) ? (this.a = !!b, Pc(this, c[1] || "", !0), this.j = Tc(c[2] || ""), Qc(this, c[3] || "", !0), Rc(this, c[4]), this.g = Tc(c[5] || "", !0), Sc(this, c[6] || "", !0), this.i = Tc(c[7] || "")) : (this.a = !!b, this.b = new U(null, this.a)); }
    T.prototype.toString = function () { var a = [], b = this.f; b && a.push(Uc(b, Vc, !0), ":"); var c = this.c; if (c || "file" == b)
        a.push("//"), (b = this.j) && a.push(Uc(b, Vc, !0), "@"), a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), c = this.h, null != c && a.push(":", String(c)); if (c = this.g)
        this.c && "/" != c.charAt(0) && a.push("/"), a.push(Uc(c, "/" == c.charAt(0) ? Wc : Xc, !0)); (c = this.b.toString()) && a.push("?", c); (c = this.i) && a.push("#", Uc(c, Yc)); return a.join(""); };
    function L(a) { return new T(a); }
    function Pc(a, b, c) { a.f = c ? Tc(b, !0) : b; a.f && (a.f = a.f.replace(/:$/, "")); }
    function Qc(a, b, c) { a.c = c ? Tc(b, !0) : b; }
    function Rc(a, b) { if (b) {
        b = Number(b);
        if (isNaN(b) || 0 > b)
            throw Error("Bad port number " + b);
        a.h = b;
    }
    else
        a.h = null; }
    function Sc(a, b, c) { b instanceof U ? (a.b = b, Zc(a.b, a.a)) : (c || (b = Uc(b, $c)), a.b = new U(b, a.a)); }
    function Q(a, b, c) { a.b.set(b, c); }
    function lc(a) { Q(a, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ q()).toString(36)); return a; }
    function ad(a) { return a instanceof T ? L(a) : new T(a, void 0); }
    function bd(a, b, c, d) { var e = new T(null, void 0); a && Pc(e, a); b && Qc(e, b); c && Rc(e, c); d && (e.g = d); return e; }
    function Tc(a, b) { return a ? b ? decodeURI(a.replace(/%25/g, "%2525")) : decodeURIComponent(a) : ""; }
    function Uc(a, b, c) { return "string" === typeof a ? (a = encodeURI(a).replace(b, cd), c && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null; }
    function cd(a) { a = a.charCodeAt(0); return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16); }
    var Vc = /[#\/\?@]/g, Xc = /[#\?:]/g, Wc = /[#\?]/g, $c = /[#\?@]/g, Yc = /#/g;
    function U(a, b) { this.b = this.a = null; this.c = a || null; this.f = !!b; }
    function V(a) { a.a || (a.a = new R, a.b = 0, a.c && Oc(a.c, function (b, c) { a.add(decodeURIComponent(b.replace(/\+/g, " ")), c); })); }
    g = U.prototype;
    g.add = function (a, b) { V(this); this.c = null; a = W(this, a); var c = this.a.get(a); c || this.a.set(a, c = []); c.push(b); this.b += 1; return this; };
    function dd(a, b) { V(a); b = W(a, b); S(a.a.b, b) && (a.c = null, a.b -= a.a.get(b).length, a = a.a, S(a.b, b) && (delete a.b[b], a.c--, a.a.length > 2 * a.c && Mc(a))); }
    function ed(a, b) { V(a); b = W(a, b); return S(a.a.b, b); }
    g.forEach = function (a, b) { V(this); this.a.forEach(function (c, d) { oa(c, function (e) { a.call(b, e, d, this); }, this); }, this); };
    g.L = function () { V(this); for (var a = this.a.K(), b = this.a.L(), c = [], d = 0; d < b.length; d++)
        for (var e = a[d], f = 0; f < e.length; f++)
            c.push(b[d]); return c; };
    g.K = function (a) { V(this); var b = []; if ("string" === typeof a)
        ed(this, a) && (b = ra(b, this.a.get(W(this, a))));
    else {
        a = this.a.K();
        for (var c = 0; c < a.length; c++)
            b = ra(b, a[c]);
    } return b; };
    g.set = function (a, b) { V(this); this.c = null; a = W(this, a); ed(this, a) && (this.b -= this.a.get(a).length); this.a.set(a, [b]); this.b += 1; return this; };
    g.get = function (a, b) { if (!a)
        return b; a = this.K(a); return 0 < a.length ? String(a[0]) : b; };
    function nc(a, b, c) { dd(a, b); 0 < c.length && (a.c = null, a.a.set(W(a, b), sa(c)), a.b += c.length); }
    g.toString = function () { if (this.c)
        return this.c; if (!this.a)
        return ""; for (var a = [], b = this.a.L(), c = 0; c < b.length; c++) {
        var d = b[c], e = encodeURIComponent(String(d));
        d = this.K(d);
        for (var f = 0; f < d.length; f++) {
            var h = e;
            "" !== d[f] && (h += "=" + encodeURIComponent(String(d[f])));
            a.push(h);
        }
    } return this.c = a.join("&"); };
    function W(a, b) { b = String(b); a.f && (b = b.toLowerCase()); return b; }
    function Zc(a, b) { b && !a.f && (V(a), a.c = null, a.a.forEach(function (c, d) { var e = d.toLowerCase(); d != e && (dd(this, d), nc(this, e, c)); }, a)); a.f = b; }
    function fd(a, b) { this.b = a; this.a = b; }
    function gd(a) { this.g = a || hd; k.PerformanceNavigationTiming ? (a = k.performance.getEntriesByType("navigation"), a = 0 < a.length && ("hq" == a[0].nextHopProtocol || "h2" == a[0].nextHopProtocol)) : a = !!(k.ia && k.ia.ya && k.ia.ya() && k.ia.ya().qb); this.f = a ? this.g : 1; this.a = null; 1 < this.f && (this.a = new Set); this.b = null; this.c = []; }
    var hd = 10;
    function id(a) { return a.b ? !0 : a.a ? a.a.size >= a.f : !1; }
    function Dc(a) { return a.b ? 1 : a.a ? a.a.size : 0; }
    function zc(a, b) { return a.b ? a.b == b : a.a ? a.a.has(b) : !1; }
    function Ec(a, b) { a.a ? a.a.add(b) : a.b = b; }
    function Gc(a, b) { a.b && a.b == b ? a.b = null : a.a && a.a.has(b) && a.a.delete(b); }
    gd.prototype.cancel = function () {
        var e_1, _a;
        this.c = jd(this);
        if (this.b)
            this.b.cancel(), this.b = null;
        else if (this.a && 0 !== this.a.size) {
            try {
                for (var _b = __values(this.a.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var a = _c.value;
                    a.cancel();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.a.clear();
        }
    };
    function jd(a) {
        var e_2, _a;
        if (null != a.b)
            return a.c.concat(a.b.s);
        if (null != a.a && 0 !== a.a.size) {
            var b = a.c;
            try {
                for (var _b = __values(a.a.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var c = _c.value;
                    b = b.concat(c.s);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return b;
        }
        return sa(a.c);
    }
    function kd() { }
    kd.prototype.stringify = function (a) { return k.JSON.stringify(a, void 0); };
    kd.prototype.parse = function (a) { return k.JSON.parse(a, void 0); };
    function ld() { this.a = new kd; }
    function md(a, b, c) { var d = c || ""; try {
        Lc(a, function (e, f) { var h = e; n(e) && (h = vb(e)); b.push(d + f + "=" + encodeURIComponent(h)); });
    }
    catch (e) {
        throw b.push(d + "type=" + encodeURIComponent("_badmap")), e;
    } }
    function nd(a, b) { var c = new Pb; if (k.Image) {
        var d = new Image;
        d.onload = ka(od, c, d, "TestLoadImage: loaded", !0, b);
        d.onerror = ka(od, c, d, "TestLoadImage: error", !1, b);
        d.onabort = ka(od, c, d, "TestLoadImage: abort", !1, b);
        d.ontimeout = ka(od, c, d, "TestLoadImage: timeout", !1, b);
        k.setTimeout(function () { if (d.ontimeout)
            d.ontimeout(); }, 1E4);
        d.src = a;
    }
    else
        b(!1); }
    function od(a, b, c, d, e) { try {
        b.onload = null, b.onerror = null, b.onabort = null, b.ontimeout = null, e(d);
    }
    catch (f) { } }
    var pd = k.JSON.parse;
    function X(a) { D.call(this); this.headers = new R; this.H = a || null; this.b = !1; this.s = this.a = null; this.B = ""; this.h = 0; this.f = ""; this.g = this.A = this.l = this.u = !1; this.o = 0; this.m = null; this.I = qd; this.D = this.F = !1; }
    r(X, D);
    var qd = "", rd = /^https?$/i, sd = ["POST", "PUT"];
    g = X.prototype;
    g.ba = function (a, b, c, d) {
        if (this.a)
            throw Error("[goog.net.XhrIo] Object is active with another request=" + this.B + "; newUri=" + a);
        b = b ? b.toUpperCase() : "GET";
        this.B = a;
        this.f = "";
        this.h = 0;
        this.u = !1;
        this.b = !0;
        this.a = new XMLHttpRequest;
        this.s = this.H ? bc(this.H) : bc(fc);
        this.a.onreadystatechange = p(this.za, this);
        try {
            this.A = !0, this.a.open(b, String(a), !0), this.A = !1;
        }
        catch (f) {
            td(this, f);
            return;
        }
        a = c || "";
        var e = new R(this.headers);
        d && Lc(d, function (f, h) { e.set(h, f); });
        d = pa(e.L());
        c = k.FormData && a instanceof k.FormData;
        !(0 <=
            na(sd, b)) || d || c || e.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        e.forEach(function (f, h) { this.a.setRequestHeader(h, f); }, this);
        this.I && (this.a.responseType = this.I);
        "withCredentials" in this.a && this.a.withCredentials !== this.F && (this.a.withCredentials = this.F);
        try {
            ud(this), 0 < this.o && ((this.D = vd(this.a)) ? (this.a.timeout = this.o, this.a.ontimeout = p(this.xa, this)) : this.m = Jb(this.xa, this.o, this)), this.l = !0, this.a.send(a), this.l = !1;
        }
        catch (f) {
            td(this, f);
        }
    };
    function vd(a) { return x && Ra(9) && "number" === typeof a.timeout && void 0 !== a.ontimeout; }
    function qa(a) { return "content-type" == a.toLowerCase(); }
    g.xa = function () { "undefined" != typeof goog && this.a && (this.f = "Timed out after " + this.o + "ms, aborting", this.h = 8, this.dispatchEvent("timeout"), this.abort(8)); };
    function td(a, b) { a.b = !1; a.a && (a.g = !0, a.a.abort(), a.g = !1); a.f = b; a.h = 5; wd(a); xd(a); }
    function wd(a) { a.u || (a.u = !0, a.dispatchEvent("complete"), a.dispatchEvent("error")); }
    g.abort = function (a) { this.a && this.b && (this.b = !1, this.g = !0, this.a.abort(), this.g = !1, this.h = a || 7, this.dispatchEvent("complete"), this.dispatchEvent("abort"), xd(this)); };
    g.G = function () { this.a && (this.b && (this.b = !1, this.g = !0, this.a.abort(), this.g = !1), xd(this, !0)); X.S.G.call(this); };
    g.za = function () { this.j || (this.A || this.l || this.g ? yd(this) : this.Ta()); };
    g.Ta = function () { yd(this); };
    function yd(a) {
        if (a.b && "undefined" != typeof goog && (!a.s[1] || 4 != N(a) || 2 != a.X()))
            if (a.l && 4 == N(a))
                Jb(a.za, 0, a);
            else if (a.dispatchEvent("readystatechange"), 4 == N(a)) {
                a.b = !1;
                try {
                    var b = a.X();
                    a: switch (b) {
                        case 200:
                        case 201:
                        case 202:
                        case 204:
                        case 206:
                        case 304:
                        case 1223:
                            var c = !0;
                            break a;
                        default: c = !1;
                    }
                    var d;
                    if (!(d = c)) {
                        var e;
                        if (e = 0 === b) {
                            var f = String(a.B).match(Nc)[1] || null;
                            if (!f && k.self && k.self.location) {
                                var h = k.self.location.protocol;
                                f = h.substr(0, h.length - 1);
                            }
                            e = !rd.test(f ? f.toLowerCase() : "");
                        }
                        d = e;
                    }
                    if (d)
                        a.dispatchEvent("complete"),
                            a.dispatchEvent("success");
                    else {
                        a.h = 6;
                        try {
                            var m = 2 < N(a) ? a.a.statusText : "";
                        }
                        catch (l) {
                            m = "";
                        }
                        a.f = m + " [" + a.X() + "]";
                        wd(a);
                    }
                }
                finally {
                    xd(a);
                }
            }
    }
    function xd(a, b) { if (a.a) {
        ud(a);
        var c = a.a, d = a.s[0] ? aa : null;
        a.a = null;
        a.s = null;
        b || a.dispatchEvent("ready");
        try {
            c.onreadystatechange = d;
        }
        catch (e) { }
    } }
    function ud(a) { a.a && a.D && (a.a.ontimeout = null); a.m && (k.clearTimeout(a.m), a.m = null); }
    function N(a) { return a.a ? a.a.readyState : 0; }
    g.X = function () { try {
        return 2 < N(this) ? this.a.status : -1;
    }
    catch (a) {
        return -1;
    } };
    g.$ = function () { try {
        return this.a ? this.a.responseText : "";
    }
    catch (a) {
        return "";
    } };
    g.Na = function (a) { if (this.a) {
        var b = this.a.responseText;
        a && 0 == b.indexOf(a) && (b = b.substring(a.length));
        return pd(b);
    } };
    g.ua = function () { return this.h; };
    g.Qa = function () { return "string" === typeof this.f ? this.f : String(this.f); };
    function zd(a) { var b = ""; Aa(a, function (c, d) { b += d; b += ":"; b += c; b += "\r\n"; }); return b; }
    function Ad(a, b, c) { a: {
        for (d in c) {
            var d = !1;
            break a;
        }
        d = !0;
    } d || (c = zd(c), "string" === typeof a ? (null != c && encodeURIComponent(String(c))) : Q(a, b, c)); }
    function Bd(a, b, c) { return c && c.internalChannelParams ? c.internalChannelParams[a] || b : b; }
    function Cd(a) {
        this.pa = 0;
        this.g = [];
        this.c = new Pb;
        this.ga = this.la = this.B = this.fa = this.a = this.na = this.A = this.W = this.i = this.O = this.l = null;
        this.La = this.R = 0;
        this.Ia = Bd("failFast", !1, a);
        this.H = this.m = this.j = this.h = this.f = null;
        this.T = !0;
        this.I = this.oa = this.P = -1;
        this.U = this.o = this.u = 0;
        this.Fa = Bd("baseRetryDelayMs", 5E3, a);
        this.Ma = Bd("retryDelaySeedMs", 1E4, a);
        this.Ja = Bd("forwardChannelMaxRetries", 2, a);
        this.ma = Bd("forwardChannelRequestTimeoutMs", 2E4, a);
        this.Ka = a && a.g || void 0;
        this.D = void 0;
        this.C = a && a.supportsCrossDomainXhr ||
            !1;
        this.J = "";
        this.b = new gd(a && a.concurrentRequestLimit);
        this.ka = new ld;
        this.da = a && a.fastHandshake || !1;
        this.Ga = a && a.b || !1;
        a && a.f && (this.c.a = !1);
        a && a.forceLongPolling && (this.T = !1);
        this.V = !this.da && this.T && a && a.c || !1;
        this.ea = void 0;
        this.N = 0;
        this.F = !1;
        this.s = null;
    }
    g = Cd.prototype;
    g.ha = 8;
    g.v = 1;
    function Jc(a) { Dd(a); if (3 == a.v) {
        var b = a.R++, c = L(a.B);
        Q(c, "SID", a.J);
        Q(c, "RID", b);
        Q(c, "TYPE", "terminate");
        Ed(a, c);
        b = new K(a, a.c, b, void 0);
        b.H = 2;
        b.i = lc(L(c));
        c = !1;
        k.navigator && k.navigator.sendBeacon && (c = k.navigator.sendBeacon(b.i.toString(), ""));
        !c && k.Image && ((new Image).src = b.i, c = !0);
        c || (b.a = oc(b.g, null), b.a.ba(b.i));
        b.u = q();
        M(b);
    } Fd(a); }
    function Bc(a) { a.a && (xc(a), a.a.cancel(), a.a = null); }
    function Dd(a) { Bc(a); a.j && (k.clearTimeout(a.j), a.j = null); Ac(a); a.b.cancel(); a.h && ("number" === typeof a.h && k.clearTimeout(a.h), a.h = null); }
    function Gd(a, b) { a.g.push(new fd(a.La++, b)); 3 == a.v && Ic(a); }
    function Ic(a) { id(a.b) || a.h || (a.h = !0, Cb(a.Ba, a), a.u = 0); }
    function Hd(a, b) { if (Dc(a.b) >= a.b.f - (a.h ? 1 : 0))
        return !1; if (a.h)
        return a.g = b.s.concat(a.g), !0; if (1 == a.v || 2 == a.v || a.u >= (a.Ia ? 0 : a.Ja))
        return !1; a.h = I(p(a.Ba, a, b), Id(a, a.u)); a.u++; return !0; }
    g.Ba = function (a) {
        if (this.h)
            if (this.h = null, 1 == this.v) {
                if (!a) {
                    this.R = Math.floor(1E5 * Math.random());
                    a = this.R++;
                    var b = new K(this, this.c, a, void 0), c = this.l;
                    this.O && (c ? (c = Ba(c), Da(c, this.O)) : c = this.O);
                    null === this.i && (b.B = c);
                    var d;
                    if (this.da)
                        a: {
                            for (var e = d = 0; e < this.g.length; e++) {
                                b: {
                                    var f = this.g[e];
                                    if ("__data__" in f.a && (f = f.a.__data__, "string" === typeof f)) {
                                        f = f.length;
                                        break b;
                                    }
                                    f = void 0;
                                }
                                if (void 0 === f)
                                    break;
                                d += f;
                                if (4096 < d) {
                                    d = e;
                                    break a;
                                }
                                if (4096 === d || e === this.g.length - 1) {
                                    d = e + 1;
                                    break a;
                                }
                            }
                            d = 1E3;
                        }
                    else
                        d = 1E3;
                    d = Jd(this, b, d);
                    e = L(this.B);
                    Q(e, "RID", a);
                    Q(e, "CVER", 22);
                    this.A && Q(e, "X-HTTP-Session-Id", this.A);
                    Ed(this, e);
                    this.i && c && Ad(e, this.i, c);
                    Ec(this.b, b);
                    this.Ga && Q(e, "TYPE", "init");
                    this.da ? (Q(e, "$req", d), Q(e, "SID", "null"), b.V = !0, kc(b, e, null)) : kc(b, e, d);
                    this.v = 2;
                }
            }
            else
                3 == this.v && (a ? Kd(this, a) : 0 == this.g.length || id(this.b) || Kd(this));
    };
    function Kd(a, b) { var c; b ? c = b.f : c = a.R++; var d = L(a.B); Q(d, "SID", a.J); Q(d, "RID", c); Q(d, "AID", a.P); Ed(a, d); a.i && a.l && Ad(d, a.i, a.l); c = new K(a, a.c, c, a.u + 1); null === a.i && (c.B = a.l); b && (a.g = b.s.concat(a.g)); b = Jd(a, c, 1E3); c.setTimeout(Math.round(.5 * a.ma) + Math.round(.5 * a.ma * Math.random())); Ec(a.b, c); kc(c, d, b); }
    function Ed(a, b) { a.f && Lc({}, function (c, d) { Q(b, d, c); }); }
    function Jd(a, b, c) { c = Math.min(a.g.length, c); var d = a.f ? p(a.f.Ha, a.f, a) : null; a: for (var e = a.g, f = -1;;) {
        var h = ["count=" + c];
        -1 == f ? 0 < c ? (f = e[0].b, h.push("ofs=" + f)) : f = 0 : h.push("ofs=" + f);
        for (var m = !0, l = 0; l < c; l++) {
            var t = e[l].b, B = e[l].a;
            t -= f;
            if (0 > t)
                f = Math.max(0, e[l].b - 100), m = !1;
            else
                try {
                    md(B, h, "req" + t + "_");
                }
                catch (z) {
                    d && d(B);
                }
        }
        if (m) {
            d = h.join("&");
            break a;
        }
    } a = a.g.splice(0, c); b.s = a; return d; }
    function Hc(a) { a.a || a.j || (a.U = 1, Cb(a.Aa, a), a.o = 0); }
    function Cc(a) { if (a.a || a.j || 3 <= a.o)
        return !1; a.U++; a.j = I(p(a.Aa, a), Id(a, a.o)); a.o++; return !0; }
    g.Aa = function () { this.j = null; Ld(this); if (this.V && !(this.F || null == this.a || 0 >= this.N)) {
        var a = 2 * this.N;
        this.c.info("BP detection timer enabled: " + a);
        this.s = I(p(this.Sa, this), a);
    } };
    g.Sa = function () { this.s && (this.s = null, this.c.info("BP detection timeout reached."), this.c.info("Buffering proxy detected and switch to long-polling!"), this.H = !1, this.F = !0, Bc(this), Ld(this)); };
    function xc(a) { null != a.s && (k.clearTimeout(a.s), a.s = null); }
    function Ld(a) { a.a = new K(a, a.c, "rpc", a.U); null === a.i && (a.a.B = a.l); a.a.O = 0; var b = L(a.la); Q(b, "RID", "rpc"); Q(b, "SID", a.J); Q(b, "CI", a.H ? "0" : "1"); Q(b, "AID", a.P); Ed(a, b); Q(b, "TYPE", "xmlhttp"); a.i && a.l && Ad(b, a.i, a.l); a.D && a.a.setTimeout(a.D); var c = a.a; a = a.ga; c.H = 1; c.i = lc(L(b)); c.j = null; c.I = !0; mc(c, a); }
    g.Ra = function () { null != this.m && (this.m = null, Bc(this), Cc(this), H(19)); };
    function Ac(a) { null != a.m && (k.clearTimeout(a.m), a.m = null); }
    function uc(a, b) { var c = null; if (a.a == b) {
        Ac(a);
        xc(a);
        a.a = null;
        var d = 2;
    }
    else if (zc(a.b, b))
        c = b.s, Gc(a.b, b), d = 1;
    else
        return; a.I = b.N; if (0 != a.v)
        if (b.b)
            if (1 == d) {
                c = b.j ? b.j.length : 0;
                b = q() - b.u;
                var e = a.u;
                d = Vb();
                d.dispatchEvent(new Yb(d, c, b, e));
                Ic(a);
            }
            else
                Hc(a);
        else if (e = b.h, 3 == e || 0 == e && 0 < a.I || !(1 == d && Hd(a, b) || 2 == d && Cc(a)))
            switch (c && 0 < c.length && (b = a.b, b.c = b.c.concat(c)), e) {
                case 1:
                    P(a, 5);
                    break;
                case 4:
                    P(a, 10);
                    break;
                case 3:
                    P(a, 6);
                    break;
                default: P(a, 2);
            } }
    function Id(a, b) { var c = a.Fa + Math.floor(Math.random() * a.Ma); a.f || (c *= 2); return c * b; }
    function P(a, b) { a.c.info("Error code " + b); if (2 == b) {
        var c = null;
        a.f && (c = null);
        var d = p(a.Xa, a);
        c || (c = new T("//www.google.com/images/cleardot.gif"), k.location && "http" == k.location.protocol || Pc(c, "https"), lc(c));
        nd(c.toString(), d);
    }
    else
        H(2); a.v = 0; a.f && a.f.ra(b); Fd(a); Dd(a); }
    g.Xa = function (a) { a ? (this.c.info("Successfully pinged google.com"), H(2)) : (this.c.info("Failed to ping google.com"), H(1)); };
    function Fd(a) { a.v = 0; a.I = -1; if (a.f) {
        if (0 != jd(a.b).length || 0 != a.g.length)
            a.b.c.length = 0, sa(a.g), a.g.length = 0;
        a.f.qa();
    } }
    function Fc(a, b, c) { var d = ad(c); if ("" != d.c)
        b && Qc(d, b + "." + d.c), Rc(d, d.h);
    else {
        var e = k.location;
        d = bd(e.protocol, b ? b + "." + e.hostname : e.hostname, +e.port, c);
    } a.W && Aa(a.W, function (f, h) { Q(d, h, f); }); b = a.A; c = a.na; b && c && Q(d, b, c); Q(d, "VER", a.ha); Ed(a, d); return d; }
    function oc(a, b) { if (b && !a.C)
        throw Error("Can't create secondary domain capable XhrIo object."); b = new X(a.Ka); b.F = a.C; return b; }
    function Md() { }
    g = Md.prototype;
    g.ta = function () { };
    g.sa = function () { };
    g.ra = function () { };
    g.qa = function () { };
    g.Ha = function () { };
    function Nd() { if (x && !(10 <= Number(Ua)))
        throw Error("Environmental error: no available transport."); }
    Nd.prototype.a = function (a, b) { return new Y(a, b); };
    function Y(a, b) {
        D.call(this);
        this.a = new Cd(b);
        this.l = a;
        this.b = b && b.messageUrlParams || null;
        a = b && b.messageHeaders || null;
        b && b.clientProtocolHeaderRequired && (a ? a["X-Client-Protocol"] = "webchannel" : a = { "X-Client-Protocol": "webchannel" });
        this.a.l = a;
        a = b && b.initMessageHeaders || null;
        b && b.messageContentType && (a ? a["X-WebChannel-Content-Type"] = b.messageContentType : a = { "X-WebChannel-Content-Type": b.messageContentType });
        b && b.a && (a ? a["X-WebChannel-Client-Profile"] = b.a : a = { "X-WebChannel-Client-Profile": b.a });
        this.a.O =
            a;
        (a = b && b.httpHeadersOverwriteParam) && !ta(a) && (this.a.i = a);
        this.h = b && b.supportsCrossDomainXhr || !1;
        this.g = b && b.sendRawJson || !1;
        (b = b && b.httpSessionIdParam) && !ta(b) && (this.a.A = b, a = this.b, null !== a && b in a && (a = this.b, b in a && delete a[b]));
        this.f = new Z(this);
    }
    r(Y, D);
    g = Y.prototype;
    g.addEventListener = function (a, b, c, d) { Y.S.addEventListener.call(this, a, b, c, d); };
    g.removeEventListener = function (a, b, c, d) { Y.S.removeEventListener.call(this, a, b, c, d); };
    g.Oa = function () { this.a.f = this.f; this.h && (this.a.C = !0); var a = this.a, b = this.l, c = this.b || void 0; H(0); a.fa = b; a.W = c || {}; a.H = a.T; a.B = Fc(a, null, a.fa); Ic(a); };
    g.close = function () { Jc(this.a); };
    g.Pa = function (a) { if ("string" === typeof a) {
        var b = {};
        b.__data__ = a;
        Gd(this.a, b);
    }
    else
        this.g ? (b = {}, b.__data__ = vb(a), Gd(this.a, b)) : Gd(this.a, a); };
    g.G = function () { this.a.f = null; delete this.f; Jc(this.a); delete this.a; Y.S.G.call(this); };
    function Od(a) { dc.call(this); var b = a.__sm__; if (b) {
        a: {
            for (var c in b) {
                a = c;
                break a;
            }
            a = void 0;
        }
        (this.c = a) ? (a = this.c, this.data = null !== b && a in b ? b[a] : void 0) : this.data = b;
    }
    else
        this.data = a; }
    r(Od, dc);
    function Pd() { ec.call(this); this.status = 1; }
    r(Pd, ec);
    function Z(a) { this.a = a; }
    r(Z, Md);
    Z.prototype.ta = function () { this.a.dispatchEvent("a"); };
    Z.prototype.sa = function (a) { this.a.dispatchEvent(new Od(a)); };
    Z.prototype.ra = function (a) { this.a.dispatchEvent(new Pd(a)); };
    Z.prototype.qa = function () { this.a.dispatchEvent("b"); }; /*

     Copyright 2017 Google Inc.

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
    */
    Nd.prototype.createWebChannel = Nd.prototype.a;
    Y.prototype.send = Y.prototype.Pa;
    Y.prototype.open = Y.prototype.Oa;
    Y.prototype.close = Y.prototype.close;
    Zb.NO_ERROR = 0;
    Zb.TIMEOUT = 8;
    Zb.HTTP_ERROR = 6;
    $b.COMPLETE = "complete";
    cc.EventType = J;
    J.OPEN = "a";
    J.CLOSE = "b";
    J.ERROR = "c";
    J.MESSAGE = "d";
    D.prototype.listen = D.prototype.va;
    X.prototype.listenOnce = X.prototype.wa;
    X.prototype.getLastError = X.prototype.Qa;
    X.prototype.getLastErrorCode = X.prototype.ua;
    X.prototype.getStatus = X.prototype.X;
    X.prototype.getResponseJson = X.prototype.Na;
    X.prototype.getResponseText = X.prototype.$;
    X.prototype.send = X.prototype.ba;
    var esm = { createWebChannelTransport: function () { return new Nd; }, ErrorCode: Zb, EventType: $b, WebChannel: cc, XhrIo: X };
    var esm_1 = esm.createWebChannelTransport;
    var esm_2 = esm.ErrorCode;
    var esm_3 = esm.EventType;
    var esm_4 = esm.WebChannel;
    var esm_5 = esm.XhrIo;

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Simple wrapper around a nullable UID. Mostly exists to make code more
     * readable.
     */ class A$1 {
        constructor(t) {
            this.uid = t;
        }
        t() {
            return null != this.uid;
        }
        /**
         * Returns a key representing this user, suitable for inclusion in a
         * dictionary.
         */    s() {
            return this.t() ? "uid:" + this.uid : "anonymous-user";
        }
        isEqual(t) {
            return t.uid === this.uid;
        }
    }

    /** A user with a null UID. */ A$1.UNAUTHENTICATED = new A$1(null), 
    // TODO(mikelehen): Look into getting a proper uid-equivalent for
    // non-FirebaseAuth providers.
    A$1.i = new A$1("google-credentials-uid"), A$1.o = new A$1("first-party-uid");

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const R$1 = new Logger("@firebase/firestore");

    // Helper methods are needed because variables can't be exported as read/write
    function m() {
        return R$1.logLevel;
    }

    function P$1(t) {
        R$1.setLogLevel(t);
    }

    function V$1(t, ...e) {
        if (R$1.logLevel <= LogLevel.DEBUG) {
            const n = e.map(p$1);
            R$1.debug("Firestore (7.17.1): " + t, ...n);
        }
    }

    function g$1(t, ...e) {
        if (R$1.logLevel <= LogLevel.ERROR) {
            const n = e.map(p$1);
            R$1.error("Firestore (7.17.1): " + t, ...n);
        }
    }

    function y$1(t, ...e) {
        if (R$1.logLevel <= LogLevel.WARN) {
            const n = e.map(p$1);
            R$1.warn("Firestore (7.17.1): " + t, ...n);
        }
    }

    /**
     * Converts an additional log parameter to a string representation.
     */ function p$1(t) {
        if ("string" == typeof t) return t;
        try {
            return e = t, JSON.stringify(e);
        } catch (e) {
            // Converting to JSON failed, just log the object directly
            return t;
        }
        /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /** Formats an object as a JSON string, suitable for logging. */
        var e;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Unconditionally fails, throwing an Error with the given message.
     * Messages are stripped in production builds.
     *
     * Returns `never` and can be used in expressions:
     * @example
     * let futureVar = fail('not implemented yet');
     */ function b(t = "Unexpected state") {
        // Log the failure in addition to throw an exception, just in case the
        // exception is swallowed.
        const e = "FIRESTORE (7.17.1) INTERNAL ASSERTION FAILED: " + t;
        // NOTE: We don't use FirestoreError here because these are internal failures
        // that cannot be handled by the user. (Also it would create a circular
        // dependency between the error and assert modules which doesn't work.)
        throw g$1(e), new Error(e);
    }

    /**
     * Fails if the given assertion condition is false, throwing an Error with the
     * given message if it did.
     *
     * Messages are stripped in production builds.
     */ function v$1(t, e) {
        t || b();
    }

    /**
     * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
     * instance of `T` before casting.
     */ function S$1(t, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        return t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const C$1 = {
        // Causes are copied from:
        // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
        /** Not an error; returned on success. */
        OK: "ok",
        /** The operation was cancelled (typically by the caller). */
        CANCELLED: "cancelled",
        /** Unknown error or an error from a different error domain. */
        UNKNOWN: "unknown",
        /**
         * Client specified an invalid argument. Note that this differs from
         * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
         * problematic regardless of the state of the system (e.g., a malformed file
         * name).
         */
        INVALID_ARGUMENT: "invalid-argument",
        /**
         * Deadline expired before operation could complete. For operations that
         * change the state of the system, this error may be returned even if the
         * operation has completed successfully. For example, a successful response
         * from a server could have been delayed long enough for the deadline to
         * expire.
         */
        DEADLINE_EXCEEDED: "deadline-exceeded",
        /** Some requested entity (e.g., file or directory) was not found. */
        NOT_FOUND: "not-found",
        /**
         * Some entity that we attempted to create (e.g., file or directory) already
         * exists.
         */
        ALREADY_EXISTS: "already-exists",
        /**
         * The caller does not have permission to execute the specified operation.
         * PERMISSION_DENIED must not be used for rejections caused by exhausting
         * some resource (use RESOURCE_EXHAUSTED instead for those errors).
         * PERMISSION_DENIED must not be used if the caller can not be identified
         * (use UNAUTHENTICATED instead for those errors).
         */
        PERMISSION_DENIED: "permission-denied",
        /**
         * The request does not have valid authentication credentials for the
         * operation.
         */
        UNAUTHENTICATED: "unauthenticated",
        /**
         * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
         * entire file system is out of space.
         */
        RESOURCE_EXHAUSTED: "resource-exhausted",
        /**
         * Operation was rejected because the system is not in a state required for
         * the operation's execution. For example, directory to be deleted may be
         * non-empty, an rmdir operation is applied to a non-directory, etc.
         *
         * A litmus test that may help a service implementor in deciding
         * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
         *  (a) Use UNAVAILABLE if the client can retry just the failing call.
         *  (b) Use ABORTED if the client should retry at a higher-level
         *      (e.g., restarting a read-modify-write sequence).
         *  (c) Use FAILED_PRECONDITION if the client should not retry until
         *      the system state has been explicitly fixed. E.g., if an "rmdir"
         *      fails because the directory is non-empty, FAILED_PRECONDITION
         *      should be returned since the client should not retry unless
         *      they have first fixed up the directory by deleting files from it.
         *  (d) Use FAILED_PRECONDITION if the client performs conditional
         *      REST Get/Update/Delete on a resource and the resource on the
         *      server does not match the condition. E.g., conflicting
         *      read-modify-write on the same resource.
         */
        FAILED_PRECONDITION: "failed-precondition",
        /**
         * The operation was aborted, typically due to a concurrency issue like
         * sequencer check failures, transaction aborts, etc.
         *
         * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
         * and UNAVAILABLE.
         */
        ABORTED: "aborted",
        /**
         * Operation was attempted past the valid range. E.g., seeking or reading
         * past end of file.
         *
         * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
         * if the system state changes. For example, a 32-bit file system will
         * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
         * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
         * an offset past the current file size.
         *
         * There is a fair bit of overlap between FAILED_PRECONDITION and
         * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
         * when it applies so that callers who are iterating through a space can
         * easily look for an OUT_OF_RANGE error to detect when they are done.
         */
        OUT_OF_RANGE: "out-of-range",
        /** Operation is not implemented or not supported/enabled in this service. */
        UNIMPLEMENTED: "unimplemented",
        /**
         * Internal errors. Means some invariants expected by underlying System has
         * been broken. If you see one of these errors, Something is very broken.
         */
        INTERNAL: "internal",
        /**
         * The service is currently unavailable. This is a most likely a transient
         * condition and may be corrected by retrying with a backoff.
         *
         * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
         * and UNAVAILABLE.
         */
        UNAVAILABLE: "unavailable",
        /** Unrecoverable data loss or corruption. */
        DATA_LOSS: "data-loss"
    };

    /**
     * An error class used for Firestore-generated errors. Ideally we should be
     * using FirebaseError, but integrating with it is overly arduous at the moment,
     * so we define our own compatible error class (with a `name` of 'FirebaseError'
     * and compatible `code` and `message` fields.)
     */ class D$1 extends Error {
        constructor(t, e) {
            super(e), this.code = t, this.message = e, this.name = "FirebaseError", 
            // HACK: We write a toString property directly because Error is not a real
            // class and so inheritance does not work correctly. We could alternatively
            // do the same "back-door inheritance" trick that FirebaseError does.
            this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class N$1 {
        constructor(t, e) {
            this.user = e, this.type = "OAuth", this.h = {}, 
            // Set the headers using Object Literal notation to avoid minification
            this.h.Authorization = "Bearer " + t;
        }
    }

    class x$1 {
        constructor(t) {
            /**
             * The auth token listener registered with FirebaseApp, retained here so we
             * can unregister it.
             */
            this.u = null, 
            /** Tracks the current User. */
            this.currentUser = A$1.UNAUTHENTICATED, this.l = !1, 
            /**
             * Counter used to detect if the token changed while a getToken request was
             * outstanding.
             */
            this._ = 0, 
            /** The listener registered with setChangeListener(). */
            this.T = null, this.forceRefresh = !1, this.u = () => {
                this._++, this.currentUser = this.I(), this.l = !0, this.T && this.T(this.currentUser);
            }, this._ = 0, this.auth = t.getImmediate({
                optional: !0
            }), this.auth ? this.auth.addAuthTokenListener(this.u) : (
            // if auth is not available, invoke tokenListener once with null token
            this.u(null), t.get().then(t => {
                this.auth = t, this.u && 
                // tokenListener can be removed by removeChangeListener()
                this.auth.addAuthTokenListener(this.u);
            }, () => {}));
        }
        getToken() {
            // Take note of the current value of the tokenCounter so that this method
            // can fail (with an ABORTED error) if there is a token change while the
            // request is outstanding.
            const t = this._, e = this.forceRefresh;
            return this.forceRefresh = !1, this.auth ? this.auth.getToken(e).then(e => 
            // Cancel the request since the token changed while the request was
            // outstanding so the response is potentially for a previous user (which
            // user, we can't be sure).
            this._ !== t ? (V$1("FirebaseCredentialsProvider", "getToken aborted due to token change."), 
            this.getToken()) : e ? (v$1("string" == typeof e.accessToken), new N$1(e.accessToken, this.currentUser)) : null) : Promise.resolve(null);
        }
        A() {
            this.forceRefresh = !0;
        }
        R(t) {
            this.T = t, 
            // Fire the initial event
            this.l && t(this.currentUser);
        }
        m() {
            this.auth && this.auth.removeAuthTokenListener(this.u), this.u = null, this.T = null;
        }
        // Auth.getUid() can return null even with a user logged in. It is because
        // getUid() is synchronous, but the auth code populating Uid is asynchronous.
        // This method should only be called in the AuthTokenListener callback
        // to guarantee to get the actual user.
        I() {
            const t = this.auth && this.auth.getUid();
            return v$1(null === t || "string" == typeof t), new A$1(t);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Generates `nBytes` of random bytes.
     *
     * If `nBytes < 0` , an error will be thrown.
     */ function k$1(t) {
        // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
        const e = 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "undefined" != typeof self && (self.crypto || self.msCrypto), n = new Uint8Array(t);
        if (e) e.getRandomValues(n); else 
        // Falls back to Math.random
        for (let e = 0; e < t; e++) n[e] = Math.floor(256 * Math.random());
        return n;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class O$1 {
        static P() {
            // Alphanumeric characters
            const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length;
            // The largest byte value that is a multiple of `char.length`.
                    let n = "";
            for (;n.length < 20; ) {
                const s = k$1(40);
                for (let i = 0; i < s.length; ++i) 
                // Only accept values that are [0, maxMultiple), this ensures they can
                // be evenly mapped to indices of `chars` via a modulo operation.
                n.length < 20 && s[i] < e && (n += t.charAt(s[i] % t.length));
            }
            return n;
        }
    }

    function F$1(t, e) {
        return t < e ? -1 : t > e ? 1 : 0;
    }

    /** Helper to compare arrays using isEqual(). */ function M$1(t, e, n) {
        return t.length === e.length && t.every((t, s) => n(t, e[s]));
    }

    /**
     * Returns the immediate lexicographically-following string. This is useful to
     * construct an inclusive range for indexeddb iterators.
     */ function $(t) {
        // Return the input string, with an additional NUL byte appended.
        return t + "\0";
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // The earlist date supported by Firestore timestamps (0001-01-01T00:00:00Z).
    class L$1 {
        constructor(t, e) {
            if (this.seconds = t, this.nanoseconds = e, e < 0) throw new D$1(C$1.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
            if (e >= 1e9) throw new D$1(C$1.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
            if (t < -62135596800) throw new D$1(C$1.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
            // This will break in the year 10,000.
                    if (t >= 253402300800) throw new D$1(C$1.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
        }
        static now() {
            return L$1.fromMillis(Date.now());
        }
        static fromDate(t) {
            return L$1.fromMillis(t.getTime());
        }
        static fromMillis(t) {
            const e = Math.floor(t / 1e3);
            return new L$1(e, 1e6 * (t - 1e3 * e));
        }
        toDate() {
            return new Date(this.toMillis());
        }
        toMillis() {
            return 1e3 * this.seconds + this.nanoseconds / 1e6;
        }
        V(t) {
            return this.seconds === t.seconds ? F$1(this.nanoseconds, t.nanoseconds) : F$1(this.seconds, t.seconds);
        }
        isEqual(t) {
            return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
        }
        toString() {
            return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
        }
        valueOf() {
            // This method returns a string of the form <seconds>.<nanoseconds> where <seconds> is
            // translated to have a non-negative value and both <seconds> and <nanoseconds> are left-padded
            // with zeroes to be a consistent length. Strings with this format then have a lexiographical
            // ordering that matches the expected ordering. The <seconds> translation is done to avoid
            // having a leading negative sign (i.e. a leading '-' character) in its string representation,
            // which would affect its lexiographical ordering.
            const t = this.seconds - -62135596800;
            // Note: Up to 12 decimal digits are required to represent all valid 'seconds' values.
                    return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A version of a document in Firestore. This corresponds to the version
     * timestamp, such as update_time or read_time.
     */ class q$1 {
        constructor(t) {
            this.timestamp = t;
        }
        static g(t) {
            return new q$1(t);
        }
        static min() {
            return new q$1(new L$1(0, 0));
        }
        p(t) {
            return this.timestamp.V(t.timestamp);
        }
        isEqual(t) {
            return this.timestamp.isEqual(t.timestamp);
        }
        /** Returns a number representation of the version for use in spec tests. */    v() {
            // Convert to microseconds.
            return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
        }
        toString() {
            return "SnapshotVersion(" + this.timestamp.toString() + ")";
        }
        S() {
            return this.timestamp;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Path represents an ordered sequence of string segments.
     */
    class B {
        constructor(t, e, n) {
            void 0 === e ? e = 0 : e > t.length && b(), void 0 === n ? n = t.length - e : n > t.length - e && b(), 
            this.segments = t, this.offset = e, this.C = n;
        }
        get length() {
            return this.C;
        }
        isEqual(t) {
            return 0 === B.D(this, t);
        }
        child(t) {
            const e = this.segments.slice(this.offset, this.limit());
            return t instanceof B ? t.forEach(t => {
                e.push(t);
            }) : e.push(t), this.N(e);
        }
        /** The index of one past the last segment of the path. */    limit() {
            return this.offset + this.length;
        }
        k(t) {
            return t = void 0 === t ? 1 : t, this.N(this.segments, this.offset + t, this.length - t);
        }
        O() {
            return this.N(this.segments, this.offset, this.length - 1);
        }
        F() {
            return this.segments[this.offset];
        }
        M() {
            return this.get(this.length - 1);
        }
        get(t) {
            return this.segments[this.offset + t];
        }
        $() {
            return 0 === this.length;
        }
        L(t) {
            if (t.length < this.length) return !1;
            for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
            return !0;
        }
        q(t) {
            if (this.length + 1 !== t.length) return !1;
            for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
            return !0;
        }
        forEach(t) {
            for (let e = this.offset, n = this.limit(); e < n; e++) t(this.segments[e]);
        }
        B() {
            return this.segments.slice(this.offset, this.limit());
        }
        static D(t, e) {
            const n = Math.min(t.length, e.length);
            for (let s = 0; s < n; s++) {
                const n = t.get(s), i = e.get(s);
                if (n < i) return -1;
                if (n > i) return 1;
            }
            return t.length < e.length ? -1 : t.length > e.length ? 1 : 0;
        }
    }

    /**
     * A slash-separated path for navigating resources (documents and collections)
     * within Firestore.
     */ class U$1 extends B {
        N(t, e, n) {
            return new U$1(t, e, n);
        }
        U() {
            // NOTE: The client is ignorant of any path segments containing escape
            // sequences (e.g. __id123__) and just passes them through raw (they exist
            // for legacy reasons and should not be used frequently).
            return this.B().join("/");
        }
        toString() {
            return this.U();
        }
        /**
         * Creates a resource path from the given slash-delimited string.
         */    static W(t) {
            // NOTE: The client is ignorant of any path segments containing escape
            // sequences (e.g. __id123__) and just passes them through raw (they exist
            // for legacy reasons and should not be used frequently).
            if (t.indexOf("//") >= 0) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid path (${t}). Paths must not contain // in them.`);
            // We may still have an empty segment at the beginning or end if they had a
            // leading or trailing slash (which we allow).
                    const e = t.split("/").filter(t => t.length > 0);
            return new U$1(e);
        }
        static K() {
            return new U$1([]);
        }
    }

    const W$1 = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

    /** A dot-separated path for navigating sub-objects within a document. */ class K$1 extends B {
        N(t, e, n) {
            return new K$1(t, e, n);
        }
        /**
         * Returns true if the string could be used as a segment in a field path
         * without escaping.
         */    static j(t) {
            return W$1.test(t);
        }
        U() {
            return this.B().map(t => (t = t.replace("\\", "\\\\").replace("`", "\\`"), K$1.j(t) || (t = "`" + t + "`"), 
            t)).join(".");
        }
        toString() {
            return this.U();
        }
        /**
         * Returns true if this field references the key of a document.
         */    G() {
            return 1 === this.length && "__name__" === this.get(0);
        }
        /**
         * The field designating the key of a document.
         */    static H() {
            return new K$1([ "__name__" ]);
        }
        /**
         * Parses a field string from the given server-formatted string.
         *
         * - Splitting the empty string is not allowed (for now at least).
         * - Empty segments within the string (e.g. if there are two consecutive
         *   separators) are not allowed.
         *
         * TODO(b/37244157): we should make this more strict. Right now, it allows
         * non-identifier path components, even if they aren't escaped.
         */    static J(t) {
            const e = [];
            let n = "", s = 0;
            const i = () => {
                if (0 === n.length) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
                e.push(n), n = "";
            };
            let r = !1;
            for (;s < t.length; ) {
                const e = t[s];
                if ("\\" === e) {
                    if (s + 1 === t.length) throw new D$1(C$1.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
                    const e = t[s + 1];
                    if ("\\" !== e && "." !== e && "`" !== e) throw new D$1(C$1.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
                    n += e, s += 2;
                } else "`" === e ? (r = !r, s++) : "." !== e || r ? (n += e, s++) : (i(), s++);
            }
            if (i(), r) throw new D$1(C$1.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
            return new K$1(e);
        }
        static K() {
            return new K$1([]);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class j {
        constructor(t) {
            this.path = t;
        }
        static Y(t) {
            return new j(U$1.W(t).k(5));
        }
        /** Returns true if the document is in the specified collectionId. */    X(t) {
            return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
        }
        isEqual(t) {
            return null !== t && 0 === U$1.D(this.path, t.path);
        }
        toString() {
            return this.path.toString();
        }
        static D(t, e) {
            return U$1.D(t.path, e.path);
        }
        static Z(t) {
            return t.length % 2 == 0;
        }
        /**
         * Creates and returns a new document key with the given segments.
         *
         * @param segments The segments of the path to the document
         * @return A new instance of DocumentKey
         */    static tt(t) {
            return new j(new U$1(t.slice()));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Q$1 {
        /**
         * Constructs a DatabaseInfo using the provided host, databaseId and
         * persistenceKey.
         *
         * @param databaseId The database to use.
         * @param persistenceKey A unique identifier for this Firestore's local
         * storage (used in conjunction with the databaseId).
         * @param host The Firestore backend host to connect to.
         * @param ssl Whether to use SSL when connecting.
         * @param forceLongPolling Whether to use the forceLongPolling option
         * when using WebChannel as the network transport.
         */
        constructor(t, e, n, s, i) {
            this.et = t, this.persistenceKey = e, this.host = n, this.ssl = s, this.forceLongPolling = i;
        }
    }

    /** The default database name for a project. */
    /** Represents the database ID a Firestore client is associated with. */
    class G$1 {
        constructor(t, e) {
            this.projectId = t, this.database = e || "(default)";
        }
        get nt() {
            return "(default)" === this.database;
        }
        isEqual(t) {
            return t instanceof G$1 && t.projectId === this.projectId && t.database === this.database;
        }
        p(t) {
            return F$1(this.projectId, t.projectId) || F$1(this.database, t.database);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns whether a variable is either undefined or null.
     */ function z(t) {
        return null == t;
    }

    /** Returns whether the value represents -0. */ function H$1(t) {
        // Detect if the value is -0.0. Based on polyfill from
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
        return -0 === t && 1 / t == -1 / 0;
    }

    /**
     * Returns whether a value is an integer and in the safe integer range
     * @param value The value to test for being an integer and in the safe range
     */ function J$1(t) {
        return "number" == typeof t && Number.isInteger(t) && !H$1(t) && t <= Number.MAX_SAFE_INTEGER && t >= Number.MIN_SAFE_INTEGER;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Visible for testing
    class Y$1 {
        constructor(t, e = null, n = [], s = [], i = null, r = null, o = null) {
            this.path = t, this.collectionGroup = e, this.orderBy = n, this.filters = s, this.limit = i, 
            this.startAt = r, this.endAt = o, this.st = null;
        }
    }

    /**
     * Initializes a Target with a path and optional additional query constraints.
     * Path must currently be empty if this is a collection group query.
     *
     * NOTE: you should always construct `Target` from `Query.toTarget` instead of
     * using this factory method, because `Query` provides an implicit `orderBy`
     * property.
     */ function X$1(t, e = null, n = [], s = [], i = null, r = null, o = null) {
        return new Y$1(t, e, n, s, i, r, o);
    }

    function Z$1(t) {
        const e = S$1(t);
        if (null === e.st) {
            let t = e.path.U();
            null !== e.collectionGroup && (t += "|cg:" + e.collectionGroup), t += "|f:", t += e.filters.map(t => qn(t)).join(","), 
            t += "|ob:", t += e.orderBy.map(t => function(t) {
                // TODO(b/29183165): Make this collision robust.
                return t.field.U() + t.dir;
            }(t)).join(","), z(e.limit) || (t += "|l:", t += e.limit), e.startAt && (t += "|lb:", 
            t += Jn(e.startAt)), e.endAt && (t += "|ub:", t += Jn(e.endAt)), e.st = t;
        }
        return e.st;
    }

    function tt(t) {
        let e = t.path.U();
        return null !== t.collectionGroup && (e += " collectionGroup=" + t.collectionGroup), 
        t.filters.length > 0 && (e += `, filters: [${t.filters.map(t => {
        return `${(e = t).field.U()} ${e.op} ${zt(e.value)}`;
        /** Returns a debug description for `filter`. */
        var e;
        /** Filter that matches on key fields (i.e. '__name__'). */    }).join(", ")}]`), 
        z(t.limit) || (e += ", limit: " + t.limit), t.orderBy.length > 0 && (e += `, orderBy: [${t.orderBy.map(t => function(t) {
        return `${t.field.U()} (${t.dir})`;
    }(t)).join(", ")}]`), t.startAt && (e += ", startAt: " + Jn(t.startAt)), t.endAt && (e += ", endAt: " + Jn(t.endAt)), 
        `Target(${e})`;
    }

    function et(t, e) {
        if (t.limit !== e.limit) return !1;
        if (t.orderBy.length !== e.orderBy.length) return !1;
        for (let n = 0; n < t.orderBy.length; n++) if (!es(t.orderBy[n], e.orderBy[n])) return !1;
        if (t.filters.length !== e.filters.length) return !1;
        for (let i = 0; i < t.filters.length; i++) if (n = t.filters[i], s = e.filters[i], 
        n.op !== s.op || !n.field.isEqual(s.field) || !Kt(n.value, s.value)) return !1;
        var n, s;
        return t.collectionGroup === e.collectionGroup && (!!t.path.isEqual(e.path) && (!!Xn(t.startAt, e.startAt) && Xn(t.endAt, e.endAt)));
    }

    function nt(t) {
        return j.Z(t.path) && null === t.collectionGroup && 0 === t.filters.length;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Converts a Base64 encoded string to a binary string. */
    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Immutable class that represents a "proto" byte string.
     *
     * Proto byte strings can either be Base64-encoded strings or Uint8Arrays when
     * sent on the wire. This class abstracts away this differentiation by holding
     * the proto byte string in a common class that must be converted into a string
     * before being sent as a proto.
     */
    class st {
        constructor(t) {
            this.it = t;
        }
        static fromBase64String(t) {
            const e = atob(t);
            return new st(e);
        }
        static fromUint8Array(t) {
            const e = 
            /**
     * Helper function to convert an Uint8array to a binary string.
     */
            function(t) {
                let e = "";
                for (let n = 0; n < t.length; ++n) e += String.fromCharCode(t[n]);
                return e;
            }
            /**
     * Helper function to convert a binary string to an Uint8Array.
     */ (t);
            return new st(e);
        }
        toBase64() {
            return t = this.it, btoa(t);
            /** Converts a binary string to a Base64 encoded string. */
            var t;
            /** True if and only if the Base64 conversion functions are available. */    }
        toUint8Array() {
            return function(t) {
                const e = new Uint8Array(t.length);
                for (let n = 0; n < t.length; n++) e[n] = t.charCodeAt(n);
                return e;
            }
            /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
            /**
     * An immutable set of metadata that the local store tracks for each target.
     */ (this.it);
        }
        rt() {
            return 2 * this.it.length;
        }
        p(t) {
            return F$1(this.it, t.it);
        }
        isEqual(t) {
            return this.it === t.it;
        }
    }

    st.ot = new st("");

    class it {
        constructor(
        /** The target being listened to. */
        t, 
        /**
         * The target ID to which the target corresponds; Assigned by the
         * LocalStore for user listens and by the SyncEngine for limbo watches.
         */
        e, 
        /** The purpose of the target. */
        n, 
        /**
         * The sequence number of the last transaction during which this target data
         * was modified.
         */
        s, 
        /** The latest snapshot version seen for this target. */
        i = q$1.min()
        /**
         * The maximum snapshot version at which the associated view
         * contained no limbo documents.
         */ , r = q$1.min()
        /**
         * An opaque, server-assigned token that allows watching a target to be
         * resumed after disconnecting without retransmitting all the data that
         * matches the target. The resume token essentially identifies a point in
         * time from which the server should resume sending results.
         */ , o = st.ot) {
            this.target = t, this.targetId = e, this.ht = n, this.sequenceNumber = s, this.at = i, 
            this.lastLimboFreeSnapshotVersion = r, this.resumeToken = o;
        }
        /** Creates a new target data instance with an updated sequence number. */    ut(t) {
            return new it(this.target, this.targetId, this.ht, t, this.at, this.lastLimboFreeSnapshotVersion, this.resumeToken);
        }
        /**
         * Creates a new target data instance with an updated resume token and
         * snapshot version.
         */    ct(t, e) {
            return new it(this.target, this.targetId, this.ht, this.sequenceNumber, e, this.lastLimboFreeSnapshotVersion, t);
        }
        /**
         * Creates a new target data instance with an updated last limbo free
         * snapshot version number.
         */    lt(t) {
            return new it(this.target, this.targetId, this.ht, this.sequenceNumber, this.at, t, this.resumeToken);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class rt {
        // TODO(b/33078163): just use simplest form of existence filter for now
        constructor(t) {
            this.count = t;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Error Codes describing the different ways GRPC can fail. These are copied
     * directly from GRPC's sources here:
     *
     * https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
     *
     * Important! The names of these identifiers matter because the string forms
     * are used for reverse lookups from the webchannel stream. Do NOT change the
     * names of these identifiers or change this into a const enum.
     */ var ot, ht;

    /**
     * Determines whether an error code represents a permanent error when received
     * in response to a non-write operation.
     *
     * See isPermanentWriteError for classifying write errors.
     */
    function at(t) {
        switch (t) {
          case C$1.OK:
            return b();

          case C$1.CANCELLED:
          case C$1.UNKNOWN:
          case C$1.DEADLINE_EXCEEDED:
          case C$1.RESOURCE_EXHAUSTED:
          case C$1.INTERNAL:
          case C$1.UNAVAILABLE:
     // Unauthenticated means something went wrong with our token and we need
            // to retry with new credentials which will happen automatically.
                  case C$1.UNAUTHENTICATED:
            return !1;

          case C$1.INVALID_ARGUMENT:
          case C$1.NOT_FOUND:
          case C$1.ALREADY_EXISTS:
          case C$1.PERMISSION_DENIED:
          case C$1.FAILED_PRECONDITION:
     // Aborted might be retried in some scenarios, but that is dependant on
            // the context and should handled individually by the calling code.
            // See https://cloud.google.com/apis/design/errors.
                  case C$1.ABORTED:
          case C$1.OUT_OF_RANGE:
          case C$1.UNIMPLEMENTED:
          case C$1.DATA_LOSS:
            return !0;

          default:
            return b();
        }
    }

    /**
     * Determines whether an error code represents a permanent error when received
     * in response to a write operation.
     *
     * Write operations must be handled specially because as of b/119437764, ABORTED
     * errors on the write stream should be retried too (even though ABORTED errors
     * are not generally retryable).
     *
     * Note that during the initial handshake on the write stream an ABORTED error
     * signals that we should discard our stream token (i.e. it is permanent). This
     * means a handshake error should be classified with isPermanentError, above.
     */
    /**
     * Maps an error Code from GRPC status code number, like 0, 1, or 14. These
     * are not the same as HTTP status codes.
     *
     * @returns The Code equivalent to the given GRPC status code. Fails if there
     *     is no match.
     */
    function ut(t) {
        if (void 0 === t) 
        // This shouldn't normally happen, but in certain error cases (like trying
        // to send invalid proto messages) we may get an error with no GRPC code.
        return g$1("GRPC error has no .code"), C$1.UNKNOWN;
        switch (t) {
          case ot.OK:
            return C$1.OK;

          case ot.CANCELLED:
            return C$1.CANCELLED;

          case ot.UNKNOWN:
            return C$1.UNKNOWN;

          case ot.DEADLINE_EXCEEDED:
            return C$1.DEADLINE_EXCEEDED;

          case ot.RESOURCE_EXHAUSTED:
            return C$1.RESOURCE_EXHAUSTED;

          case ot.INTERNAL:
            return C$1.INTERNAL;

          case ot.UNAVAILABLE:
            return C$1.UNAVAILABLE;

          case ot.UNAUTHENTICATED:
            return C$1.UNAUTHENTICATED;

          case ot.INVALID_ARGUMENT:
            return C$1.INVALID_ARGUMENT;

          case ot.NOT_FOUND:
            return C$1.NOT_FOUND;

          case ot.ALREADY_EXISTS:
            return C$1.ALREADY_EXISTS;

          case ot.PERMISSION_DENIED:
            return C$1.PERMISSION_DENIED;

          case ot.FAILED_PRECONDITION:
            return C$1.FAILED_PRECONDITION;

          case ot.ABORTED:
            return C$1.ABORTED;

          case ot.OUT_OF_RANGE:
            return C$1.OUT_OF_RANGE;

          case ot.UNIMPLEMENTED:
            return C$1.UNIMPLEMENTED;

          case ot.DATA_LOSS:
            return C$1.DATA_LOSS;

          default:
            return b();
        }
    }

    /**
     * Converts an HTTP response's error status to the equivalent error code.
     *
     * @param status An HTTP error response status ("FAILED_PRECONDITION",
     * "UNKNOWN", etc.)
     * @returns The equivalent Code. Non-matching responses are mapped to
     *     Code.UNKNOWN.
     */ (ht = ot || (ot = {}))[ht.OK = 0] = "OK", ht[ht.CANCELLED = 1] = "CANCELLED", 
    ht[ht.UNKNOWN = 2] = "UNKNOWN", ht[ht.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", 
    ht[ht.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", ht[ht.NOT_FOUND = 5] = "NOT_FOUND", 
    ht[ht.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", ht[ht.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", 
    ht[ht.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", ht[ht.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", 
    ht[ht.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", ht[ht.ABORTED = 10] = "ABORTED", 
    ht[ht.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", ht[ht.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", 
    ht[ht.INTERNAL = 13] = "INTERNAL", ht[ht.UNAVAILABLE = 14] = "UNAVAILABLE", ht[ht.DATA_LOSS = 15] = "DATA_LOSS";

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // An immutable sorted map implementation, based on a Left-leaning Red-Black
    // tree.
    class ct {
        constructor(t, e) {
            this.D = t, this.root = e || _t.EMPTY;
        }
        // Returns a copy of the map, with the specified key/value added or replaced.
        _t(t, e) {
            return new ct(this.D, this.root._t(t, e, this.D).copy(null, null, _t.ft, null, null));
        }
        // Returns a copy of the map, with the specified key removed.
        remove(t) {
            return new ct(this.D, this.root.remove(t, this.D).copy(null, null, _t.ft, null, null));
        }
        // Returns the value of the node with the given key, or null.
        get(t) {
            let e = this.root;
            for (;!e.$(); ) {
                const n = this.D(t, e.key);
                if (0 === n) return e.value;
                n < 0 ? e = e.left : n > 0 && (e = e.right);
            }
            return null;
        }
        // Returns the index of the element in this sorted map, or -1 if it doesn't
        // exist.
        indexOf(t) {
            // Number of nodes that were pruned when descending right
            let e = 0, n = this.root;
            for (;!n.$(); ) {
                const s = this.D(t, n.key);
                if (0 === s) return e + n.left.size;
                s < 0 ? n = n.left : (
                // Count all nodes left of the node plus the node itself
                e += n.left.size + 1, n = n.right);
            }
            // Node not found
                    return -1;
        }
        $() {
            return this.root.$();
        }
        // Returns the total number of nodes in the map.
        get size() {
            return this.root.size;
        }
        // Returns the minimum key in the map.
        dt() {
            return this.root.dt();
        }
        // Returns the maximum key in the map.
        wt() {
            return this.root.wt();
        }
        // Traverses the map in key order and calls the specified action function
        // for each key/value pair. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        Tt(t) {
            return this.root.Tt(t);
        }
        forEach(t) {
            this.Tt((e, n) => (t(e, n), !1));
        }
        toString() {
            const t = [];
            return this.Tt((e, n) => (t.push(`${e}:${n}`), !1)), `{${t.join(", ")}}`;
        }
        // Traverses the map in reverse key order and calls the specified action
        // function for each key/value pair. If action returns true, traversal is
        // aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        Et(t) {
            return this.root.Et(t);
        }
        // Returns an iterator over the SortedMap.
        It() {
            return new lt(this.root, null, this.D, !1);
        }
        At(t) {
            return new lt(this.root, t, this.D, !1);
        }
        Rt() {
            return new lt(this.root, null, this.D, !0);
        }
        Pt(t) {
            return new lt(this.root, t, this.D, !0);
        }
    }

     // end SortedMap
    // An iterator over an LLRBNode.
    class lt {
        constructor(t, e, n, s) {
            this.Vt = s, this.gt = [];
            let i = 1;
            for (;!t.$(); ) if (i = e ? n(t.key, e) : 1, 
            // flip the comparison if we're going in reverse
            s && (i *= -1), i < 0) 
            // This node is less than our start key. ignore it
            t = this.Vt ? t.left : t.right; else {
                if (0 === i) {
                    // This node is exactly equal to our start key. Push it on the stack,
                    // but stop iterating;
                    this.gt.push(t);
                    break;
                }
                // This node is greater than our start key, add it to the stack and move
                // to the next one
                this.gt.push(t), t = this.Vt ? t.right : t.left;
            }
        }
        yt() {
            let t = this.gt.pop();
            const e = {
                key: t.key,
                value: t.value
            };
            if (this.Vt) for (t = t.left; !t.$(); ) this.gt.push(t), t = t.right; else for (t = t.right; !t.$(); ) this.gt.push(t), 
            t = t.left;
            return e;
        }
        pt() {
            return this.gt.length > 0;
        }
        bt() {
            if (0 === this.gt.length) return null;
            const t = this.gt[this.gt.length - 1];
            return {
                key: t.key,
                value: t.value
            };
        }
    }

     // end SortedMapIterator
    // Represents a node in a Left-leaning Red-Black tree.
    class _t {
        constructor(t, e, n, s, i) {
            this.key = t, this.value = e, this.color = null != n ? n : _t.RED, this.left = null != s ? s : _t.EMPTY, 
            this.right = null != i ? i : _t.EMPTY, this.size = this.left.size + 1 + this.right.size;
        }
        // Returns a copy of the current node, optionally replacing pieces of it.
        copy(t, e, n, s, i) {
            return new _t(null != t ? t : this.key, null != e ? e : this.value, null != n ? n : this.color, null != s ? s : this.left, null != i ? i : this.right);
        }
        $() {
            return !1;
        }
        // Traverses the tree in key order and calls the specified action function
        // for each node. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        Tt(t) {
            return this.left.Tt(t) || t(this.key, this.value) || this.right.Tt(t);
        }
        // Traverses the tree in reverse key order and calls the specified action
        // function for each node. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        Et(t) {
            return this.right.Et(t) || t(this.key, this.value) || this.left.Et(t);
        }
        // Returns the minimum node in the tree.
        min() {
            return this.left.$() ? this : this.left.min();
        }
        // Returns the maximum key in the tree.
        dt() {
            return this.min().key;
        }
        // Returns the maximum key in the tree.
        wt() {
            return this.right.$() ? this.key : this.right.wt();
        }
        // Returns new tree, with the key/value added.
        _t(t, e, n) {
            let s = this;
            const i = n(t, s.key);
            return s = i < 0 ? s.copy(null, null, null, s.left._t(t, e, n), null) : 0 === i ? s.copy(null, e, null, null, null) : s.copy(null, null, null, null, s.right._t(t, e, n)), 
            s.vt();
        }
        St() {
            if (this.left.$()) return _t.EMPTY;
            let t = this;
            return t.left.Ct() || t.left.left.Ct() || (t = t.Dt()), t = t.copy(null, null, null, t.left.St(), null), 
            t.vt();
        }
        // Returns new tree, with the specified item removed.
        remove(t, e) {
            let n, s = this;
            if (e(t, s.key) < 0) s.left.$() || s.left.Ct() || s.left.left.Ct() || (s = s.Dt()), 
            s = s.copy(null, null, null, s.left.remove(t, e), null); else {
                if (s.left.Ct() && (s = s.Nt()), s.right.$() || s.right.Ct() || s.right.left.Ct() || (s = s.xt()), 
                0 === e(t, s.key)) {
                    if (s.right.$()) return _t.EMPTY;
                    n = s.right.min(), s = s.copy(n.key, n.value, null, null, s.right.St());
                }
                s = s.copy(null, null, null, null, s.right.remove(t, e));
            }
            return s.vt();
        }
        Ct() {
            return this.color;
        }
        // Returns new tree after performing any needed rotations.
        vt() {
            let t = this;
            return t.right.Ct() && !t.left.Ct() && (t = t.kt()), t.left.Ct() && t.left.left.Ct() && (t = t.Nt()), 
            t.left.Ct() && t.right.Ct() && (t = t.Ot()), t;
        }
        Dt() {
            let t = this.Ot();
            return t.right.left.Ct() && (t = t.copy(null, null, null, null, t.right.Nt()), t = t.kt(), 
            t = t.Ot()), t;
        }
        xt() {
            let t = this.Ot();
            return t.left.left.Ct() && (t = t.Nt(), t = t.Ot()), t;
        }
        kt() {
            const t = this.copy(null, null, _t.RED, null, this.right.left);
            return this.right.copy(null, null, this.color, t, null);
        }
        Nt() {
            const t = this.copy(null, null, _t.RED, this.left.right, null);
            return this.left.copy(null, null, this.color, null, t);
        }
        Ot() {
            const t = this.left.copy(null, null, !this.left.color, null, null), e = this.right.copy(null, null, !this.right.color, null, null);
            return this.copy(null, null, !this.color, t, e);
        }
        // For testing.
        Ft() {
            const t = this.Mt();
            return Math.pow(2, t) <= this.size + 1;
        }
        // In a balanced RB tree, the black-depth (number of black nodes) from root to
        // leaves is equal on both sides.  This function verifies that or asserts.
        Mt() {
            if (this.Ct() && this.left.Ct()) throw b();
            if (this.right.Ct()) throw b();
            const t = this.left.Mt();
            if (t !== this.right.Mt()) throw b();
            return t + (this.Ct() ? 0 : 1);
        }
    }

     // end LLRBNode
    // Empty node is shared between all LLRB trees.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _t.EMPTY = null, _t.RED = !0, _t.ft = !1;

    // end LLRBEmptyNode
    _t.EMPTY = new 
    // Represents an empty node (a leaf node in the Red-Black Tree).
    class {
        constructor() {
            this.size = 0;
        }
        get key() {
            throw b();
        }
        get value() {
            throw b();
        }
        get color() {
            throw b();
        }
        get left() {
            throw b();
        }
        get right() {
            throw b();
        }
        // Returns a copy of the current node.
        copy(t, e, n, s, i) {
            return this;
        }
        // Returns a copy of the tree, with the specified key/value added.
        _t(t, e, n) {
            return new _t(t, e);
        }
        // Returns a copy of the tree, with the specified key removed.
        remove(t, e) {
            return this;
        }
        $() {
            return !0;
        }
        Tt(t) {
            return !1;
        }
        Et(t) {
            return !1;
        }
        dt() {
            return null;
        }
        wt() {
            return null;
        }
        Ct() {
            return !1;
        }
        // For testing.
        Ft() {
            return !0;
        }
        Mt() {
            return 0;
        }
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * SortedSet is an immutable (copy-on-write) collection that holds elements
     * in order specified by the provided comparator.
     *
     * NOTE: if provided comparator returns 0 for two elements, we consider them to
     * be equal!
     */
    class ft {
        constructor(t) {
            this.D = t, this.data = new ct(this.D);
        }
        has(t) {
            return null !== this.data.get(t);
        }
        first() {
            return this.data.dt();
        }
        last() {
            return this.data.wt();
        }
        get size() {
            return this.data.size;
        }
        indexOf(t) {
            return this.data.indexOf(t);
        }
        /** Iterates elements in order defined by "comparator" */    forEach(t) {
            this.data.Tt((e, n) => (t(e), !1));
        }
        /** Iterates over `elem`s such that: range[0] <= elem < range[1]. */    $t(t, e) {
            const n = this.data.At(t[0]);
            for (;n.pt(); ) {
                const s = n.yt();
                if (this.D(s.key, t[1]) >= 0) return;
                e(s.key);
            }
        }
        /**
         * Iterates over `elem`s such that: start <= elem until false is returned.
         */    Lt(t, e) {
            let n;
            for (n = void 0 !== e ? this.data.At(e) : this.data.It(); n.pt(); ) {
                if (!t(n.yt().key)) return;
            }
        }
        /** Finds the least element greater than or equal to `elem`. */    qt(t) {
            const e = this.data.At(t);
            return e.pt() ? e.yt().key : null;
        }
        It() {
            return new dt(this.data.It());
        }
        At(t) {
            return new dt(this.data.At(t));
        }
        /** Inserts or updates an element */    add(t) {
            return this.copy(this.data.remove(t)._t(t, !0));
        }
        /** Deletes an element */    delete(t) {
            return this.has(t) ? this.copy(this.data.remove(t)) : this;
        }
        $() {
            return this.data.$();
        }
        Bt(t) {
            let e = this;
            // Make sure `result` always refers to the larger one of the two sets.
                    return e.size < t.size && (e = t, t = this), t.forEach(t => {
                e = e.add(t);
            }), e;
        }
        isEqual(t) {
            if (!(t instanceof ft)) return !1;
            if (this.size !== t.size) return !1;
            const e = this.data.It(), n = t.data.It();
            for (;e.pt(); ) {
                const t = e.yt().key, s = n.yt().key;
                if (0 !== this.D(t, s)) return !1;
            }
            return !0;
        }
        B() {
            const t = [];
            return this.forEach(e => {
                t.push(e);
            }), t;
        }
        toString() {
            const t = [];
            return this.forEach(e => t.push(e)), "SortedSet(" + t.toString() + ")";
        }
        copy(t) {
            const e = new ft(this.D);
            return e.data = t, e;
        }
    }

    class dt {
        constructor(t) {
            this.Ut = t;
        }
        yt() {
            return this.Ut.yt().key;
        }
        pt() {
            return this.Ut.pt();
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const wt = new ct(j.D);

    function Tt() {
        return wt;
    }

    function Et() {
        return Tt();
    }

    const It = new ct(j.D);

    function At() {
        return It;
    }

    const Rt = new ct(j.D);

    const mt = new ft(j.D);

    function Pt(...t) {
        let e = mt;
        for (const n of t) e = e.add(n);
        return e;
    }

    const Vt = new ft(F$1);

    function gt() {
        return Vt;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * DocumentSet is an immutable (copy-on-write) collection that holds documents
     * in order specified by the provided comparator. We always add a document key
     * comparator on top of what is provided to guarantee document equality based on
     * the key.
     */ class yt {
        /** The default ordering is by key if the comparator is omitted */
        constructor(t) {
            // We are adding document key comparator to the end as it's the only
            // guaranteed unique property of a document.
            this.D = t ? (e, n) => t(e, n) || j.D(e.key, n.key) : (t, e) => j.D(t.key, e.key), 
            this.Wt = At(), this.Kt = new ct(this.D);
        }
        /**
         * Returns an empty copy of the existing DocumentSet, using the same
         * comparator.
         */    static jt(t) {
            return new yt(t.D);
        }
        has(t) {
            return null != this.Wt.get(t);
        }
        get(t) {
            return this.Wt.get(t);
        }
        first() {
            return this.Kt.dt();
        }
        last() {
            return this.Kt.wt();
        }
        $() {
            return this.Kt.$();
        }
        /**
         * Returns the index of the provided key in the document set, or -1 if the
         * document key is not present in the set;
         */    indexOf(t) {
            const e = this.Wt.get(t);
            return e ? this.Kt.indexOf(e) : -1;
        }
        get size() {
            return this.Kt.size;
        }
        /** Iterates documents in order defined by "comparator" */    forEach(t) {
            this.Kt.Tt((e, n) => (t(e), !1));
        }
        /** Inserts or updates a document with the same key */    add(t) {
            // First remove the element if we have it.
            const e = this.delete(t.key);
            return e.copy(e.Wt._t(t.key, t), e.Kt._t(t, null));
        }
        /** Deletes a document with a given key */    delete(t) {
            const e = this.get(t);
            return e ? this.copy(this.Wt.remove(t), this.Kt.remove(e)) : this;
        }
        isEqual(t) {
            if (!(t instanceof yt)) return !1;
            if (this.size !== t.size) return !1;
            const e = this.Kt.It(), n = t.Kt.It();
            for (;e.pt(); ) {
                const t = e.yt().key, s = n.yt().key;
                if (!t.isEqual(s)) return !1;
            }
            return !0;
        }
        toString() {
            const t = [];
            return this.forEach(e => {
                t.push(e.toString());
            }), 0 === t.length ? "DocumentSet ()" : "DocumentSet (\n  " + t.join("  \n") + "\n)";
        }
        copy(t, e) {
            const n = new yt;
            return n.D = this.D, n.Wt = t, n.Kt = e, n;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * DocumentChangeSet keeps track of a set of changes to docs in a query, merging
     * duplicate events for the same doc.
     */ class pt {
        constructor() {
            this.Qt = new ct(j.D);
        }
        track(t) {
            const e = t.doc.key, n = this.Qt.get(e);
            n ? 
            // Merge the new change with the existing change.
            0 /* Added */ !== t.type && 3 /* Metadata */ === n.type ? this.Qt = this.Qt._t(e, t) : 3 /* Metadata */ === t.type && 1 /* Removed */ !== n.type ? this.Qt = this.Qt._t(e, {
                type: n.type,
                doc: t.doc
            }) : 2 /* Modified */ === t.type && 2 /* Modified */ === n.type ? this.Qt = this.Qt._t(e, {
                type: 2 /* Modified */ ,
                doc: t.doc
            }) : 2 /* Modified */ === t.type && 0 /* Added */ === n.type ? this.Qt = this.Qt._t(e, {
                type: 0 /* Added */ ,
                doc: t.doc
            }) : 1 /* Removed */ === t.type && 0 /* Added */ === n.type ? this.Qt = this.Qt.remove(e) : 1 /* Removed */ === t.type && 2 /* Modified */ === n.type ? this.Qt = this.Qt._t(e, {
                type: 1 /* Removed */ ,
                doc: n.doc
            }) : 0 /* Added */ === t.type && 1 /* Removed */ === n.type ? this.Qt = this.Qt._t(e, {
                type: 2 /* Modified */ ,
                doc: t.doc
            }) : 
            // This includes these cases, which don't make sense:
            // Added->Added
            // Removed->Removed
            // Modified->Added
            // Removed->Modified
            // Metadata->Added
            // Removed->Metadata
            b() : this.Qt = this.Qt._t(e, t);
        }
        Gt() {
            const t = [];
            return this.Qt.Tt((e, n) => {
                t.push(n);
            }), t;
        }
    }

    class bt {
        constructor(t, e, n, s, i, r, o, h) {
            this.query = t, this.docs = e, this.zt = n, this.docChanges = s, this.Ht = i, this.fromCache = r, 
            this.Jt = o, this.Yt = h;
        }
        /** Returns a view snapshot as if all documents in the snapshot were added. */    static Xt(t, e, n, s) {
            const i = [];
            return e.forEach(t => {
                i.push({
                    type: 0 /* Added */ ,
                    doc: t
                });
            }), new bt(t, e, yt.jt(e), i, n, s, 
            /* syncStateChanged= */ !0, 
            /* excludesMetadataChanges= */ !1);
        }
        get hasPendingWrites() {
            return !this.Ht.$();
        }
        isEqual(t) {
            if (!(this.fromCache === t.fromCache && this.Jt === t.Jt && this.Ht.isEqual(t.Ht) && kn(this.query, t.query) && this.docs.isEqual(t.docs) && this.zt.isEqual(t.zt))) return !1;
            const e = this.docChanges, n = t.docChanges;
            if (e.length !== n.length) return !1;
            for (let t = 0; t < e.length; t++) if (e[t].type !== n[t].type || !e[t].doc.isEqual(n[t].doc)) return !1;
            return !0;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An event from the RemoteStore. It is split into targetChanges (changes to the
     * state or the set of documents in our watched targets) and documentUpdates
     * (changes to the actual documents).
     */ class vt {
        constructor(
        /**
         * The snapshot version this event brings us up to, or MIN if not set.
         */
        t, 
        /**
         * A map from target to changes to the target. See TargetChange.
         */
        e, 
        /**
         * A set of targets that is known to be inconsistent. Listens for these
         * targets should be re-established without resume tokens.
         */
        n, 
        /**
         * A set of which documents have changed or been deleted, along with the
         * doc's new values (if not deleted).
         */
        s, 
        /**
         * A set of which document updates are due only to limbo resolution targets.
         */
        i) {
            this.at = t, this.Zt = e, this.te = n, this.ee = s, this.ne = i;
        }
        /**
         * HACK: Views require RemoteEvents in order to determine whether the view is
         * CURRENT, but secondary tabs don't receive remote events. So this method is
         * used to create a synthesized RemoteEvent that can be used to apply a
         * CURRENT status change to a View, for queries executed in a different tab.
         */
        // PORTING NOTE: Multi-tab only
        static se(t, e) {
            const n = new Map;
            return n.set(t, St.ie(t, e)), new vt(q$1.min(), n, gt(), Tt(), Pt());
        }
    }

    /**
     * A TargetChange specifies the set of changes for a specific target as part of
     * a RemoteEvent. These changes track which documents are added, modified or
     * removed, as well as the target's resume token and whether the target is
     * marked CURRENT.
     * The actual changes *to* documents are not part of the TargetChange since
     * documents may be part of multiple targets.
     */ class St {
        constructor(
        /**
         * An opaque, server-assigned token that allows watching a query to be resumed
         * after disconnecting without retransmitting all the data that matches the
         * query. The resume token essentially identifies a point in time from which
         * the server should resume sending results.
         */
        t, 
        /**
         * The "current" (synced) status of this target. Note that "current"
         * has special meaning in the RPC protocol that implies that a target is
         * both up-to-date and consistent with the rest of the watch stream.
         */
        e, 
        /**
         * The set of documents that were newly assigned to this target as part of
         * this remote event.
         */
        n, 
        /**
         * The set of documents that were already assigned to this target but received
         * an update during this remote event.
         */
        s, 
        /**
         * The set of documents that were removed from this target as part of this
         * remote event.
         */
        i) {
            this.resumeToken = t, this.re = e, this.oe = n, this.he = s, this.ae = i;
        }
        /**
         * This method is used to create a synthesized TargetChanges that can be used to
         * apply a CURRENT status change to a View (for queries executed in a different
         * tab) or for new queries (to raise snapshots with correct CURRENT status).
         */    static ie(t, e) {
            return new St(st.ot, e, Pt(), Pt(), Pt());
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a changed document and a list of target ids to which this change
     * applies.
     *
     * If document has been deleted NoDocument will be provided.
     */ class Ct {
        constructor(
        /** The new document applies to all of these targets. */
        t, 
        /** The new document is removed from all of these targets. */
        e, 
        /** The key of the document for this change. */
        n, 
        /**
         * The new document or NoDocument if it was deleted. Is null if the
         * document went out of view without the server sending a new document.
         */
        s) {
            this.ue = t, this.removedTargetIds = e, this.key = n, this.ce = s;
        }
    }

    class Dt {
        constructor(t, e) {
            this.targetId = t, this.le = e;
        }
    }

    class Nt {
        constructor(
        /** What kind of change occurred to the watch target. */
        t, 
        /** The target IDs that were added/removed/set. */
        e, 
        /**
         * An opaque, server-assigned token that allows watching a target to be
         * resumed after disconnecting without retransmitting all the data that
         * matches the target. The resume token essentially identifies a point in
         * time from which the server should resume sending results.
         */
        n = st.ot
        /** An RPC error indicating why the watch failed. */ , s = null) {
            this.state = t, this.targetIds = e, this.resumeToken = n, this.cause = s;
        }
    }

    /** Tracks the internal state of a Watch target. */ class xt {
        constructor() {
            /**
             * The number of pending responses (adds or removes) that we are waiting on.
             * We only consider targets active that have no pending responses.
             */
            this._e = 0, 
            /**
             * Keeps track of the document changes since the last raised snapshot.
             *
             * These changes are continuously updated as we receive document updates and
             * always reflect the current set of changes against the last issued snapshot.
             */
            this.fe = Ft(), 
            /** See public getters for explanations of these fields. */
            this.de = st.ot, this.we = !1, 
            /**
             * Whether this target state should be included in the next snapshot. We
             * initialize to true so that newly-added targets are included in the next
             * RemoteEvent.
             */
            this.Te = !0;
        }
        /**
         * Whether this target has been marked 'current'.
         *
         * 'Current' has special meaning in the RPC protocol: It implies that the
         * Watch backend has sent us all changes up to the point at which the target
         * was added and that the target is consistent with the rest of the watch
         * stream.
         */    get re() {
            return this.we;
        }
        /** The last resume token sent to us for this target. */    get resumeToken() {
            return this.de;
        }
        /** Whether this target has pending target adds or target removes. */    get Ee() {
            return 0 !== this._e;
        }
        /** Whether we have modified any state that should trigger a snapshot. */    get Ie() {
            return this.Te;
        }
        /**
         * Applies the resume token to the TargetChange, but only when it has a new
         * value. Empty resumeTokens are discarded.
         */    Ae(t) {
            t.rt() > 0 && (this.Te = !0, this.de = t);
        }
        /**
         * Creates a target change from the current set of changes.
         *
         * To reset the document changes after raising this snapshot, call
         * `clearPendingChanges()`.
         */    Re() {
            let t = Pt(), e = Pt(), n = Pt();
            return this.fe.forEach((s, i) => {
                switch (i) {
                  case 0 /* Added */ :
                    t = t.add(s);
                    break;

                  case 2 /* Modified */ :
                    e = e.add(s);
                    break;

                  case 1 /* Removed */ :
                    n = n.add(s);
                    break;

                  default:
                    b();
                }
            }), new St(this.de, this.we, t, e, n);
        }
        /**
         * Resets the document changes and sets `hasPendingChanges` to false.
         */    me() {
            this.Te = !1, this.fe = Ft();
        }
        Pe(t, e) {
            this.Te = !0, this.fe = this.fe._t(t, e);
        }
        Ve(t) {
            this.Te = !0, this.fe = this.fe.remove(t);
        }
        ge() {
            this._e += 1;
        }
        ye() {
            this._e -= 1;
        }
        pe() {
            this.Te = !0, this.we = !0;
        }
    }

    /**
     * A helper class to accumulate watch changes into a RemoteEvent.
     */
    class kt {
        constructor(t) {
            this.be = t, 
            /** The internal state of all tracked targets. */
            this.ve = new Map, 
            /** Keeps track of the documents to update since the last raised snapshot. */
            this.Se = Tt(), 
            /** A mapping of document keys to their set of target IDs. */
            this.Ce = Ot(), 
            /**
             * A list of targets with existence filter mismatches. These targets are
             * known to be inconsistent and their listens needs to be re-established by
             * RemoteStore.
             */
            this.De = new ft(F$1);
        }
        /**
         * Processes and adds the DocumentWatchChange to the current set of changes.
         */    Ne(t) {
            for (const e of t.ue) t.ce instanceof gn ? this.xe(e, t.ce) : t.ce instanceof yn && this.ke(e, t.key, t.ce);
            for (const e of t.removedTargetIds) this.ke(e, t.key, t.ce);
        }
        /** Processes and adds the WatchTargetChange to the current set of changes. */    Oe(t) {
            this.Fe(t, e => {
                const n = this.Me(e);
                switch (t.state) {
                  case 0 /* NoChange */ :
                    this.$e(e) && n.Ae(t.resumeToken);
                    break;

                  case 1 /* Added */ :
                    // We need to decrement the number of pending acks needed from watch
                    // for this targetId.
                    n.ye(), n.Ee || 
                    // We have a freshly added target, so we need to reset any state
                    // that we had previously. This can happen e.g. when remove and add
                    // back a target for existence filter mismatches.
                    n.me(), n.Ae(t.resumeToken);
                    break;

                  case 2 /* Removed */ :
                    // We need to keep track of removed targets to we can post-filter and
                    // remove any target changes.
                    // We need to decrement the number of pending acks needed from watch
                    // for this targetId.
                    n.ye(), n.Ee || this.removeTarget(e);
                    break;

                  case 3 /* Current */ :
                    this.$e(e) && (n.pe(), n.Ae(t.resumeToken));
                    break;

                  case 4 /* Reset */ :
                    this.$e(e) && (
                    // Reset the target and synthesizes removes for all existing
                    // documents. The backend will re-add any documents that still
                    // match the target before it sends the next global snapshot.
                    this.Le(e), n.Ae(t.resumeToken));
                    break;

                  default:
                    b();
                }
            });
        }
        /**
         * Iterates over all targetIds that the watch change applies to: either the
         * targetIds explicitly listed in the change or the targetIds of all currently
         * active targets.
         */    Fe(t, e) {
            t.targetIds.length > 0 ? t.targetIds.forEach(e) : this.ve.forEach((t, n) => {
                this.$e(n) && e(n);
            });
        }
        /**
         * Handles existence filters and synthesizes deletes for filter mismatches.
         * Targets that are invalidated by filter mismatches are added to
         * `pendingTargetResets`.
         */    qe(t) {
            const e = t.targetId, n = t.le.count, s = this.Be(e);
            if (s) {
                const t = s.target;
                if (nt(t)) if (0 === n) {
                    // The existence filter told us the document does not exist. We deduce
                    // that this document does not exist and apply a deleted document to
                    // our updates. Without applying this deleted document there might be
                    // another query that will raise this document as part of a snapshot
                    // until it is resolved, essentially exposing inconsistency between
                    // queries.
                    const n = new j(t.path);
                    this.ke(e, n, new yn(n, q$1.min()));
                } else v$1(1 === n); else {
                    this.Ue(e) !== n && (
                    // Existence filter mismatch: We reset the mapping and raise a new
                    // snapshot with `isFromCache:true`.
                    this.Le(e), this.De = this.De.add(e));
                }
            }
        }
        /**
         * Converts the currently accumulated state into a remote event at the
         * provided snapshot version. Resets the accumulated changes before returning.
         */    We(t) {
            const e = new Map;
            this.ve.forEach((n, s) => {
                const i = this.Be(s);
                if (i) {
                    if (n.re && nt(i.target)) {
                        // Document queries for document that don't exist can produce an empty
                        // result set. To update our local cache, we synthesize a document
                        // delete if we have not previously received the document. This
                        // resolves the limbo state of the document, removing it from
                        // limboDocumentRefs.
                        // TODO(dimond): Ideally we would have an explicit lookup target
                        // instead resulting in an explicit delete message and we could
                        // remove this special logic.
                        const e = new j(i.target.path);
                        null !== this.Se.get(e) || this.Ke(s, e) || this.ke(s, e, new yn(e, t));
                    }
                    n.Ie && (e.set(s, n.Re()), n.me());
                }
            });
            let n = Pt();
            // We extract the set of limbo-only document updates as the GC logic
            // special-cases documents that do not appear in the target cache.
            
            // TODO(gsoltis): Expand on this comment once GC is available in the JS
            // client.
                    this.Ce.forEach((t, e) => {
                let s = !0;
                e.Lt(t => {
                    const e = this.Be(t);
                    return !e || 2 /* LimboResolution */ === e.ht || (s = !1, !1);
                }), s && (n = n.add(t));
            });
            const s = new vt(t, e, this.De, this.Se, n);
            return this.Se = Tt(), this.Ce = Ot(), this.De = new ft(F$1), s;
        }
        /**
         * Adds the provided document to the internal list of document updates and
         * its document key to the given target's mapping.
         */
        // Visible for testing.
        xe(t, e) {
            if (!this.$e(t)) return;
            const n = this.Ke(t, e.key) ? 2 /* Modified */ : 0 /* Added */;
            this.Me(t).Pe(e.key, n), this.Se = this.Se._t(e.key, e), this.Ce = this.Ce._t(e.key, this.je(e.key).add(t));
        }
        /**
         * Removes the provided document from the target mapping. If the
         * document no longer matches the target, but the document's state is still
         * known (e.g. we know that the document was deleted or we received the change
         * that caused the filter mismatch), the new document can be provided
         * to update the remote document cache.
         */
        // Visible for testing.
        ke(t, e, n) {
            if (!this.$e(t)) return;
            const s = this.Me(t);
            this.Ke(t, e) ? s.Pe(e, 1 /* Removed */) : 
            // The document may have entered and left the target before we raised a
            // snapshot, so we can just ignore the change.
            s.Ve(e), this.Ce = this.Ce._t(e, this.je(e).delete(t)), n && (this.Se = this.Se._t(e, n));
        }
        removeTarget(t) {
            this.ve.delete(t);
        }
        /**
         * Returns the current count of documents in the target. This includes both
         * the number of documents that the LocalStore considers to be part of the
         * target as well as any accumulated changes.
         */    Ue(t) {
            const e = this.Me(t).Re();
            return this.be.Qe(t).size + e.oe.size - e.ae.size;
        }
        /**
         * Increment the number of acks needed from watch before we can consider the
         * server to be 'in-sync' with the client's active targets.
         */    ge(t) {
            this.Me(t).ge();
        }
        Me(t) {
            let e = this.ve.get(t);
            return e || (e = new xt, this.ve.set(t, e)), e;
        }
        je(t) {
            let e = this.Ce.get(t);
            return e || (e = new ft(F$1), this.Ce = this.Ce._t(t, e)), e;
        }
        /**
         * Verifies that the user is still interested in this target (by calling
         * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
         * from watch.
         */    $e(t) {
            const e = null !== this.Be(t);
            return e || V$1("WatchChangeAggregator", "Detected inactive target", t), e;
        }
        /**
         * Returns the TargetData for an active target (i.e. a target that the user
         * is still interested in that has no outstanding target change requests).
         */    Be(t) {
            const e = this.ve.get(t);
            return e && e.Ee ? null : this.be.Ge(t);
        }
        /**
         * Resets the state of a Watch target to its initial state (e.g. sets
         * 'current' to false, clears the resume token and removes its target mapping
         * from all documents).
         */    Le(t) {
            this.ve.set(t, new xt);
            this.be.Qe(t).forEach(e => {
                this.ke(t, e, /*updatedDocument=*/ null);
            });
        }
        /**
         * Returns whether the LocalStore considers the document to be part of the
         * specified target.
         */    Ke(t, e) {
            return this.be.Qe(t).has(e);
        }
    }

    function Ot() {
        return new ct(j.D);
    }

    function Ft() {
        return new ct(j.D);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function Mt(t) {
        let e = 0;
        for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e++;
        return e;
    }

    function $t(t, e) {
        for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
    }

    function Lt(t) {
        for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) return !1;
        return !0;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a locally-applied ServerTimestamp.
     *
     * Server Timestamps are backed by MapValues that contain an internal field
     * `__type__` with a value of `server_timestamp`. The previous value and local
     * write time are stored in its `__previous_value__` and `__local_write_time__`
     * fields respectively.
     *
     * Notes:
     * - ServerTimestampValue instances are created as the result of applying a
     *   TransformMutation (see TransformMutation.applyTo()). They can only exist in
     *   the local view of a document. Therefore they do not need to be parsed or
     *   serialized.
     * - When evaluated locally (e.g. for snapshot.data()), they by default
     *   evaluate to `null`. This behavior can be configured by passing custom
     *   FieldValueOptions to value().
     * - With respect to other ServerTimestampValues, they sort by their
     *   localWriteTime.
     */ function qt(t) {
        var e, n;
        return "server_timestamp" === (null === (n = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e ? void 0 : e.fields) || {}).__type__) || void 0 === n ? void 0 : n.stringValue);
    }

    /**
     * Creates a new ServerTimestamp proto value (using the internal format).
     */
    /**
     * Returns the local time at which this timestamp was first set.
     */
    function Bt(t) {
        const e = Jt(t.mapValue.fields.__local_write_time__.timestampValue);
        return new L$1(e.seconds, e.nanos);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // A RegExp matching ISO 8601 UTC timestamps with optional fraction.
    const Ut = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

    /** Extracts the backend's type order for the provided value. */ function Wt(t) {
        return "nullValue" in t ? 0 /* NullValue */ : "booleanValue" in t ? 1 /* BooleanValue */ : "integerValue" in t || "doubleValue" in t ? 2 /* NumberValue */ : "timestampValue" in t ? 3 /* TimestampValue */ : "stringValue" in t ? 5 /* StringValue */ : "bytesValue" in t ? 6 /* BlobValue */ : "referenceValue" in t ? 7 /* RefValue */ : "geoPointValue" in t ? 8 /* GeoPointValue */ : "arrayValue" in t ? 9 /* ArrayValue */ : "mapValue" in t ? qt(t) ? 4 /* ServerTimestampValue */ : 10 /* ObjectValue */ : b();
    }

    /** Tests `left` and `right` for equality based on the backend semantics. */ function Kt(t, e) {
        const n = Wt(t);
        if (n !== Wt(e)) return !1;
        switch (n) {
          case 0 /* NullValue */ :
            return !0;

          case 1 /* BooleanValue */ :
            return t.booleanValue === e.booleanValue;

          case 4 /* ServerTimestampValue */ :
            return Bt(t).isEqual(Bt(e));

          case 3 /* TimestampValue */ :
            return function(t, e) {
                if ("string" == typeof t.timestampValue && "string" == typeof e.timestampValue && t.timestampValue.length === e.timestampValue.length) 
                // Use string equality for ISO 8601 timestamps
                return t.timestampValue === e.timestampValue;
                const n = Jt(t.timestampValue), s = Jt(e.timestampValue);
                return n.seconds === s.seconds && n.nanos === s.nanos;
            }(t, e);

          case 5 /* StringValue */ :
            return t.stringValue === e.stringValue;

          case 6 /* BlobValue */ :
            return function(t, e) {
                return Xt(t.bytesValue).isEqual(Xt(e.bytesValue));
            }(t, e);

          case 7 /* RefValue */ :
            return t.referenceValue === e.referenceValue;

          case 8 /* GeoPointValue */ :
            return function(t, e) {
                return Yt(t.geoPointValue.latitude) === Yt(e.geoPointValue.latitude) && Yt(t.geoPointValue.longitude) === Yt(e.geoPointValue.longitude);
            }(t, e);

          case 2 /* NumberValue */ :
            return function(t, e) {
                if ("integerValue" in t && "integerValue" in e) return Yt(t.integerValue) === Yt(e.integerValue);
                if ("doubleValue" in t && "doubleValue" in e) {
                    const n = Yt(t.doubleValue), s = Yt(e.doubleValue);
                    return n === s ? H$1(n) === H$1(s) : isNaN(n) && isNaN(s);
                }
                return !1;
            }(t, e);

          case 9 /* ArrayValue */ :
            return M$1(t.arrayValue.values || [], e.arrayValue.values || [], Kt);

          case 10 /* ObjectValue */ :
            return function(t, e) {
                const n = t.mapValue.fields || {}, s = e.mapValue.fields || {};
                if (Mt(n) !== Mt(s)) return !1;
                for (const t in n) if (n.hasOwnProperty(t) && (void 0 === s[t] || !Kt(n[t], s[t]))) return !1;
                return !0;
            }
            /** Returns true if the ArrayValue contains the specified element. */ (t, e);

          default:
            return b();
        }
    }

    function jt(t, e) {
        return void 0 !== (t.values || []).find(t => Kt(t, e));
    }

    function Qt(t, e) {
        const n = Wt(t), s = Wt(e);
        if (n !== s) return F$1(n, s);
        switch (n) {
          case 0 /* NullValue */ :
            return 0;

          case 1 /* BooleanValue */ :
            return F$1(t.booleanValue, e.booleanValue);

          case 2 /* NumberValue */ :
            return function(t, e) {
                const n = Yt(t.integerValue || t.doubleValue), s = Yt(e.integerValue || e.doubleValue);
                return n < s ? -1 : n > s ? 1 : n === s ? 0 : 
                // one or both are NaN.
                isNaN(n) ? isNaN(s) ? 0 : -1 : 1;
            }(t, e);

          case 3 /* TimestampValue */ :
            return Gt(t.timestampValue, e.timestampValue);

          case 4 /* ServerTimestampValue */ :
            return Gt(Bt(t), Bt(e));

          case 5 /* StringValue */ :
            return F$1(t.stringValue, e.stringValue);

          case 6 /* BlobValue */ :
            return function(t, e) {
                const n = Xt(t), s = Xt(e);
                return n.p(s);
            }(t.bytesValue, e.bytesValue);

          case 7 /* RefValue */ :
            return function(t, e) {
                const n = t.split("/"), s = e.split("/");
                for (let t = 0; t < n.length && t < s.length; t++) {
                    const e = F$1(n[t], s[t]);
                    if (0 !== e) return e;
                }
                return F$1(n.length, s.length);
            }(t.referenceValue, e.referenceValue);

          case 8 /* GeoPointValue */ :
            return function(t, e) {
                const n = F$1(Yt(t.latitude), Yt(e.latitude));
                if (0 !== n) return n;
                return F$1(Yt(t.longitude), Yt(e.longitude));
            }(t.geoPointValue, e.geoPointValue);

          case 9 /* ArrayValue */ :
            return function(t, e) {
                const n = t.values || [], s = e.values || [];
                for (let t = 0; t < n.length && t < s.length; ++t) {
                    const e = Qt(n[t], s[t]);
                    if (e) return e;
                }
                return F$1(n.length, s.length);
            }(t.arrayValue, e.arrayValue);

          case 10 /* ObjectValue */ :
            return function(t, e) {
                const n = t.fields || {}, s = Object.keys(n), i = e.fields || {}, r = Object.keys(i);
                // Even though MapValues are likely sorted correctly based on their insertion
                // order (e.g. when received from the backend), local modifications can bring
                // elements out of order. We need to re-sort the elements to ensure that
                // canonical IDs are independent of insertion order.
                s.sort(), r.sort();
                for (let t = 0; t < s.length && t < r.length; ++t) {
                    const e = F$1(s[t], r[t]);
                    if (0 !== e) return e;
                    const o = Qt(n[s[t]], i[r[t]]);
                    if (0 !== o) return o;
                }
                return F$1(s.length, r.length);
            }
            /**
     * Generates the canonical ID for the provided field value (as used in Target
     * serialization).
     */ (t.mapValue, e.mapValue);

          default:
            throw b();
        }
    }

    function Gt(t, e) {
        if ("string" == typeof t && "string" == typeof e && t.length === e.length) return F$1(t, e);
        const n = Jt(t), s = Jt(e), i = F$1(n.seconds, s.seconds);
        return 0 !== i ? i : F$1(n.nanos, s.nanos);
    }

    function zt(t) {
        return Ht(t);
    }

    function Ht(t) {
        return "nullValue" in t ? "null" : "booleanValue" in t ? "" + t.booleanValue : "integerValue" in t ? "" + t.integerValue : "doubleValue" in t ? "" + t.doubleValue : "timestampValue" in t ? function(t) {
            const e = Jt(t);
            return `time(${e.seconds},${e.nanos})`;
        }(t.timestampValue) : "stringValue" in t ? t.stringValue : "bytesValue" in t ? Xt(t.bytesValue).toBase64() : "referenceValue" in t ? (n = t.referenceValue, 
        j.Y(n).toString()) : "geoPointValue" in t ? `geo(${(e = t.geoPointValue).latitude},${e.longitude})` : "arrayValue" in t ? function(t) {
            let e = "[", n = !0;
            for (const s of t.values || []) n ? n = !1 : e += ",", e += Ht(s);
            return e + "]";
        }
        /**
     * Converts the possible Proto values for a timestamp value into a "seconds and
     * nanos" representation.
     */ (t.arrayValue) : "mapValue" in t ? function(t) {
            // Iteration order in JavaScript is not guaranteed. To ensure that we generate
            // matching canonical IDs for identical maps, we need to sort the keys.
            const e = Object.keys(t.fields || {}).sort();
            let n = "{", s = !0;
            for (const i of e) s ? s = !1 : n += ",", n += `${i}:${Ht(t.fields[i])}`;
            return n + "}";
        }(t.mapValue) : b();
        var e, n;
    }

    function Jt(t) {
        // The json interface (for the browser) will return an iso timestamp string,
        // while the proto js library (for node) will return a
        // google.protobuf.Timestamp instance.
        if (v$1(!!t), "string" == typeof t) {
            // The date string can have higher precision (nanos) than the Date class
            // (millis), so we do some custom parsing here.
            // Parse the nanos right out of the string.
            let e = 0;
            const n = Ut.exec(t);
            if (v$1(!!n), n[1]) {
                // Pad the fraction out to 9 digits (nanos).
                let t = n[1];
                t = (t + "000000000").substr(0, 9), e = Number(t);
            }
            // Parse the date to get the seconds.
                    const s = new Date(t);
            return {
                seconds: Math.floor(s.getTime() / 1e3),
                nanos: e
            };
        }
        return {
            seconds: Yt(t.seconds),
            nanos: Yt(t.nanos)
        };
    }

    /**
     * Converts the possible Proto types for numbers into a JavaScript number.
     * Returns 0 if the value is not numeric.
     */ function Yt(t) {
        // TODO(bjornick): Handle int64 greater than 53 bits.
        return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
    }

    /** Converts the possible Proto types for Blobs into a ByteString. */ function Xt(t) {
        return "string" == typeof t ? st.fromBase64String(t) : st.fromUint8Array(t);
    }

    /** Returns a reference value for the provided database and key. */ function Zt(t, e) {
        return {
            referenceValue: `projects/${t.projectId}/databases/${t.database}/documents/${e.path.U()}`
        };
    }

    /** Returns true if `value` is an IntegerValue . */ function te(t) {
        return !!t && "integerValue" in t;
    }

    /** Returns true if `value` is a DoubleValue. */
    /** Returns true if `value` is an ArrayValue. */
    function ee(t) {
        return !!t && "arrayValue" in t;
    }

    /** Returns true if `value` is a NullValue. */ function ne(t) {
        return !!t && "nullValue" in t;
    }

    /** Returns true if `value` is NaN. */ function se(t) {
        return !!t && "doubleValue" in t && isNaN(Number(t.doubleValue));
    }

    /** Returns true if `value` is a MapValue. */ function ie(t) {
        return !!t && "mapValue" in t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const re = (() => {
        const t = {
            asc: "ASCENDING",
            desc: "DESCENDING"
        };
        return t;
    })(), oe = (() => {
        const t = {
            "<": "LESS_THAN",
            "<=": "LESS_THAN_OR_EQUAL",
            ">": "GREATER_THAN",
            ">=": "GREATER_THAN_OR_EQUAL",
            "==": "EQUAL",
            "!=": "NOT_EQUAL",
            "array-contains": "ARRAY_CONTAINS",
            in: "IN",
            "not-in": "NOT_IN",
            "array-contains-any": "ARRAY_CONTAINS_ANY"
        };
        return t;
    })();

    /**
     * This class generates JsonObject values for the Datastore API suitable for
     * sending to either GRPC stub methods or via the JSON/HTTP REST API.
     *
     * The serializer supports both Protobuf.js and Proto3 JSON formats. By
     * setting `useProto3Json` to true, the serializer will use the Proto3 JSON
     * format.
     *
     * For a description of the Proto3 JSON format check
     * https://developers.google.com/protocol-buffers/docs/proto3#json
     *
     * TODO(klimt): We can remove the databaseId argument if we keep the full
     * resource name in documents.
     */
    class he {
        constructor(t, e) {
            this.et = t, this.ze = e;
        }
    }

    /**
     * Returns an IntegerValue for `value`.
     */
    function ae(t) {
        return {
            integerValue: "" + t
        };
    }

    /**
     * Returns an DoubleValue for `value` that is encoded based the serializer's
     * `useProto3Json` setting.
     */ function ue(t, e) {
        if (t.ze) {
            if (isNaN(e)) return {
                doubleValue: "NaN"
            };
            if (e === 1 / 0) return {
                doubleValue: "Infinity"
            };
            if (e === -1 / 0) return {
                doubleValue: "-Infinity"
            };
        }
        return {
            doubleValue: H$1(e) ? "-0" : e
        };
    }

    /**
     * Returns a value for a number that's appropriate to put into a proto.
     * The return value is an IntegerValue if it can safely represent the value,
     * otherwise a DoubleValue is returned.
     */ function ce(t, e) {
        return J$1(e) ? ae(e) : ue(t, e);
    }

    /**
     * Returns a value for a Date that's appropriate to put into a proto.
     */ function le(t, e) {
        if (t.ze) {
            return `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z`;
        }
        return {
            seconds: "" + e.seconds,
            nanos: e.nanoseconds
        };
    }

    /**
     * Returns a value for bytes that's appropriate to put in a proto.
     *
     * Visible for testing.
     */
    function _e(t, e) {
        return t.ze ? e.toBase64() : e.toUint8Array();
    }

    /**
     * Returns a ByteString based on the proto string value.
     */ function fe(t, e) {
        return le(t, e.S());
    }

    function de(t) {
        return v$1(!!t), q$1.g(function(t) {
            const e = Jt(t);
            return new L$1(e.seconds, e.nanos);
        }(t));
    }

    function we(t, e) {
        return function(t) {
            return new U$1([ "projects", t.projectId, "databases", t.database ]);
        }(t).child("documents").child(e).U();
    }

    function Te(t) {
        const e = U$1.W(t);
        return v$1(qe(e)), e;
    }

    function Ee(t, e) {
        return we(t.et, e.path);
    }

    function Ie(t, e) {
        const n = Te(e);
        return v$1(n.get(1) === t.et.projectId), v$1(!n.get(3) && !t.et.database || n.get(3) === t.et.database), 
        new j(Pe(n));
    }

    function Ae(t, e) {
        return we(t.et, e);
    }

    function Re(t) {
        const e = Te(t);
        // In v1beta1 queries for collections at the root did not have a trailing
        // "/documents". In v1 all resource paths contain "/documents". Preserve the
        // ability to read the v1beta1 form for compatibility with queries persisted
        // in the local target cache.
            return 4 === e.length ? U$1.K() : Pe(e);
    }

    function me(t) {
        return new U$1([ "projects", t.et.projectId, "databases", t.et.database ]).U();
    }

    function Pe(t) {
        return v$1(t.length > 4 && "documents" === t.get(4)), t.k(5);
    }

    /** Creates an api.Document from key and fields (but no create/update time) */ function Ve(t, e, n) {
        return {
            name: Ee(t, e),
            fields: n.proto.mapValue.fields
        };
    }

    function ge(t, e) {
        return "found" in e ? function(t, e) {
            v$1(!!e.found), e.found.name, e.found.updateTime;
            const n = Ie(t, e.found.name), s = de(e.found.updateTime), i = new Rn({
                mapValue: {
                    fields: e.found.fields
                }
            });
            return new gn(n, s, i, {});
        }(t, e) : "missing" in e ? function(t, e) {
            v$1(!!e.missing), v$1(!!e.readTime);
            const n = Ie(t, e.missing), s = de(e.readTime);
            return new yn(n, s);
        }(t, e) : b();
    }

    function ye(t, e) {
        let n;
        if ("targetChange" in e) {
            e.targetChange;
            // proto3 default value is unset in JSON (undefined), so use 'NO_CHANGE'
            // if unset
            const s = function(t) {
                return "NO_CHANGE" === t ? 0 /* NoChange */ : "ADD" === t ? 1 /* Added */ : "REMOVE" === t ? 2 /* Removed */ : "CURRENT" === t ? 3 /* Current */ : "RESET" === t ? 4 /* Reset */ : b();
            }(e.targetChange.targetChangeType || "NO_CHANGE"), i = e.targetChange.targetIds || [], r = function(t, e) {
                return t.ze ? (v$1(void 0 === e || "string" == typeof e), st.fromBase64String(e || "")) : (v$1(void 0 === e || e instanceof Uint8Array), 
                st.fromUint8Array(e || new Uint8Array));
            }(t, e.targetChange.resumeToken), o = e.targetChange.cause, h = o && function(t) {
                const e = void 0 === t.code ? C$1.UNKNOWN : ut(t.code);
                return new D$1(e, t.message || "");
            }
            /**
     * Returns a value for a number (or null) that's appropriate to put into
     * a google.protobuf.Int32Value proto.
     * DO NOT USE THIS FOR ANYTHING ELSE.
     * This method cheats. It's typed as returning "number" because that's what
     * our generated proto interfaces say Int32Value must be. But GRPC actually
     * expects a { value: <number> } struct.
     */ (o);
            n = new Nt(s, i, r, h || null);
        } else if ("documentChange" in e) {
            e.documentChange;
            const s = e.documentChange;
            s.document, s.document.name, s.document.updateTime;
            const i = Ie(t, s.document.name), r = de(s.document.updateTime), o = new Rn({
                mapValue: {
                    fields: s.document.fields
                }
            }), h = new gn(i, r, o, {}), a = s.targetIds || [], u = s.removedTargetIds || [];
            n = new Ct(a, u, h.key, h);
        } else if ("documentDelete" in e) {
            e.documentDelete;
            const s = e.documentDelete;
            s.document;
            const i = Ie(t, s.document), r = s.readTime ? de(s.readTime) : q$1.min(), o = new yn(i, r), h = s.removedTargetIds || [];
            n = new Ct([], h, o.key, o);
        } else if ("documentRemove" in e) {
            e.documentRemove;
            const s = e.documentRemove;
            s.document;
            const i = Ie(t, s.document), r = s.removedTargetIds || [];
            n = new Ct([], r, i, null);
        } else {
            if (!("filter" in e)) return b();
            {
                e.filter;
                const t = e.filter;
                t.targetId;
                const s = t.count || 0, i = new rt(s), r = t.targetId;
                n = new Dt(r, i);
            }
        }
        return n;
    }

    function pe(t, e) {
        let n;
        if (e instanceof _n) n = {
            update: Ve(t, e.key, e.value)
        }; else if (e instanceof In) n = {
            delete: Ee(t, e.key)
        }; else if (e instanceof fn) n = {
            update: Ve(t, e.key, e.data),
            updateMask: Le(e.He)
        }; else if (e instanceof wn) n = {
            transform: {
                document: Ee(t, e.key),
                fieldTransforms: e.fieldTransforms.map(t => function(t, e) {
                    const n = e.transform;
                    if (n instanceof je) return {
                        fieldPath: e.field.U(),
                        setToServerValue: "REQUEST_TIME"
                    };
                    if (n instanceof Qe) return {
                        fieldPath: e.field.U(),
                        appendMissingElements: {
                            values: n.elements
                        }
                    };
                    if (n instanceof ze) return {
                        fieldPath: e.field.U(),
                        removeAllFromArray: {
                            values: n.elements
                        }
                    };
                    if (n instanceof Je) return {
                        fieldPath: e.field.U(),
                        increment: n.Je
                    };
                    throw b();
                }(0, t))
            }
        }; else {
            if (!(e instanceof An)) return b();
            n = {
                verify: Ee(t, e.key)
            };
        }
        return e.Xe.Ye || (n.currentDocument = function(t, e) {
            return void 0 !== e.updateTime ? {
                updateTime: fe(t, e.updateTime)
            } : void 0 !== e.exists ? {
                exists: e.exists
            } : b();
        }(t, e.Xe)), n;
    }

    function be(t, e) {
        const n = e.currentDocument ? function(t) {
            return void 0 !== t.updateTime ? sn.updateTime(de(t.updateTime)) : void 0 !== t.exists ? sn.exists(t.exists) : sn.Ze();
        }(e.currentDocument) : sn.Ze();
        if (e.update) {
            e.update.name;
            const s = Ie(t, e.update.name), i = new Rn({
                mapValue: {
                    fields: e.update.fields
                }
            });
            if (e.updateMask) {
                const t = function(t) {
                    const e = t.fieldPaths || [];
                    return new Ze(e.map(t => K$1.J(t)));
                }(e.updateMask);
                return new fn(s, i, t, n);
            }
            return new _n(s, i, n);
        }
        if (e.delete) {
            const s = Ie(t, e.delete);
            return new In(s, n);
        }
        if (e.transform) {
            const s = Ie(t, e.transform.document), i = e.transform.fieldTransforms.map(e => function(t, e) {
                let n = null;
                if ("setToServerValue" in e) v$1("REQUEST_TIME" === e.setToServerValue), n = new je; else if ("appendMissingElements" in e) {
                    const t = e.appendMissingElements.values || [];
                    n = new Qe(t);
                } else if ("removeAllFromArray" in e) {
                    const t = e.removeAllFromArray.values || [];
                    n = new ze(t);
                } else "increment" in e ? n = new Je(t, e.increment) : b();
                const s = K$1.J(e.fieldPath);
                return new tn(s, n);
            }(t, e));
            return v$1(!0 === n.exists), new wn(s, i);
        }
        if (e.verify) {
            const s = Ie(t, e.verify);
            return new An(s, n);
        }
        return b();
    }

    function ve(t, e) {
        return t && t.length > 0 ? (v$1(void 0 !== e), t.map(t => function(t, e) {
            // NOTE: Deletes don't have an updateTime.
            let n = t.updateTime ? de(t.updateTime) : de(e);
            n.isEqual(q$1.min()) && (
            // The Firestore Emulator currently returns an update time of 0 for
            // deletes of non-existing documents (rather than null). This breaks the
            // test "get deleted doc while offline with source=cache" as NoDocuments
            // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
            // TODO(#2149): Remove this when Emulator is fixed
            n = de(e));
            let s = null;
            return t.transformResults && t.transformResults.length > 0 && (s = t.transformResults), 
            new nn(n, s);
        }(t, e))) : [];
    }

    function Se(t, e) {
        return {
            documents: [ Ae(t, e.path) ]
        };
    }

    function Ce(t, e) {
        // Dissect the path into parent, collectionId, and optional key filter.
        const n = {
            structuredQuery: {}
        }, s = e.path;
        null !== e.collectionGroup ? (n.parent = Ae(t, s), n.structuredQuery.from = [ {
            collectionId: e.collectionGroup,
            allDescendants: !0
        } ]) : (n.parent = Ae(t, s.O()), n.structuredQuery.from = [ {
            collectionId: s.M()
        } ]);
        const i = function(t) {
            if (0 === t.length) return;
            const e = t.map(t => 
            // visible for testing
            function(t) {
                if ("==" /* EQUAL */ === t.op) {
                    if (se(t.value)) return {
                        unaryFilter: {
                            field: Oe(t.field),
                            op: "IS_NAN"
                        }
                    };
                    if (ne(t.value)) return {
                        unaryFilter: {
                            field: Oe(t.field),
                            op: "IS_NULL"
                        }
                    };
                } else if ("!=" /* NOT_EQUAL */ === t.op) {
                    if (se(t.value)) return {
                        unaryFilter: {
                            field: Oe(t.field),
                            op: "IS_NOT_NAN"
                        }
                    };
                    if (ne(t.value)) return {
                        unaryFilter: {
                            field: Oe(t.field),
                            op: "IS_NOT_NULL"
                        }
                    };
                }
                return {
                    fieldFilter: {
                        field: Oe(t.field),
                        op: (e = t.op, oe[e]),
                        value: t.value
                    }
                };
                // visible for testing
                var e;
            }(t));
            if (1 === e.length) return e[0];
            return {
                compositeFilter: {
                    op: "AND",
                    filters: e
                }
            };
        }(e.filters);
        i && (n.structuredQuery.where = i);
        const r = function(t) {
            if (0 === t.length) return;
            return t.map(t => 
            // visible for testing
            function(t) {
                return {
                    field: Oe(t.field),
                    direction: (e = t.dir, re[e])
                };
                // visible for testing
                var e;
                // visible for testing
                    }(t));
        }(e.orderBy);
        r && (n.structuredQuery.orderBy = r);
        const o = function(t, e) {
            return t.ze || z(e) ? e : {
                value: e
            };
        }
        /**
     * Returns a number (or null) from a google.protobuf.Int32Value proto.
     */ (t, e.limit);
        return null !== o && (n.structuredQuery.limit = o), e.startAt && (n.structuredQuery.startAt = xe(e.startAt)), 
        e.endAt && (n.structuredQuery.endAt = xe(e.endAt)), n;
    }

    function De(t) {
        let e = Re(t.parent);
        const n = t.structuredQuery, s = n.from ? n.from.length : 0;
        let i = null;
        if (s > 0) {
            v$1(1 === s);
            const t = n.from[0];
            t.allDescendants ? i = t.collectionId : e = e.child(t.collectionId);
        }
        let r = [];
        n.where && (r = function t(e) {
            return e ? void 0 !== e.unaryFilter ? [ $e(e) ] : void 0 !== e.fieldFilter ? [ Me(e) ] : void 0 !== e.compositeFilter ? e.compositeFilter.filters.map(e => t(e)).reduce((t, e) => t.concat(e)) : b() : [];
        }(n.where));
        let o = [];
        n.orderBy && (o = n.orderBy.map(t => function(t) {
            return new Zn(Fe(t.field), function(t) {
                switch (t) {
                  case "ASCENDING":
                    return "asc" /* ASCENDING */;

                  case "DESCENDING":
                    return "desc" /* DESCENDING */;

                  default:
                    return;
                }
            }(t.direction));
        }(t)));
        let h = null;
        n.limit && (h = function(t) {
            let e;
            return e = "object" == typeof t ? t.value : t, z(e) ? null : e;
        }(n.limit));
        let a = null;
        n.startAt && (a = ke(n.startAt));
        let u = null;
        return n.endAt && (u = ke(n.endAt)), xn(Sn(e, i, o, r, h, "F" /* First */ , a, u));
    }

    function Ne(t, e) {
        const n = function(t, e) {
            switch (e) {
              case 0 /* Listen */ :
                return null;

              case 1 /* ExistenceFilterMismatch */ :
                return "existence-filter-mismatch";

              case 2 /* LimboResolution */ :
                return "limbo-document";

              default:
                return b();
            }
        }(0, e.ht);
        return null == n ? null : {
            "goog-listen-tags": n
        };
    }

    function xe(t) {
        return {
            before: t.before,
            values: t.position
        };
    }

    function ke(t) {
        const e = !!t.before, n = t.values || [];
        return new Hn(n, e);
    }

    function Oe(t) {
        return {
            fieldPath: t.U()
        };
    }

    function Fe(t) {
        return K$1.J(t.fieldPath);
    }

    function Me(t) {
        return Ln.create(Fe(t.fieldFilter.field), function(t) {
            switch (t) {
              case "EQUAL":
                return "==" /* EQUAL */;

              case "NOT_EQUAL":
                return "!=" /* NOT_EQUAL */;

              case "GREATER_THAN":
                return ">" /* GREATER_THAN */;

              case "GREATER_THAN_OR_EQUAL":
                return ">=" /* GREATER_THAN_OR_EQUAL */;

              case "LESS_THAN":
                return "<" /* LESS_THAN */;

              case "LESS_THAN_OR_EQUAL":
                return "<=" /* LESS_THAN_OR_EQUAL */;

              case "ARRAY_CONTAINS":
                return "array-contains" /* ARRAY_CONTAINS */;

              case "IN":
                return "in" /* IN */;

              case "NOT_IN":
                return "not-in" /* NOT_IN */;

              case "ARRAY_CONTAINS_ANY":
                return "array-contains-any" /* ARRAY_CONTAINS_ANY */;

              case "OPERATOR_UNSPECIFIED":
              default:
                return b();
            }
        }(t.fieldFilter.op), t.fieldFilter.value);
    }

    function $e(t) {
        switch (t.unaryFilter.op) {
          case "IS_NAN":
            const e = Fe(t.unaryFilter.field);
            return Ln.create(e, "==" /* EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NULL":
            const n = Fe(t.unaryFilter.field);
            return Ln.create(n, "==" /* EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          case "IS_NOT_NAN":
            const s = Fe(t.unaryFilter.field);
            return Ln.create(s, "!=" /* NOT_EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NOT_NULL":
            const i = Fe(t.unaryFilter.field);
            return Ln.create(i, "!=" /* NOT_EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          case "OPERATOR_UNSPECIFIED":
          default:
            return b();
        }
    }

    function Le(t) {
        const e = [];
        return t.fields.forEach(t => e.push(t.U())), {
            fieldPaths: e
        };
    }

    function qe(t) {
        // Resource names have at least 4 components (project ID, database ID)
        return t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2);
    }

    /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Represents a transform within a TransformMutation. */ class Be {
        constructor() {
            // Make sure that the structural type of `TransformOperation` is unique.
            // See https://github.com/microsoft/TypeScript/issues/5451
            this.tn = void 0;
        }
    }

    /**
     * Computes the local transform result against the provided `previousValue`,
     * optionally using the provided localWriteTime.
     */ function Ue(t, e, n) {
        return t instanceof je ? function(t, e) {
            const n = {
                fields: {
                    __type__: {
                        stringValue: "server_timestamp"
                    },
                    __local_write_time__: {
                        timestampValue: {
                            seconds: t.seconds,
                            nanos: t.nanoseconds
                        }
                    }
                }
            };
            return e && (n.fields.__previous_value__ = e), {
                mapValue: n
            };
        }
        /**
     * Returns the value of the field before this ServerTimestamp was set.
     *
     * Preserving the previous values allows the user to display the last resoled
     * value until the backend responds with the timestamp.
     */ (n, e) : t instanceof Qe ? Ge(t, e) : t instanceof ze ? He(t, e) : function(t, e) {
            // PORTING NOTE: Since JavaScript's integer arithmetic is limited to 53 bit
            // precision and resolves overflows by reducing precision, we do not
            // manually cap overflows at 2^63.
            const n = Ke(t, e), s = Ye(n) + Ye(t.Je);
            return te(n) && te(t.Je) ? ae(s) : ue(t.serializer, s);
        }(t, e);
    }

    /**
     * Computes a final transform result after the transform has been acknowledged
     * by the server, potentially using the server-provided transformResult.
     */ function We(t, e, n) {
        // The server just sends null as the transform result for array operations,
        // so we have to calculate a result the same as we do for local
        // applications.
        return t instanceof Qe ? Ge(t, e) : t instanceof ze ? He(t, e) : n;
    }

    /**
     * If this transform operation is not idempotent, returns the base value to
     * persist for this transform. If a base value is returned, the transform
     * operation is always applied to this base value, even if document has
     * already been updated.
     *
     * Base values provide consistent behavior for non-idempotent transforms and
     * allow us to return the same latency-compensated value even if the backend
     * has already applied the transform operation. The base value is null for
     * idempotent transforms, as they can be re-played even if the backend has
     * already applied them.
     *
     * @return a base value to store along with the mutation, or null for
     * idempotent transforms.
     */ function Ke(t, e) {
        return t instanceof Je ? te(n = e) || function(t) {
            return !!t && "doubleValue" in t;
        }
        /** Returns true if `value` is either an IntegerValue or a DoubleValue. */ (n) ? e : {
            integerValue: 0
        } : null;
        var n;
    }

    /** Transforms a value into a server-generated timestamp. */
    class je extends Be {}

    /** Transforms an array value via a union operation. */ class Qe extends Be {
        constructor(t) {
            super(), this.elements = t;
        }
    }

    function Ge(t, e) {
        const n = Xe(e);
        for (const e of t.elements) n.some(t => Kt(t, e)) || n.push(e);
        return {
            arrayValue: {
                values: n
            }
        };
    }

    /** Transforms an array value via a remove operation. */ class ze extends Be {
        constructor(t) {
            super(), this.elements = t;
        }
    }

    function He(t, e) {
        let n = Xe(e);
        for (const e of t.elements) n = n.filter(t => !Kt(t, e));
        return {
            arrayValue: {
                values: n
            }
        };
    }

    /**
     * Implements the backend semantics for locally computed NUMERIC_ADD (increment)
     * transforms. Converts all field values to integers or doubles, but unlike the
     * backend does not cap integer values at 2^63. Instead, JavaScript number
     * arithmetic is used and precision loss can occur for values greater than 2^53.
     */ class Je extends Be {
        constructor(t, e) {
            super(), this.serializer = t, this.Je = e;
        }
    }

    function Ye(t) {
        return Yt(t.integerValue || t.doubleValue);
    }

    function Xe(t) {
        return ee(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provides a set of fields that can be used to partially patch a document.
     * FieldMask is used in conjunction with ObjectValue.
     * Examples:
     *   foo - Overwrites foo entirely with the provided value. If foo is not
     *         present in the companion ObjectValue, the field is deleted.
     *   foo.bar - Overwrites only the field bar of the object foo.
     *             If foo is not an object, foo is replaced with an object
     *             containing foo
     */ class Ze {
        constructor(t) {
            this.fields = t, 
            // TODO(dimond): validation of FieldMask
            // Sort the field mask to support `FieldMask.isEqual()` and assert below.
            t.sort(K$1.D);
        }
        /**
         * Verifies that `fieldPath` is included by at least one field in this field
         * mask.
         *
         * This is an O(n) operation, where `n` is the size of the field mask.
         */    en(t) {
            for (const e of this.fields) if (e.L(t)) return !0;
            return !1;
        }
        isEqual(t) {
            return M$1(this.fields, t.fields, (t, e) => t.isEqual(e));
        }
    }

    /** A field path and the TransformOperation to perform upon it. */ class tn {
        constructor(t, e) {
            this.field = t, this.transform = e;
        }
    }

    function en(t, e) {
        return t.field.isEqual(e.field) && function(t, e) {
            return t instanceof Qe && e instanceof Qe || t instanceof ze && e instanceof ze ? M$1(t.elements, e.elements, Kt) : t instanceof Je && e instanceof Je ? Kt(t.Je, e.Je) : t instanceof je && e instanceof je;
        }(t.transform, e.transform);
    }

    /** The result of successfully applying a mutation to the backend. */ class nn {
        constructor(
        /**
         * The version at which the mutation was committed:
         *
         * - For most operations, this is the updateTime in the WriteResult.
         * - For deletes, the commitTime of the WriteResponse (because deletes are
         *   not stored and have no updateTime).
         *
         * Note that these versions can be different: No-op writes will not change
         * the updateTime even though the commitTime advances.
         */
        t, 
        /**
         * The resulting fields returned from the backend after a
         * TransformMutation has been committed. Contains one FieldValue for each
         * FieldTransform that was in the mutation.
         *
         * Will be null if the mutation was not a TransformMutation.
         */
        e) {
            this.version = t, this.transformResults = e;
        }
    }

    /**
     * Encodes a precondition for a mutation. This follows the model that the
     * backend accepts with the special case of an explicit "empty" precondition
     * (meaning no precondition).
     */ class sn {
        constructor(t, e) {
            this.updateTime = t, this.exists = e;
        }
        /** Creates a new empty Precondition. */    static Ze() {
            return new sn;
        }
        /** Creates a new Precondition with an exists flag. */    static exists(t) {
            return new sn(void 0, t);
        }
        /** Creates a new Precondition based on a version a document exists at. */    static updateTime(t) {
            return new sn(t);
        }
        /** Returns whether this Precondition is empty. */    get Ye() {
            return void 0 === this.updateTime && void 0 === this.exists;
        }
        isEqual(t) {
            return this.exists === t.exists && (this.updateTime ? !!t.updateTime && this.updateTime.isEqual(t.updateTime) : !t.updateTime);
        }
    }

    /**
     * Returns true if the preconditions is valid for the given document
     * (or null if no document is available).
     */ function rn(t, e) {
        return void 0 !== t.updateTime ? e instanceof gn && e.version.isEqual(t.updateTime) : void 0 === t.exists || t.exists === e instanceof gn;
    }

    /**
     * A mutation describes a self-contained change to a document. Mutations can
     * create, replace, delete, and update subsets of documents.
     *
     * Mutations not only act on the value of the document but also its version.
     *
     * For local mutations (mutations that haven't been committed yet), we preserve
     * the existing version for Set, Patch, and Transform mutations. For Delete
     * mutations, we reset the version to 0.
     *
     * Here's the expected transition table.
     *
     * MUTATION           APPLIED TO            RESULTS IN
     *
     * SetMutation        Document(v3)          Document(v3)
     * SetMutation        NoDocument(v3)        Document(v0)
     * SetMutation        null                  Document(v0)
     * PatchMutation      Document(v3)          Document(v3)
     * PatchMutation      NoDocument(v3)        NoDocument(v3)
     * PatchMutation      null                  null
     * TransformMutation  Document(v3)          Document(v3)
     * TransformMutation  NoDocument(v3)        NoDocument(v3)
     * TransformMutation  null                  null
     * DeleteMutation     Document(v3)          NoDocument(v0)
     * DeleteMutation     NoDocument(v3)        NoDocument(v0)
     * DeleteMutation     null                  NoDocument(v0)
     *
     * For acknowledged mutations, we use the updateTime of the WriteResponse as
     * the resulting version for Set, Patch, and Transform mutations. As deletes
     * have no explicit update time, we use the commitTime of the WriteResponse for
     * Delete mutations.
     *
     * If a mutation is acknowledged by the backend but fails the precondition check
     * locally, we return an `UnknownDocument` and rely on Watch to send us the
     * updated version.
     *
     * Note that TransformMutations don't create Documents (in the case of being
     * applied to a NoDocument), even though they would on the backend. This is
     * because the client always combines the TransformMutation with a SetMutation
     * or PatchMutation and we only want to apply the transform if the prior
     * mutation resulted in a Document (always true for a SetMutation, but not
     * necessarily for a PatchMutation).
     *
     * ## Subclassing Notes
     *
     * Subclasses of Mutation need to implement applyToRemoteDocument() and
     * applyToLocalView() to implement the actual behavior of applying the mutation
     * to some source document.
     */ class on {}

    /**
     * Applies this mutation to the given MaybeDocument or null for the purposes
     * of computing a new remote document. If the input document doesn't match the
     * expected state (e.g. it is null or outdated), an `UnknownDocument` can be
     * returned.
     *
     * @param mutation The mutation to apply.
     * @param maybeDoc The document to mutate. The input document can be null if
     *     the client has no knowledge of the pre-mutation state of the document.
     * @param mutationResult The result of applying the mutation from the backend.
     * @return The mutated document. The returned document may be an
     *     UnknownDocument if the mutation could not be applied to the locally
     *     cached base document.
     */ function hn(t, e, n) {
        return t instanceof _n ? function(t, e, n) {
            // Unlike applySetMutationToLocalView, if we're applying a mutation to a
            // remote document the server has accepted the mutation so the precondition
            // must have held.
            return new gn(t.key, n.version, t.value, {
                hasCommittedMutations: !0
            });
        }(t, 0, n) : t instanceof fn ? function(t, e, n) {
            if (!rn(t.Xe, e)) 
            // Since the mutation was not rejected, we know that the  precondition
            // matched on the backend. We therefore must not have the expected version
            // of the document in our cache and return an UnknownDocument with the
            // known updateTime.
            return new pn(t.key, n.version);
            const s = dn(t, e);
            return new gn(t.key, n.version, s, {
                hasCommittedMutations: !0
            });
        }(t, e, n) : t instanceof wn ? function(t, e, n) {
            if (v$1(null != n.transformResults), !rn(t.Xe, e)) 
            // Since the mutation was not rejected, we know that the  precondition
            // matched on the backend. We therefore must not have the expected version
            // of the document in our cache and return an UnknownDocument with the
            // known updateTime.
            return new pn(t.key, n.version);
            const s = Tn(t, e), i = 
            /**
     * Creates a list of "transform results" (a transform result is a field value
     * representing the result of applying a transform) for use after a
     * TransformMutation has been acknowledged by the server.
     *
     * @param fieldTransforms The field transforms to apply the result to.
     * @param baseDoc The document prior to applying this mutation batch.
     * @param serverTransformResults The transform results received by the server.
     * @return The transform results list.
     */
            function(t, e, n) {
                const s = [];
                v$1(t.length === n.length);
                for (let i = 0; i < n.length; i++) {
                    const r = t[i], o = r.transform;
                    let h = null;
                    e instanceof gn && (h = e.field(r.field)), s.push(We(o, h, n[i]));
                }
                return s;
            }
            /**
     * Creates a list of "transform results" (a transform result is a field value
     * representing the result of applying a transform) for use when applying a
     * TransformMutation locally.
     *
     * @param fieldTransforms The field transforms to apply the result to.
     * @param localWriteTime The local time of the transform mutation (used to
     *     generate ServerTimestampValues).
     * @param maybeDoc The current state of the document after applying all
     *     previous mutations.
     * @param baseDoc The document prior to applying this mutation batch.
     * @return The transform results list.
     */ (t.fieldTransforms, e, n.transformResults), r = n.version, o = En(t, s.data(), i);
            return new gn(t.key, r, o, {
                hasCommittedMutations: !0
            });
        }(t, e, n) : function(t, e, n) {
            // Unlike applyToLocalView, if we're applying a mutation to a remote
            // document the server has accepted the mutation so the precondition must
            // have held.
            return new yn(t.key, n.version, {
                hasCommittedMutations: !0
            });
        }(t, 0, n);
    }

    /**
     * Applies this mutation to the given MaybeDocument or null for the purposes
     * of computing the new local view of a document. Both the input and returned
     * documents can be null.
     *
     * @param mutation The mutation to apply.
     * @param maybeDoc The document to mutate. The input document can be null if
     *     the client has no knowledge of the pre-mutation state of the document.
     * @param baseDoc The state of the document prior to this mutation batch. The
     *     input document can be null if the client has no knowledge of the
     *     pre-mutation state of the document.
     * @param localWriteTime A timestamp indicating the local write time of the
     *     batch this mutation is a part of.
     * @return The mutated document. The returned document may be null, but only
     *     if maybeDoc was null and the mutation would not create a new document.
     */ function an(t, e, n, s) {
        return t instanceof _n ? function(t, e) {
            if (!rn(t.Xe, e)) return e;
            const n = ln(e);
            return new gn(t.key, n, t.value, {
                nn: !0
            });
        }
        /**
     * A mutation that modifies fields of the document at the given key with the
     * given values. The values are applied through a field mask:
     *
     *  * When a field is in both the mask and the values, the corresponding field
     *    is updated.
     *  * When a field is in neither the mask nor the values, the corresponding
     *    field is unmodified.
     *  * When a field is in the mask but not in the values, the corresponding field
     *    is deleted.
     *  * When a field is not in the mask but is in the values, the values map is
     *    ignored.
     */ (t, e) : t instanceof fn ? function(t, e) {
            if (!rn(t.Xe, e)) return e;
            const n = ln(e), s = dn(t, e);
            return new gn(t.key, n, s, {
                nn: !0
            });
        }
        /**
     * Patches the data of document if available or creates a new document. Note
     * that this does not check whether or not the precondition of this patch
     * holds.
     */ (t, e) : t instanceof wn ? function(t, e, n, s) {
            if (!rn(t.Xe, e)) return e;
            const i = Tn(t, e), r = function(t, e, n, s) {
                const i = [];
                for (const r of t) {
                    const t = r.transform;
                    let o = null;
                    n instanceof gn && (o = n.field(r.field)), null === o && s instanceof gn && (
                    // If the current document does not contain a value for the mutated
                    // field, use the value that existed before applying this mutation
                    // batch. This solves an edge case where a PatchMutation clears the
                    // values in a nested map before the TransformMutation is applied.
                    o = s.field(r.field)), i.push(Ue(t, o, e));
                }
                return i;
            }(t.fieldTransforms, n, e, s), o = En(t, i.data(), r);
            return new gn(t.key, i.version, o, {
                nn: !0
            });
        }(t, e, s, n) : function(t, e) {
            if (!rn(t.Xe, e)) return e;
            return new yn(t.key, q$1.min());
        }
        /**
     * A mutation that verifies the existence of the document at the given key with
     * the provided precondition.
     *
     * The `verify` operation is only used in Transactions, and this class serves
     * primarily to facilitate serialization into protos.
     */ (t, e);
    }

    /**
     * If this mutation is not idempotent, returns the base value to persist with
     * this mutation. If a base value is returned, the mutation is always applied
     * to this base value, even if document has already been updated.
     *
     * The base value is a sparse object that consists of only the document
     * fields for which this mutation contains a non-idempotent transformation
     * (e.g. a numeric increment). The provided value guarantees consistent
     * behavior for non-idempotent transforms and allow us to return the same
     * latency-compensated value even if the backend has already applied the
     * mutation. The base value is null for idempotent mutations, as they can be
     * re-played even if the backend has already applied them.
     *
     * @return a base value to store along with the mutation, or null for
     * idempotent mutations.
     */ function un(t, e) {
        return t instanceof wn ? function(t, e) {
            let n = null;
            for (const s of t.fieldTransforms) {
                const t = e instanceof gn ? e.field(s.field) : void 0, i = Ke(s.transform, t || null);
                null != i && (n = null == n ? (new mn).set(s.field, i) : n.set(s.field, i));
            }
            return n ? n.sn() : null;
        }
        /**
     * Asserts that the given MaybeDocument is actually a Document and verifies
     * that it matches the key for this mutation. Since we only support
     * transformations with precondition exists this method is guaranteed to be
     * safe.
     */ (t, e) : null;
    }

    function cn(t, e) {
        return t.type === e.type && (!!t.key.isEqual(e.key) && (!!t.Xe.isEqual(e.Xe) && (0 /* Set */ === t.type ? t.value.isEqual(e.value) : 1 /* Patch */ === t.type ? t.data.isEqual(e.data) && t.He.isEqual(e.He) : 2 /* Transform */ !== t.type || M$1(t.fieldTransforms, t.fieldTransforms, (t, e) => en(t, e)))));
    }

    /**
     * Returns the version from the given document for use as the result of a
     * mutation. Mutations are defined to return the version of the base document
     * only if it is an existing document. Deleted and unknown documents have a
     * post-mutation version of SnapshotVersion.min().
     */ function ln(t) {
        return t instanceof gn ? t.version : q$1.min();
    }

    /**
     * A mutation that creates or replaces the document at the given key with the
     * object value contents.
     */ class _n extends on {
        constructor(t, e, n) {
            super(), this.key = t, this.value = e, this.Xe = n, this.type = 0 /* Set */;
        }
    }

    class fn extends on {
        constructor(t, e, n, s) {
            super(), this.key = t, this.data = e, this.He = n, this.Xe = s, this.type = 1 /* Patch */;
        }
    }

    function dn(t, e) {
        let n;
        return n = e instanceof gn ? e.data() : Rn.empty(), function(t, e) {
            const n = new mn(e);
            return t.He.fields.forEach(e => {
                if (!e.$()) {
                    const s = t.data.field(e);
                    null !== s ? n.set(e, s) : n.delete(e);
                }
            }), n.sn();
        }
        /**
     * A mutation that modifies specific fields of the document with transform
     * operations. Currently the only supported transform is a server timestamp, but
     * IP Address, increment(n), etc. could be supported in the future.
     *
     * It is somewhat similar to a PatchMutation in that it patches specific fields
     * and has no effect when applied to a null or NoDocument (see comment on
     * Mutation for rationale).
     */ (t, n);
    }

    class wn extends on {
        constructor(t, e) {
            super(), this.key = t, this.fieldTransforms = e, this.type = 2 /* Transform */ , 
            // NOTE: We set a precondition of exists: true as a safety-check, since we
            // always combine TransformMutations with a SetMutation or PatchMutation which
            // (if successful) should end up with an existing document.
            this.Xe = sn.exists(!0);
        }
    }

    function Tn(t, e) {
        return e;
    }

    function En(t, e, n) {
        const s = new mn(e);
        for (let e = 0; e < t.fieldTransforms.length; e++) {
            const i = t.fieldTransforms[e];
            s.set(i.field, n[e]);
        }
        return s.sn();
    }

    /** A mutation that deletes the document at the given key. */ class In extends on {
        constructor(t, e) {
            super(), this.key = t, this.Xe = e, this.type = 3 /* Delete */;
        }
    }

    class An extends on {
        constructor(t, e) {
            super(), this.key = t, this.Xe = e, this.type = 4 /* Verify */;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An ObjectValue represents a MapValue in the Firestore Proto and offers the
     * ability to add and remove fields (via the ObjectValueBuilder).
     */ class Rn {
        constructor(t) {
            this.proto = t;
        }
        static empty() {
            return new Rn({
                mapValue: {}
            });
        }
        /**
         * Returns the value at the given path or null.
         *
         * @param path the path to search
         * @return The value at the path or if there it doesn't exist.
         */    field(t) {
            if (t.$()) return this.proto;
            {
                let e = this.proto;
                for (let n = 0; n < t.length - 1; ++n) {
                    if (!e.mapValue.fields) return null;
                    if (e = e.mapValue.fields[t.get(n)], !ie(e)) return null;
                }
                return e = (e.mapValue.fields || {})[t.M()], e || null;
            }
        }
        isEqual(t) {
            return Kt(this.proto, t.proto);
        }
    }

    /**
     * An ObjectValueBuilder provides APIs to set and delete fields from an
     * ObjectValue.
     */ class mn {
        /**
         * @param baseObject The object to mutate.
         */
        constructor(t = Rn.empty()) {
            this.rn = t, 
            /** A map that contains the accumulated changes in this builder. */
            this.on = new Map;
        }
        /**
         * Sets the field to the provided value.
         *
         * @param path The field path to set.
         * @param value The value to set.
         * @return The current Builder instance.
         */    set(t, e) {
            return this.hn(t, e), this;
        }
        /**
         * Removes the field at the specified path. If there is no field at the
         * specified path, nothing is changed.
         *
         * @param path The field path to remove.
         * @return The current Builder instance.
         */    delete(t) {
            return this.hn(t, null), this;
        }
        /**
         * Adds `value` to the overlay map at `path`. Creates nested map entries if
         * needed.
         */    hn(t, e) {
            let n = this.on;
            for (let e = 0; e < t.length - 1; ++e) {
                const s = t.get(e);
                let i = n.get(s);
                i instanceof Map ? 
                // Re-use a previously created map
                n = i : i && 10 /* ObjectValue */ === Wt(i) ? (
                // Convert the existing Protobuf MapValue into a map
                i = new Map(Object.entries(i.mapValue.fields || {})), n.set(s, i), n = i) : (
                // Create an empty map to represent the current nesting level
                i = new Map, n.set(s, i), n = i);
            }
            n.set(t.M(), e);
        }
        /** Returns an ObjectValue with all mutations applied. */    sn() {
            const t = this.an(K$1.K(), this.on);
            return null != t ? new Rn(t) : this.rn;
        }
        /**
         * Applies any overlays from `currentOverlays` that exist at `currentPath`
         * and returns the merged data at `currentPath` (or null if there were no
         * changes).
         *
         * @param currentPath The path at the current nesting level. Can be set to
         * FieldValue.emptyPath() to represent the root.
         * @param currentOverlays The overlays at the current nesting level in the
         * same format as `overlayMap`.
         * @return The merged data at `currentPath` or null if no modifications
         * were applied.
         */    an(t, e) {
            let n = !1;
            const s = this.rn.field(t), i = ie(s) ? // If there is already data at the current path, base our
            Object.assign({}, s.mapValue.fields) : {};
            return e.forEach((e, s) => {
                if (e instanceof Map) {
                    const r = this.an(t.child(s), e);
                    null != r && (i[s] = r, n = !0);
                } else null !== e ? (i[s] = e, n = !0) : i.hasOwnProperty(s) && (delete i[s], n = !0);
            }), n ? {
                mapValue: {
                    fields: i
                }
            } : null;
        }
    }

    /**
     * Returns a FieldMask built from all fields in a MapValue.
     */ function Pn(t) {
        const e = [];
        return $t(t.fields || {}, (t, n) => {
            const s = new K$1([ t ]);
            if (ie(n)) {
                const t = Pn(n.mapValue).fields;
                if (0 === t.length) 
                // Preserve the empty map by adding it to the FieldMask.
                e.push(s); else 
                // For nested and non-empty ObjectValues, add the FieldPath of the
                // leaf nodes.
                for (const n of t) e.push(s.child(n));
            } else 
            // For nested and non-empty ObjectValues, add the FieldPath of the leaf
            // nodes.
            e.push(s);
        }), new Ze(e);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The result of a lookup for a given path may be an existing document or a
     * marker that this document does not exist at a given version.
     */ class Vn {
        constructor(t, e) {
            this.key = t, this.version = e;
        }
    }

    /**
     * Represents a document in Firestore with a key, version, data and whether the
     * data has local mutations applied to it.
     */ class gn extends Vn {
        constructor(t, e, n, s) {
            super(t, e), this.un = n, this.nn = !!s.nn, this.hasCommittedMutations = !!s.hasCommittedMutations;
        }
        field(t) {
            return this.un.field(t);
        }
        data() {
            return this.un;
        }
        cn() {
            return this.un.proto;
        }
        isEqual(t) {
            return t instanceof gn && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.nn === t.nn && this.hasCommittedMutations === t.hasCommittedMutations && this.un.isEqual(t.un);
        }
        toString() {
            return `Document(${this.key}, ${this.version}, ${this.un.toString()}, {hasLocalMutations: ${this.nn}}), {hasCommittedMutations: ${this.hasCommittedMutations}})`;
        }
        get hasPendingWrites() {
            return this.nn || this.hasCommittedMutations;
        }
    }

    /**
     * Compares the value for field `field` in the provided documents. Throws if
     * the field does not exist in both documents.
     */
    /**
     * A class representing a deleted document.
     * Version is set to 0 if we don't point to any specific time, otherwise it
     * denotes time we know it didn't exist at.
     */
    class yn extends Vn {
        constructor(t, e, n) {
            super(t, e), this.hasCommittedMutations = !(!n || !n.hasCommittedMutations);
        }
        toString() {
            return `NoDocument(${this.key}, ${this.version})`;
        }
        get hasPendingWrites() {
            return this.hasCommittedMutations;
        }
        isEqual(t) {
            return t instanceof yn && t.hasCommittedMutations === this.hasCommittedMutations && t.version.isEqual(this.version) && t.key.isEqual(this.key);
        }
    }

    /**
     * A class representing an existing document whose data is unknown (e.g. a
     * document that was updated without a known base document).
     */ class pn extends Vn {
        toString() {
            return `UnknownDocument(${this.key}, ${this.version})`;
        }
        get hasPendingWrites() {
            return !0;
        }
        isEqual(t) {
            return t instanceof pn && t.version.isEqual(this.version) && t.key.isEqual(this.key);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Casts `obj` to `T`. Throws if  `obj` is not an instance of `T`.
     *
     * This cast is used in the Lite and Full SDK to verify instance types for
     * arguments passed to the public API.
     */ function bn(t, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        if (!(t instanceof e)) throw e.name === t.constructor.name ? new D$1(C$1.INVALID_ARGUMENT, `Type does not match the expected instance. Did you pass '${e.name}' from a different Firestore SDK?`) : new D$1(C$1.INVALID_ARGUMENT, `Expected type '${e.name}', but was '${t.constructor.name}'`);
        return t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Query encapsulates all the query attributes we support in the SDK. It can
     * be run against the LocalStore, as well as be converted to a `Target` to
     * query the RemoteStore results.
     *
     * Visible for testing.
     */ class vn {
        /**
         * Initializes a Query with a path and optional additional query constraints.
         * Path must currently be empty if this is a collection group query.
         */
        constructor(t, e = null, n = [], s = [], i = null, r = "F" /* First */ , o = null, h = null) {
            this.path = t, this.collectionGroup = e, this.ln = n, this.filters = s, this.limit = i, 
            this._n = r, this.startAt = o, this.endAt = h, this.fn = null, 
            // The corresponding `Target` of this `Query` instance.
            this.dn = null, this.startAt, this.endAt;
        }
        /**
         * Helper to convert a collection group query into a collection query at a
         * specific path. This is used when executing collection group queries, since
         * we have to split the query into a set of collection queries at multiple
         * paths.
         */    wn(t) {
            return new vn(t, 
            /*collectionGroup=*/ null, this.ln.slice(), this.filters.slice(), this.limit, this._n, this.startAt, this.endAt);
        }
        Tn() {
            return 0 === this.filters.length && null === this.limit && null == this.startAt && null == this.endAt && (0 === this.ln.length || 1 === this.ln.length && this.ln[0].field.G());
        }
        En() {
            return !z(this.limit) && "F" /* First */ === this._n;
        }
        In() {
            return !z(this.limit) && "L" /* Last */ === this._n;
        }
        An() {
            return this.ln.length > 0 ? this.ln[0].field : null;
        }
        Rn() {
            for (const t of this.filters) if (t.mn()) return t.field;
            return null;
        }
        Pn(t) {
            for (const e of this.filters) if (t.indexOf(e.op) >= 0) return e.op;
            return null;
        }
    }

    /** Creates a new Query instance with the options provided. */ function Sn(t, e, n, s, i, r, o, h) {
        return new vn(t, e, n, s, i, r, o, h);
    }

    /** Creates a new Query for a query that matches all documents at `path` */ function Cn(t) {
        return new vn(t);
    }

    /**
     * Creates a new Query for a collection group query that matches all documents
     * within the provided collection group.
     */
    /**
     * Returns whether the query matches a collection group rather than a specific
     * collection.
     */
    function Dn(t) {
        return null !== t.collectionGroup;
    }

    /**
     * Returns the implicit order by constraint that is used to execute the Query,
     * which can be different from the order by constraints the user provided (e.g.
     * the SDK and backend always orders by `__name__`).
     */ function Nn(t) {
        const e = bn(t, vn);
        if (null === e.fn) {
            e.fn = [];
            const t = e.Rn(), n = e.An();
            if (null !== t && null === n) 
            // In order to implicitly add key ordering, we must also add the
            // inequality filter field for it to be a valid query.
            // Note that the default inequality field and key ordering is ascending.
            t.G() || e.fn.push(new Zn(t)), e.fn.push(new Zn(K$1.H(), "asc" /* ASCENDING */)); else {
                let t = !1;
                for (const n of e.ln) e.fn.push(n), n.field.G() && (t = !0);
                if (!t) {
                    // The order of the implicit key ordering always matches the last
                    // explicit order by
                    const t = e.ln.length > 0 ? e.ln[e.ln.length - 1].dir : "asc" /* ASCENDING */;
                    e.fn.push(new Zn(K$1.H(), t));
                }
            }
        }
        return e.fn;
    }

    /**
     * Converts this `Query` instance to it's corresponding `Target` representation.
     */ function xn(t) {
        const e = bn(t, vn);
        if (!e.dn) if ("F" /* First */ === e._n) e.dn = X$1(e.path, e.collectionGroup, Nn(e), e.filters, e.limit, e.startAt, e.endAt); else {
            // Flip the orderBy directions since we want the last results
            const t = [];
            for (const n of Nn(e)) {
                const e = "desc" /* DESCENDING */ === n.dir ? "asc" /* ASCENDING */ : "desc" /* DESCENDING */;
                t.push(new Zn(n.field, e));
            }
            // We need to swap the cursors to match the now-flipped query ordering.
                    const n = e.endAt ? new Hn(e.endAt.position, !e.endAt.before) : null, s = e.startAt ? new Hn(e.startAt.position, !e.startAt.before) : null;
            // Now return as a LimitType.First query.
            e.dn = X$1(e.path, e.collectionGroup, t, e.filters, e.limit, n, s);
        }
        return e.dn;
    }

    function kn(t, e) {
        return et(xn(t), xn(e)) && t._n === e._n;
    }

    // TODO(b/29183165): This is used to get a unique string from a query to, for
    // example, use as a dictionary key, but the implementation is subject to
    // collisions. Make it collision-free.
    function On(t) {
        return `${Z$1(xn(t))}|lt:${t._n}`;
    }

    function Fn(t) {
        return `Query(target=${tt(xn(t))}; limitType=${t._n})`;
    }

    /** Returns whether `doc` matches the constraints of `query`. */ function Mn(t, e) {
        return function(t, e) {
            const n = e.key.path;
            return null !== t.collectionGroup ? e.key.X(t.collectionGroup) && t.path.L(n) : j.Z(t.path) ? t.path.isEqual(n) : t.path.q(n);
        }
        /**
     * A document must have a value for every ordering clause in order to show up
     * in the results.
     */ (t, e) && function(t, e) {
            for (const n of t.ln) 
            // order by key always matches
            if (!n.field.G() && null === e.field(n.field)) return !1;
            return !0;
        }(t, e) && function(t, e) {
            for (const n of t.filters) if (!n.matches(e)) return !1;
            return !0;
        }
        /** Makes sure a document is within the bounds, if provided. */ (t, e) && function(t, e) {
            if (t.startAt && !Yn(t.startAt, Nn(t), e)) return !1;
            if (t.endAt && Yn(t.endAt, Nn(t), e)) return !1;
            return !0;
        }
        /**
     * Returns a new comparator function that can be used to compare two documents
     * based on the Query's ordering constraint.
     */ (t, e);
    }

    function $n(t) {
        return (e, n) => {
            let s = !1;
            for (const i of Nn(t)) {
                const t = ts(i, e, n);
                if (0 !== t) return t;
                s = s || i.field.G();
            }
            return 0;
        };
    }

    class Ln extends class {} {
        constructor(t, e, n) {
            super(), this.field = t, this.op = e, this.value = n;
        }
        /**
         * Creates a filter based on the provided arguments.
         */    static create(t, e, n) {
            if (t.G()) return "in" /* IN */ === e || "not-in" /* NOT_IN */ === e ? this.Vn(t, e, n) : new Bn(t, e, n);
            if (ne(n)) {
                if ("==" /* EQUAL */ !== e && "!=" /* NOT_EQUAL */ !== e) 
                // TODO(ne-queries): Update error message to include != comparison.
                throw new D$1(C$1.INVALID_ARGUMENT, "Invalid query. Null supports only equality comparisons.");
                return new Ln(t, e, n);
            }
            if (se(n)) {
                if ("==" /* EQUAL */ !== e && "!=" /* NOT_EQUAL */ !== e) 
                // TODO(ne-queries): Update error message to include != comparison.
                throw new D$1(C$1.INVALID_ARGUMENT, "Invalid query. NaN supports only equality comparisons.");
                return new Ln(t, e, n);
            }
            return "array-contains" /* ARRAY_CONTAINS */ === e ? new jn(t, n) : "in" /* IN */ === e ? new Qn(t, n) : "not-in" /* NOT_IN */ === e ? new Gn(t, n) : "array-contains-any" /* ARRAY_CONTAINS_ANY */ === e ? new zn(t, n) : new Ln(t, e, n);
        }
        static Vn(t, e, n) {
            return "in" /* IN */ === e ? new Un(t, n) : new Wn(t, n);
        }
        matches(t) {
            const e = t.field(this.field);
            // Types do not have to match in NOT_EQUAL filters.
                    return "!=" /* NOT_EQUAL */ === this.op ? null !== e && this.gn(Qt(e, this.value)) : null !== e && Wt(this.value) === Wt(e) && this.gn(Qt(e, this.value));
            // Only compare types with matching backend order (such as double and int).
            }
        gn(t) {
            switch (this.op) {
              case "<" /* LESS_THAN */ :
                return t < 0;

              case "<=" /* LESS_THAN_OR_EQUAL */ :
                return t <= 0;

              case "==" /* EQUAL */ :
                return 0 === t;

              case "!=" /* NOT_EQUAL */ :
                return 0 !== t;

              case ">" /* GREATER_THAN */ :
                return t > 0;

              case ">=" /* GREATER_THAN_OR_EQUAL */ :
                return t >= 0;

              default:
                return b();
            }
        }
        mn() {
            return [ "<" /* LESS_THAN */ , "<=" /* LESS_THAN_OR_EQUAL */ , ">" /* GREATER_THAN */ , ">=" /* GREATER_THAN_OR_EQUAL */ , "!=" /* NOT_EQUAL */ ].indexOf(this.op) >= 0;
        }
    }

    function qn(t) {
        // TODO(b/29183165): Technically, this won't be unique if two values have
        // the same description, such as the int 3 and the string "3". So we should
        // add the types in here somehow, too.
        return t.field.U() + t.op.toString() + zt(t.value);
    }

    class Bn extends Ln {
        constructor(t, e, n) {
            super(t, e, n), this.key = j.Y(n.referenceValue);
        }
        matches(t) {
            const e = j.D(t.key, this.key);
            return this.gn(e);
        }
    }

    /** Filter that matches on key fields within an array. */ class Un extends Ln {
        constructor(t, e) {
            super(t, "in" /* IN */ , e), this.keys = Kn("in" /* IN */ , e);
        }
        matches(t) {
            return this.keys.some(e => e.isEqual(t.key));
        }
    }

    /** Filter that matches on key fields not present within an array. */ class Wn extends Ln {
        constructor(t, e) {
            super(t, "not-in" /* NOT_IN */ , e), this.keys = Kn("not-in" /* NOT_IN */ , e);
        }
        matches(t) {
            return !this.keys.some(e => e.isEqual(t.key));
        }
    }

    function Kn(t, e) {
        var n;
        return ((null === (n = e.arrayValue) || void 0 === n ? void 0 : n.values) || []).map(t => j.Y(t.referenceValue));
    }

    /** A Filter that implements the array-contains operator. */ class jn extends Ln {
        constructor(t, e) {
            super(t, "array-contains" /* ARRAY_CONTAINS */ , e);
        }
        matches(t) {
            const e = t.field(this.field);
            return ee(e) && jt(e.arrayValue, this.value);
        }
    }

    /** A Filter that implements the IN operator. */ class Qn extends Ln {
        constructor(t, e) {
            super(t, "in" /* IN */ , e);
        }
        matches(t) {
            const e = t.field(this.field);
            return null !== e && jt(this.value.arrayValue, e);
        }
    }

    /** A Filter that implements the not-in operator. */ class Gn extends Ln {
        constructor(t, e) {
            super(t, "not-in" /* NOT_IN */ , e);
        }
        matches(t) {
            const e = t.field(this.field);
            return null !== e && !jt(this.value.arrayValue, e);
        }
    }

    /** A Filter that implements the array-contains-any operator. */ class zn extends Ln {
        constructor(t, e) {
            super(t, "array-contains-any" /* ARRAY_CONTAINS_ANY */ , e);
        }
        matches(t) {
            const e = t.field(this.field);
            return !(!ee(e) || !e.arrayValue.values) && e.arrayValue.values.some(t => jt(this.value.arrayValue, t));
        }
    }

    /**
     * Represents a bound of a query.
     *
     * The bound is specified with the given components representing a position and
     * whether it's just before or just after the position (relative to whatever the
     * query order is).
     *
     * The position represents a logical index position for a query. It's a prefix
     * of values for the (potentially implicit) order by clauses of a query.
     *
     * Bound provides a function to determine whether a document comes before or
     * after a bound. This is influenced by whether the position is just before or
     * just after the provided values.
     */ class Hn {
        constructor(t, e) {
            this.position = t, this.before = e;
        }
    }

    function Jn(t) {
        // TODO(b/29183165): Make this collision robust.
        return `${t.before ? "b" : "a"}:${t.position.map(t => zt(t)).join(",")}`;
    }

    /**
     * Returns true if a document sorts before a bound using the provided sort
     * order.
     */ function Yn(t, e, n) {
        let s = 0;
        for (let i = 0; i < t.position.length; i++) {
            const r = e[i], o = t.position[i];
            if (r.field.G()) s = j.D(j.Y(o.referenceValue), n.key); else {
                s = Qt(o, n.field(r.field));
            }
            if ("desc" /* DESCENDING */ === r.dir && (s *= -1), 0 !== s) break;
        }
        return t.before ? s <= 0 : s < 0;
    }

    function Xn(t, e) {
        if (null === t) return null === e;
        if (null === e) return !1;
        if (t.before !== e.before || t.position.length !== e.position.length) return !1;
        for (let n = 0; n < t.position.length; n++) {
            if (!Kt(t.position[n], e.position[n])) return !1;
        }
        return !0;
    }

    /**
     * An ordering on a field, in some Direction. Direction defaults to ASCENDING.
     */ class Zn {
        constructor(t, e = "asc" /* ASCENDING */) {
            this.field = t, this.dir = e;
        }
    }

    function ts(t, e, n) {
        const s = t.field.G() ? j.D(e.key, n.key) : function(t, e, n) {
            const s = e.field(t), i = n.field(t);
            return null !== s && null !== i ? Qt(s, i) : b();
        }(t.field, e, n);
        switch (t.dir) {
          case "asc" /* ASCENDING */ :
            return s;

          case "desc" /* DESCENDING */ :
            return -1 * s;

          default:
            return b();
        }
    }

    function es(t, e) {
        return t.dir === e.dir && t.field.isEqual(e.field);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A batch of mutations that will be sent as one unit to the backend.
     */
    class ns {
        /**
         * @param batchId The unique ID of this mutation batch.
         * @param localWriteTime The original write time of this mutation.
         * @param baseMutations Mutations that are used to populate the base
         * values when this mutation is applied locally. This can be used to locally
         * overwrite values that are persisted in the remote document cache. Base
         * mutations are never sent to the backend.
         * @param mutations The user-provided mutations in this mutation batch.
         * User-provided mutations are applied both locally and remotely on the
         * backend.
         */
        constructor(t, e, n, s) {
            this.batchId = t, this.yn = e, this.baseMutations = n, this.mutations = s;
        }
        /**
         * Applies all the mutations in this MutationBatch to the specified document
         * to create a new remote document
         *
         * @param docKey The key of the document to apply mutations to.
         * @param maybeDoc The document to apply mutations to.
         * @param batchResult The result of applying the MutationBatch to the
         * backend.
         */    pn(t, e, n) {
            const s = n.bn;
            for (let n = 0; n < this.mutations.length; n++) {
                const i = this.mutations[n];
                if (i.key.isEqual(t)) {
                    e = hn(i, e, s[n]);
                }
            }
            return e;
        }
        /**
         * Computes the local view of a document given all the mutations in this
         * batch.
         *
         * @param docKey The key of the document to apply mutations to.
         * @param maybeDoc The document to apply mutations to.
         */    vn(t, e) {
            // First, apply the base state. This allows us to apply non-idempotent
            // transform against a consistent set of values.
            for (const n of this.baseMutations) n.key.isEqual(t) && (e = an(n, e, e, this.yn));
            const n = e;
            // Second, apply all user-provided mutations.
                    for (const s of this.mutations) s.key.isEqual(t) && (e = an(s, e, n, this.yn));
            return e;
        }
        /**
         * Computes the local view for all provided documents given the mutations in
         * this batch.
         */    Sn(t) {
            // TODO(mrschmidt): This implementation is O(n^2). If we apply the mutations
            // directly (as done in `applyToLocalView()`), we can reduce the complexity
            // to O(n).
            let e = t;
            return this.mutations.forEach(n => {
                const s = this.vn(n.key, t.get(n.key));
                s && (e = e._t(n.key, s));
            }), e;
        }
        keys() {
            return this.mutations.reduce((t, e) => t.add(e.key), Pt());
        }
        isEqual(t) {
            return this.batchId === t.batchId && M$1(this.mutations, t.mutations, (t, e) => cn(t, e)) && M$1(this.baseMutations, t.baseMutations, (t, e) => cn(t, e));
        }
    }

    /** The result of applying a mutation batch to the backend. */ class ss {
        constructor(t, e, n, 
        /**
         * A pre-computed mapping from each mutated document to the resulting
         * version.
         */
        s) {
            this.batch = t, this.Cn = e, this.bn = n, this.Dn = s;
        }
        /**
         * Creates a new MutationBatchResult for the given batch and results. There
         * must be one result for each mutation in the batch. This static factory
         * caches a document=>version mapping (docVersions).
         */    static from(t, e, n) {
            v$1(t.mutations.length === n.length);
            let s = Rt;
            const i = t.mutations;
            for (let t = 0; t < i.length; t++) s = s._t(i[t].key, n[t].version);
            return new ss(t, e, n, s);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A map implementation that uses objects as keys. Objects must have an
     * associated equals function and must be immutable. Entries in the map are
     * stored together with the key being produced from the mapKeyFn. This map
     * automatically handles collisions of keys.
     */ class is {
        constructor(t, e) {
            this.Nn = t, this.xn = e, 
            /**
             * The inner map for a key -> value pair. Due to the possibility of
             * collisions we keep a list of entries that we do a linear search through
             * to find an actual match. Note that collisions should be rare, so we still
             * expect near constant time lookups in practice.
             */
            this.kn = {};
        }
        /** Get a value for this key, or undefined if it does not exist. */    get(t) {
            const e = this.Nn(t), n = this.kn[e];
            if (void 0 !== n) for (const [e, s] of n) if (this.xn(e, t)) return s;
        }
        has(t) {
            return void 0 !== this.get(t);
        }
        /** Put this key and value in the map. */    set(t, e) {
            const n = this.Nn(t), s = this.kn[n];
            if (void 0 !== s) {
                for (let n = 0; n < s.length; n++) if (this.xn(s[n][0], t)) return void (s[n] = [ t, e ]);
                s.push([ t, e ]);
            } else this.kn[n] = [ [ t, e ] ];
        }
        /**
         * Remove this key from the map. Returns a boolean if anything was deleted.
         */    delete(t) {
            const e = this.Nn(t), n = this.kn[e];
            if (void 0 === n) return !1;
            for (let s = 0; s < n.length; s++) if (this.xn(n[s][0], t)) return 1 === n.length ? delete this.kn[e] : n.splice(s, 1), 
            !0;
            return !1;
        }
        forEach(t) {
            $t(this.kn, (e, n) => {
                for (const [e, s] of n) t(e, s);
            });
        }
        $() {
            return Lt(this.kn);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * PersistencePromise<> is essentially a re-implementation of Promise<> except
     * it has a .next() method instead of .then() and .next() and .catch() callbacks
     * are executed synchronously when a PersistencePromise resolves rather than
     * asynchronously (Promise<> implementations use setImmediate() or similar).
     *
     * This is necessary to interoperate with IndexedDB which will automatically
     * commit transactions if control is returned to the event loop without
     * synchronously initiating another operation on the transaction.
     *
     * NOTE: .then() and .catch() only allow a single consumer, unlike normal
     * Promises.
     */ class rs {
        constructor(t) {
            // NOTE: next/catchCallback will always point to our own wrapper functions,
            // not the user's raw next() or catch() callbacks.
            this.On = null, this.Fn = null, 
            // When the operation resolves, we'll set result or error and mark isDone.
            this.result = void 0, this.error = void 0, this.Mn = !1, 
            // Set to true when .then() or .catch() are called and prevents additional
            // chaining.
            this.$n = !1, t(t => {
                this.Mn = !0, this.result = t, this.On && 
                // value should be defined unless T is Void, but we can't express
                // that in the type system.
                this.On(t);
            }, t => {
                this.Mn = !0, this.error = t, this.Fn && this.Fn(t);
            });
        }
        catch(t) {
            return this.next(void 0, t);
        }
        next(t, e) {
            return this.$n && b(), this.$n = !0, this.Mn ? this.error ? this.Ln(e, this.error) : this.qn(t, this.result) : new rs((n, s) => {
                this.On = e => {
                    this.qn(t, e).next(n, s);
                }, this.Fn = t => {
                    this.Ln(e, t).next(n, s);
                };
            });
        }
        Bn() {
            return new Promise((t, e) => {
                this.next(t, e);
            });
        }
        Un(t) {
            try {
                const e = t();
                return e instanceof rs ? e : rs.resolve(e);
            } catch (t) {
                return rs.reject(t);
            }
        }
        qn(t, e) {
            return t ? this.Un(() => t(e)) : rs.resolve(e);
        }
        Ln(t, e) {
            return t ? this.Un(() => t(e)) : rs.reject(e);
        }
        static resolve(t) {
            return new rs((e, n) => {
                e(t);
            });
        }
        static reject(t) {
            return new rs((e, n) => {
                n(t);
            });
        }
        static Wn(
        // Accept all Promise types in waitFor().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t) {
            return new rs((e, n) => {
                let s = 0, i = 0, r = !1;
                t.forEach(t => {
                    ++s, t.next(() => {
                        ++i, r && i === s && e();
                    }, t => n(t));
                }), r = !0, i === s && e();
            });
        }
        /**
         * Given an array of predicate functions that asynchronously evaluate to a
         * boolean, implements a short-circuiting `or` between the results. Predicates
         * will be evaluated until one of them returns `true`, then stop. The final
         * result will be whether any of them returned `true`.
         */    static Kn(t) {
            let e = rs.resolve(!1);
            for (const n of t) e = e.next(t => t ? rs.resolve(t) : n());
            return e;
        }
        static forEach(t, e) {
            const n = [];
            return t.forEach((t, s) => {
                n.push(e.call(this, t, s));
            }), this.Wn(n);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory buffer of entries to be written to a RemoteDocumentCache.
     * It can be used to batch up a set of changes to be written to the cache, but
     * additionally supports reading entries back with the `getEntry()` method,
     * falling back to the underlying RemoteDocumentCache if no entry is
     * buffered.
     *
     * Entries added to the cache *must* be read first. This is to facilitate
     * calculating the size delta of the pending changes.
     *
     * PORTING NOTE: This class was implemented then removed from other platforms.
     * If byte-counting ends up being needed on the other platforms, consider
     * porting this class as part of that implementation work.
     */ class os {
        constructor() {
            // A mapping of document key to the new cache entry that should be written (or null if any
            // existing cache entry should be removed).
            this.jn = new is(t => t.toString(), (t, e) => t.isEqual(e)), this.Qn = !1;
        }
        set readTime(t) {
            this.Gn = t;
        }
        get readTime() {
            return this.Gn;
        }
        /**
         * Buffers a `RemoteDocumentCache.addEntry()` call.
         *
         * You can only modify documents that have already been retrieved via
         * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
         */    zn(t, e) {
            this.Hn(), this.readTime = e, this.jn.set(t.key, t);
        }
        /**
         * Buffers a `RemoteDocumentCache.removeEntry()` call.
         *
         * You can only remove documents that have already been retrieved via
         * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
         */    Jn(t, e) {
            this.Hn(), e && (this.readTime = e), this.jn.set(t, null);
        }
        /**
         * Looks up an entry in the cache. The buffered changes will first be checked,
         * and if no buffered change applies, this will forward to
         * `RemoteDocumentCache.getEntry()`.
         *
         * @param transaction The transaction in which to perform any persistence
         *     operations.
         * @param documentKey The key of the entry to look up.
         * @return The cached Document or NoDocument entry, or null if we have nothing
         * cached.
         */    Yn(t, e) {
            this.Hn();
            const n = this.jn.get(e);
            return void 0 !== n ? rs.resolve(n) : this.Xn(t, e);
        }
        /**
         * Looks up several entries in the cache, forwarding to
         * `RemoteDocumentCache.getEntry()`.
         *
         * @param transaction The transaction in which to perform any persistence
         *     operations.
         * @param documentKeys The keys of the entries to look up.
         * @return A map of cached `Document`s or `NoDocument`s, indexed by key. If an
         *     entry cannot be found, the corresponding key will be mapped to a null
         *     value.
         */    getEntries(t, e) {
            return this.Zn(t, e);
        }
        /**
         * Applies buffered changes to the underlying RemoteDocumentCache, using
         * the provided transaction.
         */    apply(t) {
            return this.Hn(), this.Qn = !0, this.ts(t);
        }
        /** Helper to assert this.changes is not null  */    Hn() {}
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const hs = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";

    /**
     * A base class representing a persistence transaction, encapsulating both the
     * transaction's sequence numbers as well as a list of onCommitted listeners.
     *
     * When you call Persistence.runTransaction(), it will create a transaction and
     * pass it to your callback. You then pass it to any method that operates
     * on persistence.
     */ class as {
        constructor() {
            this.es = [];
        }
        ns(t) {
            this.es.push(t);
        }
        ss() {
            this.es.forEach(t => t());
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A readonly view of the local state of all documents we're tracking (i.e. we
     * have a cached version in remoteDocumentCache or local mutations for the
     * document). The view is computed by applying the mutations in the
     * MutationQueue to the RemoteDocumentCache.
     */ class us {
        constructor(t, e, n) {
            this.rs = t, this.os = e, this.hs = n;
        }
        /**
         * Get the local view of the document identified by `key`.
         *
         * @return Local view of the document or null if we don't have any cached
         * state for it.
         */    as(t, e) {
            return this.os.us(t, e).next(n => this.cs(t, e, n));
        }
        /** Internal version of `getDocument` that allows reusing batches. */    cs(t, e, n) {
            return this.rs.Yn(t, e).next(t => {
                for (const s of n) t = s.vn(e, t);
                return t;
            });
        }
        // Returns the view of the given `docs` as they would appear after applying
        // all mutations in the given `batches`.
        ls(t, e, n) {
            let s = Et();
            return e.forEach((t, e) => {
                for (const s of n) e = s.vn(t, e);
                s = s._t(t, e);
            }), s;
        }
        /**
         * Gets the local view of the documents identified by `keys`.
         *
         * If we don't have cached state for a document in `keys`, a NoDocument will
         * be stored for that key in the resulting set.
         */    _s(t, e) {
            return this.rs.getEntries(t, e).next(e => this.fs(t, e));
        }
        /**
         * Similar to `getDocuments`, but creates the local view from the given
         * `baseDocs` without retrieving documents from the local store.
         */    fs(t, e) {
            return this.os.ds(t, e).next(n => {
                const s = this.ls(t, e, n);
                let i = Tt();
                return s.forEach((t, e) => {
                    // TODO(http://b/32275378): Don't conflate missing / deleted.
                    e || (e = new yn(t, q$1.min())), i = i._t(t, e);
                }), i;
            });
        }
        /**
         * Performs a query against the local view of all documents.
         *
         * @param transaction The persistence transaction.
         * @param query The query to match documents against.
         * @param sinceReadTime If not set to SnapshotVersion.min(), return only
         *     documents that have been read since this snapshot version (exclusive).
         */    ws(t, e, n) {
            /**
     * Returns whether the query matches a single document by path (rather than a
     * collection).
     */
            return function(t) {
                return j.Z(t.path) && null === t.collectionGroup && 0 === t.filters.length;
            }(e) ? this.Ts(t, e.path) : Dn(e) ? this.Es(t, e, n) : this.Is(t, e, n);
        }
        Ts(t, e) {
            // Just do a simple document lookup.
            return this.as(t, new j(e)).next(t => {
                let e = At();
                return t instanceof gn && (e = e._t(t.key, t)), e;
            });
        }
        Es(t, e, n) {
            const s = e.collectionGroup;
            let i = At();
            return this.hs.As(t, s).next(r => rs.forEach(r, r => {
                const o = e.wn(r.child(s));
                return this.Is(t, o, n).next(t => {
                    t.forEach((t, e) => {
                        i = i._t(t, e);
                    });
                });
            }).next(() => i));
        }
        Is(t, e, n) {
            // Query the remote documents and overlay mutations.
            let s, i;
            return this.rs.ws(t, e, n).next(n => (s = n, this.os.Rs(t, e))).next(e => (i = e, 
            this.ms(t, i, s).next(t => {
                s = t;
                for (const t of i) for (const e of t.mutations) {
                    const n = e.key, i = s.get(n), r = an(e, i, i, t.yn);
                    s = r instanceof gn ? s._t(n, r) : s.remove(n);
                }
            }))).next(() => (
            // Finally, filter out any documents that don't actually match
            // the query.
            s.forEach((t, n) => {
                Mn(e, n) || (s = s.remove(t));
            }), s));
        }
        ms(t, e, n) {
            let s = Pt();
            for (const t of e) for (const e of t.mutations) e instanceof fn && null === n.get(e.key) && (s = s.add(e.key));
            let i = n;
            return this.rs.getEntries(t, s).next(t => (t.forEach((t, e) => {
                null !== e && e instanceof gn && (i = i._t(t, e));
            }), i));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A set of changes to what documents are currently in view and out of view for
     * a given query. These changes are sent to the LocalStore by the View (via
     * the SyncEngine) and are used to pin / unpin documents as appropriate.
     */ class cs {
        constructor(t, e, n, s) {
            this.targetId = t, this.fromCache = e, this.Ps = n, this.Vs = s;
        }
        static gs(t, e) {
            let n = Pt(), s = Pt();
            for (const t of e.docChanges) switch (t.type) {
              case 0 /* Added */ :
                n = n.add(t.doc.key);
                break;

              case 1 /* Removed */ :
                s = s.add(t.doc.key);
     // do nothing
                    }
            return new cs(t, e.fromCache, n, s);
        }
    }

    /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * `ListenSequence` is a monotonic sequence. It is initialized with a minimum value to
     * exceed. All subsequent calls to next will return increasing values. If provided with a
     * `SequenceNumberSyncer`, it will additionally bump its next value when told of a new value, as
     * well as write out sequence numbers that it produces via `next()`.
     */ class ls {
        constructor(t, e) {
            this.previousValue = t, e && (e.ys = t => this.ps(t), this.bs = t => e.vs(t));
        }
        ps(t) {
            return this.previousValue = Math.max(t, this.previousValue), this.previousValue;
        }
        next() {
            const t = ++this.previousValue;
            return this.bs && this.bs(t), t;
        }
    }

    ls.Ss = -1;

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class _s {
        constructor() {
            this.promise = new Promise((t, e) => {
                this.resolve = t, this.reject = e;
            });
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A helper for running delayed tasks following an exponential backoff curve
     * between attempts.
     *
     * Each delay is made up of a "base" delay which follows the exponential
     * backoff curve, and a +/- 50% "jitter" that is calculated and added to the
     * base delay. This prevents clients from accidentally synchronizing their
     * delays causing spikes of load to the backend.
     */
    class fs {
        constructor(
        /**
         * The AsyncQueue to run backoff operations on.
         */
        t, 
        /**
         * The ID to use when scheduling backoff operations on the AsyncQueue.
         */
        e, 
        /**
         * The initial delay (used as the base delay on the first retry attempt).
         * Note that jitter will still be applied, so the actual delay could be as
         * little as 0.5*initialDelayMs.
         */
        n = 1e3
        /**
         * The multiplier to use to determine the extended base delay after each
         * attempt.
         */ , s = 1.5
        /**
         * The maximum base delay after which no further backoff is performed.
         * Note that jitter will still be applied, so the actual delay could be as
         * much as 1.5*maxDelayMs.
         */ , i = 6e4) {
            this.Cs = t, this.Ds = e, this.Ns = n, this.xs = s, this.ks = i, this.Os = 0, this.Fs = null, 
            /** The last backoff attempt, as epoch milliseconds. */
            this.Ms = Date.now(), this.reset();
        }
        /**
         * Resets the backoff delay.
         *
         * The very next backoffAndWait() will have no delay. If it is called again
         * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
         * subsequent ones will increase according to the backoffFactor.
         */    reset() {
            this.Os = 0;
        }
        /**
         * Resets the backoff delay to the maximum delay (e.g. for use after a
         * RESOURCE_EXHAUSTED error).
         */    $s() {
            this.Os = this.ks;
        }
        /**
         * Returns a promise that resolves after currentDelayMs, and increases the
         * delay for any subsequent attempts. If there was a pending backoff operation
         * already, it will be canceled.
         */    Ls(t) {
            // Cancel any pending backoff operation.
            this.cancel();
            // First schedule using the current base (which may be 0 and should be
            // honored as such).
            const e = Math.floor(this.Os + this.qs()), n = Math.max(0, Date.now() - this.Ms), s = Math.max(0, e - n);
            // Guard against lastAttemptTime being in the future due to a clock change.
                    s > 0 && V$1("ExponentialBackoff", `Backing off for ${s} ms (base delay: ${this.Os} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`), 
            this.Fs = this.Cs.Bs(this.Ds, s, () => (this.Ms = Date.now(), t())), 
            // Apply backoff factor to determine next delay and ensure it is within
            // bounds.
            this.Os *= this.xs, this.Os < this.Ns && (this.Os = this.Ns), this.Os > this.ks && (this.Os = this.ks);
        }
        Us() {
            null !== this.Fs && (this.Fs.Ws(), this.Fs = null);
        }
        cancel() {
            null !== this.Fs && (this.Fs.cancel(), this.Fs = null);
        }
        /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */    qs() {
            return (Math.random() - .5) * this.Os;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // References to `window` are guarded by SimpleDb.isAvailable()
    /* eslint-disable no-restricted-globals */
    /**
     * Provides a wrapper around IndexedDb with a simplified interface that uses
     * Promise-like return values to chain operations. Real promises cannot be used
     * since .then() continuations are executed asynchronously (e.g. via
     * .setImmediate), which would cause IndexedDB to end the transaction.
     * See PersistencePromise for more details.
     */
    class ds {
        /*
         * Creates a new SimpleDb wrapper for IndexedDb database `name`.
         *
         * Note that `version` must not be a downgrade. IndexedDB does not support
         * downgrading the schema version. We currently do not support any way to do
         * versioning outside of IndexedDB's versioning mechanism, as only
         * version-upgrade transactions are allowed to do things like create
         * objectstores.
         */
        constructor(t, e, n) {
            this.name = t, this.version = e, this.Ks = n;
            // NOTE: According to https://bugs.webkit.org/show_bug.cgi?id=197050, the
            // bug we're checking for should exist in iOS >= 12.2 and < 13, but for
            // whatever reason it's much harder to hit after 12.2 so we only proactively
            // log on 12.2.
            12.2 === ds.js(getUA()) && g$1("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.");
        }
        /** Deletes the specified database. */    static delete(t) {
            return V$1("SimpleDb", "Removing database:", t), Rs(window.indexedDB.deleteDatabase(t)).Bn();
        }
        /** Returns true if IndexedDB is available in the current environment. */    static Qs() {
            if ("undefined" == typeof indexedDB) return !1;
            if (ds.Gs()) return !0;
            // We extensively use indexed array values and compound keys,
            // which IE and Edge do not support. However, they still have indexedDB
            // defined on the window, so we need to check for them here and make sure
            // to return that persistence is not enabled for those browsers.
            // For tracking support of this feature, see here:
            // https://developer.microsoft.com/en-us/microsoft-edge/platform/status/indexeddbarraysandmultientrysupport/
            // Check the UA string to find out the browser.
                    const t = getUA(), e = ds.js(t), n = 0 < e && e < 10, s = ds.zs(t), i = 0 < s && s < 4.5;
            // IE 10
            // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
            // IE 11
            // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
            // Edge
            // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML,
            // like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
            // iOS Safari: Disable for users running iOS version < 10.
                    return !(t.indexOf("MSIE ") > 0 || t.indexOf("Trident/") > 0 || t.indexOf("Edge/") > 0 || n || i);
        }
        /**
         * Returns true if the backing IndexedDB store is the Node IndexedDBShim
         * (see https://github.com/axemclion/IndexedDBShim).
         */    static Gs() {
            var t;
            return "undefined" != typeof process && "YES" === (null === (t = process.env) || void 0 === t ? void 0 : t.Hs);
        }
        /** Helper to get a typed SimpleDbStore from a transaction. */    static Js(t, e) {
            return t.store(e);
        }
        // visible for testing
        /** Parse User Agent to determine iOS version. Returns -1 if not found. */
        static js(t) {
            const e = t.match(/i(?:phone|pad|pod) os ([\d_]+)/i), n = e ? e[1].split("_").slice(0, 2).join(".") : "-1";
            return Number(n);
        }
        // visible for testing
        /** Parse User Agent to determine Android version. Returns -1 if not found. */
        static zs(t) {
            const e = t.match(/Android ([\d.]+)/i), n = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
            return Number(n);
        }
        /**
         * Opens the specified database, creating or upgrading it if necessary.
         */    async Ys() {
            return this.db || (V$1("SimpleDb", "Opening database:", this.name), this.db = await new Promise((t, e) => {
                // TODO(mikelehen): Investigate browser compatibility.
                // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
                // suggests IE9 and older WebKit browsers handle upgrade
                // differently. They expect setVersion, as described here:
                // https://developer.mozilla.org/en-US/docs/Web/API/IDBVersionChangeRequest/setVersion
                const n = indexedDB.open(this.name, this.version);
                n.onsuccess = e => {
                    const n = e.target.result;
                    t(n);
                }, n.onblocked = () => {
                    e(new Ts("Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."));
                }, n.onerror = t => {
                    const n = t.target.error;
                    "VersionError" === n.name ? e(new D$1(C$1.FAILED_PRECONDITION, "A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")) : e(new Ts(n));
                }, n.onupgradeneeded = t => {
                    V$1("SimpleDb", 'Database "' + this.name + '" requires upgrade from version:', t.oldVersion);
                    const e = t.target.result;
                    this.Ks.createOrUpgrade(e, n.transaction, t.oldVersion, this.version).next(() => {
                        V$1("SimpleDb", "Database upgrade to version " + this.version + " complete");
                    });
                };
            })), this.Xs && (this.db.onversionchange = t => this.Xs(t)), this.db;
        }
        Zs(t) {
            this.Xs = t, this.db && (this.db.onversionchange = e => t(e));
        }
        async runTransaction(t, e, n) {
            const s = "readonly" === t;
            let i = 0;
            for (;;) {
                ++i;
                try {
                    this.db = await this.Ys();
                    const t = Is.open(this.db, s ? "readonly" : "readwrite", e), i = n(t).catch(e => (
                    // Abort the transaction if there was an error.
                    t.abort(e), rs.reject(e))).Bn();
                    // As noted above, errors are propagated by aborting the transaction. So
                    // we swallow any error here to avoid the browser logging it as unhandled.
                    return i.catch(() => {}), 
                    // Wait for the transaction to complete (i.e. IndexedDb's onsuccess event to
                    // fire), but still return the original transactionFnResult back to the
                    // caller.
                    await t.ti, i;
                } catch (t) {
                    // TODO(schmidt-sebastian): We could probably be smarter about this and
                    // not retry exceptions that are likely unrecoverable (such as quota
                    // exceeded errors).
                    // Note: We cannot use an instanceof check for FirestoreException, since the
                    // exception is wrapped in a generic error by our async/await handling.
                    const e = "FirebaseError" !== t.name && i < 3;
                    if (V$1("SimpleDb", "Transaction failed with error: %s. Retrying: %s.", t.message, e), 
                    this.close(), !e) return Promise.reject(t);
                }
            }
        }
        close() {
            this.db && this.db.close(), this.db = void 0;
        }
    }

    /**
     * A controller for iterating over a key range or index. It allows an iterate
     * callback to delete the currently-referenced object, or jump to a new key
     * within the key range or index.
     */ class ws {
        constructor(t) {
            this.ei = t, this.ni = !1, this.si = null;
        }
        get Mn() {
            return this.ni;
        }
        get ii() {
            return this.si;
        }
        set cursor(t) {
            this.ei = t;
        }
        /**
         * This function can be called to stop iteration at any point.
         */    done() {
            this.ni = !0;
        }
        /**
         * This function can be called to skip to that next key, which could be
         * an index or a primary key.
         */    ri(t) {
            this.si = t;
        }
        /**
         * Delete the current cursor value from the object store.
         *
         * NOTE: You CANNOT do this with a keysOnly query.
         */    delete() {
            return Rs(this.ei.delete());
        }
    }

    /** An error that wraps exceptions that thrown during IndexedDB execution. */ class Ts extends D$1 {
        constructor(t) {
            super(C$1.UNAVAILABLE, "IndexedDB transaction failed: " + t), this.name = "IndexedDbTransactionError";
        }
    }

    /** Verifies whether `e` is an IndexedDbTransactionError. */ function Es(t) {
        // Use name equality, as instanceof checks on errors don't work with errors
        // that wrap other errors.
        return "IndexedDbTransactionError" === t.name;
    }

    /**
     * Wraps an IDBTransaction and exposes a store() method to get a handle to a
     * specific object store.
     */ class Is {
        constructor(t) {
            this.transaction = t, this.aborted = !1, 
            /**
             * A promise that resolves with the result of the IndexedDb transaction.
             */
            this.oi = new _s, this.transaction.oncomplete = () => {
                this.oi.resolve();
            }, this.transaction.onabort = () => {
                t.error ? this.oi.reject(new Ts(t.error)) : this.oi.resolve();
            }, this.transaction.onerror = t => {
                const e = Ps(t.target.error);
                this.oi.reject(new Ts(e));
            };
        }
        static open(t, e, n) {
            try {
                return new Is(t.transaction(n, e));
            } catch (t) {
                throw new Ts(t);
            }
        }
        get ti() {
            return this.oi.promise;
        }
        abort(t) {
            t && this.oi.reject(t), this.aborted || (V$1("SimpleDb", "Aborting transaction:", t ? t.message : "Client-initiated abort"), 
            this.aborted = !0, this.transaction.abort());
        }
        /**
         * Returns a SimpleDbStore<KeyType, ValueType> for the specified store. All
         * operations performed on the SimpleDbStore happen within the context of this
         * transaction and it cannot be used anymore once the transaction is
         * completed.
         *
         * Note that we can't actually enforce that the KeyType and ValueType are
         * correct, but they allow type safety through the rest of the consuming code.
         */    store(t) {
            const e = this.transaction.objectStore(t);
            return new As(e);
        }
    }

    /**
     * A wrapper around an IDBObjectStore providing an API that:
     *
     * 1) Has generic KeyType / ValueType parameters to provide strongly-typed
     * methods for acting against the object store.
     * 2) Deals with IndexedDB's onsuccess / onerror event callbacks, making every
     * method return a PersistencePromise instead.
     * 3) Provides a higher-level API to avoid needing to do excessive wrapping of
     * intermediate IndexedDB types (IDBCursorWithValue, etc.)
     */ class As {
        constructor(t) {
            this.store = t;
        }
        put(t, e) {
            let n;
            return void 0 !== e ? (V$1("SimpleDb", "PUT", this.store.name, t, e), n = this.store.put(e, t)) : (V$1("SimpleDb", "PUT", this.store.name, "<auto-key>", t), 
            n = this.store.put(t)), Rs(n);
        }
        /**
         * Adds a new value into an Object Store and returns the new key. Similar to
         * IndexedDb's `add()`, this method will fail on primary key collisions.
         *
         * @param value The object to write.
         * @return The key of the value to add.
         */    add(t) {
            V$1("SimpleDb", "ADD", this.store.name, t, t);
            return Rs(this.store.add(t));
        }
        /**
         * Gets the object with the specified key from the specified store, or null
         * if no object exists with the specified key.
         *
         * @key The key of the object to get.
         * @return The object with the specified key or null if no object exists.
         */    get(t) {
            // We're doing an unsafe cast to ValueType.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return Rs(this.store.get(t)).next(e => (
            // Normalize nonexistence to null.
            void 0 === e && (e = null), V$1("SimpleDb", "GET", this.store.name, t, e), e));
        }
        delete(t) {
            V$1("SimpleDb", "DELETE", this.store.name, t);
            return Rs(this.store.delete(t));
        }
        /**
         * If we ever need more of the count variants, we can add overloads. For now,
         * all we need is to count everything in a store.
         *
         * Returns the number of rows in the store.
         */    count() {
            V$1("SimpleDb", "COUNT", this.store.name);
            return Rs(this.store.count());
        }
        hi(t, e) {
            const n = this.cursor(this.options(t, e)), s = [];
            return this.ai(n, (t, e) => {
                s.push(e);
            }).next(() => s);
        }
        ui(t, e) {
            V$1("SimpleDb", "DELETE ALL", this.store.name);
            const n = this.options(t, e);
            n.ci = !1;
            const s = this.cursor(n);
            return this.ai(s, (t, e, n) => n.delete());
        }
        li(t, e) {
            let n;
            e ? n = t : (n = {}, e = t);
            const s = this.cursor(n);
            return this.ai(s, e);
        }
        /**
         * Iterates over a store, but waits for the given callback to complete for
         * each entry before iterating the next entry. This allows the callback to do
         * asynchronous work to determine if this iteration should continue.
         *
         * The provided callback should return `true` to continue iteration, and
         * `false` otherwise.
         */    _i(t) {
            const e = this.cursor({});
            return new rs((n, s) => {
                e.onerror = t => {
                    const e = Ps(t.target.error);
                    s(e);
                }, e.onsuccess = e => {
                    const s = e.target.result;
                    s ? t(s.primaryKey, s.value).next(t => {
                        t ? s.continue() : n();
                    }) : n();
                };
            });
        }
        ai(t, e) {
            const n = [];
            return new rs((s, i) => {
                t.onerror = t => {
                    i(t.target.error);
                }, t.onsuccess = t => {
                    const i = t.target.result;
                    if (!i) return void s();
                    const r = new ws(i), o = e(i.primaryKey, i.value, r);
                    if (o instanceof rs) {
                        const t = o.catch(t => (r.done(), rs.reject(t)));
                        n.push(t);
                    }
                    r.Mn ? s() : null === r.ii ? i.continue() : i.continue(r.ii);
                };
            }).next(() => rs.Wn(n));
        }
        options(t, e) {
            let n = void 0;
            return void 0 !== t && ("string" == typeof t ? n = t : e = t), {
                index: n,
                range: e
            };
        }
        cursor(t) {
            let e = "next";
            if (t.reverse && (e = "prev"), t.index) {
                const n = this.store.index(t.index);
                return t.ci ? n.openKeyCursor(t.range, e) : n.openCursor(t.range, e);
            }
            return this.store.openCursor(t.range, e);
        }
    }

    /**
     * Wraps an IDBRequest in a PersistencePromise, using the onsuccess / onerror
     * handlers to resolve / reject the PersistencePromise as appropriate.
     */ function Rs(t) {
        return new rs((e, n) => {
            t.onsuccess = t => {
                const n = t.target.result;
                e(n);
            }, t.onerror = t => {
                const e = Ps(t.target.error);
                n(e);
            };
        });
    }

    // Guard so we only report the error once.
    let ms = !1;

    function Ps(t) {
        const e = ds.js(getUA());
        if (e >= 12.2 && e < 13) {
            const e = "An internal error was encountered in the Indexed Database server";
            if (t.message.indexOf(e) >= 0) {
                // Wrap error in a more descriptive one.
                const t = new D$1("internal", `IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${e}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);
                return ms || (ms = !0, 
                // Throw a global exception outside of this promise chain, for the user to
                // potentially catch.
                setTimeout(() => {
                    throw t;
                }, 0)), t;
            }
        }
        return t;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** The Platform's 'window' implementation or null if not available. */ function Vs() {
        // `window` is not always available, e.g. in ReactNative and WebWorkers.
        // eslint-disable-next-line no-restricted-globals
        return "undefined" != typeof window ? window : null;
    }

    /** The Platform's 'document' implementation or null if not available. */
    /**
     * Represents an operation scheduled to be run in the future on an AsyncQueue.
     *
     * It is created via DelayedOperation.createAndSchedule().
     *
     * Supports cancellation (via cancel()) and early execution (via skipDelay()).
     *
     * Note: We implement `PromiseLike` instead of `Promise`, as the `Promise` type
     * in newer versions of TypeScript defines `finally`, which is not available in
     * IE.
     */
    class gs {
        constructor(t, e, n, s, i) {
            this.fi = t, this.Ds = e, this.di = n, this.op = s, this.wi = i, this.Ti = new _s, 
            this.then = this.Ti.promise.then.bind(this.Ti.promise), 
            // It's normal for the deferred promise to be canceled (due to cancellation)
            // and so we attach a dummy catch callback to avoid
            // 'UnhandledPromiseRejectionWarning' log spam.
            this.Ti.promise.catch(t => {});
        }
        /**
         * Creates and returns a DelayedOperation that has been scheduled to be
         * executed on the provided asyncQueue after the provided delayMs.
         *
         * @param asyncQueue The queue to schedule the operation on.
         * @param id A Timer ID identifying the type of operation this is.
         * @param delayMs The delay (ms) before the operation should be scheduled.
         * @param op The operation to run.
         * @param removalCallback A callback to be called synchronously once the
         *   operation is executed or canceled, notifying the AsyncQueue to remove it
         *   from its delayedOperations list.
         *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
         *   the DelayedOperation class public.
         */    static Ei(t, e, n, s, i) {
            const r = Date.now() + n, o = new gs(t, e, r, s, i);
            return o.start(n), o;
        }
        /**
         * Starts the timer. This is called immediately after construction by
         * createAndSchedule().
         */    start(t) {
            this.Ii = setTimeout(() => this.Ai(), t);
        }
        /**
         * Queues the operation to run immediately (if it hasn't already been run or
         * canceled).
         */    Ws() {
            return this.Ai();
        }
        /**
         * Cancels the operation if it hasn't already been executed or canceled. The
         * promise will be rejected.
         *
         * As long as the operation has not yet been run, calling cancel() provides a
         * guarantee that the operation will not be run.
         */    cancel(t) {
            null !== this.Ii && (this.clearTimeout(), this.Ti.reject(new D$1(C$1.CANCELLED, "Operation cancelled" + (t ? ": " + t : ""))));
        }
        Ai() {
            this.fi.Ri(() => null !== this.Ii ? (this.clearTimeout(), this.op().then(t => this.Ti.resolve(t))) : Promise.resolve());
        }
        clearTimeout() {
            null !== this.Ii && (this.wi(this), clearTimeout(this.Ii), this.Ii = null);
        }
    }

    class ys {
        constructor() {
            // The last promise in the queue.
            this.mi = Promise.resolve(), 
            // A list of retryable operations. Retryable operations are run in order and
            // retried with backoff.
            this.Pi = [], 
            // Is this AsyncQueue being shut down? Once it is set to true, it will not
            // be changed again.
            this.Vi = !1, 
            // Operations scheduled to be queued in the future. Operations are
            // automatically removed after they are run or canceled.
            this.gi = [], 
            // visible for testing
            this.yi = null, 
            // Flag set while there's an outstanding AsyncQueue operation, used for
            // assertion sanity-checks.
            this.pi = !1, 
            // List of TimerIds to fast-forward delays for.
            this.bi = [], 
            // Backoff timer used to schedule retries for retryable operations
            this.vi = new fs(this, "async_queue_retry" /* AsyncQueueRetry */), 
            // Visibility handler that triggers an immediate retry of all retryable
            // operations. Meant to speed up recovery when we regain file system access
            // after page comes into foreground.
            this.Si = () => this.vi.Us();
            const t = Vs();
            t && "function" == typeof t.addEventListener && t.addEventListener("visibilitychange", this.Si);
        }
        // Is this AsyncQueue being shut down? If true, this instance will not enqueue
        // any new operations, Promises from enqueue requests will not resolve.
        get Ci() {
            return this.Vi;
        }
        /**
         * Adds a new operation to the queue without waiting for it to complete (i.e.
         * we ignore the Promise result).
         */    Ri(t) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.enqueue(t);
        }
        /**
         * Regardless if the queue has initialized shutdown, adds a new operation to the
         * queue without waiting for it to complete (i.e. we ignore the Promise result).
         */    Di(t) {
            this.Ni(), 
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.xi(t);
        }
        /**
         * Regardless if the queue has initialized shutdown, adds a new operation to the
         * queue.
         */    ki(t) {
            return this.Ni(), this.xi(t);
        }
        /**
         * Adds a new operation to the queue and initialize the shut down of this queue.
         * Returns a promise that will be resolved when the promise returned by the new
         * operation is (with its value).
         * Once this method is called, the only possible way to request running an operation
         * is through `enqueueAndForgetEvenAfterShutdown`.
         */    async Oi(t) {
            if (this.Ni(), !this.Vi) {
                this.Vi = !0;
                const e = Vs();
                e && e.removeEventListener("visibilitychange", this.Si), await this.ki(t);
            }
        }
        /**
         * Adds a new operation to the queue. Returns a promise that will be resolved
         * when the promise returned by the new operation is (with its value).
         */    enqueue(t) {
            return this.Ni(), this.Vi ? new Promise(t => {}) : this.xi(t);
        }
        /**
         * Enqueue a retryable operation.
         *
         * A retryable operation is rescheduled with backoff if it fails with a
         * IndexedDbTransactionError (the error type used by SimpleDb). All
         * retryable operations are executed in order and only run if all prior
         * operations were retried successfully.
         */    Fi(t) {
            this.Pi.push(t), this.Ri(() => this.Mi());
        }
        /**
         * Runs the next operation from the retryable queue. If the operation fails,
         * reschedules with backoff.
         */    async Mi() {
            if (0 !== this.Pi.length) {
                try {
                    await this.Pi[0](), this.Pi.shift(), this.vi.reset();
                } catch (t) {
                    if (!Es(t)) throw t;
     // Failure will be handled by AsyncQueue
                                    V$1("AsyncQueue", "Operation failed with retryable error: " + t);
                }
                this.Pi.length > 0 && 
                // If there are additional operations, we re-schedule `retryNextOp()`.
                // This is necessary to run retryable operations that failed during
                // their initial attempt since we don't know whether they are already
                // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
                // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
                // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
                // call scheduled here.
                // Since `backoffAndRun()` cancels an existing backoff and schedules a
                // new backoff on every call, there is only ever a single additional
                // operation in the queue.
                this.vi.Ls(() => this.Mi());
            }
        }
        xi(t) {
            const e = this.mi.then(() => (this.pi = !0, t().catch(t => {
                this.yi = t, this.pi = !1;
                // Re-throw the error so that this.tail becomes a rejected Promise and
                // all further attempts to chain (via .then) will just short-circuit
                // and return the rejected Promise.
                throw g$1("INTERNAL UNHANDLED ERROR: ", 
                /**
     * Chrome includes Error.message in Error.stack. Other browsers do not.
     * This returns expected output of message + stack when available.
     * @param error Error or FirestoreError
     */
                function(t) {
                    let e = t.message || "";
                    t.stack && (e = t.stack.includes(t.message) ? t.stack : t.message + "\n" + t.stack);
                    return e;
                }
                /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (t)), t;
            }).then(t => (this.pi = !1, t))));
            return this.mi = e, e;
        }
        /**
         * Schedules an operation to be queued on the AsyncQueue once the specified
         * `delayMs` has elapsed. The returned DelayedOperation can be used to cancel
         * or fast-forward the operation prior to its running.
         */    Bs(t, e, n) {
            this.Ni(), 
            // Fast-forward delays for timerIds that have been overriden.
            this.bi.indexOf(t) > -1 && (e = 0);
            const s = gs.Ei(this, t, e, n, t => this.$i(t));
            return this.gi.push(s), s;
        }
        Ni() {
            this.yi && b();
        }
        /**
         * Verifies there's an operation currently in-progress on the AsyncQueue.
         * Unfortunately we can't verify that the running code is in the promise chain
         * of that operation, so this isn't a foolproof check, but it should be enough
         * to catch some bugs.
         */    Li() {}
        /**
         * Waits until all currently queued tasks are finished executing. Delayed
         * operations are not run.
         */    async qi() {
            // Operations in the queue prior to draining may have enqueued additional
            // operations. Keep draining the queue until the tail is no longer advanced,
            // which indicates that no more new operations were enqueued and that all
            // operations were executed.
            let t;
            do {
                t = this.mi, await t;
            } while (t !== this.mi);
        }
        /**
         * For Tests: Determine if a delayed operation with a particular TimerId
         * exists.
         */    Bi(t) {
            for (const e of this.gi) if (e.Ds === t) return !0;
            return !1;
        }
        /**
         * For Tests: Runs some or all delayed operations early.
         *
         * @param lastTimerId Delayed operations up to and including this TimerId will
         *  be drained. Pass TimerId.All to run all delayed operations.
         * @returns a Promise that resolves once all operations have been run.
         */    Ui(t) {
            // Note that draining may generate more delayed ops, so we do that first.
            return this.qi().then(() => {
                // Run ops in the same order they'd run if they ran naturally.
                this.gi.sort((t, e) => t.di - e.di);
                for (const e of this.gi) if (e.Ws(), "all" /* All */ !== t && e.Ds === t) break;
                return this.qi();
            });
        }
        /**
         * For Tests: Skip all subsequent delays for a timer id.
         */    Wi(t) {
            this.bi.push(t);
        }
        /** Called once a DelayedOperation is run or canceled. */    $i(t) {
            // NOTE: indexOf / slice are O(n), but delayedOperations is expected to be small.
            const e = this.gi.indexOf(t);
            this.gi.splice(e, 1);
        }
    }

    /**
     * Returns a FirestoreError that can be surfaced to the user if the provided
     * error is an IndexedDbTransactionError. Re-throws the error otherwise.
     */ function ps(t, e) {
        if (g$1("AsyncQueue", `${e}: ${t}`), Es(t)) return new D$1(C$1.UNAVAILABLE, `${e}: ${t}`);
        throw t;
    }

    function bs([t, e], [n, s]) {
        const i = F$1(t, n);
        return 0 === i ? F$1(e, s) : i;
    }

    /**
     * Used to calculate the nth sequence number. Keeps a rolling buffer of the
     * lowest n values passed to `addElement`, and finally reports the largest of
     * them in `maxValue`.
     */ class vs {
        constructor(t) {
            this.Ki = t, this.buffer = new ft(bs), this.ji = 0;
        }
        Qi() {
            return ++this.ji;
        }
        Gi(t) {
            const e = [ t, this.Qi() ];
            if (this.buffer.size < this.Ki) this.buffer = this.buffer.add(e); else {
                const t = this.buffer.last();
                bs(e, t) < 0 && (this.buffer = this.buffer.delete(t).add(e));
            }
        }
        get maxValue() {
            // Guaranteed to be non-empty. If we decide we are not collecting any
            // sequence numbers, nthSequenceNumber below short-circuits. If we have
            // decided that we are collecting n sequence numbers, it's because n is some
            // percentage of the existing sequence numbers. That means we should never
            // be in a situation where we are collecting sequence numbers but don't
            // actually have any.
            return this.buffer.last()[0];
        }
    }

    const Ss = {
        zi: !1,
        Hi: 0,
        Ji: 0,
        Yi: 0
    };

    class Cs {
        constructor(
        // When we attempt to collect, we will only do so if the cache size is greater than this
        // threshold. Passing `COLLECTION_DISABLED` here will cause collection to always be skipped.
        t, 
        // The percentage of sequence numbers that we will attempt to collect
        e, 
        // A cap on the total number of sequence numbers that will be collected. This prevents
        // us from collecting a huge number of sequence numbers if the cache has grown very large.
        n) {
            this.Xi = t, this.Zi = e, this.tr = n;
        }
        static er(t) {
            return new Cs(t, Cs.nr, Cs.sr);
        }
    }

    Cs.ir = -1, Cs.rr = 1048576, Cs.or = 41943040, Cs.nr = 10, Cs.sr = 1e3, Cs.hr = new Cs(Cs.or, Cs.nr, Cs.sr), 
    Cs.ar = new Cs(Cs.ir, 0, 0);

    /**
     * This class is responsible for the scheduling of LRU garbage collection. It handles checking
     * whether or not GC is enabled, as well as which delay to use before the next run.
     */
    class Ds {
        constructor(t, e) {
            this.ur = t, this.fi = e, this.cr = !1, this.lr = null;
        }
        start(t) {
            this.ur.params.Xi !== Cs.ir && this._r(t);
        }
        stop() {
            this.lr && (this.lr.cancel(), this.lr = null);
        }
        get dr() {
            return null !== this.lr;
        }
        _r(t) {
            const e = this.cr ? 3e5 : 6e4;
            V$1("LruGarbageCollector", `Garbage collection scheduled in ${e}ms`), this.lr = this.fi.Bs("lru_garbage_collection" /* LruGarbageCollection */ , e, async () => {
                this.lr = null, this.cr = !0;
                try {
                    await t.wr(this.ur);
                } catch (t) {
                    Es(t) ? V$1("LruGarbageCollector", "Ignoring IndexedDB error during garbage collection: ", t) : await Bi(t);
                }
                await this._r(t);
            });
        }
    }

    /** Implements the steps for LRU garbage collection. */ class Ns {
        constructor(t, e) {
            this.Tr = t, this.params = e;
        }
        /** Given a percentile of target to collect, returns the number of targets to collect. */    Er(t, e) {
            return this.Tr.Ir(t).next(t => Math.floor(e / 100 * t));
        }
        /** Returns the nth sequence number, counting in order from the smallest. */    Ar(t, e) {
            if (0 === e) return rs.resolve(ls.Ss);
            const n = new vs(e);
            return this.Tr.Fe(t, t => n.Gi(t.sequenceNumber)).next(() => this.Tr.Rr(t, t => n.Gi(t))).next(() => n.maxValue);
        }
        /**
         * Removes targets with a sequence number equal to or less than the given upper bound, and removes
         * document associations with those targets.
         */    mr(t, e, n) {
            return this.Tr.mr(t, e, n);
        }
        /**
         * Removes documents that have a sequence number equal to or less than the upper bound and are not
         * otherwise pinned.
         */    Pr(t, e) {
            return this.Tr.Pr(t, e);
        }
        Vr(t, e) {
            return this.params.Xi === Cs.ir ? (V$1("LruGarbageCollector", "Garbage collection skipped; disabled"), 
            rs.resolve(Ss)) : this.gr(t).next(n => n < this.params.Xi ? (V$1("LruGarbageCollector", `Garbage collection skipped; Cache size ${n} is lower than threshold ` + this.params.Xi), 
            Ss) : this.yr(t, e));
        }
        gr(t) {
            return this.Tr.gr(t);
        }
        yr(t, e) {
            let n, s, i, r, h, a, u;
            const c = Date.now();
            return this.Er(t, this.params.Zi).next(e => (
            // Cap at the configured max
            e > this.params.tr ? (V$1("LruGarbageCollector", `Capping sequence numbers to collect down to the maximum of ${this.params.tr} from ` + e), 
            s = this.params.tr) : s = e, r = Date.now(), this.Ar(t, s))).next(s => (n = s, h = Date.now(), 
            this.mr(t, n, e))).next(e => (i = e, a = Date.now(), this.Pr(t, n))).next(t => {
                if (u = Date.now(), m() <= LogLevel.DEBUG) {
                    V$1("LruGarbageCollector", `LRU Garbage Collection\n\tCounted targets in ${r - c}ms\n\tDetermined least recently used ${s} in ` + (h - r) + "ms\n" + `\tRemoved ${i} targets in ` + (a - h) + "ms\n" + `\tRemoved ${t} documents in ` + (u - a) + "ms\n" + `Total Duration: ${u - c}ms`);
                }
                return rs.resolve({
                    zi: !0,
                    Hi: s,
                    Ji: i,
                    Yi: t
                });
            });
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Encodes a resource path into a IndexedDb-compatible string form.
     */
    function xs(t) {
        let e = "";
        for (let n = 0; n < t.length; n++) e.length > 0 && (e = Os(e)), e = ks(t.get(n), e);
        return Os(e);
    }

    /** Encodes a single segment of a resource path into the given result */ function ks(t, e) {
        let n = e;
        const s = t.length;
        for (let e = 0; e < s; e++) {
            const s = t.charAt(e);
            switch (s) {
              case "\0":
                n += "";
                break;

              case "":
                n += "";
                break;

              default:
                n += s;
            }
        }
        return n;
    }

    /** Encodes a path separator into the given result */ function Os(t) {
        return t + "";
    }

    /**
     * Decodes the given IndexedDb-compatible string form of a resource path into
     * a ResourcePath instance. Note that this method is not suitable for use with
     * decoding resource names from the server; those are One Platform format
     * strings.
     */ function Fs(t) {
        // Event the empty path must encode as a path of at least length 2. A path
        // with exactly 2 must be the empty path.
        const e = t.length;
        if (v$1(e >= 2), 2 === e) return v$1("" === t.charAt(0) && "" === t.charAt(1)), U$1.K();
        // Escape characters cannot exist past the second-to-last position in the
        // source value.
            const n = e - 2, s = [];
        let i = "";
        for (let r = 0; r < e; ) {
            // The last two characters of a valid encoded path must be a separator, so
            // there must be an end to this segment.
            const e = t.indexOf("", r);
            (e < 0 || e > n) && b();
            switch (t.charAt(e + 1)) {
              case "":
                const n = t.substring(r, e);
                let o;
                0 === i.length ? 
                // Avoid copying for the common case of a segment that excludes \0
                // and \001
                o = n : (i += n, o = i, i = ""), s.push(o);
                break;

              case "":
                i += t.substring(r, e), i += "\0";
                break;

              case "":
                // The escape character can be used in the output to encode itself.
                i += t.substring(r, e + 1);
                break;

              default:
                b();
            }
            r = e + 2;
        }
        return new U$1(s);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Serializer for values stored in the LocalStore. */ class Ms {
        constructor(t) {
            this.pr = t;
        }
    }

    /** Decodes a remote document from storage locally to a Document. */ function $s(t, e) {
        if (e.document) return function(t, e, n) {
            const s = Ie(t, e.name), i = de(e.updateTime), r = new Rn({
                mapValue: {
                    fields: e.fields
                }
            });
            return new gn(s, i, r, {
                hasCommittedMutations: !!n
            });
        }(t.pr, e.document, !!e.hasCommittedMutations);
        if (e.noDocument) {
            const t = j.tt(e.noDocument.path), n = Ws(e.noDocument.readTime);
            return new yn(t, n, {
                hasCommittedMutations: !!e.hasCommittedMutations
            });
        }
        if (e.unknownDocument) {
            const t = j.tt(e.unknownDocument.path), n = Ws(e.unknownDocument.version);
            return new pn(t, n);
        }
        return b();
    }

    /** Encodes a document for storage locally. */ function Ls(t, e, n) {
        const s = qs(n), i = e.key.path.O().B();
        if (e instanceof gn) {
            const n = function(t, e) {
                return {
                    name: Ee(t, e.key),
                    fields: e.cn().mapValue.fields,
                    updateTime: le(t, e.version.S())
                };
            }(t.pr, e), r = e.hasCommittedMutations;
            return new di(
            /* unknownDocument= */ null, 
            /* noDocument= */ null, n, r, s, i);
        }
        if (e instanceof yn) {
            const t = e.key.path.B(), n = Us(e.version), r = e.hasCommittedMutations;
            return new di(
            /* unknownDocument= */ null, new _i(t, n), 
            /* document= */ null, r, s, i);
        }
        if (e instanceof pn) {
            const t = e.key.path.B(), n = Us(e.version);
            return new di(new fi(t, n), 
            /* noDocument= */ null, 
            /* document= */ null, 
            /* hasCommittedMutations= */ !0, s, i);
        }
        return b();
    }

    function qs(t) {
        const e = t.S();
        return [ e.seconds, e.nanoseconds ];
    }

    function Bs(t) {
        const e = new L$1(t[0], t[1]);
        return q$1.g(e);
    }

    function Us(t) {
        const e = t.S();
        return new hi(e.seconds, e.nanoseconds);
    }

    function Ws(t) {
        const e = new L$1(t.seconds, t.nanoseconds);
        return q$1.g(e);
    }

    /** Encodes a batch of mutations into a DbMutationBatch for local storage. */
    /** Decodes a DbMutationBatch into a MutationBatch */
    function Ks(t, e) {
        const n = (e.baseMutations || []).map(e => be(t.pr, e)), s = e.mutations.map(e => be(t.pr, e)), i = L$1.fromMillis(e.localWriteTimeMs);
        return new ns(e.batchId, i, n, s);
    }

    /** Decodes a DbTarget into TargetData */ function js(t) {
        const e = Ws(t.readTime), n = void 0 !== t.lastLimboFreeSnapshotVersion ? Ws(t.lastLimboFreeSnapshotVersion) : q$1.min();
        let s;
        var i;
        return void 0 !== t.query.documents ? (v$1(1 === (i = t.query).documents.length), 
        s = xn(Cn(Re(i.documents[0])))) : s = De(t.query), new it(s, t.targetId, 0 /* Listen */ , t.lastListenSequenceNumber, e, n, st.fromBase64String(t.resumeToken));
    }

    /** Encodes TargetData into a DbTarget for storage locally. */ function Qs(t, e) {
        const n = Us(e.at), s = Us(e.lastLimboFreeSnapshotVersion);
        let i;
        i = nt(e.target) ? Se(t.pr, e.target) : Ce(t.pr, e.target);
        // We can't store the resumeToken as a ByteString in IndexedDb, so we
        // convert it to a base64 string for storage.
            const r = e.resumeToken.toBase64();
        // lastListenSequenceNumber is always 0 until we do real GC.
            return new Ti(e.targetId, Z$1(e.target), n, r, e.sequenceNumber, s, i);
    }

    /**
     * A helper function for figuring out what kind of query has been stored.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** A mutation queue for a specific user, backed by IndexedDB. */
    class Gs {
        constructor(
        /**
         * The normalized userId (e.g. null UID => "" userId) used to store /
         * retrieve mutations.
         */
        t, e, n, s) {
            this.userId = t, this.serializer = e, this.hs = n, this.br = s, 
            /**
             * Caches the document keys for pending mutation batches. If the mutation
             * has been removed from IndexedDb, the cached value may continue to
             * be used to retrieve the batch's document keys. To remove a cached value
             * locally, `removeCachedMutationKeys()` should be invoked either directly
             * or through `removeMutationBatches()`.
             *
             * With multi-tab, when the primary client acknowledges or rejects a mutation,
             * this cache is used by secondary clients to invalidate the local
             * view of the documents that were previously affected by the mutation.
             */
            // PORTING NOTE: Multi-tab only.
            this.vr = {};
        }
        /**
         * Creates a new mutation queue for the given user.
         * @param user The user for which to create a mutation queue.
         * @param serializer The serializer to use when persisting to IndexedDb.
         */    static Sr(t, e, n, s) {
            // TODO(mcg): Figure out what constraints there are on userIDs
            // In particular, are there any reserved characters? are empty ids allowed?
            // For the moment store these together in the same mutations table assuming
            // that empty userIDs aren't allowed.
            v$1("" !== t.uid);
            const i = t.t() ? t.uid : "";
            return new Gs(i, e, n, s);
        }
        Cr(t) {
            let e = !0;
            const n = IDBKeyRange.bound([ this.userId, Number.NEGATIVE_INFINITY ], [ this.userId, Number.POSITIVE_INFINITY ]);
            return Js(t).li({
                index: ci.userMutationsIndex,
                range: n
            }, (t, n, s) => {
                e = !1, s.done();
            }).next(() => e);
        }
        Dr(t, e, n, s) {
            const i = Ys(t), r = Js(t);
            // The IndexedDb implementation in Chrome (and Firefox) does not handle
            // compound indices that include auto-generated keys correctly. To ensure
            // that the index entry is added correctly in all browsers, we perform two
            // writes: The first write is used to retrieve the next auto-generated Batch
            // ID, and the second write populates the index and stores the actual
            // mutation batch.
            // See: https://bugs.chromium.org/p/chromium/issues/detail?id=701972
            // We write an empty object to obtain key
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return r.add({}).next(o => {
                v$1("number" == typeof o);
                const h = new ns(o, e, n, s), a = function(t, e, n) {
                    const s = n.baseMutations.map(e => pe(t.pr, e)), i = n.mutations.map(e => pe(t.pr, e));
                    return new ci(e, n.batchId, n.yn.toMillis(), s, i);
                }(this.serializer, this.userId, h), u = [];
                let c = new ft((t, e) => F$1(t.U(), e.U()));
                for (const t of s) {
                    const e = li.key(this.userId, t.key.path, o);
                    c = c.add(t.key.path.O()), u.push(r.put(a)), u.push(i.put(e, li.PLACEHOLDER));
                }
                return c.forEach(e => {
                    u.push(this.hs.Nr(t, e));
                }), t.ns(() => {
                    this.vr[o] = h.keys();
                }), rs.Wn(u).next(() => h);
            });
        }
        xr(t, e) {
            return Js(t).get(e).next(t => t ? (v$1(t.userId === this.userId), Ks(this.serializer, t)) : null);
        }
        /**
         * Returns the document keys for the mutation batch with the given batchId.
         * For primary clients, this method returns `null` after
         * `removeMutationBatches()` has been called. Secondary clients return a
         * cached result until `removeCachedMutationKeys()` is invoked.
         */
        // PORTING NOTE: Multi-tab only.
        kr(t, e) {
            return this.vr[e] ? rs.resolve(this.vr[e]) : this.xr(t, e).next(t => {
                if (t) {
                    const n = t.keys();
                    return this.vr[e] = n, n;
                }
                return null;
            });
        }
        Or(t, e) {
            const n = e + 1, s = IDBKeyRange.lowerBound([ this.userId, n ]);
            let i = null;
            return Js(t).li({
                index: ci.userMutationsIndex,
                range: s
            }, (t, e, s) => {
                e.userId === this.userId && (v$1(e.batchId >= n), i = Ks(this.serializer, e)), s.done();
            }).next(() => i);
        }
        Fr(t) {
            const e = IDBKeyRange.upperBound([ this.userId, Number.POSITIVE_INFINITY ]);
            let n = -1;
            return Js(t).li({
                index: ci.userMutationsIndex,
                range: e,
                reverse: !0
            }, (t, e, s) => {
                n = e.batchId, s.done();
            }).next(() => n);
        }
        Mr(t) {
            const e = IDBKeyRange.bound([ this.userId, -1 ], [ this.userId, Number.POSITIVE_INFINITY ]);
            return Js(t).hi(ci.userMutationsIndex, e).next(t => t.map(t => Ks(this.serializer, t)));
        }
        us(t, e) {
            // Scan the document-mutation index starting with a prefix starting with
            // the given documentKey.
            const n = li.prefixForPath(this.userId, e.path), s = IDBKeyRange.lowerBound(n), i = [];
            return Ys(t).li({
                range: s
            }, (n, s, r) => {
                const [o, h, a] = n, u = Fs(h);
                // Only consider rows matching exactly the specific key of
                // interest. Note that because we order by path first, and we
                // order terminators before path separators, we'll encounter all
                // the index rows for documentKey contiguously. In particular, all
                // the rows for documentKey will occur before any rows for
                // documents nested in a subcollection beneath documentKey so we
                // can stop as soon as we hit any such row.
                            if (o === this.userId && e.path.isEqual(u)) 
                // Look up the mutation batch in the store.
                return Js(t).get(a).next(t => {
                    if (!t) throw b();
                    v$1(t.userId === this.userId), i.push(Ks(this.serializer, t));
                });
                r.done();
            }).next(() => i);
        }
        ds(t, e) {
            let n = new ft(F$1);
            const s = [];
            return e.forEach(e => {
                const i = li.prefixForPath(this.userId, e.path), r = IDBKeyRange.lowerBound(i), o = Ys(t).li({
                    range: r
                }, (t, s, i) => {
                    const [r, o, h] = t, a = Fs(o);
                    // Only consider rows matching exactly the specific key of
                    // interest. Note that because we order by path first, and we
                    // order terminators before path separators, we'll encounter all
                    // the index rows for documentKey contiguously. In particular, all
                    // the rows for documentKey will occur before any rows for
                    // documents nested in a subcollection beneath documentKey so we
                    // can stop as soon as we hit any such row.
                                    r === this.userId && e.path.isEqual(a) ? n = n.add(h) : i.done();
                });
                s.push(o);
            }), rs.Wn(s).next(() => this.$r(t, n));
        }
        Rs(t, e) {
            const n = e.path, s = n.length + 1, i = li.prefixForPath(this.userId, n), r = IDBKeyRange.lowerBound(i);
            // Collect up unique batchIDs encountered during a scan of the index. Use a
            // SortedSet to accumulate batch IDs so they can be traversed in order in a
            // scan of the main table.
            let o = new ft(F$1);
            return Ys(t).li({
                range: r
            }, (t, e, i) => {
                const [r, h, a] = t, u = Fs(h);
                r === this.userId && n.L(u) ? 
                // Rows with document keys more than one segment longer than the
                // query path can't be matches. For example, a query on 'rooms'
                // can't match the document /rooms/abc/messages/xyx.
                // TODO(mcg): we'll need a different scanner when we implement
                // ancestor queries.
                u.length === s && (o = o.add(a)) : i.done();
            }).next(() => this.$r(t, o));
        }
        $r(t, e) {
            const n = [], s = [];
            // TODO(rockwood): Implement this using iterate.
            return e.forEach(e => {
                s.push(Js(t).get(e).next(t => {
                    if (null === t) throw b();
                    v$1(t.userId === this.userId), n.push(Ks(this.serializer, t));
                }));
            }), rs.Wn(s).next(() => n);
        }
        Lr(t, e) {
            return Hs(t.qr, this.userId, e).next(n => (t.ns(() => {
                this.Br(e.batchId);
            }), rs.forEach(n, e => this.br.Ur(t, e))));
        }
        /**
         * Clears the cached keys for a mutation batch. This method should be
         * called by secondary clients after they process mutation updates.
         *
         * Note that this method does not have to be called from primary clients as
         * the corresponding cache entries are cleared when an acknowledged or
         * rejected batch is removed from the mutation queue.
         */
        // PORTING NOTE: Multi-tab only
        Br(t) {
            delete this.vr[t];
        }
        Wr(t) {
            return this.Cr(t).next(e => {
                if (!e) return rs.resolve();
                // Verify that there are no entries in the documentMutations index if
                // the queue is empty.
                            const n = IDBKeyRange.lowerBound(li.prefixForUser(this.userId)), s = [];
                return Ys(t).li({
                    range: n
                }, (t, e, n) => {
                    if (t[0] === this.userId) {
                        const e = Fs(t[1]);
                        s.push(e);
                    } else n.done();
                }).next(() => {
                    v$1(0 === s.length);
                });
            });
        }
        Kr(t, e) {
            return zs(t, this.userId, e);
        }
        // PORTING NOTE: Multi-tab only (state is held in memory in other clients).
        /** Returns the mutation queue's metadata from IndexedDb. */
        jr(t) {
            return Xs(t).get(this.userId).next(t => t || new ui(this.userId, -1, 
            /*lastStreamToken=*/ ""));
        }
    }

    /**
     * @return true if the mutation queue for the given user contains a pending
     *         mutation for the given key.
     */ function zs(t, e, n) {
        const s = li.prefixForPath(e, n.path), i = s[1], r = IDBKeyRange.lowerBound(s);
        let o = !1;
        return Ys(t).li({
            range: r,
            ci: !0
        }, (t, n, s) => {
            const [r, h, /*batchID*/ a] = t;
            r === e && h === i && (o = !0), s.done();
        }).next(() => o);
    }

    /** Returns true if any mutation queue contains the given document. */
    /**
     * Delete a mutation batch and the associated document mutations.
     * @return A PersistencePromise of the document mutations that were removed.
     */
    function Hs(t, e, n) {
        const s = t.store(ci.store), i = t.store(li.store), r = [], o = IDBKeyRange.only(n.batchId);
        let h = 0;
        const a = s.li({
            range: o
        }, (t, e, n) => (h++, n.delete()));
        r.push(a.next(() => {
            v$1(1 === h);
        }));
        const u = [];
        for (const t of n.mutations) {
            const s = li.key(e, t.key.path, n.batchId);
            r.push(i.delete(s)), u.push(t.key);
        }
        return rs.Wn(r).next(() => u);
    }

    /**
     * Helper to get a typed SimpleDbStore for the mutations object store.
     */ function Js(t) {
        return Ni.Js(t, ci.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the mutationQueues object store.
     */ function Ys(t) {
        return Ni.Js(t, li.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the mutationQueues object store.
     */ function Xs(t) {
        return Ni.Js(t, ui.store);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Zs {
        /**
         * @param {LocalSerializer} serializer The document serializer.
         * @param {IndexManager} indexManager The query indexes that need to be maintained.
         */
        constructor(t, e) {
            this.serializer = t, this.hs = e;
        }
        /**
         * Adds the supplied entries to the cache.
         *
         * All calls of `addEntry` are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()` to ensure proper accounting of metadata.
         */    zn(t, e, n) {
            return ei(t).put(ni(e), n);
        }
        /**
         * Removes a document from the cache.
         *
         * All calls of `removeEntry`  are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()` to ensure proper accounting of metadata.
         */    Jn(t, e) {
            const n = ei(t), s = ni(e);
            return n.delete(s);
        }
        /**
         * Updates the current cache size.
         *
         * Callers to `addEntry()` and `removeEntry()` *must* call this afterwards to update the
         * cache's metadata.
         */    updateMetadata(t, e) {
            return this.getMetadata(t).next(n => (n.byteSize += e, this.Qr(t, n)));
        }
        Yn(t, e) {
            return ei(t).get(ni(e)).next(t => this.Gr(t));
        }
        /**
         * Looks up an entry in the cache.
         *
         * @param documentKey The key of the entry to look up.
         * @return The cached MaybeDocument entry and its size, or null if we have nothing cached.
         */    zr(t, e) {
            return ei(t).get(ni(e)).next(t => {
                const e = this.Gr(t);
                return e ? {
                    Hr: e,
                    size: si(t)
                } : null;
            });
        }
        getEntries(t, e) {
            let n = Et();
            return this.Jr(t, e, (t, e) => {
                const s = this.Gr(e);
                n = n._t(t, s);
            }).next(() => n);
        }
        /**
         * Looks up several entries in the cache.
         *
         * @param documentKeys The set of keys entries to look up.
         * @return A map of MaybeDocuments indexed by key (if a document cannot be
         *     found, the key will be mapped to null) and a map of sizes indexed by
         *     key (zero if the key cannot be found).
         */    Yr(t, e) {
            let n = Et(), s = new ct(j.D);
            return this.Jr(t, e, (t, e) => {
                const i = this.Gr(e);
                i ? (n = n._t(t, i), s = s._t(t, si(e))) : (n = n._t(t, null), s = s._t(t, 0));
            }).next(() => ({
                Xr: n,
                Zr: s
            }));
        }
        Jr(t, e, n) {
            if (e.$()) return rs.resolve();
            const s = IDBKeyRange.bound(e.first().path.B(), e.last().path.B()), i = e.It();
            let r = i.yt();
            return ei(t).li({
                range: s
            }, (t, e, s) => {
                const o = j.tt(t);
                // Go through keys not found in cache.
                            for (;r && j.D(r, o) < 0; ) n(r, null), r = i.yt();
                r && r.isEqual(o) && (
                // Key found in cache.
                n(r, e), r = i.pt() ? i.yt() : null), 
                // Skip to the next key (if there is one).
                r ? s.ri(r.path.B()) : s.done();
            }).next(() => {
                // The rest of the keys are not in the cache. One case where `iterate`
                // above won't go through them is when the cache is empty.
                for (;r; ) n(r, null), r = i.pt() ? i.yt() : null;
            });
        }
        ws(t, e, n) {
            let s = At();
            const i = e.path.length + 1, r = {};
            if (n.isEqual(q$1.min())) {
                // Documents are ordered by key, so we can use a prefix scan to narrow
                // down the documents we need to match the query against.
                const t = e.path.B();
                r.range = IDBKeyRange.lowerBound(t);
            } else {
                // Execute an index-free query and filter by read time. This is safe
                // since all document changes to queries that have a
                // lastLimboFreeSnapshotVersion (`sinceReadTime`) have a read time set.
                const t = e.path.B(), s = qs(n);
                r.range = IDBKeyRange.lowerBound([ t, s ], 
                /* open= */ !0), r.index = di.collectionReadTimeIndex;
            }
            return ei(t).li(r, (t, n, r) => {
                // The query is actually returning any path that starts with the query
                // path prefix which may include documents in subcollections. For
                // example, a query on 'rooms' will return rooms/abc/messages/xyx but we
                // shouldn't match it. Fix this by discarding rows with document keys
                // more than one segment longer than the query path.
                if (t.length !== i) return;
                const o = $s(this.serializer, n);
                e.path.L(o.key.path) ? o instanceof gn && Mn(e, o) && (s = s._t(o.key, o)) : r.done();
            }).next(() => s);
        }
        /**
         * Returns the set of documents that have changed since the specified read
         * time.
         */
        // PORTING NOTE: This is only used for multi-tab synchronization.
        to(t, e) {
            let n = Tt(), s = qs(e);
            const i = ei(t), r = IDBKeyRange.lowerBound(s, !0);
            return i.li({
                index: di.readTimeIndex,
                range: r
            }, (t, e) => {
                // Unlike `getEntry()` and others, `getNewDocumentChanges()` parses
                // the documents directly since we want to keep sentinel deletes.
                const i = $s(this.serializer, e);
                n = n._t(i.key, i), s = e.readTime;
            }).next(() => ({
                eo: n,
                readTime: Bs(s)
            }));
        }
        /**
         * Returns the read time of the most recently read document in the cache, or
         * SnapshotVersion.min() if not available.
         */
        // PORTING NOTE: This is only used for multi-tab synchronization.
        no(t) {
            const e = ei(t);
            // If there are no existing entries, we return SnapshotVersion.min().
                    let n = q$1.min();
            return e.li({
                index: di.readTimeIndex,
                reverse: !0
            }, (t, e, s) => {
                e.readTime && (n = Bs(e.readTime)), s.done();
            }).next(() => n);
        }
        so(t) {
            return new Zs.io(this, !!t && t.ro);
        }
        oo(t) {
            return this.getMetadata(t).next(t => t.byteSize);
        }
        getMetadata(t) {
            return ti(t).get(wi.key).next(t => (v$1(!!t), t));
        }
        Qr(t, e) {
            return ti(t).put(wi.key, e);
        }
        /**
         * Decodes `remoteDoc` and returns the document (or null, if the document
         * corresponds to the format used for sentinel deletes).
         */    Gr(t) {
            if (t) {
                const e = $s(this.serializer, t);
                return e instanceof yn && e.version.isEqual(q$1.min()) ? null : e;
            }
            return null;
        }
    }

    /**
     * Handles the details of adding and updating documents in the IndexedDbRemoteDocumentCache.
     *
     * Unlike the MemoryRemoteDocumentChangeBuffer, the IndexedDb implementation computes the size
     * delta for all submitted changes. This avoids having to re-read all documents from IndexedDb
     * when we apply the changes.
     */ function ti(t) {
        return Ni.Js(t, wi.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the remoteDocuments object store.
     */ function ei(t) {
        return Ni.Js(t, di.store);
    }

    function ni(t) {
        return t.path.B();
    }

    /**
     * Retrusn an approximate size for the given document.
     */ function si(t) {
        let e;
        if (t.document) e = t.document; else if (t.unknownDocument) e = t.unknownDocument; else {
            if (!t.noDocument) throw b();
            e = t.noDocument;
        }
        return JSON.stringify(e).length;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory implementation of IndexManager.
     */ Zs.io = class extends os {
        /**
         * @param documentCache The IndexedDbRemoteDocumentCache to apply the changes to.
         * @param trackRemovals Whether to create sentinel deletes that can be tracked by
         * `getNewDocumentChanges()`.
         */
        constructor(t, e) {
            super(), this.ho = t, this.ro = e, 
            // A map of document sizes prior to applying the changes in this buffer.
            this.ao = new is(t => t.toString(), (t, e) => t.isEqual(e));
        }
        ts(t) {
            const e = [];
            let n = 0, s = new ft((t, e) => F$1(t.U(), e.U()));
            return this.jn.forEach((i, r) => {
                const o = this.ao.get(i);
                if (r) {
                    const h = Ls(this.ho.serializer, r, this.readTime);
                    s = s.add(i.path.O());
                    const a = si(h);
                    n += a - o, e.push(this.ho.zn(t, i, h));
                } else if (n -= o, this.ro) {
                    // In order to track removals, we store a "sentinel delete" in the
                    // RemoteDocumentCache. This entry is represented by a NoDocument
                    // with a version of 0 and ignored by `maybeDecodeDocument()` but
                    // preserved in `getNewDocumentChanges()`.
                    const n = Ls(this.ho.serializer, new yn(i, q$1.min()), this.readTime);
                    e.push(this.ho.zn(t, i, n));
                } else e.push(this.ho.Jn(t, i));
            }), s.forEach(n => {
                e.push(this.ho.hs.Nr(t, n));
            }), e.push(this.ho.updateMetadata(t, n)), rs.Wn(e);
        }
        Xn(t, e) {
            // Record the size of everything we load from the cache so we can compute a delta later.
            return this.ho.zr(t, e).next(t => null === t ? (this.ao.set(e, 0), null) : (this.ao.set(e, t.size), 
            t.Hr));
        }
        Zn(t, e) {
            // Record the size of everything we load from the cache so we can compute
            // a delta later.
            return this.ho.Yr(t, e).next(({Xr: t, Zr: e}) => (
            // Note: `getAllFromCache` returns two maps instead of a single map from
            // keys to `DocumentSizeEntry`s. This is to allow returning the
            // `NullableMaybeDocumentMap` directly, without a conversion.
            e.forEach((t, e) => {
                this.ao.set(t, e);
            }), t));
        }
    };

    class ii {
        constructor() {
            this.uo = new ri;
        }
        Nr(t, e) {
            return this.uo.add(e), rs.resolve();
        }
        As(t, e) {
            return rs.resolve(this.uo.getEntries(e));
        }
    }

    /**
     * Internal implementation of the collection-parent index exposed by MemoryIndexManager.
     * Also used for in-memory caching by IndexedDbIndexManager and initial index population
     * in indexeddb_schema.ts
     */ class ri {
        constructor() {
            this.index = {};
        }
        // Returns false if the entry already existed.
        add(t) {
            const e = t.M(), n = t.O(), s = this.index[e] || new ft(U$1.D), i = !s.has(n);
            return this.index[e] = s.add(n), i;
        }
        has(t) {
            const e = t.M(), n = t.O(), s = this.index[e];
            return s && s.has(n);
        }
        getEntries(t) {
            return (this.index[t] || new ft(U$1.D)).B();
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Schema Version for the Web client:
     * 1.  Initial version including Mutation Queue, Query Cache, and Remote
     *     Document Cache
     * 2.  Used to ensure a targetGlobal object exists and add targetCount to it. No
     *     longer required because migration 3 unconditionally clears it.
     * 3.  Dropped and re-created Query Cache to deal with cache corruption related
     *     to limbo resolution. Addresses
     *     https://github.com/firebase/firebase-ios-sdk/issues/1548
     * 4.  Multi-Tab Support.
     * 5.  Removal of held write acks.
     * 6.  Create document global for tracking document cache size.
     * 7.  Ensure every cached document has a sentinel row with a sequence number.
     * 8.  Add collection-parent index for Collection Group queries.
     * 9.  Change RemoteDocumentChanges store to be keyed by readTime rather than
     *     an auto-incrementing ID. This is required for Index-Free queries.
     * 10. Rewrite the canonical IDs to the explicit Protobuf-based format.
     */
    /** Performs database creation and schema upgrades. */
    class oi {
        constructor(t) {
            this.serializer = t;
        }
        /**
         * Performs database creation and schema upgrades.
         *
         * Note that in production, this method is only ever used to upgrade the schema
         * to SCHEMA_VERSION. Different values of toVersion are only used for testing
         * and local feature development.
         */    createOrUpgrade(t, e, n, s) {
            v$1(n < s && n >= 0 && s <= 10);
            const i = new Is(e);
            n < 1 && s >= 1 && (function(t) {
                t.createObjectStore(ai.store);
            }
            /**
     * An object to be stored in the 'mutationQueues' store in IndexedDb.
     *
     * Each user gets a single queue of MutationBatches to apply to the server.
     * DbMutationQueue tracks the metadata about the queue.
     */ (t), function(t) {
                t.createObjectStore(ui.store, {
                    keyPath: ui.keyPath
                });
                t.createObjectStore(ci.store, {
                    keyPath: ci.keyPath,
                    autoIncrement: !0
                }).createIndex(ci.userMutationsIndex, ci.userMutationsKeyPath, {
                    unique: !0
                }), t.createObjectStore(li.store);
            }
            /**
     * Upgrade function to migrate the 'mutations' store from V1 to V3. Loads
     * and rewrites all data.
     */ (t), Ri(t), function(t) {
                t.createObjectStore(di.store);
            }
            /**
     * Represents the known absence of a document at a particular version.
     * Stored in IndexedDb as part of a DbRemoteDocument object.
     */ (t));
            // Migration 2 to populate the targetGlobal object no longer needed since
            // migration 3 unconditionally clears it.
                    let r = rs.resolve();
            return n < 3 && s >= 3 && (
            // Brand new clients don't need to drop and recreate--only clients that
            // potentially have corrupt data.
            0 !== n && (!function(t) {
                t.deleteObjectStore(Ei.store), t.deleteObjectStore(Ti.store), t.deleteObjectStore(Ii.store);
            }(t), Ri(t)), r = r.next(() => 
            /**
     * Creates the target global singleton row.
     *
     * @param {IDBTransaction} txn The version upgrade transaction for indexeddb
     */
            function(t) {
                const e = t.store(Ii.store), n = new Ii(
                /*highestTargetId=*/ 0, 
                /*lastListenSequenceNumber=*/ 0, q$1.min().S(), 
                /*targetCount=*/ 0);
                return e.put(Ii.key, n);
            }
            /**
     * Creates indices on the RemoteDocuments store used for both multi-tab
     * and Index-Free queries.
     */ (i))), n < 4 && s >= 4 && (0 !== n && (
            // Schema version 3 uses auto-generated keys to generate globally unique
            // mutation batch IDs (this was previously ensured internally by the
            // client). To migrate to the new schema, we have to read all mutations
            // and write them back out. We preserve the existing batch IDs to guarantee
            // consistency with other object stores. Any further mutation batch IDs will
            // be auto-generated.
            r = r.next(() => function(t, e) {
                return e.store(ci.store).hi().next(n => {
                    t.deleteObjectStore(ci.store);
                    t.createObjectStore(ci.store, {
                        keyPath: ci.keyPath,
                        autoIncrement: !0
                    }).createIndex(ci.userMutationsIndex, ci.userMutationsKeyPath, {
                        unique: !0
                    });
                    const s = e.store(ci.store), i = n.map(t => s.put(t));
                    return rs.Wn(i);
                });
            }
            /**
     * An object to be stored in the 'documentMutations' store in IndexedDb.
     *
     * A manually maintained index of all the mutation batches that affect a given
     * document key. The rows in this table are references based on the contents of
     * DbMutationBatch.mutations.
     */ (t, i))), r = r.next(() => {
                !function(t) {
                    t.createObjectStore(mi.store, {
                        keyPath: mi.keyPath
                    });
                }
                // Visible for testing
                (t);
            })), n < 5 && s >= 5 && (r = r.next(() => this.removeAcknowledgedMutations(i))), 
            n < 6 && s >= 6 && (r = r.next(() => (function(t) {
                t.createObjectStore(wi.store);
            }
            /**
     * An object to be stored in the 'targets' store in IndexedDb.
     *
     * This is based on and should be kept in sync with the proto used in the iOS
     * client.
     *
     * Each query the client listens to against the server is tracked on disk so
     * that the query can be efficiently resumed on restart.
     */ (t), this.addDocumentGlobal(i)))), n < 7 && s >= 7 && (r = r.next(() => this.ensureSequenceNumbers(i))), 
            n < 8 && s >= 8 && (r = r.next(() => this.createCollectionParentIndex(t, i))), n < 9 && s >= 9 && (r = r.next(() => {
                // Multi-Tab used to manage its own changelog, but this has been moved
                // to the DbRemoteDocument object store itself. Since the previous change
                // log only contained transient data, we can drop its object store.
                !function(t) {
                    t.objectStoreNames.contains("remoteDocumentChanges") && t.deleteObjectStore("remoteDocumentChanges");
                }(t), function(t) {
                    const e = t.objectStore(di.store);
                    e.createIndex(di.readTimeIndex, di.readTimeIndexPath, {
                        unique: !1
                    }), e.createIndex(di.collectionReadTimeIndex, di.collectionReadTimeIndexPath, {
                        unique: !1
                    });
                }
                /**
     * A record of the metadata state of each client.
     *
     * PORTING NOTE: This is used to synchronize multi-tab state and does not need
     * to be ported to iOS or Android.
     */ (e);
            })), n < 10 && s >= 10 && (r = r.next(() => this.rewriteCanonicalIds(i))), r;
        }
        addDocumentGlobal(t) {
            let e = 0;
            return t.store(di.store).li((t, n) => {
                e += si(n);
            }).next(() => {
                const n = new wi(e);
                return t.store(wi.store).put(wi.key, n);
            });
        }
        removeAcknowledgedMutations(t) {
            const e = t.store(ui.store), n = t.store(ci.store);
            return e.hi().next(e => rs.forEach(e, e => {
                const s = IDBKeyRange.bound([ e.userId, -1 ], [ e.userId, e.lastAcknowledgedBatchId ]);
                return n.hi(ci.userMutationsIndex, s).next(n => rs.forEach(n, n => {
                    v$1(n.userId === e.userId);
                    const s = Ks(this.serializer, n);
                    return Hs(t, e.userId, s).next(() => {});
                }));
            }));
        }
        /**
         * Ensures that every document in the remote document cache has a corresponding sentinel row
         * with a sequence number. Missing rows are given the most recently used sequence number.
         */    ensureSequenceNumbers(t) {
            const e = t.store(Ei.store), n = t.store(di.store);
            return t.store(Ii.store).get(Ii.key).next(t => {
                const s = [];
                return n.li((n, i) => {
                    const r = new U$1(n), o = function(t) {
                        return [ 0, xs(t) ];
                    }
                    /**
     * Wrapper class to store timestamps (seconds and nanos) in IndexedDb objects.
     */ (r);
                    s.push(e.get(o).next(n => n ? rs.resolve() : (n => e.put(new Ei(0, xs(n), t.highestListenSequenceNumber)))(r)));
                }).next(() => rs.Wn(s));
            });
        }
        createCollectionParentIndex(t, e) {
            // Create the index.
            t.createObjectStore(Ai.store, {
                keyPath: Ai.keyPath
            });
            const n = e.store(Ai.store), s = new ri, i = t => {
                if (s.add(t)) {
                    const e = t.M(), s = t.O();
                    return n.put({
                        collectionId: e,
                        parent: xs(s)
                    });
                }
            };
            // Helper to add an index entry iff we haven't already written it.
                    // Index existing remote documents.
            return e.store(di.store).li({
                ci: !0
            }, (t, e) => {
                const n = new U$1(t);
                return i(n.O());
            }).next(() => e.store(li.store).li({
                ci: !0
            }, ([t, e, n], s) => {
                const r = Fs(e);
                return i(r.O());
            }));
        }
        rewriteCanonicalIds(t) {
            const e = t.store(Ti.store);
            return e.li((t, n) => {
                const s = js(n), i = Qs(this.serializer, s);
                return e.put(i);
            });
        }
    }

    class hi {
        constructor(t, e) {
            this.seconds = t, this.nanoseconds = e;
        }
    }

    /**
     * A singleton object to be stored in the 'owner' store in IndexedDb.
     *
     * A given database can have a single primary tab assigned at a given time. That
     * tab must validate that it is still holding the primary lease before every
     * operation that requires locked access. The primary tab should regularly
     * write an updated timestamp to this lease to prevent other tabs from
     * "stealing" the primary lease
     */ class ai {
        constructor(t, 
        /** Whether to allow shared access from multiple tabs. */
        e, n) {
            this.ownerId = t, this.allowTabSynchronization = e, this.leaseTimestampMs = n;
        }
    }

    /**
     * Name of the IndexedDb object store.
     *
     * Note that the name 'owner' is chosen to ensure backwards compatibility with
     * older clients that only supported single locked access to the persistence
     * layer.
     */ ai.store = "owner", 
    /**
     * The key string used for the single object that exists in the
     * DbPrimaryClient store.
     */
    ai.key = "owner";

    class ui {
        constructor(
        /**
         * The normalized user ID to which this queue belongs.
         */
        t, 
        /**
         * An identifier for the highest numbered batch that has been acknowledged
         * by the server. All MutationBatches in this queue with batchIds less
         * than or equal to this value are considered to have been acknowledged by
         * the server.
         *
         * NOTE: this is deprecated and no longer used by the code.
         */
        e, 
        /**
         * A stream token that was previously sent by the server.
         *
         * See StreamingWriteRequest in datastore.proto for more details about
         * usage.
         *
         * After sending this token, earlier tokens may not be used anymore so
         * only a single stream token is retained.
         *
         * NOTE: this is deprecated and no longer used by the code.
         */
        n) {
            this.userId = t, this.lastAcknowledgedBatchId = e, this.lastStreamToken = n;
        }
    }

    /** Name of the IndexedDb object store.  */ ui.store = "mutationQueues", 
    /** Keys are automatically assigned via the userId property. */
    ui.keyPath = "userId";

    /**
     * An object to be stored in the 'mutations' store in IndexedDb.
     *
     * Represents a batch of user-level mutations intended to be sent to the server
     * in a single write. Each user-level batch gets a separate DbMutationBatch
     * with a new batchId.
     */
    class ci {
        constructor(
        /**
         * The normalized user ID to which this batch belongs.
         */
        t, 
        /**
         * An identifier for this batch, allocated using an auto-generated key.
         */
        e, 
        /**
         * The local write time of the batch, stored as milliseconds since the
         * epoch.
         */
        n, 
        /**
         * A list of "mutations" that represent a partial base state from when this
         * write batch was initially created. During local application of the write
         * batch, these baseMutations are applied prior to the real writes in order
         * to override certain document fields from the remote document cache. This
         * is necessary in the case of non-idempotent writes (e.g. `increment()`
         * transforms) to make sure that the local view of the modified documents
         * doesn't flicker if the remote document cache receives the result of the
         * non-idempotent write before the write is removed from the queue.
         *
         * These mutations are never sent to the backend.
         */
        s, 
        /**
         * A list of mutations to apply. All mutations will be applied atomically.
         *
         * Mutations are serialized via toMutation().
         */
        i) {
            this.userId = t, this.batchId = e, this.localWriteTimeMs = n, this.baseMutations = s, 
            this.mutations = i;
        }
    }

    /** Name of the IndexedDb object store.  */ ci.store = "mutations", 
    /** Keys are automatically assigned via the userId, batchId properties. */
    ci.keyPath = "batchId", 
    /** The index name for lookup of mutations by user. */
    ci.userMutationsIndex = "userMutationsIndex", 
    /** The user mutations index is keyed by [userId, batchId] pairs. */
    ci.userMutationsKeyPath = [ "userId", "batchId" ];

    class li {
        constructor() {}
        /**
         * Creates a [userId] key for use in the DbDocumentMutations index to iterate
         * over all of a user's document mutations.
         */    static prefixForUser(t) {
            return [ t ];
        }
        /**
         * Creates a [userId, encodedPath] key for use in the DbDocumentMutations
         * index to iterate over all at document mutations for a given path or lower.
         */    static prefixForPath(t, e) {
            return [ t, xs(e) ];
        }
        /**
         * Creates a full index key of [userId, encodedPath, batchId] for inserting
         * and deleting into the DbDocumentMutations index.
         */    static key(t, e, n) {
            return [ t, xs(e), n ];
        }
    }

    li.store = "documentMutations", 
    /**
     * Because we store all the useful information for this store in the key,
     * there is no useful information to store as the value. The raw (unencoded)
     * path cannot be stored because IndexedDb doesn't store prototype
     * information.
     */
    li.PLACEHOLDER = new li;

    class _i {
        constructor(t, e) {
            this.path = t, this.readTime = e;
        }
    }

    /**
     * Represents a document that is known to exist but whose data is unknown.
     * Stored in IndexedDb as part of a DbRemoteDocument object.
     */ class fi {
        constructor(t, e) {
            this.path = t, this.version = e;
        }
    }

    /**
     * An object to be stored in the 'remoteDocuments' store in IndexedDb.
     * It represents either:
     *
     * - A complete document.
     * - A "no document" representing a document that is known not to exist (at
     * some version).
     * - An "unknown document" representing a document that is known to exist (at
     * some version) but whose contents are unknown.
     *
     * Note: This is the persisted equivalent of a MaybeDocument and could perhaps
     * be made more general if necessary.
     */ class di {
        // TODO: We are currently storing full document keys almost three times
        // (once as part of the primary key, once - partly - as `parentPath` and once
        // inside the encoded documents). During our next migration, we should
        // rewrite the primary key as parentPath + document ID which would allow us
        // to drop one value.
        constructor(
        /**
         * Set to an instance of DbUnknownDocument if the data for a document is
         * not known, but it is known that a document exists at the specified
         * version (e.g. it had a successful update applied to it)
         */
        t, 
        /**
         * Set to an instance of a DbNoDocument if it is known that no document
         * exists.
         */
        e, 
        /**
         * Set to an instance of a Document if there's a cached version of the
         * document.
         */
        n, 
        /**
         * Documents that were written to the remote document store based on
         * a write acknowledgment are marked with `hasCommittedMutations`. These
         * documents are potentially inconsistent with the backend's copy and use
         * the write's commit version as their document version.
         */
        s, 
        /**
         * When the document was read from the backend. Undefined for data written
         * prior to schema version 9.
         */
        i, 
        /**
         * The path of the collection this document is part of. Undefined for data
         * written prior to schema version 9.
         */
        r) {
            this.unknownDocument = t, this.noDocument = e, this.document = n, this.hasCommittedMutations = s, 
            this.readTime = i, this.parentPath = r;
        }
    }

    di.store = "remoteDocuments", 
    /**
     * An index that provides access to all entries sorted by read time (which
     * corresponds to the last modification time of each row).
     *
     * This index is used to provide a changelog for Multi-Tab.
     */
    di.readTimeIndex = "readTimeIndex", di.readTimeIndexPath = "readTime", 
    /**
     * An index that provides access to documents in a collection sorted by read
     * time.
     *
     * This index is used to allow the RemoteDocumentCache to fetch newly changed
     * documents in a collection.
     */
    di.collectionReadTimeIndex = "collectionReadTimeIndex", di.collectionReadTimeIndexPath = [ "parentPath", "readTime" ];

    /**
     * Contains a single entry that has metadata about the remote document cache.
     */
    class wi {
        /**
         * @param byteSize Approximately the total size in bytes of all the documents in the document
         * cache.
         */
        constructor(t) {
            this.byteSize = t;
        }
    }

    wi.store = "remoteDocumentGlobal", wi.key = "remoteDocumentGlobalKey";

    class Ti {
        constructor(
        /**
         * An auto-generated sequential numeric identifier for the query.
         *
         * Queries are stored using their canonicalId as the key, but these
         * canonicalIds can be quite long so we additionally assign a unique
         * queryId which can be used by referenced data structures (e.g.
         * indexes) to minimize the on-disk cost.
         */
        t, 
        /**
         * The canonical string representing this query. This is not unique.
         */
        e, 
        /**
         * The last readTime received from the Watch Service for this query.
         *
         * This is the same value as TargetChange.read_time in the protos.
         */
        n, 
        /**
         * An opaque, server-assigned token that allows watching a query to be
         * resumed after disconnecting without retransmitting all the data
         * that matches the query. The resume token essentially identifies a
         * point in time from which the server should resume sending results.
         *
         * This is related to the snapshotVersion in that the resumeToken
         * effectively also encodes that value, but the resumeToken is opaque
         * and sometimes encodes additional information.
         *
         * A consequence of this is that the resumeToken should be used when
         * asking the server to reason about where this client is in the watch
         * stream, but the client should use the snapshotVersion for its own
         * purposes.
         *
         * This is the same value as TargetChange.resume_token in the protos.
         */
        s, 
        /**
         * A sequence number representing the last time this query was
         * listened to, used for garbage collection purposes.
         *
         * Conventionally this would be a timestamp value, but device-local
         * clocks are unreliable and they must be able to create new listens
         * even while disconnected. Instead this should be a monotonically
         * increasing number that's incremented on each listen call.
         *
         * This is different from the queryId since the queryId is an
         * immutable identifier assigned to the Query on first use while
         * lastListenSequenceNumber is updated every time the query is
         * listened to.
         */
        i, 
        /**
         * Denotes the maximum snapshot version at which the associated query view
         * contained no limbo documents.  Undefined for data written prior to
         * schema version 9.
         */
        r, 
        /**
         * The query for this target.
         *
         * Because canonical ids are not unique we must store the actual query. We
         * use the proto to have an object we can persist without having to
         * duplicate translation logic to and from a `Query` object.
         */
        o) {
            this.targetId = t, this.canonicalId = e, this.readTime = n, this.resumeToken = s, 
            this.lastListenSequenceNumber = i, this.lastLimboFreeSnapshotVersion = r, this.query = o;
        }
    }

    Ti.store = "targets", 
    /** Keys are automatically assigned via the targetId property. */
    Ti.keyPath = "targetId", 
    /** The name of the queryTargets index. */
    Ti.queryTargetsIndexName = "queryTargetsIndex", 
    /**
     * The index of all canonicalIds to the targets that they match. This is not
     * a unique mapping because canonicalId does not promise a unique name for all
     * possible queries, so we append the targetId to make the mapping unique.
     */
    Ti.queryTargetsKeyPath = [ "canonicalId", "targetId" ];

    /**
     * An object representing an association between a target and a document, or a
     * sentinel row marking the last sequence number at which a document was used.
     * Each document cached must have a corresponding sentinel row before lru
     * garbage collection is enabled.
     *
     * The target associations and sentinel rows are co-located so that orphaned
     * documents and their sequence numbers can be identified efficiently via a scan
     * of this store.
     */
    class Ei {
        constructor(
        /**
         * The targetId identifying a target or 0 for a sentinel row.
         */
        t, 
        /**
         * The path to the document, as encoded in the key.
         */
        e, 
        /**
         * If this is a sentinel row, this should be the sequence number of the last
         * time the document specified by `path` was used. Otherwise, it should be
         * `undefined`.
         */
        n) {
            this.targetId = t, this.path = e, this.sequenceNumber = n;
        }
    }

    /** Name of the IndexedDb object store.  */ Ei.store = "targetDocuments", 
    /** Keys are automatically assigned via the targetId, path properties. */
    Ei.keyPath = [ "targetId", "path" ], 
    /** The index name for the reverse index. */
    Ei.documentTargetsIndex = "documentTargetsIndex", 
    /** We also need to create the reverse index for these properties. */
    Ei.documentTargetsKeyPath = [ "path", "targetId" ];

    /**
     * A record of global state tracked across all Targets, tracked separately
     * to avoid the need for extra indexes.
     *
     * This should be kept in-sync with the proto used in the iOS client.
     */
    class Ii {
        constructor(
        /**
         * The highest numbered target id across all targets.
         *
         * See DbTarget.targetId.
         */
        t, 
        /**
         * The highest numbered lastListenSequenceNumber across all targets.
         *
         * See DbTarget.lastListenSequenceNumber.
         */
        e, 
        /**
         * A global snapshot version representing the last consistent snapshot we
         * received from the backend. This is monotonically increasing and any
         * snapshots received from the backend prior to this version (e.g. for
         * targets resumed with a resumeToken) should be suppressed (buffered)
         * until the backend has caught up to this snapshot version again. This
         * prevents our cache from ever going backwards in time.
         */
        n, 
        /**
         * The number of targets persisted.
         */
        s) {
            this.highestTargetId = t, this.highestListenSequenceNumber = e, this.lastRemoteSnapshotVersion = n, 
            this.targetCount = s;
        }
    }

    /**
     * The key string used for the single object that exists in the
     * DbTargetGlobal store.
     */ Ii.key = "targetGlobalKey", Ii.store = "targetGlobal";

    /**
     * An object representing an association between a Collection id (e.g. 'messages')
     * to a parent path (e.g. '/chats/123') that contains it as a (sub)collection.
     * This is used to efficiently find all collections to query when performing
     * a Collection Group query.
     */
    class Ai {
        constructor(
        /**
         * The collectionId (e.g. 'messages')
         */
        t, 
        /**
         * The path to the parent (either a document location or an empty path for
         * a root-level collection).
         */
        e) {
            this.collectionId = t, this.parent = e;
        }
    }

    /** Name of the IndexedDb object store. */ function Ri(t) {
        t.createObjectStore(Ei.store, {
            keyPath: Ei.keyPath
        }).createIndex(Ei.documentTargetsIndex, Ei.documentTargetsKeyPath, {
            unique: !0
        });
        // NOTE: This is unique only because the TargetId is the suffix.
        t.createObjectStore(Ti.store, {
            keyPath: Ti.keyPath
        }).createIndex(Ti.queryTargetsIndexName, Ti.queryTargetsKeyPath, {
            unique: !0
        }), t.createObjectStore(Ii.store);
    }

    Ai.store = "collectionParents", 
    /** Keys are automatically assigned via the collectionId, parent properties. */
    Ai.keyPath = [ "collectionId", "parent" ];

    class mi {
        constructor(
        // Note: Previous schema versions included a field
        // "lastProcessedDocumentChangeId". Don't use anymore.
        /** The auto-generated client id assigned at client startup. */
        t, 
        /** The last time this state was updated. */
        e, 
        /** Whether the client's network connection is enabled. */
        n, 
        /** Whether this client is running in a foreground tab. */
        s) {
            this.clientId = t, this.updateTimeMs = e, this.networkEnabled = n, this.inForeground = s;
        }
    }

    /** Name of the IndexedDb object store. */ mi.store = "clientMetadata", 
    /** Keys are automatically assigned via the clientId properties. */
    mi.keyPath = "clientId";

    const Pi = [ ...[ ...[ ...[ ui.store, ci.store, li.store, di.store, Ti.store, ai.store, Ii.store, Ei.store ], mi.store ], wi.store ], Ai.store ];

    // V2 is no longer usable (see comment at top of file)
    // Visible for testing
    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A persisted implementation of IndexManager.
     */
    class Vi {
        constructor() {
            /**
             * An in-memory copy of the index entries we've already written since the SDK
             * launched. Used to avoid re-writing the same entry repeatedly.
             *
             * This is *NOT* a complete cache of what's in persistence and so can never be used to
             * satisfy reads.
             */
            this.co = new ri;
        }
        /**
         * Adds a new entry to the collection parent index.
         *
         * Repeated calls for the same collectionPath should be avoided within a
         * transaction as IndexedDbIndexManager only caches writes once a transaction
         * has been committed.
         */    Nr(t, e) {
            if (!this.co.has(e)) {
                const n = e.M(), s = e.O();
                t.ns(() => {
                    // Add the collection to the in memory cache only if the transaction was
                    // successfully committed.
                    this.co.add(e);
                });
                const i = {
                    collectionId: n,
                    parent: xs(s)
                };
                return gi(t).put(i);
            }
            return rs.resolve();
        }
        As(t, e) {
            const n = [], s = IDBKeyRange.bound([ e, "" ], [ $(e), "" ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0);
            return gi(t).hi(s).next(t => {
                for (const s of t) {
                    // This collectionId guard shouldn't be necessary (and isn't as long
                    // as we're running in a real browser), but there's a bug in
                    // indexeddbshim that breaks our range in our tests running in node:
                    // https://github.com/axemclion/IndexedDBShim/issues/334
                    if (s.collectionId !== e) break;
                    n.push(Fs(s.parent));
                }
                return n;
            });
        }
    }

    /**
     * Helper to get a typed SimpleDbStore for the collectionParents
     * document store.
     */ function gi(t) {
        return Ni.Js(t, Ai.store);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Offset to ensure non-overlapping target ids. */
    /**
     * Generates monotonically increasing target IDs for sending targets to the
     * watch stream.
     *
     * The client constructs two generators, one for the target cache, and one for
     * for the sync engine (to generate limbo documents targets). These
     * generators produce non-overlapping IDs (by using even and odd IDs
     * respectively).
     *
     * By separating the target ID space, the query cache can generate target IDs
     * that persist across client restarts, while sync engine can independently
     * generate in-memory target IDs that are transient and can be reused after a
     * restart.
     */
    class yi {
        constructor(t) {
            this.lo = t;
        }
        next() {
            return this.lo += 2, this.lo;
        }
        static _o() {
            // The target cache generator must return '2' in its first call to `next()`
            // as there is no differentiation in the protocol layer between an unset
            // number and the number '0'. If we were to sent a target with target ID
            // '0', the backend would consider it unset and replace it with its own ID.
            return new yi(0);
        }
        static fo() {
            // Sync engine assigns target IDs for limbo document detection.
            return new yi(-1);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class pi {
        constructor(t, e) {
            this.br = t, this.serializer = e;
        }
        // PORTING NOTE: We don't cache global metadata for the target cache, since
        // some of it (in particular `highestTargetId`) can be modified by secondary
        // tabs. We could perhaps be more granular (and e.g. still cache
        // `lastRemoteSnapshotVersion` in memory) but for simplicity we currently go
        // to IndexedDb whenever we need to read metadata. We can revisit if it turns
        // out to have a meaningful performance impact.
        do(t) {
            return this.wo(t).next(e => {
                const n = new yi(e.highestTargetId);
                return e.highestTargetId = n.next(), this.To(t, e).next(() => e.highestTargetId);
            });
        }
        Eo(t) {
            return this.wo(t).next(t => q$1.g(new L$1(t.lastRemoteSnapshotVersion.seconds, t.lastRemoteSnapshotVersion.nanoseconds)));
        }
        Io(t) {
            return this.wo(t).next(t => t.highestListenSequenceNumber);
        }
        Ao(t, e, n) {
            return this.wo(t).next(s => (s.highestListenSequenceNumber = e, n && (s.lastRemoteSnapshotVersion = n.S()), 
            e > s.highestListenSequenceNumber && (s.highestListenSequenceNumber = e), this.To(t, s)));
        }
        Ro(t, e) {
            return this.mo(t, e).next(() => this.wo(t).next(n => (n.targetCount += 1, this.Po(e, n), 
            this.To(t, n))));
        }
        Vo(t, e) {
            return this.mo(t, e);
        }
        yo(t, e) {
            return this.po(t, e.targetId).next(() => bi(t).delete(e.targetId)).next(() => this.wo(t)).next(e => (v$1(e.targetCount > 0), 
            e.targetCount -= 1, this.To(t, e)));
        }
        /**
         * Drops any targets with sequence number less than or equal to the upper bound, excepting those
         * present in `activeTargetIds`. Document associations for the removed targets are also removed.
         * Returns the number of targets removed.
         */    mr(t, e, n) {
            let s = 0;
            const i = [];
            return bi(t).li((r, o) => {
                const h = js(o);
                h.sequenceNumber <= e && null === n.get(h.targetId) && (s++, i.push(this.yo(t, h)));
            }).next(() => rs.Wn(i)).next(() => s);
        }
        /**
         * Call provided function with each `TargetData` that we have cached.
         */    Fe(t, e) {
            return bi(t).li((t, n) => {
                const s = js(n);
                e(s);
            });
        }
        wo(t) {
            return vi(t).get(Ii.key).next(t => (v$1(null !== t), t));
        }
        To(t, e) {
            return vi(t).put(Ii.key, e);
        }
        mo(t, e) {
            return bi(t).put(Qs(this.serializer, e));
        }
        /**
         * In-place updates the provided metadata to account for values in the given
         * TargetData. Saving is done separately. Returns true if there were any
         * changes to the metadata.
         */    Po(t, e) {
            let n = !1;
            return t.targetId > e.highestTargetId && (e.highestTargetId = t.targetId, n = !0), 
            t.sequenceNumber > e.highestListenSequenceNumber && (e.highestListenSequenceNumber = t.sequenceNumber, 
            n = !0), n;
        }
        bo(t) {
            return this.wo(t).next(t => t.targetCount);
        }
        vo(t, e) {
            // Iterating by the canonicalId may yield more than one result because
            // canonicalId values are not required to be unique per target. This query
            // depends on the queryTargets index to be efficient.
            const n = Z$1(e), s = IDBKeyRange.bound([ n, Number.NEGATIVE_INFINITY ], [ n, Number.POSITIVE_INFINITY ]);
            let i = null;
            return bi(t).li({
                range: s,
                index: Ti.queryTargetsIndexName
            }, (t, n, s) => {
                const r = js(n);
                // After finding a potential match, check that the target is
                // actually equal to the requested target.
                            et(e, r.target) && (i = r, s.done());
            }).next(() => i);
        }
        So(t, e, n) {
            // PORTING NOTE: The reverse index (documentsTargets) is maintained by
            // IndexedDb.
            const s = [], i = Si(t);
            return e.forEach(e => {
                const r = xs(e.path);
                s.push(i.put(new Ei(n, r))), s.push(this.br.Co(t, n, e));
            }), rs.Wn(s);
        }
        Do(t, e, n) {
            // PORTING NOTE: The reverse index (documentsTargets) is maintained by
            // IndexedDb.
            const s = Si(t);
            return rs.forEach(e, e => {
                const i = xs(e.path);
                return rs.Wn([ s.delete([ n, i ]), this.br.No(t, n, e) ]);
            });
        }
        po(t, e) {
            const n = Si(t), s = IDBKeyRange.bound([ e ], [ e + 1 ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0);
            return n.delete(s);
        }
        xo(t, e) {
            const n = IDBKeyRange.bound([ e ], [ e + 1 ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0), s = Si(t);
            let i = Pt();
            return s.li({
                range: n,
                ci: !0
            }, (t, e, n) => {
                const s = Fs(t[1]), r = new j(s);
                i = i.add(r);
            }).next(() => i);
        }
        Kr(t, e) {
            const n = xs(e.path), s = IDBKeyRange.bound([ n ], [ $(n) ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0);
            let i = 0;
            return Si(t).li({
                index: Ei.documentTargetsIndex,
                ci: !0,
                range: s
            }, ([t, e], n, s) => {
                // Having a sentinel row for a document does not count as containing that document;
                // For the target cache, containing the document means the document is part of some
                // target.
                0 !== t && (i++, s.done());
            }).next(() => i > 0);
        }
        /**
         * Looks up a TargetData entry by target ID.
         *
         * @param targetId The target ID of the TargetData entry to look up.
         * @return The cached TargetData entry, or null if the cache has no entry for
         * the target.
         */
        // PORTING NOTE: Multi-tab only.
        Ge(t, e) {
            return bi(t).get(e).next(t => t ? js(t) : null);
        }
    }

    /**
     * Helper to get a typed SimpleDbStore for the queries object store.
     */ function bi(t) {
        return Ni.Js(t, Ti.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the target globals object store.
     */ function vi(t) {
        return Ni.Js(t, Ii.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the document target object store.
     */ function Si(t) {
        return Ni.Js(t, Ei.store);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Ci = "Failed to obtain exclusive access to the persistence layer. To allow shared access, make sure to invoke `enablePersistence()` with `synchronizeTabs:true` in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";

    /**
     * Oldest acceptable age in milliseconds for client metadata before the client
     * is considered inactive and its associated data is garbage collected.
     */ class Di extends as {
        constructor(t, e) {
            super(), this.qr = t, this.ko = e;
        }
    }

    /**
     * An IndexedDB-backed instance of Persistence. Data is stored persistently
     * across sessions.
     *
     * On Web only, the Firestore SDKs support shared access to its persistence
     * layer. This allows multiple browser tabs to read and write to IndexedDb and
     * to synchronize state even without network connectivity. Shared access is
     * currently optional and not enabled unless all clients invoke
     * `enablePersistence()` with `{synchronizeTabs:true}`.
     *
     * In multi-tab mode, if multiple clients are active at the same time, the SDK
     * will designate one client as the “primary client”. An effort is made to pick
     * a visible, network-connected and active client, and this client is
     * responsible for letting other clients know about its presence. The primary
     * client writes a unique client-generated identifier (the client ID) to
     * IndexedDb’s “owner” store every 4 seconds. If the primary client fails to
     * update this entry, another client can acquire the lease and take over as
     * primary.
     *
     * Some persistence operations in the SDK are designated as primary-client only
     * operations. This includes the acknowledgment of mutations and all updates of
     * remote documents. The effects of these operations are written to persistence
     * and then broadcast to other tabs via LocalStorage (see
     * `WebStorageSharedClientState`), which then refresh their state from
     * persistence.
     *
     * Similarly, the primary client listens to notifications sent by secondary
     * clients to discover persistence changes written by secondary clients, such as
     * the addition of new mutations and query targets.
     *
     * If multi-tab is not enabled and another tab already obtained the primary
     * lease, IndexedDbPersistence enters a failed state and all subsequent
     * operations will automatically fail.
     *
     * Additionally, there is an optimization so that when a tab is closed, the
     * primary lease is released immediately (this is especially important to make
     * sure that a refreshed tab is able to immediately re-acquire the primary
     * lease). Unfortunately, IndexedDB cannot be reliably used in window.unload
     * since it is an asynchronous API. So in addition to attempting to give up the
     * lease, the leaseholder writes its client ID to a "zombiedClient" entry in
     * LocalStorage which acts as an indicator that another tab should go ahead and
     * take the primary lease immediately regardless of the current lease timestamp.
     *
     * TODO(b/114226234): Remove `synchronizeTabs` section when multi-tab is no
     * longer optional.
     */ class Ni {
        constructor(
        /**
         * Whether to synchronize the in-memory state of multiple tabs and share
         * access to local persistence.
         */
        t, e, n, s, i, r, o, h, a, 
        /**
         * If set to true, forcefully obtains database access. Existing tabs will
         * no longer be able to access IndexedDB.
         */
        u) {
            if (this.allowTabSynchronization = t, this.persistenceKey = e, this.clientId = n, 
            this.Cs = i, this.window = r, this.document = o, this.Oo = a, this.Fo = u, this.Mo = null, 
            this.$o = !1, this.isPrimary = !1, this.networkEnabled = !0, 
            /** Our window.unload handler, if registered. */
            this.Lo = null, this.inForeground = !1, 
            /** Our 'visibilitychange' listener if registered. */
            this.qo = null, 
            /** The client metadata refresh task. */
            this.Bo = null, 
            /** The last time we garbage collected the client metadata object store. */
            this.Uo = Number.NEGATIVE_INFINITY, 
            /** A listener to notify on primary state changes. */
            this.Wo = t => Promise.resolve(), !Ni.Qs()) throw new D$1(C$1.UNIMPLEMENTED, "This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");
            this.br = new Oi(this, s), this.Ko = e + "main", this.serializer = new Ms(h), this.jo = new ds(this.Ko, 10, new oi(this.serializer)), 
            this.Qo = new pi(this.br, this.serializer), this.hs = new Vi, this.rs = new Zs(this.serializer, this.hs), 
            this.window && this.window.localStorage ? this.Go = this.window.localStorage : (this.Go = null, 
            !1 === u && g$1("IndexedDbPersistence", "LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."));
        }
        static Js(t, e) {
            if (t instanceof Di) return ds.Js(t.qr, e);
            throw b();
        }
        /**
         * Attempt to start IndexedDb persistence.
         *
         * @return {Promise<void>} Whether persistence was enabled.
         */    start() {
            // NOTE: This is expected to fail sometimes (in the case of another tab 
            // already having the persistence lock), so it's the first thing we should 
            // do.
            return this.zo().then(() => {
                if (!this.isPrimary && !this.allowTabSynchronization) 
                // Fail `start()` if `synchronizeTabs` is disabled and we cannot
                // obtain the primary lease.
                throw new D$1(C$1.FAILED_PRECONDITION, Ci);
                return this.Ho(), this.Jo(), this.Yo(), this.runTransaction("getHighestListenSequenceNumber", "readonly", t => this.Qo.Io(t));
            }).then(t => {
                this.Mo = new ls(t, this.Oo);
            }).then(() => {
                this.$o = !0;
            }).catch(t => (this.jo && this.jo.close(), Promise.reject(t)));
        }
        /**
         * Registers a listener that gets called when the primary state of the
         * instance changes. Upon registering, this listener is invoked immediately
         * with the current primary state.
         *
         * PORTING NOTE: This is only used for Web multi-tab.
         */    Xo(t) {
            return this.Wo = async e => {
                if (this.dr) return t(e);
            }, t(this.isPrimary);
        }
        /**
         * Registers a listener that gets called when the database receives a
         * version change event indicating that it has deleted.
         *
         * PORTING NOTE: This is only used for Web multi-tab.
         */    Zo(t) {
            this.jo.Zs(async e => {
                // Check if an attempt is made to delete IndexedDB.
                null === e.newVersion && await t();
            });
        }
        /**
         * Adjusts the current network state in the client's metadata, potentially
         * affecting the primary lease.
         *
         * PORTING NOTE: This is only used for Web multi-tab.
         */    th(t) {
            this.networkEnabled !== t && (this.networkEnabled = t, 
            // Schedule a primary lease refresh for immediate execution. The eventual
            // lease update will be propagated via `primaryStateListener`.
            this.Cs.Ri(async () => {
                this.dr && await this.zo();
            }));
        }
        /**
         * Updates the client metadata in IndexedDb and attempts to either obtain or
         * extend the primary lease for the local client. Asynchronously notifies the
         * primary state listener if the client either newly obtained or released its
         * primary lease.
         */    zo() {
            return this.runTransaction("updateClientMetadataAndTryBecomePrimary", "readwrite", t => ki(t).put(new mi(this.clientId, Date.now(), this.networkEnabled, this.inForeground)).next(() => {
                if (this.isPrimary) return this.eh(t).next(t => {
                    t || (this.isPrimary = !1, this.Cs.Fi(() => this.Wo(!1)));
                });
            }).next(() => this.nh(t)).next(e => this.isPrimary && !e ? this.sh(t).next(() => !1) : !!e && this.ih(t).next(() => !0))).catch(t => {
                if (Es(t)) 
                // Proceed with the existing state. Any subsequent access to
                // IndexedDB will verify the lease.
                return V$1("IndexedDbPersistence", "Failed to extend owner lease: ", t), this.isPrimary;
                if (!this.allowTabSynchronization) throw t;
                return V$1("IndexedDbPersistence", "Releasing owner lease after error during lease refresh", t), 
                /* isPrimary= */ !1;
            }).then(t => {
                this.isPrimary !== t && this.Cs.Fi(() => this.Wo(t)), this.isPrimary = t;
            });
        }
        eh(t) {
            return xi(t).get(ai.key).next(t => rs.resolve(this.rh(t)));
        }
        oh(t) {
            return ki(t).delete(this.clientId);
        }
        /**
         * If the garbage collection threshold has passed, prunes the
         * RemoteDocumentChanges and the ClientMetadata store based on the last update
         * time of all clients.
         */    async hh() {
            if (this.isPrimary && !this.ah(this.Uo, 18e5)) {
                this.Uo = Date.now();
                const t = await this.runTransaction("maybeGarbageCollectMultiClientState", "readwrite-primary", t => {
                    const e = Ni.Js(t, mi.store);
                    return e.hi().next(t => {
                        const n = this.uh(t, 18e5), s = t.filter(t => -1 === n.indexOf(t));
                        // Delete metadata for clients that are no longer considered active.
                        return rs.forEach(s, t => e.delete(t.clientId)).next(() => s);
                    });
                }).catch(() => []);
                // Delete potential leftover entries that may continue to mark the
                // inactive clients as zombied in LocalStorage.
                // Ideally we'd delete the IndexedDb and LocalStorage zombie entries for
                // the client atomically, but we can't. So we opt to delete the IndexedDb
                // entries first to avoid potentially reviving a zombied client.
                            if (this.Go) for (const e of t) this.Go.removeItem(this.lh(e.clientId));
            }
        }
        /**
         * Schedules a recurring timer to update the client metadata and to either
         * extend or acquire the primary lease if the client is eligible.
         */    Yo() {
            this.Bo = this.Cs.Bs("client_metadata_refresh" /* ClientMetadataRefresh */ , 4e3, () => this.zo().then(() => this.hh()).then(() => this.Yo()));
        }
        /** Checks whether `client` is the local client. */    rh(t) {
            return !!t && t.ownerId === this.clientId;
        }
        /**
         * Evaluate the state of all active clients and determine whether the local
         * client is or can act as the holder of the primary lease. Returns whether
         * the client is eligible for the lease, but does not actually acquire it.
         * May return 'false' even if there is no active leaseholder and another
         * (foreground) client should become leaseholder instead.
         */    nh(t) {
            if (this.Fo) return rs.resolve(!0);
            return xi(t).get(ai.key).next(e => {
                // A client is eligible for the primary lease if:
                // - its network is enabled and the client's tab is in the foreground.
                // - its network is enabled and no other client's tab is in the
                //   foreground.
                // - every clients network is disabled and the client's tab is in the
                //   foreground.
                // - every clients network is disabled and no other client's tab is in
                //   the foreground.
                // - the `forceOwningTab` setting was passed in.
                if (null !== e && this.ah(e.leaseTimestampMs, 5e3) && !this._h(e.ownerId)) {
                    if (this.rh(e) && this.networkEnabled) return !0;
                    if (!this.rh(e)) {
                        if (!e.allowTabSynchronization) 
                        // Fail the `canActAsPrimary` check if the current leaseholder has
                        // not opted into multi-tab synchronization. If this happens at
                        // client startup, we reject the Promise returned by
                        // `enablePersistence()` and the user can continue to use Firestore
                        // with in-memory persistence.
                        // If this fails during a lease refresh, we will instead block the
                        // AsyncQueue from executing further operations. Note that this is
                        // acceptable since mixing & matching different `synchronizeTabs`
                        // settings is not supported.
                        // TODO(b/114226234): Remove this check when `synchronizeTabs` can
                        // no longer be turned off.
                        throw new D$1(C$1.FAILED_PRECONDITION, Ci);
                        return !1;
                    }
                }
                return !(!this.networkEnabled || !this.inForeground) || ki(t).hi().next(t => void 0 === this.uh(t, 5e3).find(t => {
                    if (this.clientId !== t.clientId) {
                        const e = !this.networkEnabled && t.networkEnabled, n = !this.inForeground && t.inForeground, s = this.networkEnabled === t.networkEnabled;
                        if (e || n && s) return !0;
                    }
                    return !1;
                }));
            }).next(t => (this.isPrimary !== t && V$1("IndexedDbPersistence", `Client ${t ? "is" : "is not"} eligible for a primary lease.`), 
            t));
        }
        async fh() {
            // The shutdown() operations are idempotent and can be called even when
            // start() aborted (e.g. because it couldn't acquire the persistence lease).
            this.$o = !1, this.dh(), this.Bo && (this.Bo.cancel(), this.Bo = null), this.wh(), 
            this.Th(), await this.runTransaction("shutdown", "readwrite", t => this.sh(t).next(() => this.oh(t))).catch(t => {
                V$1("IndexedDbPersistence", "Proceeding with shutdown despite failure: ", t);
            }), this.jo.close(), 
            // Remove the entry marking the client as zombied from LocalStorage since
            // we successfully deleted its metadata from IndexedDb.
            this.Eh();
        }
        /**
         * Returns clients that are not zombied and have an updateTime within the
         * provided threshold.
         */    uh(t, e) {
            return t.filter(t => this.ah(t.updateTimeMs, e) && !this._h(t.clientId));
        }
        /**
         * Returns the IDs of the clients that are currently active. If multi-tab
         * is not supported, returns an array that only contains the local client's
         * ID.
         *
         * PORTING NOTE: This is only used for Web multi-tab.
         */    Ih() {
            return this.runTransaction("getActiveClients", "readonly", t => ki(t).hi().next(t => this.uh(t, 18e5).map(t => t.clientId)));
        }
        get dr() {
            return this.$o;
        }
        Ah(t) {
            return Gs.Sr(t, this.serializer, this.hs, this.br);
        }
        Rh() {
            return this.Qo;
        }
        mh() {
            return this.rs;
        }
        Ph() {
            return this.hs;
        }
        runTransaction(t, e, n) {
            V$1("IndexedDbPersistence", "Starting transaction:", t);
            const s = "readonly" === e ? "readonly" : "readwrite";
            let i;
            // Do all transactions as readwrite against all object stores, since we
            // are the only reader/writer.
                    return this.jo.runTransaction(s, Pi, s => (i = new Di(s, this.Mo ? this.Mo.next() : ls.Ss), 
            "readwrite-primary" === e ? this.eh(i).next(t => !!t || this.nh(i)).next(e => {
                if (!e) throw g$1(`Failed to obtain primary lease for action '${t}'.`), this.isPrimary = !1, 
                this.Cs.Fi(() => this.Wo(!1)), new D$1(C$1.FAILED_PRECONDITION, hs);
                return n(i);
            }).next(t => this.ih(i).next(() => t)) : this.Vh(i).next(() => n(i)))).then(t => (i.ss(), 
            t));
        }
        /**
         * Verifies that the current tab is the primary leaseholder or alternatively
         * that the leaseholder has opted into multi-tab synchronization.
         */
        // TODO(b/114226234): Remove this check when `synchronizeTabs` can no longer
        // be turned off.
        Vh(t) {
            return xi(t).get(ai.key).next(t => {
                if (null !== t && this.ah(t.leaseTimestampMs, 5e3) && !this._h(t.ownerId) && !this.rh(t) && !(this.Fo || this.allowTabSynchronization && t.allowTabSynchronization)) throw new D$1(C$1.FAILED_PRECONDITION, Ci);
            });
        }
        /**
         * Obtains or extends the new primary lease for the local client. This
         * method does not verify that the client is eligible for this lease.
         */    ih(t) {
            const e = new ai(this.clientId, this.allowTabSynchronization, Date.now());
            return xi(t).put(ai.key, e);
        }
        static Qs() {
            return ds.Qs();
        }
        /** Checks the primary lease and removes it if we are the current primary. */    sh(t) {
            const e = xi(t);
            return e.get(ai.key).next(t => this.rh(t) ? (V$1("IndexedDbPersistence", "Releasing primary lease."), 
            e.delete(ai.key)) : rs.resolve());
        }
        /** Verifies that `updateTimeMs` is within `maxAgeMs`. */    ah(t, e) {
            const n = Date.now();
            return !(t < n - e) && (!(t > n) || (g$1(`Detected an update time that is in the future: ${t} > ${n}`), 
            !1));
        }
        Ho() {
            null !== this.document && "function" == typeof this.document.addEventListener && (this.qo = () => {
                this.Cs.Ri(() => (this.inForeground = "visible" === this.document.visibilityState, 
                this.zo()));
            }, this.document.addEventListener("visibilitychange", this.qo), this.inForeground = "visible" === this.document.visibilityState);
        }
        wh() {
            this.qo && (this.document.removeEventListener("visibilitychange", this.qo), this.qo = null);
        }
        /**
         * Attaches a window.unload handler that will synchronously write our
         * clientId to a "zombie client id" location in LocalStorage. This can be used
         * by tabs trying to acquire the primary lease to determine that the lease
         * is no longer valid even if the timestamp is recent. This is particularly
         * important for the refresh case (so the tab correctly re-acquires the
         * primary lease). LocalStorage is used for this rather than IndexedDb because
         * it is a synchronous API and so can be used reliably from  an unload
         * handler.
         */    Jo() {
            var t;
            "function" == typeof (null === (t = this.window) || void 0 === t ? void 0 : t.addEventListener) && (this.Lo = () => {
                // Note: In theory, this should be scheduled on the AsyncQueue since it
                // accesses internal state. We execute this code directly during shutdown
                // to make sure it gets a chance to run.
                this.dh(), this.Cs.Ri(() => this.fh());
            }, this.window.addEventListener("unload", this.Lo));
        }
        Th() {
            this.Lo && (this.window.removeEventListener("unload", this.Lo), this.Lo = null);
        }
        /**
         * Returns whether a client is "zombied" based on its LocalStorage entry.
         * Clients become zombied when their tab closes without running all of the
         * cleanup logic in `shutdown()`.
         */    _h(t) {
            var e;
            try {
                const n = null !== (null === (e = this.Go) || void 0 === e ? void 0 : e.getItem(this.lh(t)));
                return V$1("IndexedDbPersistence", `Client '${t}' ${n ? "is" : "is not"} zombied in LocalStorage`), 
                n;
            } catch (t) {
                // Gracefully handle if LocalStorage isn't working.
                return g$1("IndexedDbPersistence", "Failed to get zombied client id.", t), !1;
            }
        }
        /**
         * Record client as zombied (a client that had its tab closed). Zombied
         * clients are ignored during primary tab selection.
         */    dh() {
            if (this.Go) try {
                this.Go.setItem(this.lh(this.clientId), String(Date.now()));
            } catch (t) {
                // Gracefully handle if LocalStorage isn't available / working.
                g$1("Failed to set zombie client id.", t);
            }
        }
        /** Removes the zombied client entry if it exists. */    Eh() {
            if (this.Go) try {
                this.Go.removeItem(this.lh(this.clientId));
            } catch (t) {
                // Ignore
            }
        }
        lh(t) {
            return `firestore_zombie_${this.persistenceKey}_${t}`;
        }
    }

    /**
     * Helper to get a typed SimpleDbStore for the primary client object store.
     */ function xi(t) {
        return Ni.Js(t, ai.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the client metadata object store.
     */ function ki(t) {
        return Ni.Js(t, mi.store);
    }

    /** Provides LRU functionality for IndexedDB persistence. */ class Oi {
        constructor(t, e) {
            this.db = t, this.ur = new Ns(this, e);
        }
        Ir(t) {
            const e = this.gh(t);
            return this.db.Rh().bo(t).next(t => e.next(e => t + e));
        }
        gh(t) {
            let e = 0;
            return this.Rr(t, t => {
                e++;
            }).next(() => e);
        }
        Fe(t, e) {
            return this.db.Rh().Fe(t, e);
        }
        Rr(t, e) {
            return this.yh(t, (t, n) => e(n));
        }
        Co(t, e, n) {
            return Fi(t, n);
        }
        No(t, e, n) {
            return Fi(t, n);
        }
        mr(t, e, n) {
            return this.db.Rh().mr(t, e, n);
        }
        Ur(t, e) {
            return Fi(t, e);
        }
        /**
         * Returns true if anything would prevent this document from being garbage
         * collected, given that the document in question is not present in any
         * targets and has a sequence number less than or equal to the upper bound for
         * the collection run.
         */    ph(t, e) {
            return function(t, e) {
                let n = !1;
                return Xs(t)._i(s => zs(t, s, e).next(t => (t && (n = !0), rs.resolve(!t)))).next(() => n);
            }(t, e);
        }
        Pr(t, e) {
            const n = this.db.mh().so(), s = [];
            let i = 0;
            return this.yh(t, (r, o) => {
                if (o <= e) {
                    const e = this.ph(t, r).next(e => {
                        if (!e) 
                        // Our size accounting requires us to read all documents before
                        // removing them.
                        return i++, n.Yn(t, r).next(() => (n.Jn(r), Si(t).delete([ 0, xs(r.path) ])));
                    });
                    s.push(e);
                }
            }).next(() => rs.Wn(s)).next(() => n.apply(t)).next(() => i);
        }
        removeTarget(t, e) {
            const n = e.ut(t.ko);
            return this.db.Rh().Vo(t, n);
        }
        bh(t, e) {
            return Fi(t, e);
        }
        /**
         * Call provided function for each document in the cache that is 'orphaned'. Orphaned
         * means not a part of any target, so the only entry in the target-document index for
         * that document will be the sentinel row (targetId 0), which will also have the sequence
         * number for the last time the document was accessed.
         */    yh(t, e) {
            const n = Si(t);
            let s, i = ls.Ss;
            return n.li({
                index: Ei.documentTargetsIndex
            }, ([t, n], {path: r, sequenceNumber: o}) => {
                0 === t ? (
                // if nextToReport is valid, report it, this is a new key so the
                // last one must not be a member of any targets.
                i !== ls.Ss && e(new j(Fs(s)), i), 
                // set nextToReport to be this sequence number. It's the next one we
                // might report, if we don't find any targets for this document.
                // Note that the sequence number must be defined when the targetId
                // is 0.
                i = o, s = r) : 
                // set nextToReport to be invalid, we know we don't need to report
                // this one since we found a target for it.
                i = ls.Ss;
            }).next(() => {
                // Since we report sequence numbers after getting to the next key, we
                // need to check if the last key we iterated over was an orphaned
                // document and report it.
                i !== ls.Ss && e(new j(Fs(s)), i);
            });
        }
        gr(t) {
            return this.db.mh().oo(t);
        }
    }

    function Fi(t, e) {
        return Si(t).put(
        /**
     * @return A value suitable for writing a sentinel row in the target-document
     * store.
     */
        function(t, e) {
            return new Ei(0, xs(t.path), e);
        }(e, t.ko));
    }

    /**
     * Generates a string used as a prefix when storing data in IndexedDB and
     * LocalStorage.
     */ function Mi(t, e) {
        // Use two different prefix formats:
        //   * firestore / persistenceKey / projectID . databaseID / ...
        //   * firestore / persistenceKey / projectID / ...
        // projectIDs are DNS-compatible names and cannot contain dots
        // so there's no danger of collisions.
        let n = t.projectId;
        return t.nt || (n += "." + t.database), "firestore/" + e + "/" + n + "/";
    }

    async function $i(t) {
        if (!ds.Qs()) return Promise.resolve();
        const e = t + "main";
        await ds.delete(e);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Implements `LocalStore` interface.
     *
     * Note: some field defined in this class might have public access level, but
     * the class is not exported so they are only accessible from this module.
     * This is useful to implement optional features (like bundles) in free
     * functions, such that they are tree-shakeable.
     */
    class Li {
        constructor(
        /** Manages our in-memory or durable persistence. */
        t, e, n) {
            this.persistence = t, this.vh = e, 
            /**
             * Maps a targetID to data about its target.
             *
             * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
             * of `applyRemoteEvent()` idempotent.
             */
            this.Sh = new ct(F$1), 
            /** Maps a target to its targetID. */
            // TODO(wuandy): Evaluate if TargetId can be part of Target.
            this.Ch = new is(t => Z$1(t), et), 
            /**
             * The read time of the last entry processed by `getNewDocumentChanges()`.
             *
             * PORTING NOTE: This is only used for multi-tab synchronization.
             */
            this.Dh = q$1.min(), this.os = t.Ah(n), this.Nh = t.mh(), this.Qo = t.Rh(), this.xh = new us(this.Nh, this.os, this.persistence.Ph()), 
            this.vh.kh(this.xh);
        }
        async Oh(t) {
            let e = this.os, n = this.xh;
            const s = await this.persistence.runTransaction("Handle user change", "readonly", s => {
                // Swap out the mutation queue, grabbing the pending mutation batches
                // before and after.
                let i;
                return this.os.Mr(s).next(r => (i = r, e = this.persistence.Ah(t), 
                // Recreate our LocalDocumentsView using the new
                // MutationQueue.
                n = new us(this.Nh, e, this.persistence.Ph()), e.Mr(s))).next(t => {
                    const e = [], r = [];
                    // Union the old/new changed keys.
                    let o = Pt();
                    for (const t of i) {
                        e.push(t.batchId);
                        for (const e of t.mutations) o = o.add(e.key);
                    }
                    for (const e of t) {
                        r.push(e.batchId);
                        for (const t of e.mutations) o = o.add(t.key);
                    }
                    // Return the set of all (potentially) changed documents and the list
                    // of mutation batch IDs that were affected by change.
                                    return n._s(s, o).next(t => ({
                        Fh: t,
                        Mh: e,
                        $h: r
                    }));
                });
            });
            return this.os = e, this.xh = n, this.vh.kh(this.xh), s;
        }
        Lh(t) {
            const e = L$1.now(), n = t.reduce((t, e) => t.add(e.key), Pt());
            let s;
            return this.persistence.runTransaction("Locally write mutations", "readwrite", i => this.xh._s(i, n).next(n => {
                s = n;
                // For non-idempotent mutations (such as `FieldValue.increment()`),
                // we record the base state in a separate patch mutation. This is
                // later used to guarantee consistent values and prevents flicker
                // even if the backend sends us an update that already includes our
                // transform.
                const r = [];
                for (const e of t) {
                    const t = un(e, s.get(e.key));
                    null != t && 
                    // NOTE: The base state should only be applied if there's some
                    // existing document to override, so use a Precondition of
                    // exists=true
                    r.push(new fn(e.key, t, Pn(t.proto.mapValue), sn.exists(!0)));
                }
                return this.os.Dr(i, e, r, t);
            })).then(t => {
                const e = t.Sn(s);
                return {
                    batchId: t.batchId,
                    jn: e
                };
            });
        }
        qh(t) {
            return this.persistence.runTransaction("Acknowledge batch", "readwrite-primary", e => {
                const n = t.batch.keys(), s = this.Nh.so({
                    ro: !0
                });
                return this.Bh(e, t, s).next(() => s.apply(e)).next(() => this.os.Wr(e)).next(() => this.xh._s(e, n));
            });
        }
        Uh(t) {
            return this.persistence.runTransaction("Reject batch", "readwrite-primary", e => {
                let n;
                return this.os.xr(e, t).next(t => (v$1(null !== t), n = t.keys(), this.os.Lr(e, t))).next(() => this.os.Wr(e)).next(() => this.xh._s(e, n));
            });
        }
        Fr() {
            return this.persistence.runTransaction("Get highest unacknowledged batch id", "readonly", t => this.os.Fr(t));
        }
        Eo() {
            return this.persistence.runTransaction("Get last remote snapshot version", "readonly", t => this.Qo.Eo(t));
        }
        Wh(t) {
            const e = t.at;
            let n = this.Sh;
            return this.persistence.runTransaction("Apply remote event", "readwrite-primary", s => {
                const i = this.Nh.so({
                    ro: !0
                });
                // Reset newTargetDataByTargetMap in case this transaction gets re-run.
                            n = this.Sh;
                const r = [];
                t.Zt.forEach((t, i) => {
                    const o = n.get(i);
                    if (!o) return;
                    // Only update the remote keys if the target is still active. This
                    // ensures that we can persist the updated target data along with
                    // the updated assignment.
                                    r.push(this.Qo.Do(s, t.ae, i).next(() => this.Qo.So(s, t.oe, i)));
                    const h = t.resumeToken;
                    // Update the resume token if the change includes one.
                                    if (h.rt() > 0) {
                        const a = o.ct(h, e).ut(s.ko);
                        n = n._t(i, a), 
                        // Update the target data if there are target changes (or if
                        // sufficient time has passed since the last update).
                        Li.Kh(o, a, t) && r.push(this.Qo.Vo(s, a));
                    }
                });
                let o = Tt(), h = Pt();
                // HACK: The only reason we allow a null snapshot version is so that we
                // can synthesize remote events when we get permission denied errors while
                // trying to resolve the state of a locally cached document that is in
                // limbo.
                if (t.ee.forEach((t, e) => {
                    h = h.add(t);
                }), 
                // Each loop iteration only affects its "own" doc, so it's safe to get all the remote
                // documents in advance in a single call.
                r.push(i.getEntries(s, h).next(n => {
                    t.ee.forEach((h, a) => {
                        const u = n.get(h);
                        // Note: The order of the steps below is important, since we want
                        // to ensure that rejected limbo resolutions (which fabricate
                        // NoDocuments with SnapshotVersion.min()) never add documents to
                        // cache.
                                            a instanceof yn && a.version.isEqual(q$1.min()) ? (
                        // NoDocuments with SnapshotVersion.min() are used in manufactured
                        // events. We remove these documents from cache since we lost
                        // access.
                        i.Jn(h, e), o = o._t(h, a)) : null == u || a.version.p(u.version) > 0 || 0 === a.version.p(u.version) && u.hasPendingWrites ? (i.zn(a, e), 
                        o = o._t(h, a)) : V$1("LocalStore", "Ignoring outdated watch update for ", h, ". Current version:", u.version, " Watch version:", a.version), 
                        t.ne.has(h) && r.push(this.persistence.br.bh(s, h));
                    });
                })), !e.isEqual(q$1.min())) {
                    const t = this.Qo.Eo(s).next(t => this.Qo.Ao(s, s.ko, e));
                    r.push(t);
                }
                return rs.Wn(r).next(() => i.apply(s)).next(() => this.xh.fs(s, o));
            }).then(t => (this.Sh = n, t));
        }
        /**
         * Returns true if the newTargetData should be persisted during an update of
         * an active target. TargetData should always be persisted when a target is
         * being released and should not call this function.
         *
         * While the target is active, TargetData updates can be omitted when nothing
         * about the target has changed except metadata like the resume token or
         * snapshot version. Occasionally it's worth the extra write to prevent these
         * values from getting too stale after a crash, but this doesn't have to be
         * too frequent.
         */    static Kh(t, e, n) {
            // Always persist target data if we don't already have a resume token.
            if (v$1(e.resumeToken.rt() > 0), 0 === t.resumeToken.rt()) return !0;
            // Don't allow resume token changes to be buffered indefinitely. This
            // allows us to be reasonably up-to-date after a crash and avoids needing
            // to loop over all active queries on shutdown. Especially in the browser
            // we may not get time to do anything interesting while the current tab is
            // closing.
                    if (e.at.v() - t.at.v() >= this.jh) return !0;
            // Otherwise if the only thing that has changed about a target is its resume
            // token it's not worth persisting. Note that the RemoteStore keeps an
            // in-memory view of the currently active targets which includes the current
            // resume token, so stream failure or user changes will still use an
            // up-to-date resume token regardless of what we do here.
                    return n.oe.size + n.he.size + n.ae.size > 0;
        }
        async Qh(t) {
            try {
                await this.persistence.runTransaction("notifyLocalViewChanges", "readwrite", e => rs.forEach(t, t => rs.forEach(t.Ps, n => this.persistence.br.Co(e, t.targetId, n)).next(() => rs.forEach(t.Vs, n => this.persistence.br.No(e, t.targetId, n)))));
            } catch (t) {
                if (!Es(t)) throw t;
                // If `notifyLocalViewChanges` fails, we did not advance the sequence
                // number for the documents that were included in this transaction.
                // This might trigger them to be deleted earlier than they otherwise
                // would have, but it should not invalidate the integrity of the data.
                V$1("LocalStore", "Failed to update sequence numbers: " + t);
            }
            for (const e of t) {
                const t = e.targetId;
                if (!e.fromCache) {
                    const e = this.Sh.get(t), n = e.at, s = e.lt(n);
                    // Advance the last limbo free snapshot version
                                    this.Sh = this.Sh._t(t, s);
                }
            }
        }
        Gh(t) {
            return this.persistence.runTransaction("Get next mutation batch", "readonly", e => (void 0 === t && (t = -1), 
            this.os.Or(e, t)));
        }
        zh(t) {
            return this.persistence.runTransaction("read document", "readonly", e => this.xh.as(e, t));
        }
        Hh(t) {
            return this.persistence.runTransaction("Allocate target", "readwrite", e => {
                let n;
                return this.Qo.vo(e, t).next(s => s ? (
                // This target has been listened to previously, so reuse the
                // previous targetID.
                // TODO(mcg): freshen last accessed date?
                n = s, rs.resolve(n)) : this.Qo.do(e).next(s => (n = new it(t, s, 0 /* Listen */ , e.ko), 
                this.Qo.Ro(e, n).next(() => n))));
            }).then(e => {
                // If Multi-Tab is enabled, the existing target data may be newer than
                // the in-memory data
                const n = this.Sh.get(e.targetId);
                return (null === n || e.at.p(n.at) > 0) && (this.Sh = this.Sh._t(e.targetId, e), 
                this.Ch.set(t, e.targetId)), e;
            });
        }
        vo(t, e) {
            const n = this.Ch.get(e);
            return void 0 !== n ? rs.resolve(this.Sh.get(n)) : this.Qo.vo(t, e);
        }
        async Jh(t, e) {
            const n = this.Sh.get(t), s = e ? "readwrite" : "readwrite-primary";
            try {
                e || await this.persistence.runTransaction("Release target", s, t => this.persistence.br.removeTarget(t, n));
            } catch (e) {
                if (!Es(e)) throw e;
                // All `releaseTarget` does is record the final metadata state for the
                // target, but we've been recording this periodically during target
                // activity. If we lose this write this could cause a very slight
                // difference in the order of target deletion during GC, but we
                // don't define exact LRU semantics so this is acceptable.
                V$1("LocalStore", `Failed to update sequence numbers for target ${t}: ${e}`);
            }
            this.Sh = this.Sh.remove(t), this.Ch.delete(n.target);
        }
        Yh(t, e) {
            let n = q$1.min(), s = Pt();
            return this.persistence.runTransaction("Execute query", "readonly", i => this.vo(i, xn(t)).next(t => {
                if (t) return n = t.lastLimboFreeSnapshotVersion, this.Qo.xo(i, t.targetId).next(t => {
                    s = t;
                });
            }).next(() => this.vh.ws(i, t, e ? n : q$1.min(), e ? s : Pt())).next(t => ({
                documents: t,
                Xh: s
            })));
        }
        Bh(t, e, n) {
            const s = e.batch, i = s.keys();
            let r = rs.resolve();
            return i.forEach(i => {
                r = r.next(() => n.Yn(t, i)).next(t => {
                    let r = t;
                    const o = e.Dn.get(i);
                    v$1(null !== o), (!r || r.version.p(o) < 0) && (r = s.pn(i, r, e), r && 
                    // We use the commitVersion as the readTime rather than the
                    // document's updateTime since the updateTime is not advanced
                    // for updates that do not modify the underlying document.
                    n.zn(r, e.Cn));
                });
            }), r.next(() => this.os.Lr(t, s));
        }
        wr(t) {
            return this.persistence.runTransaction("Collect garbage", "readwrite-primary", e => t.Vr(e, this.Sh));
        }
    }

    /**
     * The maximum time to leave a resume token buffered without writing it out.
     * This value is arbitrary: it's long enough to avoid several writes
     * (possibly indefinitely if updates come more frequently than this) but
     * short enough that restarting after crashing will still have a pretty
     * recent resume token.
     */
    // PORTING NOTE: Multi-Tab only.
    function qi(t, e) {
        const n = S$1(t), s = S$1(n.Qo), i = n.Sh.get(e);
        return i ? Promise.resolve(i.target) : n.persistence.runTransaction("Get target data", "readonly", t => s.Ge(t, e).next(t => t ? t.target : null));
    }

    /**
     * Returns the set of documents that have been updated since the last call.
     * If this is the first call, returns the set of changes since client
     * initialization. Further invocations will return document that have changed
     * since the prior call.
     */
    // PORTING NOTE: Multi-Tab only.
    /**
     * Verifies the error thrown by a LocalStore operation. If a LocalStore
     * operation fails because the primary lease has been taken by another client,
     * we ignore the error (the persistence layer will immediately call
     * `applyPrimaryLease` to propagate the primary state change). All other errors
     * are re-thrown.
     *
     * @param err An error returned by a LocalStore operation.
     * @return A Promise that resolves after we recovered, or the original error.
     */
    async function Bi(t) {
        if (t.code !== C$1.FAILED_PRECONDITION || t.message !== hs) throw t;
        V$1("LocalStore", "Unexpectedly lost primary lease");
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ Li.jh = 3e8;

    /**
     * A PersistentStream is an abstract base class that represents a streaming RPC
     * to the Firestore backend. It's built on top of the connections own support
     * for streaming RPCs, and adds several critical features for our clients:
     *
     *   - Exponential backoff on failure
     *   - Authentication via CredentialsProvider
     *   - Dispatching all callbacks into the shared worker queue
     *   - Closing idle streams after 60 seconds of inactivity
     *
     * Subclasses of PersistentStream implement serialization of models to and
     * from the JSON representation of the protocol buffers for a specific
     * streaming RPC.
     *
     * ## Starting and Stopping
     *
     * Streaming RPCs are stateful and need to be start()ed before messages can
     * be sent and received. The PersistentStream will call the onOpen() function
     * of the listener once the stream is ready to accept requests.
     *
     * Should a start() fail, PersistentStream will call the registered onClose()
     * listener with a FirestoreError indicating what went wrong.
     *
     * A PersistentStream can be started and stopped repeatedly.
     *
     * Generic types:
     *  SendType: The type of the outgoing message of the underlying
     *    connection stream
     *  ReceiveType: The type of the incoming message of the underlying
     *    connection stream
     *  ListenerType: The type of the listener that will be used for callbacks
     */
    class Ui {
        constructor(t, e, n, s, i, r) {
            this.Cs = t, this.Zh = n, this.ta = s, this.ea = i, this.listener = r, this.state = 0 /* Initial */ , 
            /**
             * A close count that's incremented every time the stream is closed; used by
             * getCloseGuardedDispatcher() to invalidate callbacks that happen after
             * close.
             */
            this.na = 0, this.sa = null, this.stream = null, this.vi = new fs(t, e);
        }
        /**
         * Returns true if start() has been called and no error has occurred. True
         * indicates the stream is open or in the process of opening (which
         * encompasses respecting backoff, getting auth tokens, and starting the
         * actual RPC). Use isOpen() to determine if the stream is open and ready for
         * outbound requests.
         */    ia() {
            return 1 /* Starting */ === this.state || 2 /* Open */ === this.state || 4 /* Backoff */ === this.state;
        }
        /**
         * Returns true if the underlying RPC is open (the onOpen() listener has been
         * called) and the stream is ready for outbound requests.
         */    ra() {
            return 2 /* Open */ === this.state;
        }
        /**
         * Starts the RPC. Only allowed if isStarted() returns false. The stream is
         * not immediately ready for use: onOpen() will be invoked when the RPC is
         * ready for outbound requests, at which point isOpen() will return true.
         *
         * When start returns, isStarted() will return true.
         */    start() {
            3 /* Error */ !== this.state ? this.auth() : this.oa();
        }
        /**
         * Stops the RPC. This call is idempotent and allowed regardless of the
         * current isStarted() state.
         *
         * When stop returns, isStarted() and isOpen() will both return false.
         */    async stop() {
            this.ia() && await this.close(0 /* Initial */);
        }
        /**
         * After an error the stream will usually back off on the next attempt to
         * start it. If the error warrants an immediate restart of the stream, the
         * sender can use this to indicate that the receiver should not back off.
         *
         * Each error will call the onClose() listener. That function can decide to
         * inhibit backoff if required.
         */    ha() {
            this.state = 0 /* Initial */ , this.vi.reset();
        }
        /**
         * Marks this stream as idle. If no further actions are performed on the
         * stream for one minute, the stream will automatically close itself and
         * notify the stream's onClose() handler with Status.OK. The stream will then
         * be in a !isStarted() state, requiring the caller to start the stream again
         * before further use.
         *
         * Only streams that are in state 'Open' can be marked idle, as all other
         * states imply pending network operations.
         */    aa() {
            // Starts the idle time if we are in state 'Open' and are not yet already
            // running a timer (in which case the previous idle timeout still applies).
            this.ra() && null === this.sa && (this.sa = this.Cs.Bs(this.Zh, 6e4, () => this.ua()));
        }
        /** Sends a message to the underlying stream. */    ca(t) {
            this.la(), this.stream.send(t);
        }
        /** Called by the idle timer when the stream should close due to inactivity. */    async ua() {
            if (this.ra()) 
            // When timing out an idle stream there's no reason to force the stream into backoff when
            // it restarts so set the stream state to Initial instead of Error.
            return this.close(0 /* Initial */);
        }
        /** Marks the stream as active again. */    la() {
            this.sa && (this.sa.cancel(), this.sa = null);
        }
        /**
         * Closes the stream and cleans up as necessary:
         *
         * * closes the underlying GRPC stream;
         * * calls the onClose handler with the given 'error';
         * * sets internal stream state to 'finalState';
         * * adjusts the backoff timer based on the error
         *
         * A new stream can be opened by calling start().
         *
         * @param finalState the intended state of the stream after closing.
         * @param error the error the connection was closed with.
         */    async close(t, e) {
            // Cancel any outstanding timers (they're guaranteed not to execute).
            this.la(), this.vi.cancel(), 
            // Invalidates any stream-related callbacks (e.g. from auth or the
            // underlying stream), guaranteeing they won't execute.
            this.na++, 3 /* Error */ !== t ? 
            // If this is an intentional close ensure we don't delay our next connection attempt.
            this.vi.reset() : e && e.code === C$1.RESOURCE_EXHAUSTED ? (
            // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
            g$1(e.toString()), g$1("Using maximum backoff delay to prevent overloading the backend."), 
            this.vi.$s()) : e && e.code === C$1.UNAUTHENTICATED && 
            // "unauthenticated" error means the token was rejected. Try force refreshing it in case it
            // just expired.
            this.ea.A(), 
            // Clean up the underlying stream because we are no longer interested in events.
            null !== this.stream && (this._a(), this.stream.close(), this.stream = null), 
            // This state must be assigned before calling onClose() to allow the callback to
            // inhibit backoff or otherwise manipulate the state in its non-started state.
            this.state = t, 
            // Notify the listener that the stream closed.
            await this.listener.fa(e);
        }
        /**
         * Can be overridden to perform additional cleanup before the stream is closed.
         * Calling super.tearDown() is not required.
         */    _a() {}
        auth() {
            this.state = 1 /* Starting */;
            const t = this.da(this.na), e = this.na;
            // TODO(mikelehen): Just use dispatchIfNotClosed, but see TODO below.
                    this.ea.getToken().then(t => {
                // Stream can be stopped while waiting for authentication.
                // TODO(mikelehen): We really should just use dispatchIfNotClosed
                // and let this dispatch onto the queue, but that opened a spec test can
                // of worms that I don't want to deal with in this PR.
                this.na === e && 
                // Normally we'd have to schedule the callback on the AsyncQueue.
                // However, the following calls are safe to be called outside the
                // AsyncQueue since they don't chain asynchronous calls
                this.wa(t);
            }, e => {
                t(() => {
                    const t = new D$1(C$1.UNKNOWN, "Fetching auth token failed: " + e.message);
                    return this.Ta(t);
                });
            });
        }
        wa(t) {
            const e = this.da(this.na);
            this.stream = this.Ea(t), this.stream.Ia(() => {
                e(() => (this.state = 2 /* Open */ , this.listener.Ia()));
            }), this.stream.fa(t => {
                e(() => this.Ta(t));
            }), this.stream.onMessage(t => {
                e(() => this.onMessage(t));
            });
        }
        oa() {
            this.state = 4 /* Backoff */ , this.vi.Ls(async () => {
                this.state = 0 /* Initial */ , this.start();
            });
        }
        // Visible for tests
        Ta(t) {
            // In theory the stream could close cleanly, however, in our current model
            // we never expect this to happen because if we stop a stream ourselves,
            // this callback will never be called. To prevent cases where we retry
            // without a backoff accidentally, we set the stream to error in all cases.
            return V$1("PersistentStream", "close with error: " + t), this.stream = null, this.close(3 /* Error */ , t);
        }
        /**
         * Returns a "dispatcher" function that dispatches operations onto the
         * AsyncQueue but only runs them if closeCount remains unchanged. This allows
         * us to turn auth / stream callbacks into no-ops if the stream is closed /
         * re-opened, etc.
         */    da(t) {
            return e => {
                this.Cs.Ri(() => this.na === t ? e() : (V$1("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), 
                Promise.resolve()));
            };
        }
    }

    /**
     * A PersistentStream that implements the Listen RPC.
     *
     * Once the Listen stream has called the onOpen() listener, any number of
     * listen() and unlisten() calls can be made to control what changes will be
     * sent from the server for ListenResponses.
     */ class Wi extends Ui {
        constructor(t, e, n, s, i) {
            super(t, "listen_stream_connection_backoff" /* ListenStreamConnectionBackoff */ , "listen_stream_idle" /* ListenStreamIdle */ , e, n, i), 
            this.serializer = s;
        }
        Ea(t) {
            return this.ta.Aa("Listen", t);
        }
        onMessage(t) {
            // A successful response means the stream is healthy
            this.vi.reset();
            const e = ye(this.serializer, t), n = function(t) {
                // We have only reached a consistent snapshot for the entire stream if there
                // is a read_time set and it applies to all targets (i.e. the list of
                // targets is empty). The backend is guaranteed to send such responses.
                if (!("targetChange" in t)) return q$1.min();
                const e = t.targetChange;
                return e.targetIds && e.targetIds.length ? q$1.min() : e.readTime ? de(e.readTime) : q$1.min();
            }(t);
            return this.listener.Ra(e, n);
        }
        /**
         * Registers interest in the results of the given target. If the target
         * includes a resumeToken it will be included in the request. Results that
         * affect the target will be streamed back as WatchChange messages that
         * reference the targetId.
         */    ma(t) {
            const e = {};
            e.database = me(this.serializer), e.addTarget = function(t, e) {
                let n;
                const s = e.target;
                return n = nt(s) ? {
                    documents: Se(t, s)
                } : {
                    query: Ce(t, s)
                }, n.targetId = e.targetId, e.resumeToken.rt() > 0 && (n.resumeToken = _e(t, e.resumeToken)), 
                n;
            }(this.serializer, t);
            const n = Ne(this.serializer, t);
            n && (e.labels = n), this.ca(e);
        }
        /**
         * Unregisters interest in the results of the target associated with the
         * given targetId.
         */    Pa(t) {
            const e = {};
            e.database = me(this.serializer), e.removeTarget = t, this.ca(e);
        }
    }

    /**
     * A Stream that implements the Write RPC.
     *
     * The Write RPC requires the caller to maintain special streamToken
     * state in between calls, to help the server understand which responses the
     * client has processed by the time the next request is made. Every response
     * will contain a streamToken; this value must be passed to the next
     * request.
     *
     * After calling start() on this stream, the next request must be a handshake,
     * containing whatever streamToken is on hand. Once a response to this
     * request is received, all pending mutations may be submitted. When
     * submitting multiple batches of mutations at the same time, it's
     * okay to use the same streamToken for the calls to writeMutations.
     *
     * TODO(b/33271235): Use proto types
     */ class Ki extends Ui {
        constructor(t, e, n, s, i) {
            super(t, "write_stream_connection_backoff" /* WriteStreamConnectionBackoff */ , "write_stream_idle" /* WriteStreamIdle */ , e, n, i), 
            this.serializer = s, this.Va = !1;
        }
        /**
         * Tracks whether or not a handshake has been successfully exchanged and
         * the stream is ready to accept mutations.
         */    get ga() {
            return this.Va;
        }
        // Override of PersistentStream.start
        start() {
            this.Va = !1, this.lastStreamToken = void 0, super.start();
        }
        _a() {
            this.Va && this.ya([]);
        }
        Ea(t) {
            return this.ta.Aa("Write", t);
        }
        onMessage(t) {
            if (
            // Always capture the last stream token.
            v$1(!!t.streamToken), this.lastStreamToken = t.streamToken, this.Va) {
                // A successful first write response means the stream is healthy,
                // Note, that we could consider a successful handshake healthy, however,
                // the write itself might be causing an error we want to back off from.
                this.vi.reset();
                const e = ve(t.writeResults, t.commitTime), n = de(t.commitTime);
                return this.listener.pa(n, e);
            }
            // The first response is always the handshake response
            return v$1(!t.writeResults || 0 === t.writeResults.length), this.Va = !0, this.listener.ba();
        }
        /**
         * Sends an initial streamToken to the server, performing the handshake
         * required to make the StreamingWrite RPC work. Subsequent
         * calls should wait until onHandshakeComplete was called.
         */    va() {
            // TODO(dimond): Support stream resumption. We intentionally do not set the
            // stream token on the handshake, ignoring any stream token we might have.
            const t = {};
            t.database = me(this.serializer), this.ca(t);
        }
        /** Sends a group of mutations to the Firestore backend to apply. */    ya(t) {
            const e = {
                streamToken: this.lastStreamToken,
                writes: t.map(t => pe(this.serializer, t))
            };
            this.ca(e);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Datastore and its related methods are a wrapper around the external Google
     * Cloud Datastore grpc API, which provides an interface that is more convenient
     * for the rest of the client SDK architecture to consume.
     */
    /**
     * An implementation of Datastore that exposes additional state for internal
     * consumption.
     */
    class ji extends class {} {
        constructor(t, e) {
            super(), this.credentials = t, this.serializer = e, this.Sa = !1;
        }
        Ca() {
            if (this.Sa) throw new D$1(C$1.FAILED_PRECONDITION, "The client has already been terminated.");
        }
        start(t) {
            this.ta = t;
        }
        /** Gets an auth token and invokes the provided RPC. */    Da(t, e, n) {
            return this.Ca(), this.credentials.getToken().then(s => this.ta.Da(t, e, n, s)).catch(t => {
                throw t.code === C$1.UNAUTHENTICATED && this.credentials.A(), t;
            });
        }
        /** Gets an auth token and invokes the provided RPC with streamed results. */    Na(t, e, n) {
            return this.Ca(), this.credentials.getToken().then(s => this.ta.Na(t, e, n, s)).catch(t => {
                throw t.code === C$1.UNAUTHENTICATED && this.credentials.A(), t;
            });
        }
        async xa() {
            this.Sa = !1;
        }
    }

    // TODO(firestorexp): Make sure there is only one Datastore instance per
    // firestore-exp client.
    function Qi(t, e) {
        return new ji(t, e);
    }

    /**
     * A component used by the RemoteStore to track the OnlineState (that is,
     * whether or not the client as a whole should be considered to be online or
     * offline), implementing the appropriate heuristics.
     *
     * In particular, when the client is trying to connect to the backend, we
     * allow up to MAX_WATCH_STREAM_FAILURES within ONLINE_STATE_TIMEOUT_MS for
     * a connection to succeed. If we have too many failures or the timeout elapses,
     * then we set the OnlineState to Offline, and the client will behave as if
     * it is offline (get()s will return cached data, etc.).
     */
    class Gi {
        constructor(t, e) {
            this.fi = t, this.ka = e, 
            /** The current OnlineState. */
            this.state = "Unknown" /* Unknown */ , 
            /**
             * A count of consecutive failures to open the stream. If it reaches the
             * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
             * Offline.
             */
            this.Oa = 0, 
            /**
             * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
             * transition from OnlineState.Unknown to OnlineState.Offline without waiting
             * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
             */
            this.Fa = null, 
            /**
             * Whether the client should log a warning message if it fails to connect to
             * the backend (initially true, cleared after a successful stream, or if we've
             * logged the message already).
             */
            this.Ma = !0;
        }
        /**
         * Called by RemoteStore when a watch stream is started (including on each
         * backoff attempt).
         *
         * If this is the first attempt, it sets the OnlineState to Unknown and starts
         * the onlineStateTimer.
         */    $a() {
            0 === this.Oa && (this.La("Unknown" /* Unknown */), this.Fa = this.fi.Bs("online_state_timeout" /* OnlineStateTimeout */ , 1e4, () => (this.Fa = null, 
            this.qa("Backend didn't respond within 10 seconds."), this.La("Offline" /* Offline */), 
            Promise.resolve())));
        }
        /**
         * Updates our OnlineState as appropriate after the watch stream reports a
         * failure. The first failure moves us to the 'Unknown' state. We then may
         * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
         * actually transition to the 'Offline' state.
         */    Ba(t) {
            "Online" /* Online */ === this.state ? this.La("Unknown" /* Unknown */) : (this.Oa++, 
            this.Oa >= 1 && (this.Ua(), this.qa("Connection failed 1 times. Most recent error: " + t.toString()), 
            this.La("Offline" /* Offline */)));
        }
        /**
         * Explicitly sets the OnlineState to the specified state.
         *
         * Note that this resets our timers / failure counters, etc. used by our
         * Offline heuristics, so must not be used in place of
         * handleWatchStreamStart() and handleWatchStreamFailure().
         */    set(t) {
            this.Ua(), this.Oa = 0, "Online" /* Online */ === t && (
            // We've connected to watch at least once. Don't warn the developer
            // about being offline going forward.
            this.Ma = !1), this.La(t);
        }
        La(t) {
            t !== this.state && (this.state = t, this.ka(t));
        }
        qa(t) {
            const e = `Could not reach Cloud Firestore backend. ${t}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
            this.Ma ? (g$1(e), this.Ma = !1) : V$1("OnlineStateTracker", e);
        }
        Ua() {
            null !== this.Fa && (this.Fa.cancel(), this.Fa = null);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * RemoteStore - An interface to remotely stored data, basically providing a
     * wrapper around the Datastore that is more reliable for the rest of the
     * system.
     *
     * RemoteStore is responsible for maintaining the connection to the server.
     * - maintaining a list of active listens.
     * - reconnecting when the connection is dropped.
     * - resuming all the active listens on reconnect.
     *
     * RemoteStore handles all incoming events from the Datastore.
     * - listening to the watch stream and repackaging the events as RemoteEvents
     * - notifying SyncEngine of any changes to the active listens.
     *
     * RemoteStore takes writes from other components and handles them reliably.
     * - pulling pending mutations from LocalStore and sending them to Datastore.
     * - retrying mutations that failed because of network problems.
     * - acking mutations to the SyncEngine once they are accepted or rejected.
     */
    class zi {
        constructor(
        /**
         * The local store, used to fill the write pipeline with outbound mutations.
         */
        t, 
        /** The client-side proxy for interacting with the backend. */
        e, n, s, i) {
            this.Wa = t, this.Ka = e, this.fi = n, 
            /**
             * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
             * LocalStore via fillWritePipeline() and have or will send to the write
             * stream.
             *
             * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
             * restart the write stream. When the stream is established the writes in the
             * pipeline will be sent in order.
             *
             * Writes remain in writePipeline until they are acknowledged by the backend
             * and thus will automatically be re-sent if the stream is interrupted /
             * restarted before they're acknowledged.
             *
             * Write responses from the backend are linked to their originating request
             * purely based on order, and so we can just shift() writes from the front of
             * the writePipeline as we receive responses.
             */
            this.ja = [], 
            /**
             * A mapping of watched targets that the client cares about tracking and the
             * user has explicitly called a 'listen' for this target.
             *
             * These targets may or may not have been sent to or acknowledged by the
             * server. On re-establishing the listen stream, these targets should be sent
             * to the server. The targets removed with unlistens are removed eagerly
             * without waiting for confirmation from the listen stream.
             */
            this.Qa = new Map, this.Ga = null, 
            /**
             * A set of reasons for why the RemoteStore may be offline. If empty, the
             * RemoteStore may start its network connections.
             */
            this.za = new Set, this.Ha = i, this.Ha.Ja(t => {
                n.Ri(async () => {
                    // Porting Note: Unlike iOS, `restartNetwork()` is called even when the
                    // network becomes unreachable as we don't have any other way to tear
                    // down our streams.
                    this.Ya() && (V$1("RemoteStore", "Restarting streams for network reachability change."), 
                    await this.Xa());
                });
            }), this.Za = new Gi(n, s), 
            // Create streams (but note they're not started yet).
            this.tu = function(t, e, n) {
                const s = S$1(t);
                return s.Ca(), new Wi(e, s.ta, s.credentials, s.serializer, n);
            }
            /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (this.Ka, n, {
                Ia: this.eu.bind(this),
                fa: this.nu.bind(this),
                Ra: this.su.bind(this)
            }), this.iu = function(t, e, n) {
                const s = S$1(t);
                return s.Ca(), new Ki(e, s.ta, s.credentials, s.serializer, n);
            }(this.Ka, n, {
                Ia: this.ru.bind(this),
                fa: this.ou.bind(this),
                ba: this.hu.bind(this),
                pa: this.pa.bind(this)
            });
        }
        /**
         * Starts up the remote store, creating streams, restoring state from
         * LocalStore, etc.
         */    start() {
            return this.enableNetwork();
        }
        /** Re-enables the network. Idempotent. */    enableNetwork() {
            return this.za.delete(0 /* UserDisabled */), this.au();
        }
        async au() {
            this.Ya() && (this.uu() ? this.cu() : this.Za.set("Unknown" /* Unknown */), 
            // This will start the write stream if necessary.
            await this.lu());
        }
        /**
         * Temporarily disables the network. The network can be re-enabled using
         * enableNetwork().
         */    async disableNetwork() {
            this.za.add(0 /* UserDisabled */), await this._u(), 
            // Set the OnlineState to Offline so get()s return from cache, etc.
            this.Za.set("Offline" /* Offline */);
        }
        async _u() {
            await this.iu.stop(), await this.tu.stop(), this.ja.length > 0 && (V$1("RemoteStore", `Stopping write stream with ${this.ja.length} pending writes`), 
            this.ja = []), this.fu();
        }
        async fh() {
            V$1("RemoteStore", "RemoteStore shutting down."), this.za.add(5 /* Shutdown */), await this._u(), 
            this.Ha.fh(), 
            // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
            // triggering spurious listener events with cached data, etc.
            this.Za.set("Unknown" /* Unknown */);
        }
        /**
         * Starts new listen for the given target. Uses resume token if provided. It
         * is a no-op if the target of given `TargetData` is already being listened to.
         */    listen(t) {
            this.Qa.has(t.targetId) || (
            // Mark this as something the client is currently listening for.
            this.Qa.set(t.targetId, t), this.uu() ? 
            // The listen will be sent in onWatchStreamOpen
            this.cu() : this.tu.ra() && this.du(t));
        }
        /**
         * Removes the listen from server. It is a no-op if the given target id is
         * not being listened to.
         */    wu(t) {
            this.Qa.delete(t), this.tu.ra() && this.Tu(t), 0 === this.Qa.size && (this.tu.ra() ? this.tu.aa() : this.Ya() && 
            // Revert to OnlineState.Unknown if the watch stream is not open and we
            // have no listeners, since without any listens to send we cannot
            // confirm if the stream is healthy and upgrade to OnlineState.Online.
            this.Za.set("Unknown" /* Unknown */));
        }
        /** {@link TargetMetadataProvider.getTargetDataForTarget} */    Ge(t) {
            return this.Qa.get(t) || null;
        }
        /** {@link TargetMetadataProvider.getRemoteKeysForTarget} */    Qe(t) {
            return this.Eu.Qe(t);
        }
        /**
         * We need to increment the the expected number of pending responses we're due
         * from watch so we wait for the ack to process any messages from this target.
         */    du(t) {
            this.Ga.ge(t.targetId), this.tu.ma(t);
        }
        /**
         * We need to increment the expected number of pending responses we're due
         * from watch so we wait for the removal on the server before we process any
         * messages from this target.
         */    Tu(t) {
            this.Ga.ge(t), this.tu.Pa(t);
        }
        cu() {
            this.Ga = new kt(this), this.tu.start(), this.Za.$a();
        }
        /**
         * Returns whether the watch stream should be started because it's necessary
         * and has not yet been started.
         */    uu() {
            return this.Ya() && !this.tu.ia() && this.Qa.size > 0;
        }
        Ya() {
            return 0 === this.za.size;
        }
        fu() {
            this.Ga = null;
        }
        async eu() {
            this.Qa.forEach((t, e) => {
                this.du(t);
            });
        }
        async nu(t) {
            this.fu(), 
            // If we still need the watch stream, retry the connection.
            this.uu() ? (this.Za.Ba(t), this.cu()) : 
            // No need to restart watch stream because there are no active targets.
            // The online state is set to unknown because there is no active attempt
            // at establishing a connection
            this.Za.set("Unknown" /* Unknown */);
        }
        async su(t, e) {
            if (
            // Mark the client as online since we got a message from the server
            this.Za.set("Online" /* Online */), t instanceof Nt && 2 /* Removed */ === t.state && t.cause) 
            // There was an error on a target, don't wait for a consistent snapshot
            // to raise events
            try {
                await this.Iu(t);
            } catch (e) {
                V$1("RemoteStore", "Failed to remove targets %s: %s ", t.targetIds.join(","), e), 
                await this.Au(e);
            } else if (t instanceof Ct ? this.Ga.Ne(t) : t instanceof Dt ? this.Ga.qe(t) : this.Ga.Oe(t), 
            !e.isEqual(q$1.min())) try {
                const t = await this.Wa.Eo();
                e.p(t) >= 0 && 
                // We have received a target change with a global snapshot if the snapshot
                // version is not equal to SnapshotVersion.min().
                await this.Ru(e);
            } catch (t) {
                V$1("RemoteStore", "Failed to raise snapshot:", t), await this.Au(t);
            }
        }
        /**
         * Recovery logic for IndexedDB errors that takes the network offline until
         * `op` succeeds. Retries are scheduled with backoff using
         * `enqueueRetryable()`. If `op()` is not provided, IndexedDB access is
         * validated via a generic operation.
         *
         * The returned Promise is resolved once the network is disabled and before
         * any retry attempt.
         */    async Au(t, e) {
            if (!Es(t)) throw t;
            this.za.add(1 /* IndexedDbFailed */), 
            // Disable network and raise offline snapshots
            await this._u(), this.Za.set("Offline" /* Offline */), e || (
            // Use a simple read operation to determine if IndexedDB recovered.
            // Ideally, we would expose a health check directly on SimpleDb, but
            // RemoteStore only has access to persistence through LocalStore.
            e = () => this.Wa.Eo()), 
            // Probe IndexedDB periodically and re-enable network
            this.fi.Fi(async () => {
                V$1("RemoteStore", "Retrying IndexedDB access"), await e(), this.za.delete(1 /* IndexedDbFailed */), 
                await this.au();
            });
        }
        /**
         * Executes `op`. If `op` fails, takes the network offline until `op`
         * succeeds. Returns after the first attempt.
         */    mu(t) {
            return t().catch(e => this.Au(e, t));
        }
        /**
         * Takes a batch of changes from the Datastore, repackages them as a
         * RemoteEvent, and passes that on to the listener, which is typically the
         * SyncEngine.
         */    Ru(t) {
            const e = this.Ga.We(t);
            // Update in-memory resume tokens. LocalStore will update the
            // persistent view of these when applying the completed RemoteEvent.
                    // Finally raise remote event
            return e.Zt.forEach((e, n) => {
                if (e.resumeToken.rt() > 0) {
                    const s = this.Qa.get(n);
                    // A watched target might have been removed already.
                                    s && this.Qa.set(n, s.ct(e.resumeToken, t));
                }
            }), 
            // Re-establish listens for the targets that have been invalidated by
            // existence filter mismatches.
            e.te.forEach(t => {
                const e = this.Qa.get(t);
                if (!e) 
                // A watched target might have been removed already.
                return;
                // Clear the resume token for the target, since we're in a known mismatch
                // state.
                            this.Qa.set(t, e.ct(st.ot, e.at)), 
                // Cause a hard reset by unwatching and rewatching immediately, but
                // deliberately don't send a resume token so that we get a full update.
                this.Tu(t);
                // Mark the target we send as being on behalf of an existence filter
                // mismatch, but don't actually retain that in listenTargets. This ensures
                // that we flag the first re-listen this way without impacting future
                // listens of this target (that might happen e.g. on reconnect).
                const n = new it(e.target, t, 1 /* ExistenceFilterMismatch */ , e.sequenceNumber);
                this.du(n);
            }), this.Eu.Wh(e);
        }
        /** Handles an error on a target */    async Iu(t) {
            const e = t.cause;
            for (const n of t.targetIds) 
            // A watched target might have been removed already.
            this.Qa.has(n) && (await this.Eu.Pu(n, e), this.Qa.delete(n), this.Ga.removeTarget(n));
        }
        /**
         * Attempts to fill our write pipeline with writes from the LocalStore.
         *
         * Called internally to bootstrap or refill the write pipeline and by
         * SyncEngine whenever there are new mutations to process.
         *
         * Starts the write stream if necessary.
         */    async lu() {
            let t = this.ja.length > 0 ? this.ja[this.ja.length - 1].batchId : -1;
            for (;this.Vu(); ) try {
                const e = await this.Wa.Gh(t);
                if (null === e) {
                    0 === this.ja.length && this.iu.aa();
                    break;
                }
                t = e.batchId, this.gu(e);
            } catch (t) {
                await this.Au(t);
            }
            this.yu() && this.pu();
        }
        /**
         * Returns true if we can add to the write pipeline (i.e. the network is
         * enabled and the write pipeline is not full).
         */    Vu() {
            return this.Ya() && this.ja.length < 10;
        }
        // For testing
        bu() {
            return this.ja.length;
        }
        /**
         * Queues additional writes to be sent to the write stream, sending them
         * immediately if the write stream is established.
         */    gu(t) {
            this.ja.push(t), this.iu.ra() && this.iu.ga && this.iu.ya(t.mutations);
        }
        yu() {
            return this.Ya() && !this.iu.ia() && this.ja.length > 0;
        }
        pu() {
            this.iu.start();
        }
        async ru() {
            this.iu.va();
        }
        async hu() {
            // Send the write pipeline now that the stream is established.
            for (const t of this.ja) this.iu.ya(t.mutations);
        }
        async pa(t, e) {
            const n = this.ja.shift(), s = ss.from(n, t, e);
            await this.mu(() => this.Eu.vu(s)), 
            // It's possible that with the completion of this mutation another
            // slot has freed up.
            await this.lu();
        }
        async ou(t) {
            // If the write stream closed after the write handshake completes, a write
            // operation failed and we fail the pending operation.
            t && this.iu.ga && 
            // This error affects the actual write.
            await this.Su(t), 
            // The write stream might have been started by refilling the write
            // pipeline for failed writes
            this.yu() && this.pu();
        }
        async Su(t) {
            // Only handle permanent errors here. If it's transient, just let the retry
            // logic kick in.
            if (at(e = t.code) && e !== C$1.ABORTED) {
                // This was a permanent error, the request itself was the problem
                // so it's not going to succeed if we resend it.
                const e = this.ja.shift();
                // In this case it's also unlikely that the server itself is melting
                // down -- this was just a bad request so inhibit backoff on the next
                // restart.
                            this.iu.ha(), await this.mu(() => this.Eu.Cu(e.batchId, t)), 
                // It's possible that with the completion of this mutation
                // another slot has freed up.
                await this.lu();
            }
            var e;
            /**
     * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
     *
     * @returns The Code equivalent to the given status string or undefined if
     *     there is no match.
     */    }
        async Xa() {
            this.za.add(4 /* ConnectivityChange */), await this._u(), this.Za.set("Unknown" /* Unknown */), 
            this.iu.ha(), this.tu.ha(), this.za.delete(4 /* ConnectivityChange */), await this.au();
        }
        async Du(t) {
            this.fi.Li(), 
            // Tear down and re-create our network streams. This will ensure we get a
            // fresh auth token for the new user and re-fill the write pipeline with
            // new mutations from the LocalStore (since mutations are per-user).
            V$1("RemoteStore", "RemoteStore received new credentials"), this.za.add(3 /* CredentialChange */), 
            await this._u(), this.Za.set("Unknown" /* Unknown */), await this.Eu.Du(t), this.za.delete(3 /* CredentialChange */), 
            await this.au();
        }
        /**
         * Toggles the network state when the client gains or loses its primary lease.
         */    async Nu(t) {
            t ? (this.za.delete(2 /* IsSecondary */), await this.au()) : t || (this.za.add(2 /* IsSecondary */), 
            await this._u(), this.Za.set("Unknown" /* Unknown */));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A collection of references to a document from some kind of numbered entity
     * (either a target ID or batch ID). As references are added to or removed from
     * the set corresponding events are emitted to a registered garbage collector.
     *
     * Each reference is represented by a DocumentReference object. Each of them
     * contains enough information to uniquely identify the reference. They are all
     * stored primarily in a set sorted by key. A document is considered garbage if
     * there's no references in that set (this can be efficiently checked thanks to
     * sorting by key).
     *
     * ReferenceSet also keeps a secondary set that contains references sorted by
     * IDs. This one is used to efficiently implement removal of all references by
     * some target ID.
     */ class Hi {
        constructor() {
            // A set of outstanding references to a document sorted by key.
            this.xu = new ft(Ji.ku), 
            // A set of outstanding references to a document sorted by target id.
            this.Ou = new ft(Ji.Fu);
        }
        /** Returns true if the reference set contains no references. */    $() {
            return this.xu.$();
        }
        /** Adds a reference to the given document key for the given ID. */    Co(t, e) {
            const n = new Ji(t, e);
            this.xu = this.xu.add(n), this.Ou = this.Ou.add(n);
        }
        /** Add references to the given document keys for the given ID. */    Mu(t, e) {
            t.forEach(t => this.Co(t, e));
        }
        /**
         * Removes a reference to the given document key for the given
         * ID.
         */    No(t, e) {
            this.$u(new Ji(t, e));
        }
        Lu(t, e) {
            t.forEach(t => this.No(t, e));
        }
        /**
         * Clears all references with a given ID. Calls removeRef() for each key
         * removed.
         */    qu(t) {
            const e = new j(new U$1([])), n = new Ji(e, t), s = new Ji(e, t + 1), i = [];
            return this.Ou.$t([ n, s ], t => {
                this.$u(t), i.push(t.key);
            }), i;
        }
        Bu() {
            this.xu.forEach(t => this.$u(t));
        }
        $u(t) {
            this.xu = this.xu.delete(t), this.Ou = this.Ou.delete(t);
        }
        Uu(t) {
            const e = new j(new U$1([])), n = new Ji(e, t), s = new Ji(e, t + 1);
            let i = Pt();
            return this.Ou.$t([ n, s ], t => {
                i = i.add(t.key);
            }), i;
        }
        Kr(t) {
            const e = new Ji(t, 0), n = this.xu.qt(e);
            return null !== n && t.isEqual(n.key);
        }
    }

    class Ji {
        constructor(t, e) {
            this.key = t, this.Wu = e;
        }
        /** Compare by key then by ID */    static ku(t, e) {
            return j.D(t.key, e.key) || F$1(t.Wu, e.Wu);
        }
        /** Compare by ID then by key */    static Fu(t, e) {
            return F$1(t.Wu, e.Wu) || j.D(t.key, e.key);
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // The format of the LocalStorage key that stores the client state is:
    //     firestore_clients_<persistence_prefix>_<instance_key>
    /** Assembles the key for a client state in WebStorage */
    function Yi(t, e) {
        return `firestore_clients_${t}_${e}`;
    }

    // The format of the WebStorage key that stores the mutation state is:
    //     firestore_mutations_<persistence_prefix>_<batch_id>
    //     (for unauthenticated users)
    // or: firestore_mutations_<persistence_prefix>_<batch_id>_<user_uid>

    // 'user_uid' is last to avoid needing to escape '_' characters that it might
    // contain.
    /** Assembles the key for a mutation batch in WebStorage */
    function Xi(t, e, n) {
        let s = `firestore_mutations_${t}_${n}`;
        return e.t() && (s += "_" + e.uid), s;
    }

    // The format of the WebStorage key that stores a query target's metadata is:
    //     firestore_targets_<persistence_prefix>_<target_id>
    /** Assembles the key for a query state in WebStorage */
    function Zi(t, e) {
        return `firestore_targets_${t}_${e}`;
    }

    // The WebStorage prefix that stores the primary tab's online state. The
    // format of the key is:
    //     firestore_online_state_<persistence_prefix>
    /**
     * Holds the state of a mutation batch, including its user ID, batch ID and
     * whether the batch is 'pending', 'acknowledged' or 'rejected'.
     */
    // Visible for testing
    class tr {
        constructor(t, e, n, s) {
            this.user = t, this.batchId = e, this.state = n, this.error = s;
        }
        /**
         * Parses a MutationMetadata from its JSON representation in WebStorage.
         * Logs a warning and returns null if the format of the data is not valid.
         */    static Ku(t, e, n) {
            const s = JSON.parse(n);
            let i = "object" == typeof s && -1 !== [ "pending", "acknowledged", "rejected" ].indexOf(s.state) && (void 0 === s.error || "object" == typeof s.error), r = void 0;
            return i && s.error && (i = "string" == typeof s.error.message && "string" == typeof s.error.code, 
            i && (r = new D$1(s.error.code, s.error.message))), i ? new tr(t, e, s.state, r) : (g$1("SharedClientState", `Failed to parse mutation state for ID '${e}': ${n}`), 
            null);
        }
        ju() {
            const t = {
                state: this.state,
                updateTimeMs: Date.now()
            };
            return this.error && (t.error = {
                code: this.error.code,
                message: this.error.message
            }), JSON.stringify(t);
        }
    }

    /**
     * Holds the state of a query target, including its target ID and whether the
     * target is 'not-current', 'current' or 'rejected'.
     */
    // Visible for testing
    class er {
        constructor(t, e, n) {
            this.targetId = t, this.state = e, this.error = n;
        }
        /**
         * Parses a QueryTargetMetadata from its JSON representation in WebStorage.
         * Logs a warning and returns null if the format of the data is not valid.
         */    static Ku(t, e) {
            const n = JSON.parse(e);
            let s = "object" == typeof n && -1 !== [ "not-current", "current", "rejected" ].indexOf(n.state) && (void 0 === n.error || "object" == typeof n.error), i = void 0;
            return s && n.error && (s = "string" == typeof n.error.message && "string" == typeof n.error.code, 
            s && (i = new D$1(n.error.code, n.error.message))), s ? new er(t, n.state, i) : (g$1("SharedClientState", `Failed to parse target state for ID '${t}': ${e}`), 
            null);
        }
        ju() {
            const t = {
                state: this.state,
                updateTimeMs: Date.now()
            };
            return this.error && (t.error = {
                code: this.error.code,
                message: this.error.message
            }), JSON.stringify(t);
        }
    }

    /**
     * This class represents the immutable ClientState for a client read from
     * WebStorage, containing the list of active query targets.
     */ class nr {
        constructor(t, e) {
            this.clientId = t, this.activeTargetIds = e;
        }
        /**
         * Parses a RemoteClientState from the JSON representation in WebStorage.
         * Logs a warning and returns null if the format of the data is not valid.
         */    static Ku(t, e) {
            const n = JSON.parse(e);
            let s = "object" == typeof n && n.activeTargetIds instanceof Array, i = gt();
            for (let t = 0; s && t < n.activeTargetIds.length; ++t) s = J$1(n.activeTargetIds[t]), 
            i = i.add(n.activeTargetIds[t]);
            return s ? new nr(t, i) : (g$1("SharedClientState", `Failed to parse client data for instance '${t}': ${e}`), 
            null);
        }
    }

    /**
     * This class represents the online state for all clients participating in
     * multi-tab. The online state is only written to by the primary client, and
     * used in secondary clients to update their query views.
     */ class sr {
        constructor(t, e) {
            this.clientId = t, this.onlineState = e;
        }
        /**
         * Parses a SharedOnlineState from its JSON representation in WebStorage.
         * Logs a warning and returns null if the format of the data is not valid.
         */    static Ku(t) {
            const e = JSON.parse(t);
            return "object" == typeof e && -1 !== [ "Unknown", "Online", "Offline" ].indexOf(e.onlineState) && "string" == typeof e.clientId ? new sr(e.clientId, e.onlineState) : (g$1("SharedClientState", "Failed to parse online state: " + t), 
            null);
        }
    }

    /**
     * Metadata state of the local client. Unlike `RemoteClientState`, this class is
     * mutable and keeps track of all pending mutations, which allows us to
     * update the range of pending mutation batch IDs as new mutations are added or
     * removed.
     *
     * The data in `LocalClientState` is not read from WebStorage and instead
     * updated via its instance methods. The updated state can be serialized via
     * `toWebStorageJSON()`.
     */
    // Visible for testing.
    class ir {
        constructor() {
            this.activeTargetIds = gt();
        }
        Qu(t) {
            this.activeTargetIds = this.activeTargetIds.add(t);
        }
        Gu(t) {
            this.activeTargetIds = this.activeTargetIds.delete(t);
        }
        /**
         * Converts this entry into a JSON-encoded format we can use for WebStorage.
         * Does not encode `clientId` as it is part of the key in WebStorage.
         */    ju() {
            const t = {
                activeTargetIds: this.activeTargetIds.B(),
                updateTimeMs: Date.now()
            };
            return JSON.stringify(t);
        }
    }

    /**
     * `WebStorageSharedClientState` uses WebStorage (window.localStorage) as the
     * backing store for the SharedClientState. It keeps track of all active
     * clients and supports modifications of the local client's data.
     */ class rr {
        constructor(t, e, n, s, i) {
            this.window = t, this.Cs = e, this.persistenceKey = n, this.zu = s, this.Eu = null, 
            this.ka = null, this.ys = null, this.Hu = this.Ju.bind(this), this.Yu = new ct(F$1), 
            this.dr = !1, 
            /**
             * Captures WebStorage events that occur before `start()` is called. These
             * events are replayed once `WebStorageSharedClientState` is started.
             */
            this.Xu = [];
            // Escape the special characters mentioned here:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            const r = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            this.storage = this.window.localStorage, this.currentUser = i, this.Zu = Yi(this.persistenceKey, this.zu), 
            this.tc = 
            /** Assembles the key for the current sequence number. */
            function(t) {
                return "firestore_sequence_number_" + t;
            }
            /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (this.persistenceKey), this.Yu = this.Yu._t(this.zu, new ir), this.ec = new RegExp(`^firestore_clients_${r}_([^_]*)$`), 
            this.nc = new RegExp(`^firestore_mutations_${r}_(\\d+)(?:_(.*))?$`), this.sc = new RegExp(`^firestore_targets_${r}_(\\d+)$`), 
            this.ic = 
            /** Assembles the key for the online state of the primary tab. */
            function(t) {
                return "firestore_online_state_" + t;
            }
            // The WebStorage key prefix for the key that stores the last sequence number allocated. The key
            // looks like 'firestore_sequence_number_<persistence_prefix>'.
            (this.persistenceKey), 
            // Rather than adding the storage observer during start(), we add the
            // storage observer during initialization. This ensures that we collect
            // events before other components populate their initial state (during their
            // respective start() calls). Otherwise, we might for example miss a
            // mutation that is added after LocalStore's start() processed the existing
            // mutations but before we observe WebStorage events.
            this.window.addEventListener("storage", this.Hu);
        }
        /** Returns 'true' if WebStorage is available in the current environment. */    static Qs(t) {
            return !(!t || !t.localStorage);
        }
        async start() {
            // Retrieve the list of existing clients to backfill the data in
            // SharedClientState.
            const t = await this.Eu.Ih();
            for (const e of t) {
                if (e === this.zu) continue;
                const t = this.getItem(Yi(this.persistenceKey, e));
                if (t) {
                    const n = nr.Ku(e, t);
                    n && (this.Yu = this.Yu._t(n.clientId, n));
                }
            }
            this.rc();
            // Check if there is an existing online state and call the callback handler
            // if applicable.
            const e = this.storage.getItem(this.ic);
            if (e) {
                const t = this.oc(e);
                t && this.hc(t);
            }
            for (const t of this.Xu) this.Ju(t);
            this.Xu = [], 
            // Register a window unload hook to remove the client metadata entry from
            // WebStorage even if `shutdown()` was not called.
            this.window.addEventListener("unload", () => this.fh()), this.dr = !0;
        }
        vs(t) {
            this.setItem(this.tc, JSON.stringify(t));
        }
        ac() {
            return this.uc(this.Yu);
        }
        cc(t) {
            let e = !1;
            return this.Yu.forEach((n, s) => {
                s.activeTargetIds.has(t) && (e = !0);
            }), e;
        }
        lc(t) {
            this._c(t, "pending");
        }
        fc(t, e, n) {
            this._c(t, e, n), 
            // Once a final mutation result is observed by other clients, they no longer
            // access the mutation's metadata entry. Since WebStorage replays events
            // in order, it is safe to delete the entry right after updating it.
            this.dc(t);
        }
        wc(t) {
            let e = "not-current";
            // Lookup an existing query state if the target ID was already registered
            // by another tab
                    if (this.cc(t)) {
                const n = this.storage.getItem(Zi(this.persistenceKey, t));
                if (n) {
                    const s = er.Ku(t, n);
                    s && (e = s.state);
                }
            }
            return this.Tc.Qu(t), this.rc(), e;
        }
        Ec(t) {
            this.Tc.Gu(t), this.rc();
        }
        Ic(t) {
            return this.Tc.activeTargetIds.has(t);
        }
        Ac(t) {
            this.removeItem(Zi(this.persistenceKey, t));
        }
        Rc(t, e, n) {
            this.mc(t, e, n);
        }
        Oh(t, e, n) {
            e.forEach(t => {
                this.dc(t);
            }), this.currentUser = t, n.forEach(t => {
                this.lc(t);
            });
        }
        Pc(t) {
            this.Vc(t);
        }
        fh() {
            this.dr && (this.window.removeEventListener("storage", this.Hu), this.removeItem(this.Zu), 
            this.dr = !1);
        }
        getItem(t) {
            const e = this.storage.getItem(t);
            return V$1("SharedClientState", "READ", t, e), e;
        }
        setItem(t, e) {
            V$1("SharedClientState", "SET", t, e), this.storage.setItem(t, e);
        }
        removeItem(t) {
            V$1("SharedClientState", "REMOVE", t), this.storage.removeItem(t);
        }
        Ju(t) {
            // Note: The function is typed to take Event to be interface-compatible with
            // `Window.addEventListener`.
            const e = t;
            if (e.storageArea === this.storage) {
                if (V$1("SharedClientState", "EVENT", e.key, e.newValue), e.key === this.Zu) return void g$1("Received WebStorage notification for local change. Another client might have garbage-collected our state");
                this.Cs.Fi(async () => {
                    if (this.dr) {
                        if (null !== e.key) if (this.ec.test(e.key)) {
                            if (null == e.newValue) {
                                const t = this.gc(e.key);
                                return this.yc(t, null);
                            }
                            {
                                const t = this.pc(e.key, e.newValue);
                                if (t) return this.yc(t.clientId, t);
                            }
                        } else if (this.nc.test(e.key)) {
                            if (null !== e.newValue) {
                                const t = this.bc(e.key, e.newValue);
                                if (t) return this.vc(t);
                            }
                        } else if (this.sc.test(e.key)) {
                            if (null !== e.newValue) {
                                const t = this.Sc(e.key, e.newValue);
                                if (t) return this.Cc(t);
                            }
                        } else if (e.key === this.ic) {
                            if (null !== e.newValue) {
                                const t = this.oc(e.newValue);
                                if (t) return this.hc(t);
                            }
                        } else if (e.key === this.tc) {
                            const t = function(t) {
                                let e = ls.Ss;
                                if (null != t) try {
                                    const n = JSON.parse(t);
                                    v$1("number" == typeof n), e = n;
                                } catch (t) {
                                    g$1("SharedClientState", "Failed to read sequence number from WebStorage", t);
                                }
                                return e;
                            }
                            /**
     * `MemorySharedClientState` is a simple implementation of SharedClientState for
     * clients using memory persistence. The state in this class remains fully
     * isolated and no synchronization is performed.
     */ (e.newValue);
                            t !== ls.Ss && this.ys(t);
                        }
                    } else this.Xu.push(e);
                });
            }
        }
        get Tc() {
            return this.Yu.get(this.zu);
        }
        rc() {
            this.setItem(this.Zu, this.Tc.ju());
        }
        _c(t, e, n) {
            const s = new tr(this.currentUser, t, e, n), i = Xi(this.persistenceKey, this.currentUser, t);
            this.setItem(i, s.ju());
        }
        dc(t) {
            const e = Xi(this.persistenceKey, this.currentUser, t);
            this.removeItem(e);
        }
        Vc(t) {
            const e = {
                clientId: this.zu,
                onlineState: t
            };
            this.storage.setItem(this.ic, JSON.stringify(e));
        }
        mc(t, e, n) {
            const s = Zi(this.persistenceKey, t), i = new er(t, e, n);
            this.setItem(s, i.ju());
        }
        /**
         * Parses a client state key in WebStorage. Returns null if the key does not
         * match the expected key format.
         */    gc(t) {
            const e = this.ec.exec(t);
            return e ? e[1] : null;
        }
        /**
         * Parses a client state in WebStorage. Returns 'null' if the value could not
         * be parsed.
         */    pc(t, e) {
            const n = this.gc(t);
            return nr.Ku(n, e);
        }
        /**
         * Parses a mutation batch state in WebStorage. Returns 'null' if the value
         * could not be parsed.
         */    bc(t, e) {
            const n = this.nc.exec(t), s = Number(n[1]), i = void 0 !== n[2] ? n[2] : null;
            return tr.Ku(new A$1(i), s, e);
        }
        /**
         * Parses a query target state from WebStorage. Returns 'null' if the value
         * could not be parsed.
         */    Sc(t, e) {
            const n = this.sc.exec(t), s = Number(n[1]);
            return er.Ku(s, e);
        }
        /**
         * Parses an online state from WebStorage. Returns 'null' if the value
         * could not be parsed.
         */    oc(t) {
            return sr.Ku(t);
        }
        async vc(t) {
            if (t.user.uid === this.currentUser.uid) return this.Eu.Dc(t.batchId, t.state, t.error);
            V$1("SharedClientState", "Ignoring mutation for non-active user " + t.user.uid);
        }
        Cc(t) {
            return this.Eu.Nc(t.targetId, t.state, t.error);
        }
        yc(t, e) {
            const n = e ? this.Yu._t(t, e) : this.Yu.remove(t), s = this.uc(this.Yu), i = this.uc(n), r = [], o = [];
            return i.forEach(t => {
                s.has(t) || r.push(t);
            }), s.forEach(t => {
                i.has(t) || o.push(t);
            }), this.Eu.xc(r, o).then(() => {
                this.Yu = n;
            });
        }
        hc(t) {
            // We check whether the client that wrote this online state is still active
            // by comparing its client ID to the list of clients kept active in
            // IndexedDb. If a client does not update their IndexedDb client state
            // within 5 seconds, it is considered inactive and we don't emit an online
            // state event.
            this.Yu.get(t.clientId) && this.ka(t.onlineState);
        }
        uc(t) {
            let e = gt();
            return t.forEach((t, n) => {
                e = e.Bt(n.activeTargetIds);
            }), e;
        }
    }

    class or {
        constructor() {
            this.kc = new ir, this.Oc = {}, this.ka = null, this.ys = null;
        }
        lc(t) {
            // No op.
        }
        fc(t, e, n) {
            // No op.
        }
        wc(t) {
            return this.kc.Qu(t), this.Oc[t] || "not-current";
        }
        Rc(t, e, n) {
            this.Oc[t] = e;
        }
        Ec(t) {
            this.kc.Gu(t);
        }
        Ic(t) {
            return this.kc.activeTargetIds.has(t);
        }
        Ac(t) {
            delete this.Oc[t];
        }
        ac() {
            return this.kc.activeTargetIds;
        }
        cc(t) {
            return this.kc.activeTargetIds.has(t);
        }
        start() {
            return this.kc = new ir, Promise.resolve();
        }
        Oh(t, e, n) {
            // No op.
        }
        Pc(t) {
            // No op.
        }
        fh() {}
        vs(t) {}
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class hr {
        constructor(t) {
            this.key = t;
        }
    }

    class ar {
        constructor(t) {
            this.key = t;
        }
    }

    /**
     * View is responsible for computing the final merged truth of what docs are in
     * a query. It gets notified of local and remote changes to docs, and applies
     * the query filters and limits to determine the most correct possible results.
     */ class ur {
        constructor(t, 
        /** Documents included in the remote target */
        e) {
            this.query = t, this.Fc = e, this.Mc = null, 
            /**
             * A flag whether the view is current with the backend. A view is considered
             * current after it has seen the current flag from the backend and did not
             * lose consistency within the watch stream (e.g. because of an existence
             * filter mismatch).
             */
            this.re = !1, 
            /** Documents in the view but not in the remote target */
            this.$c = Pt(), 
            /** Document Keys that have local changes */
            this.Ht = Pt(), this.Lc = $n(t), this.qc = new yt(this.Lc);
        }
        /**
         * The set of remote documents that the server has told us belongs to the target associated with
         * this view.
         */    get Bc() {
            return this.Fc;
        }
        /**
         * Iterates over a set of doc changes, applies the query limit, and computes
         * what the new results should be, what the changes were, and whether we may
         * need to go back to the local cache for more results. Does not make any
         * changes to the view.
         * @param docChanges The doc changes to apply to this view.
         * @param previousChanges If this is being called with a refill, then start
         *        with this set of docs and changes instead of the current view.
         * @return a new set of docs, changes, and refill flag.
         */    Uc(t, e) {
            const n = e ? e.Wc : new pt, s = e ? e.qc : this.qc;
            let i = e ? e.Ht : this.Ht, r = s, o = !1;
            // Track the last doc in a (full) limit. This is necessary, because some
            // update (a delete, or an update moving a doc past the old limit) might
            // mean there is some other document in the local cache that either should
            // come (1) between the old last limit doc and the new last document, in the
            // case of updates, or (2) after the new last document, in the case of
            // deletes. So we keep this doc at the old limit to compare the updates to.
            // Note that this should never get used in a refill (when previousChanges is
            // set), because there will only be adds -- no deletes or updates.
            const h = this.query.En() && s.size === this.query.limit ? s.last() : null, a = this.query.In() && s.size === this.query.limit ? s.first() : null;
            // Drop documents out to meet limit/limitToLast requirement.
            if (t.Tt((t, e) => {
                const u = s.get(t);
                let c = e instanceof gn ? e : null;
                c && (c = Mn(this.query, c) ? c : null);
                const l = !!u && this.Ht.has(u.key), _ = !!c && (c.nn || 
                // We only consider committed mutations for documents that were
                // mutated during the lifetime of the view.
                this.Ht.has(c.key) && c.hasCommittedMutations);
                let f = !1;
                // Calculate change
                            if (u && c) {
                    u.data().isEqual(c.data()) ? l !== _ && (n.track({
                        type: 3 /* Metadata */ ,
                        doc: c
                    }), f = !0) : this.Kc(u, c) || (n.track({
                        type: 2 /* Modified */ ,
                        doc: c
                    }), f = !0, (h && this.Lc(c, h) > 0 || a && this.Lc(c, a) < 0) && (
                    // This doc moved from inside the limit to outside the limit.
                    // That means there may be some other doc in the local cache
                    // that should be included instead.
                    o = !0));
                } else !u && c ? (n.track({
                    type: 0 /* Added */ ,
                    doc: c
                }), f = !0) : u && !c && (n.track({
                    type: 1 /* Removed */ ,
                    doc: u
                }), f = !0, (h || a) && (
                // A doc was removed from a full limit query. We'll need to
                // requery from the local cache to see if we know about some other
                // doc that should be in the results.
                o = !0));
                f && (c ? (r = r.add(c), i = _ ? i.add(t) : i.delete(t)) : (r = r.delete(t), i = i.delete(t)));
            }), this.query.En() || this.query.In()) for (;r.size > this.query.limit; ) {
                const t = this.query.En() ? r.last() : r.first();
                r = r.delete(t.key), i = i.delete(t.key), n.track({
                    type: 1 /* Removed */ ,
                    doc: t
                });
            }
            return {
                qc: r,
                Wc: n,
                jc: o,
                Ht: i
            };
        }
        Kc(t, e) {
            // We suppress the initial change event for documents that were modified as
            // part of a write acknowledgment (e.g. when the value of a server transform
            // is applied) as Watch will send us the same document again.
            // By suppressing the event, we only raise two user visible events (one with
            // `hasPendingWrites` and the final state of the document) instead of three
            // (one with `hasPendingWrites`, the modified document with
            // `hasPendingWrites` and the final state of the document).
            return t.nn && e.hasCommittedMutations && !e.nn;
        }
        /**
         * Updates the view with the given ViewDocumentChanges and optionally updates
         * limbo docs and sync state from the provided target change.
         * @param docChanges The set of changes to make to the view's docs.
         * @param updateLimboDocuments Whether to update limbo documents based on this
         *        change.
         * @param targetChange A target change to apply for computing limbo docs and
         *        sync state.
         * @return A new ViewChange with the given docs, changes, and sync state.
         */
        // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
        ts(t, e, n) {
            const s = this.qc;
            this.qc = t.qc, this.Ht = t.Ht;
            // Sort changes based on type and query comparator
            const i = t.Wc.Gt();
            i.sort((t, e) => function(t, e) {
                const n = t => {
                    switch (t) {
                      case 0 /* Added */ :
                        return 1;

                      case 2 /* Modified */ :
                      case 3 /* Metadata */ :
                        // A metadata change is converted to a modified change at the public
                        // api layer.  Since we sort by document key and then change type,
                        // metadata and modified changes must be sorted equivalently.
                        return 2;

                      case 1 /* Removed */ :
                        return 0;

                      default:
                        return b();
                    }
                };
                return n(t) - n(e);
            }
            /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (t.type, e.type) || this.Lc(t.doc, e.doc)), this.Qc(n);
            const r = e ? this.Gc() : [], o = 0 === this.$c.size && this.re ? 1 /* Synced */ : 0 /* Local */ , h = o !== this.Mc;
            if (this.Mc = o, 0 !== i.length || h) {
                return {
                    snapshot: new bt(this.query, t.qc, s, i, t.Ht, 0 /* Local */ === o, h, 
                    /* excludesMetadataChanges= */ !1),
                    zc: r
                };
            }
            // no changes
            return {
                zc: r
            };
        }
        /**
         * Applies an OnlineState change to the view, potentially generating a
         * ViewChange if the view's syncState changes as a result.
         */    Hc(t) {
            return this.re && "Offline" /* Offline */ === t ? (
            // If we're offline, set `current` to false and then call applyChanges()
            // to refresh our syncState and generate a ViewChange as appropriate. We
            // are guaranteed to get a new TargetChange that sets `current` back to
            // true once the client is back online.
            this.re = !1, this.ts({
                qc: this.qc,
                Wc: new pt,
                Ht: this.Ht,
                jc: !1
            }, 
            /* updateLimboDocuments= */ !1)) : {
                zc: []
            };
        }
        /**
         * Returns whether the doc for the given key should be in limbo.
         */    Jc(t) {
            // If the remote end says it's part of this query, it's not in limbo.
            return !this.Fc.has(t) && (
            // The local store doesn't think it's a result, so it shouldn't be in limbo.
            !!this.qc.has(t) && !this.qc.get(t).nn);
        }
        /**
         * Updates syncedDocuments, current, and limbo docs based on the given change.
         * Returns the list of changes to which docs are in limbo.
         */    Qc(t) {
            t && (t.oe.forEach(t => this.Fc = this.Fc.add(t)), t.he.forEach(t => {}), t.ae.forEach(t => this.Fc = this.Fc.delete(t)), 
            this.re = t.re);
        }
        Gc() {
            // We can only determine limbo documents when we're in-sync with the server.
            if (!this.re) return [];
            // TODO(klimt): Do this incrementally so that it's not quadratic when
            // updating many documents.
                    const t = this.$c;
            this.$c = Pt(), this.qc.forEach(t => {
                this.Jc(t.key) && (this.$c = this.$c.add(t.key));
            });
            // Diff the new limbo docs with the old limbo docs.
            const e = [];
            return t.forEach(t => {
                this.$c.has(t) || e.push(new ar(t));
            }), this.$c.forEach(n => {
                t.has(n) || e.push(new hr(n));
            }), e;
        }
        /**
         * Update the in-memory state of the current view with the state read from
         * persistence.
         *
         * We update the query view whenever a client's primary status changes:
         * - When a client transitions from primary to secondary, it can miss
         *   LocalStorage updates and its query views may temporarily not be
         *   synchronized with the state on disk.
         * - For secondary to primary transitions, the client needs to update the list
         *   of `syncedDocuments` since secondary clients update their query views
         *   based purely on synthesized RemoteEvents.
         *
         * @param queryResult.documents - The documents that match the query according
         * to the LocalStore.
         * @param queryResult.remoteKeys - The keys of the documents that match the
         * query according to the backend.
         *
         * @return The ViewChange that resulted from this synchronization.
         */
        // PORTING NOTE: Multi-tab only.
        Yc(t) {
            this.Fc = t.Xh, this.$c = Pt();
            const e = this.Uc(t.documents);
            return this.ts(e, /*updateLimboDocuments=*/ !0);
        }
        /**
         * Returns a view snapshot as if this query was just listened to. Contains
         * a document add for every existing document and the `fromCache` and
         * `hasPendingWrites` status of the already established view.
         */
        // PORTING NOTE: Multi-tab only.
        Xc() {
            return bt.Xt(this.query, this.qc, this.Ht, 0 /* Local */ === this.Mc);
        }
    }

    /**
     * QueryView contains all of the data that SyncEngine needs to keep track of for
     * a particular query.
     */
    class cr {
        constructor(
        /**
         * The query itself.
         */
        t, 
        /**
         * The target number created by the client that is used in the watch
         * stream to identify this query.
         */
        e, 
        /**
         * The view is responsible for computing the final merged truth of what
         * docs are in the query. It gets notified of local and remote changes,
         * and applies the query filters and limits to determine the most correct
         * possible results.
         */
        n) {
            this.query = t, this.targetId = e, this.view = n;
        }
    }

    /** Tracks a limbo resolution. */ class lr {
        constructor(t) {
            this.key = t, 
            /**
             * Set to true once we've received a document. This is used in
             * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
             * decide whether it needs to manufacture a delete event for the target once
             * the target is CURRENT.
             */
            this.Zc = !1;
        }
    }

    /**
     * An implementation of `SyncEngine` coordinating with other parts of SDK.
     *
     * Note: some field defined in this class might have public access level, but
     * the class is not exported so they are only accessible from this module.
     * This is useful to implement optional features (like bundles) in free
     * functions, such that they are tree-shakeable.
     */ class _r {
        constructor(t, e, n, 
        // PORTING NOTE: Manages state synchronization in multi-tab environments.
        s, i, r) {
            this.Wa = t, this.tl = e, this.Ka = n, this.el = s, this.currentUser = i, this.nl = r, 
            this.sl = null, this.il = new is(t => On(t), kn), this.rl = new Map, 
            /**
             * The keys of documents that are in limbo for which we haven't yet started a
             * limbo resolution query.
             */
            this.ol = [], 
            /**
             * Keeps track of the target ID for each document that is in limbo with an
             * active target.
             */
            this.hl = new ct(j.D), 
            /**
             * Keeps track of the information about an active limbo resolution for each
             * active target ID that was started for the purpose of limbo resolution.
             */
            this.al = new Map, this.ul = new Hi, 
            /** Stores user completion handlers, indexed by User and BatchId. */
            this.cl = {}, 
            /** Stores user callbacks waiting for all pending writes to be acknowledged. */
            this.ll = new Map, this._l = yi.fo(), this.onlineState = "Unknown" /* Unknown */ , 
            // The primary state is set to `true` or `false` immediately after Firestore
            // startup. In the interim, a client should only be considered primary if
            // `isPrimary` is true.
            this.fl = void 0;
        }
        get dl() {
            return !0 === this.fl;
        }
        subscribe(t) {
            this.sl = t;
        }
        async listen(t) {
            let e, n;
            this.wl("listen()");
            const s = this.il.get(t);
            if (s) 
            // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
            // already exists when EventManager calls us for the first time. This
            // happens when the primary tab is already listening to this query on
            // behalf of another tab and the user of the primary also starts listening
            // to the query. EventManager will not have an assigned target ID in this
            // case and calls `listen` to obtain this ID.
            e = s.targetId, this.el.wc(e), n = s.view.Xc(); else {
                const s = await this.Wa.Hh(xn(t)), i = this.el.wc(s.targetId);
                e = s.targetId, n = await this.Tl(t, e, "current" === i), this.dl && this.tl.listen(s);
            }
            return n;
        }
        /**
         * Registers a view for a previously unknown query and computes its initial
         * snapshot.
         */    async Tl(t, e, n) {
            const s = await this.Wa.Yh(t, 
            /* usePreviousResults= */ !0), i = new ur(t, s.Xh), r = i.Uc(s.documents), o = St.ie(e, n && "Offline" /* Offline */ !== this.onlineState), h = i.ts(r, 
            /* updateLimboDocuments= */ this.dl, o);
            this.El(e, h.zc);
            const a = new cr(t, e, i);
            return this.il.set(t, a), this.rl.has(e) ? this.rl.get(e).push(t) : this.rl.set(e, [ t ]), 
            h.snapshot;
        }
        async wu(t) {
            this.wl("unlisten()");
            const e = this.il.get(t), n = this.rl.get(e.targetId);
            // Only clean up the query view and target if this is the only query mapped
            // to the target.
                    if (n.length > 1) return this.rl.set(e.targetId, n.filter(e => !kn(e, t))), 
            void this.il.delete(t);
            // No other queries are mapped to the target, clean up the query and the target.
                    if (this.dl) {
                // We need to remove the local query target first to allow us to verify
                // whether any other client is still interested in this target.
                this.el.Ec(e.targetId);
                this.el.cc(e.targetId) || await this.Wa.Jh(e.targetId, /*keepPersistedTargetData=*/ !1).then(() => {
                    this.el.Ac(e.targetId), this.tl.wu(e.targetId), this.Il(e.targetId);
                }).catch(Bi);
            } else this.Il(e.targetId), await this.Wa.Jh(e.targetId, 
            /*keepPersistedTargetData=*/ !0);
        }
        async write(t, e) {
            this.wl("write()");
            try {
                const n = await this.Wa.Lh(t);
                this.el.lc(n.batchId), this.Al(n.batchId, e), await this.Rl(n.jn), await this.tl.lu();
            } catch (t) {
                // If we can't persist the mutation, we reject the user callback and
                // don't send the mutation. The user can then retry the write.
                const n = ps(t, "Failed to persist write");
                e.reject(n);
            }
        }
        async Wh(t) {
            this.wl("applyRemoteEvent()");
            try {
                const e = await this.Wa.Wh(t);
                // Update `receivedDocument` as appropriate for any limbo targets.
                            t.Zt.forEach((t, e) => {
                    const n = this.al.get(e);
                    n && (
                    // Since this is a limbo resolution lookup, it's for a single document
                    // and it could be added, modified, or removed, but not a combination.
                    v$1(t.oe.size + t.he.size + t.ae.size <= 1), t.oe.size > 0 ? n.Zc = !0 : t.he.size > 0 ? v$1(n.Zc) : t.ae.size > 0 && (v$1(n.Zc), 
                    n.Zc = !1));
                }), await this.Rl(e, t);
            } catch (t) {
                await Bi(t);
            }
        }
        Hc(t, e) {
            // If we are the secondary client, we explicitly ignore the remote store's
            // online state (the local client may go offline, even though the primary
            // tab remains online) and only apply the primary tab's online state from
            // SharedClientState.
            if (this.dl && 0 /* RemoteStore */ === e || !this.dl && 1 /* SharedClientState */ === e) {
                this.wl("applyOnlineStateChange()");
                const e = [];
                this.il.forEach((n, s) => {
                    const i = s.view.Hc(t);
                    i.snapshot && e.push(i.snapshot);
                }), this.sl.ml(t), this.sl.Ra(e), this.onlineState = t, this.dl && this.el.Pc(t);
            }
        }
        async Pu(t, e) {
            this.wl("rejectListens()"), 
            // PORTING NOTE: Multi-tab only.
            this.el.Rc(t, "rejected", e);
            const n = this.al.get(t), s = n && n.key;
            if (s) {
                // TODO(klimt): We really only should do the following on permission
                // denied errors, but we don't have the cause code here.
                // It's a limbo doc. Create a synthetic event saying it was deleted.
                // This is kind of a hack. Ideally, we would have a method in the local
                // store to purge a document. However, it would be tricky to keep all of
                // the local store's invariants with another method.
                let e = new ct(j.D);
                e = e._t(s, new yn(s, q$1.min()));
                const n = Pt().add(s), i = new vt(q$1.min(), 
                /* targetChanges= */ new Map, 
                /* targetMismatches= */ new ft(F$1), e, n);
                await this.Wh(i), 
                // Since this query failed, we won't want to manually unlisten to it.
                // We only remove it from bookkeeping after we successfully applied the
                // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
                // this query when the RemoteStore restarts the Watch stream, which should
                // re-trigger the target failure.
                this.hl = this.hl.remove(s), this.al.delete(t), this.Pl();
            } else await this.Wa.Jh(t, /* keepPersistedTargetData */ !1).then(() => this.Il(t, e)).catch(Bi);
        }
        async vu(t) {
            this.wl("applySuccessfulWrite()");
            const e = t.batch.batchId;
            try {
                const n = await this.Wa.qh(t);
                // The local store may or may not be able to apply the write result and
                // raise events immediately (depending on whether the watcher is caught
                // up), so we raise user callbacks first so that they consistently happen
                // before listen events.
                            this.Vl(e, /*error=*/ null), this.gl(e), this.el.fc(e, "acknowledged"), 
                await this.Rl(n);
            } catch (t) {
                await Bi(t);
            }
        }
        async Cu(t, e) {
            this.wl("rejectFailedWrite()");
            try {
                const n = await this.Wa.Uh(t);
                // The local store may or may not be able to apply the write result and
                // raise events immediately (depending on whether the watcher is caught up),
                // so we raise user callbacks first so that they consistently happen before
                // listen events.
                            this.Vl(t, e), this.gl(t), this.el.fc(t, "rejected", e), await this.Rl(n);
            } catch (e) {
                await Bi(e);
            }
        }
        async yl(t) {
            this.tl.Ya() || V$1("SyncEngine", "The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");
            try {
                const e = await this.Wa.Fr();
                if (-1 === e) 
                // Trigger the callback right away if there is no pending writes at the moment.
                return void t.resolve();
                const n = this.ll.get(e) || [];
                n.push(t), this.ll.set(e, n);
            } catch (e) {
                const n = ps(e, "Initialization of waitForPendingWrites() operation failed");
                t.reject(n);
            }
        }
        /**
         * Triggers the callbacks that are waiting for this batch id to get acknowledged by server,
         * if there are any.
         */    gl(t) {
            (this.ll.get(t) || []).forEach(t => {
                t.resolve();
            }), this.ll.delete(t);
        }
        /** Reject all outstanding callbacks waiting for pending writes to complete. */    pl(t) {
            this.ll.forEach(e => {
                e.forEach(e => {
                    e.reject(new D$1(C$1.CANCELLED, t));
                });
            }), this.ll.clear();
        }
        Al(t, e) {
            let n = this.cl[this.currentUser.s()];
            n || (n = new ct(F$1)), n = n._t(t, e), this.cl[this.currentUser.s()] = n;
        }
        /**
         * Resolves or rejects the user callback for the given batch and then discards
         * it.
         */    Vl(t, e) {
            let n = this.cl[this.currentUser.s()];
            // NOTE: Mutations restored from persistence won't have callbacks, so it's
            // okay for there to be no callback for this ID.
                    if (n) {
                const s = n.get(t);
                s && (e ? s.reject(e) : s.resolve(), n = n.remove(t)), this.cl[this.currentUser.s()] = n;
            }
        }
        Il(t, e = null) {
            this.el.Ec(t);
            for (const n of this.rl.get(t)) this.il.delete(n), e && this.sl.bl(n, e);
            if (this.rl.delete(t), this.dl) {
                this.ul.qu(t).forEach(t => {
                    this.ul.Kr(t) || 
                    // We removed the last reference for this key
                    this.vl(t);
                });
            }
        }
        vl(t) {
            // It's possible that the target already got removed because the query failed. In that case,
            // the key won't exist in `limboTargetsByKey`. Only do the cleanup if we still have the target.
            const e = this.hl.get(t);
            null !== e && (this.tl.wu(e), this.hl = this.hl.remove(t), this.al.delete(e), this.Pl());
        }
        El(t, e) {
            for (const n of e) if (n instanceof hr) this.ul.Co(n.key, t), this.Sl(n); else if (n instanceof ar) {
                V$1("SyncEngine", "Document no longer in limbo: " + n.key), this.ul.No(n.key, t);
                this.ul.Kr(n.key) || 
                // We removed the last reference for this key
                this.vl(n.key);
            } else b();
        }
        Sl(t) {
            const e = t.key;
            this.hl.get(e) || (V$1("SyncEngine", "New document in limbo: " + e), this.ol.push(e), 
            this.Pl());
        }
        /**
         * Starts listens for documents in limbo that are enqueued for resolution,
         * subject to a maximum number of concurrent resolutions.
         *
         * Without bounding the number of concurrent resolutions, the server can fail
         * with "resource exhausted" errors which can lead to pathological client
         * behavior as seen in https://github.com/firebase/firebase-js-sdk/issues/2683.
         */    Pl() {
            for (;this.ol.length > 0 && this.hl.size < this.nl; ) {
                const t = this.ol.shift(), e = this._l.next();
                this.al.set(e, new lr(t)), this.hl = this.hl._t(t, e), this.tl.listen(new it(xn(Cn(t.path)), e, 2 /* LimboResolution */ , ls.Ss));
            }
        }
        // Visible for testing
        Cl() {
            return this.hl;
        }
        // Visible for testing
        Dl() {
            return this.ol;
        }
        async Rl(t, e) {
            const n = [], s = [], i = [];
            this.il.forEach((r, o) => {
                i.push(Promise.resolve().then(() => {
                    const e = o.view.Uc(t);
                    return e.jc ? this.Wa.Yh(o.query, /* usePreviousResults= */ !1).then(({documents: t}) => o.view.Uc(t, e)) : e;
                    // The query has a limit and some docs were removed, so we need
                    // to re-run the query against the local store to make sure we
                    // didn't lose any good docs that had been past the limit.
                            }).then(t => {
                    const i = e && e.Zt.get(o.targetId), r = o.view.ts(t, 
                    /* updateLimboDocuments= */ this.dl, i);
                    if (this.El(o.targetId, r.zc), r.snapshot) {
                        this.dl && this.el.Rc(o.targetId, r.snapshot.fromCache ? "not-current" : "current"), 
                        n.push(r.snapshot);
                        const t = cs.gs(o.targetId, r.snapshot);
                        s.push(t);
                    }
                }));
            }), await Promise.all(i), this.sl.Ra(n), await this.Wa.Qh(s);
        }
        wl(t) {}
        async Du(t) {
            if (!this.currentUser.isEqual(t)) {
                V$1("SyncEngine", "User change. New user:", t.s());
                const e = await this.Wa.Oh(t);
                this.currentUser = t, 
                // Fails tasks waiting for pending writes requested by previous user.
                this.pl("'waitForPendingWrites' promise is rejected due to a user change."), 
                // TODO(b/114226417): Consider calling this only in the primary tab.
                this.el.Oh(t, e.Mh, e.$h), await this.Rl(e.Fh);
            }
        }
        Qe(t) {
            const e = this.al.get(t);
            if (e && e.Zc) return Pt().add(e.key);
            {
                let e = Pt();
                const n = this.rl.get(t);
                if (!n) return e;
                for (const t of n) {
                    const n = this.il.get(t);
                    e = e.Bt(n.view.Bc);
                }
                return e;
            }
        }
    }

    /**
     * Reconcile the list of synced documents in an existing view with those
     * from persistence.
     */
    async function fr(t, e) {
        const n = S$1(t), s = await n.Wa.Yh(e.query, 
        /* usePreviousResults= */ !0), i = e.view.Yc(s);
        return n.dl && n.El(e.targetId, i.zc), i;
    }

    /** Applies a mutation state to an existing batch.  */
    // PORTING NOTE: Multi-Tab only.
    async function dr(t, e, n, s) {
        const i = S$1(t);
        i.wl("applyBatchState()");
        const r = await 
        /** Returns the local view of the documents affected by a mutation batch. */
        // PORTING NOTE: Multi-Tab only.
        function(t, e) {
            const n = S$1(t), s = S$1(n.os);
            return n.persistence.runTransaction("Lookup mutation documents", "readonly", t => s.kr(t, e).next(e => e ? n.xh._s(t, e) : rs.resolve(null)));
        }
        // PORTING NOTE: Multi-Tab only.
        (i.Wa, e);
        null !== r ? ("pending" === n ? 
        // If we are the primary client, we need to send this write to the
        // backend. Secondary clients will ignore these writes since their remote
        // connection is disabled.
        await i.tl.lu() : "acknowledged" === n || "rejected" === n ? (
        // NOTE: Both these methods are no-ops for batches that originated from
        // other clients.
        i.Vl(e, s || null), function(t, e) {
            S$1(S$1(t).os).Br(e);
        }
        // PORTING NOTE: Multi-Tab only.
        (i.Wa, e)) : b(), await i.Rl(r)) : 
        // A throttled tab may not have seen the mutation before it was completed
        // and removed from the mutation queue, in which case we won't have cached
        // the affected documents. In this case we can safely ignore the update
        // since that means we didn't apply the mutation locally at all (if we
        // had, we would have cached the affected documents), and so we will just
        // see any resulting document changes via normal remote document updates
        // as applicable.
        V$1("SyncEngine", "Cannot apply mutation batch with id: " + e);
    }

    /** Applies a query target change from a different tab. */
    // PORTING NOTE: Multi-Tab only.
    async function wr(t, e) {
        const n = S$1(t);
        if (!0 === e && !0 !== n.fl) {
            // Secondary tabs only maintain Views for their local listeners and the
            // Views internal state may not be 100% populated (in particular
            // secondary tabs don't track syncedDocuments, the set of documents the
            // server considers to be in the target). So when a secondary becomes
            // primary, we need to need to make sure that all views for all targets
            // match the state on disk.
            const t = n.el.ac(), e = await Tr(n, t.B());
            n.fl = !0, await n.tl.Nu(!0);
            for (const t of e) n.tl.listen(t);
        } else if (!1 === e && !1 !== n.fl) {
            const t = [];
            let e = Promise.resolve();
            n.rl.forEach((s, i) => {
                n.el.Ic(i) ? t.push(i) : e = e.then(() => (n.Il(i), n.Wa.Jh(i, 
                /*keepPersistedTargetData=*/ !0))), n.tl.wu(i);
            }), await e, await Tr(n, t), 
            // PORTING NOTE: Multi-Tab only.
            function(t) {
                const e = S$1(t);
                e.al.forEach((t, n) => {
                    e.tl.wu(n);
                }), e.ul.Bu(), e.al = new Map, e.hl = new ct(j.D);
            }
            /**
     * Reconcile the query views of the provided query targets with the state from
     * persistence. Raises snapshots for any changes that affect the local
     * client and returns the updated state of all target's query data.
     *
     * @param targets the list of targets with views that need to be recomputed
     * @param transitionToPrimary `true` iff the tab transitions from a secondary
     * tab to a primary tab
     */
            // PORTING NOTE: Multi-Tab only.
            (n), n.fl = !1, await n.tl.Nu(!1);
        }
    }

    async function Tr(t, e, n) {
        const s = S$1(t), i = [], r = [];
        for (const t of e) {
            let e;
            const n = s.rl.get(t);
            if (n && 0 !== n.length) {
                // For queries that have a local View, we fetch their current state
                // from LocalStore (as the resume token and the snapshot version
                // might have changed) and reconcile their views with the persisted
                // state (the list of syncedDocuments may have gotten out of sync).
                e = await s.Wa.Hh(xn(n[0]));
                for (const t of n) {
                    const e = s.il.get(t), n = await fr(s, e);
                    n.snapshot && r.push(n.snapshot);
                }
            } else {
                // For queries that never executed on this client, we need to
                // allocate the target in LocalStore and initialize a new View.
                const n = await qi(s.Wa, t);
                e = await s.Wa.Hh(n), await s.Tl(Er(n), t, 
                /*current=*/ !1);
            }
            i.push(e);
        }
        return s.sl.Ra(r), i;
    }

    /**
     * Creates a `Query` object from the specified `Target`. There is no way to
     * obtain the original `Query`, so we synthesize a `Query` from the `Target`
     * object.
     *
     * The synthesized result might be different from the original `Query`, but
     * since the synthesized `Query` should return the same results as the
     * original one (only the presentation of results might differ), the potential
     * difference will not cause issues.
     */
    // PORTING NOTE: Multi-Tab only.
    function Er(t) {
        return Sn(t.path, t.collectionGroup, t.orderBy, t.filters, t.limit, "F" /* First */ , t.startAt, t.endAt);
    }

    /** Returns the IDs of the clients that are currently active. */
    // PORTING NOTE: Multi-Tab only.
    function Ir(t) {
        const e = S$1(t);
        return S$1(S$1(e.Wa).persistence).Ih();
    }

    /** Applies a query target change from a different tab. */
    // PORTING NOTE: Multi-Tab only.
    async function Ar(t, e, n, s) {
        const i = S$1(t);
        if (i.fl) 
        // If we receive a target state notification via WebStorage, we are
        // either already secondary or another tab has taken the primary lease.
        V$1("SyncEngine", "Ignoring unexpected query state notification."); else if (i.rl.has(e)) switch (n) {
          case "current":
          case "not-current":
            {
                const t = await function(t) {
                    const e = S$1(t), n = S$1(e.Nh);
                    return e.persistence.runTransaction("Get new document changes", "readonly", t => n.to(t, e.Dh)).then(({eo: t, readTime: n}) => (e.Dh = n, 
                    t));
                }
                /**
     * Reads the newest document change from persistence and moves the internal
     * synchronization marker forward so that calls to `getNewDocumentChanges()`
     * only return changes that happened after client initialization.
     */
                // PORTING NOTE: Multi-Tab only.
                (i.Wa), s = vt.se(e, "current" === n);
                await i.Rl(t, s);
                break;
            }

          case "rejected":
            await i.Wa.Jh(e, 
            /* keepPersistedTargetData */ !0), i.Il(e, s);
            break;

          default:
            b();
        }
    }

    /** Adds or removes Watch targets for queries from different tabs. */ async function Rr(t, e, n) {
        const s = S$1(t);
        if (s.fl) {
            for (const t of e) {
                if (s.rl.has(t)) {
                    // A target might have been added in a previous attempt
                    V$1("SyncEngine", "Adding an already active target " + t);
                    continue;
                }
                const e = await qi(s.Wa, t), n = await s.Wa.Hh(e);
                await s.Tl(Er(e), n.targetId, 
                /*current=*/ !1), s.tl.listen(n);
            }
            for (const t of n) 
            // Check that the target is still active since the target might have been
            // removed if it has been rejected by the backend.
            s.rl.has(t) && 
            // Release queries that are still active.
            await s.Wa.Jh(t, /* keepPersistedTargetData */ !1).then(() => {
                s.tl.wu(t), s.Il(t);
            }).catch(Bi);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Holds the listeners and the last received ViewSnapshot for a query being
     * tracked by EventManager.
     */ class mr {
        constructor() {
            this.Nl = void 0, this.listeners = [];
        }
    }

    /**
     * EventManager is responsible for mapping queries to query event emitters.
     * It handles "fan-out". -- Identical queries will re-use the same watch on the
     * backend.
     */ class Pr {
        constructor(t) {
            this.Eu = t, this.xl = new is(t => On(t), kn), this.onlineState = "Unknown" /* Unknown */ , 
            this.kl = new Set, this.Eu.subscribe(this);
        }
        async listen(t) {
            const e = t.query;
            let n = !1, s = this.xl.get(e);
            if (s || (n = !0, s = new mr), n) try {
                s.Nl = await this.Eu.listen(e);
            } catch (e) {
                const n = ps(e, `Initialization of query '${Fn(t.query)}' failed`);
                return void t.onError(n);
            }
            this.xl.set(e, s), s.listeners.push(t);
            // Run global snapshot listeners if a consistent snapshot has been emitted.
            t.Hc(this.onlineState);
            if (s.Nl) {
                t.Ol(s.Nl) && this.Fl();
            }
        }
        async wu(t) {
            const e = t.query;
            let n = !1;
            const s = this.xl.get(e);
            if (s) {
                const e = s.listeners.indexOf(t);
                e >= 0 && (s.listeners.splice(e, 1), n = 0 === s.listeners.length);
            }
            if (n) return this.xl.delete(e), this.Eu.wu(e);
        }
        Ra(t) {
            let e = !1;
            for (const n of t) {
                const t = n.query, s = this.xl.get(t);
                if (s) {
                    for (const t of s.listeners) t.Ol(n) && (e = !0);
                    s.Nl = n;
                }
            }
            e && this.Fl();
        }
        bl(t, e) {
            const n = this.xl.get(t);
            if (n) for (const t of n.listeners) t.onError(e);
            // Remove all listeners. NOTE: We don't need to call syncEngine.unlisten()
            // after an error.
                    this.xl.delete(t);
        }
        ml(t) {
            this.onlineState = t;
            let e = !1;
            this.xl.forEach((n, s) => {
                for (const n of s.listeners) 
                // Run global snapshot listeners if a consistent snapshot has been emitted.
                n.Hc(t) && (e = !0);
            }), e && this.Fl();
        }
        Ml(t) {
            this.kl.add(t), 
            // Immediately fire an initial event, indicating all existing listeners
            // are in-sync.
            t.next();
        }
        $l(t) {
            this.kl.delete(t);
        }
        // Call all global snapshot listeners that have been set.
        Fl() {
            this.kl.forEach(t => {
                t.next();
            });
        }
    }

    /**
     * QueryListener takes a series of internal view snapshots and determines
     * when to raise the event.
     *
     * It uses an Observer to dispatch events.
     */ class Vr {
        constructor(t, e, n) {
            this.query = t, this.Ll = e, 
            /**
             * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
             * observer. This flag is set to true once we've actually raised an event.
             */
            this.ql = !1, this.Bl = null, this.onlineState = "Unknown" /* Unknown */ , this.options = n || {};
        }
        /**
         * Applies the new ViewSnapshot to this listener, raising a user-facing event
         * if applicable (depending on what changed, whether the user has opted into
         * metadata-only changes, etc.). Returns true if a user-facing event was
         * indeed raised.
         */    Ol(t) {
            if (!this.options.includeMetadataChanges) {
                // Remove the metadata only changes.
                const e = [];
                for (const n of t.docChanges) 3 /* Metadata */ !== n.type && e.push(n);
                t = new bt(t.query, t.docs, t.zt, e, t.Ht, t.fromCache, t.Jt, 
                /* excludesMetadataChanges= */ !0);
            }
            let e = !1;
            return this.ql ? this.Ul(t) && (this.Ll.next(t), e = !0) : this.Wl(t, this.onlineState) && (this.Kl(t), 
            e = !0), this.Bl = t, e;
        }
        onError(t) {
            this.Ll.error(t);
        }
        /** Returns whether a snapshot was raised. */    Hc(t) {
            this.onlineState = t;
            let e = !1;
            return this.Bl && !this.ql && this.Wl(this.Bl, t) && (this.Kl(this.Bl), e = !0), 
            e;
        }
        Wl(t, e) {
            // Always raise the first event when we're synced
            if (!t.fromCache) return !0;
            // NOTE: We consider OnlineState.Unknown as online (it should become Offline
            // or Online if we wait long enough).
                    const n = "Offline" /* Offline */ !== e;
            // Don't raise the event if we're online, aren't synced yet (checked
            // above) and are waiting for a sync.
                    return (!this.options.jl || !n) && (!t.docs.$() || "Offline" /* Offline */ === e);
            // Raise data from cache if we have any documents or we are offline
            }
        Ul(t) {
            // We don't need to handle includeDocumentMetadataChanges here because
            // the Metadata only changes have already been stripped out if needed.
            // At this point the only changes we will see are the ones we should
            // propagate.
            if (t.docChanges.length > 0) return !0;
            const e = this.Bl && this.Bl.hasPendingWrites !== t.hasPendingWrites;
            return !(!t.Jt && !e) && !0 === this.options.includeMetadataChanges;
            // Generally we should have hit one of the cases above, but it's possible
            // to get here if there were only metadata docChanges and they got
            // stripped out.
            }
        Kl(t) {
            t = bt.Xt(t.query, t.docs, t.Ht, t.fromCache), this.ql = !0, this.Ll.next(t);
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // TOOD(b/140938512): Drop SimpleQueryEngine and rename IndexFreeQueryEngine.
    /**
     * A query engine that takes advantage of the target document mapping in the
     * QueryCache. The IndexFreeQueryEngine optimizes query execution by only
     * reading the documents that previously matched a query plus any documents that were
     * edited after the query was last listened to.
     *
     * There are some cases where Index-Free queries are not guaranteed to produce
     * the same results as full collection scans. In these cases, the
     * IndexFreeQueryEngine falls back to full query processing. These cases are:
     *
     * - Limit queries where a document that matched the query previously no longer
     *   matches the query.
     *
     * - Limit queries where a document edit may cause the document to sort below
     *   another document that is in the local cache.
     *
     * - Queries that have never been CURRENT or free of Limbo documents.
     */ class gr {
        kh(t) {
            this.Ql = t;
        }
        ws(t, e, n, s) {
            // Queries that match all documents don't benefit from using
            // IndexFreeQueries. It is more efficient to scan all documents in a
            // collection, rather than to perform individual lookups.
            return e.Tn() || n.isEqual(q$1.min()) ? this.Gl(t, e) : this.Ql._s(t, s).next(i => {
                const r = this.zl(e, i);
                return (e.En() || e.In()) && this.jc(e._n, r, s, n) ? this.Gl(t, e) : (m() <= LogLevel.DEBUG && V$1("IndexFreeQueryEngine", "Re-using previous result from %s to execute query: %s", n.toString(), Fn(e)), 
                this.Ql.ws(t, e, n).next(t => (
                // We merge `previousResults` into `updateResults`, since
                // `updateResults` is already a DocumentMap. If a document is
                // contained in both lists, then its contents are the same.
                r.forEach(e => {
                    t = t._t(e.key, e);
                }), t)));
            });
            // Queries that have never seen a snapshot without limbo free documents
            // should also be run as a full collection scan.
            }
        /** Applies the query filter and sorting to the provided documents.  */    zl(t, e) {
            // Sort the documents and re-apply the query filter since previously
            // matching documents do not necessarily still match the query.
            let n = new ft($n(t));
            return e.forEach((e, s) => {
                s instanceof gn && Mn(t, s) && (n = n.add(s));
            }), n;
        }
        /**
         * Determines if a limit query needs to be refilled from cache, making it
         * ineligible for index-free execution.
         *
         * @param sortedPreviousResults The documents that matched the query when it
         * was last synchronized, sorted by the query's comparator.
         * @param remoteKeys The document keys that matched the query at the last
         * snapshot.
         * @param limboFreeSnapshotVersion The version of the snapshot when the query
         * was last synchronized.
         */    jc(t, e, n, s) {
            // The query needs to be refilled if a previously matching document no
            // longer matches.
            if (n.size !== e.size) return !0;
            // Limit queries are not eligible for index-free query execution if there is
            // a potential that an older document from cache now sorts before a document
            // that was previously part of the limit. This, however, can only happen if
            // the document at the edge of the limit goes out of limit.
            // If a document that is not the limit boundary sorts differently,
            // the boundary of the limit itself did not change and documents from cache
            // will continue to be "rejected" by this boundary. Therefore, we can ignore
            // any modifications that don't affect the last document.
                    const i = "F" /* First */ === t ? e.last() : e.first();
            return !!i && (i.hasPendingWrites || i.version.p(s) > 0);
        }
        Gl(t, e) {
            return m() <= LogLevel.DEBUG && V$1("IndexFreeQueryEngine", "Using full collection scan to execute query:", Fn(e)), 
            this.Ql.ws(t, e, q$1.min());
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class yr {
        constructor(t, e) {
            this.hs = t, this.br = e, 
            /**
             * The set of all mutations that have been sent but not yet been applied to
             * the backend.
             */
            this.os = [], 
            /** Next value to use when assigning sequential IDs to each mutation batch. */
            this.Hl = 1, 
            /** An ordered mapping between documents and the mutations batch IDs. */
            this.Jl = new ft(Ji.ku);
        }
        Cr(t) {
            return rs.resolve(0 === this.os.length);
        }
        Dr(t, e, n, s) {
            const i = this.Hl;
            if (this.Hl++, this.os.length > 0) {
                this.os[this.os.length - 1];
            }
            const r = new ns(i, e, n, s);
            this.os.push(r);
            // Track references by document key and index collection parents.
            for (const e of s) this.Jl = this.Jl.add(new Ji(e.key, i)), this.hs.Nr(t, e.key.path.O());
            return rs.resolve(r);
        }
        xr(t, e) {
            return rs.resolve(this.Yl(e));
        }
        Or(t, e) {
            const n = e + 1, s = this.Xl(n), i = s < 0 ? 0 : s;
            // The requested batchId may still be out of range so normalize it to the
            // start of the queue.
                    return rs.resolve(this.os.length > i ? this.os[i] : null);
        }
        Fr() {
            return rs.resolve(0 === this.os.length ? -1 : this.Hl - 1);
        }
        Mr(t) {
            return rs.resolve(this.os.slice());
        }
        us(t, e) {
            const n = new Ji(e, 0), s = new Ji(e, Number.POSITIVE_INFINITY), i = [];
            return this.Jl.$t([ n, s ], t => {
                const e = this.Yl(t.Wu);
                i.push(e);
            }), rs.resolve(i);
        }
        ds(t, e) {
            let n = new ft(F$1);
            return e.forEach(t => {
                const e = new Ji(t, 0), s = new Ji(t, Number.POSITIVE_INFINITY);
                this.Jl.$t([ e, s ], t => {
                    n = n.add(t.Wu);
                });
            }), rs.resolve(this.Zl(n));
        }
        Rs(t, e) {
            // Use the query path as a prefix for testing if a document matches the
            // query.
            const n = e.path, s = n.length + 1;
            // Construct a document reference for actually scanning the index. Unlike
            // the prefix the document key in this reference must have an even number of
            // segments. The empty segment can be used a suffix of the query path
            // because it precedes all other segments in an ordered traversal.
            let i = n;
            j.Z(i) || (i = i.child(""));
            const r = new Ji(new j(i), 0);
            // Find unique batchIDs referenced by all documents potentially matching the
            // query.
                    let o = new ft(F$1);
            return this.Jl.Lt(t => {
                const e = t.key.path;
                return !!n.L(e) && (
                // Rows with document keys more than one segment longer than the query
                // path can't be matches. For example, a query on 'rooms' can't match
                // the document /rooms/abc/messages/xyx.
                // TODO(mcg): we'll need a different scanner when we implement
                // ancestor queries.
                e.length === s && (o = o.add(t.Wu)), !0);
            }, r), rs.resolve(this.Zl(o));
        }
        Zl(t) {
            // Construct an array of matching batches, sorted by batchID to ensure that
            // multiple mutations affecting the same document key are applied in order.
            const e = [];
            return t.forEach(t => {
                const n = this.Yl(t);
                null !== n && e.push(n);
            }), e;
        }
        Lr(t, e) {
            v$1(0 === this.t_(e.batchId, "removed")), this.os.shift();
            let n = this.Jl;
            return rs.forEach(e.mutations, s => {
                const i = new Ji(s.key, e.batchId);
                return n = n.delete(i), this.br.Ur(t, s.key);
            }).next(() => {
                this.Jl = n;
            });
        }
        Br(t) {
            // No-op since the memory mutation queue does not maintain a separate cache.
        }
        Kr(t, e) {
            const n = new Ji(e, 0), s = this.Jl.qt(n);
            return rs.resolve(e.isEqual(s && s.key));
        }
        Wr(t) {
            return this.os.length, rs.resolve();
        }
        /**
         * Finds the index of the given batchId in the mutation queue and asserts that
         * the resulting index is within the bounds of the queue.
         *
         * @param batchId The batchId to search for
         * @param action A description of what the caller is doing, phrased in passive
         * form (e.g. "acknowledged" in a routine that acknowledges batches).
         */    t_(t, e) {
            return this.Xl(t);
        }
        /**
         * Finds the index of the given batchId in the mutation queue. This operation
         * is O(1).
         *
         * @return The computed index of the batch with the given batchId, based on
         * the state of the queue. Note this index can be negative if the requested
         * batchId has already been remvoed from the queue or past the end of the
         * queue if the batchId is larger than the last added batch.
         */    Xl(t) {
            if (0 === this.os.length) 
            // As an index this is past the end of the queue
            return 0;
            // Examine the front of the queue to figure out the difference between the
            // batchId and indexes in the array. Note that since the queue is ordered
            // by batchId, if the first batch has a larger batchId then the requested
            // batchId doesn't exist in the queue.
                    return t - this.os[0].batchId;
        }
        /**
         * A version of lookupMutationBatch that doesn't return a promise, this makes
         * other functions that uses this code easier to read and more efficent.
         */    Yl(t) {
            const e = this.Xl(t);
            if (e < 0 || e >= this.os.length) return null;
            return this.os[e];
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class pr {
        /**
         * @param sizer Used to assess the size of a document. For eager GC, this is expected to just
         * return 0 to avoid unnecessarily doing the work of calculating the size.
         */
        constructor(t, e) {
            this.hs = t, this.e_ = e, 
            /** Underlying cache of documents and their read times. */
            this.docs = new ct(j.D), 
            /** Size of all cached documents. */
            this.size = 0;
        }
        /**
         * Adds the supplied entry to the cache and updates the cache size as appropriate.
         *
         * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()`.
         */    zn(t, e, n) {
            const s = e.key, i = this.docs.get(s), r = i ? i.size : 0, o = this.e_(e);
            return this.docs = this.docs._t(s, {
                Hr: e,
                size: o,
                readTime: n
            }), this.size += o - r, this.hs.Nr(t, s.path.O());
        }
        /**
         * Removes the specified entry from the cache and updates the cache size as appropriate.
         *
         * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()`.
         */    Jn(t) {
            const e = this.docs.get(t);
            e && (this.docs = this.docs.remove(t), this.size -= e.size);
        }
        Yn(t, e) {
            const n = this.docs.get(e);
            return rs.resolve(n ? n.Hr : null);
        }
        getEntries(t, e) {
            let n = Et();
            return e.forEach(t => {
                const e = this.docs.get(t);
                n = n._t(t, e ? e.Hr : null);
            }), rs.resolve(n);
        }
        ws(t, e, n) {
            let s = At();
            // Documents are ordered by key, so we can use a prefix scan to narrow down
            // the documents we need to match the query against.
                    const i = new j(e.path.child("")), r = this.docs.At(i);
            for (;r.pt(); ) {
                const {key: t, value: {Hr: i, readTime: o}} = r.yt();
                if (!e.path.L(t.path)) break;
                o.p(n) <= 0 || i instanceof gn && Mn(e, i) && (s = s._t(i.key, i));
            }
            return rs.resolve(s);
        }
        n_(t, e) {
            return rs.forEach(this.docs, t => e(t));
        }
        so(t) {
            // `trackRemovals` is ignores since the MemoryRemoteDocumentCache keeps
            // a separate changelog and does not need special handling for removals.
            return new pr.io(this);
        }
        oo(t) {
            return rs.resolve(this.size);
        }
    }

    /**
     * Handles the details of adding and updating documents in the MemoryRemoteDocumentCache.
     */ pr.io = class extends os {
        constructor(t) {
            super(), this.ho = t;
        }
        ts(t) {
            const e = [];
            return this.jn.forEach((n, s) => {
                s ? e.push(this.ho.zn(t, s, this.readTime)) : this.ho.Jn(n);
            }), rs.Wn(e);
        }
        Xn(t, e) {
            return this.ho.Yn(t, e);
        }
        Zn(t, e) {
            return this.ho.getEntries(t, e);
        }
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class br {
        constructor(t) {
            this.persistence = t, 
            /**
             * Maps a target to the data about that target
             */
            this.s_ = new is(t => Z$1(t), et), 
            /** The last received snapshot version. */
            this.lastRemoteSnapshotVersion = q$1.min(), 
            /** The highest numbered target ID encountered. */
            this.highestTargetId = 0, 
            /** The highest sequence number encountered. */
            this.i_ = 0, 
            /**
             * A ordered bidirectional mapping between documents and the remote target
             * IDs.
             */
            this.r_ = new Hi, this.targetCount = 0, this.o_ = yi._o();
        }
        Fe(t, e) {
            return this.s_.forEach((t, n) => e(n)), rs.resolve();
        }
        Eo(t) {
            return rs.resolve(this.lastRemoteSnapshotVersion);
        }
        Io(t) {
            return rs.resolve(this.i_);
        }
        do(t) {
            return this.highestTargetId = this.o_.next(), rs.resolve(this.highestTargetId);
        }
        Ao(t, e, n) {
            return n && (this.lastRemoteSnapshotVersion = n), e > this.i_ && (this.i_ = e), 
            rs.resolve();
        }
        mo(t) {
            this.s_.set(t.target, t);
            const e = t.targetId;
            e > this.highestTargetId && (this.o_ = new yi(e), this.highestTargetId = e), t.sequenceNumber > this.i_ && (this.i_ = t.sequenceNumber);
        }
        Ro(t, e) {
            return this.mo(e), this.targetCount += 1, rs.resolve();
        }
        Vo(t, e) {
            return this.mo(e), rs.resolve();
        }
        yo(t, e) {
            return this.s_.delete(e.target), this.r_.qu(e.targetId), this.targetCount -= 1, 
            rs.resolve();
        }
        mr(t, e, n) {
            let s = 0;
            const i = [];
            return this.s_.forEach((r, o) => {
                o.sequenceNumber <= e && null === n.get(o.targetId) && (this.s_.delete(r), i.push(this.po(t, o.targetId)), 
                s++);
            }), rs.Wn(i).next(() => s);
        }
        bo(t) {
            return rs.resolve(this.targetCount);
        }
        vo(t, e) {
            const n = this.s_.get(e) || null;
            return rs.resolve(n);
        }
        So(t, e, n) {
            return this.r_.Mu(e, n), rs.resolve();
        }
        Do(t, e, n) {
            this.r_.Lu(e, n);
            const s = this.persistence.br, i = [];
            return s && e.forEach(e => {
                i.push(s.Ur(t, e));
            }), rs.Wn(i);
        }
        po(t, e) {
            return this.r_.qu(e), rs.resolve();
        }
        xo(t, e) {
            const n = this.r_.Uu(e);
            return rs.resolve(n);
        }
        Kr(t, e) {
            return rs.resolve(this.r_.Kr(e));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A memory-backed instance of Persistence. Data is stored only in RAM and
     * not persisted across sessions.
     */
    class vr {
        /**
         * The constructor accepts a factory for creating a reference delegate. This
         * allows both the delegate and this instance to have strong references to
         * each other without having nullable fields that would then need to be
         * checked or asserted on every access.
         */
        constructor(t) {
            this.h_ = {}, this.Mo = new ls(0), this.$o = !1, this.$o = !0, this.br = t(this), 
            this.Qo = new br(this);
            this.hs = new ii, this.rs = new pr(this.hs, t => this.br.a_(t));
        }
        start() {
            return Promise.resolve();
        }
        fh() {
            // No durable state to ensure is closed on shutdown.
            return this.$o = !1, Promise.resolve();
        }
        get dr() {
            return this.$o;
        }
        Zo() {
            // No op.
        }
        th() {
            // No op.
        }
        Ph() {
            return this.hs;
        }
        Ah(t) {
            let e = this.h_[t.s()];
            return e || (e = new yr(this.hs, this.br), this.h_[t.s()] = e), e;
        }
        Rh() {
            return this.Qo;
        }
        mh() {
            return this.rs;
        }
        runTransaction(t, e, n) {
            V$1("MemoryPersistence", "Starting transaction:", t);
            const s = new Sr(this.Mo.next());
            return this.br.u_(), n(s).next(t => this.br.c_(s).next(() => t)).Bn().then(t => (s.ss(), 
            t));
        }
        l_(t, e) {
            return rs.Kn(Object.values(this.h_).map(n => () => n.Kr(t, e)));
        }
    }

    /**
     * Memory persistence is not actually transactional, but future implementations
     * may have transaction-scoped state.
     */ class Sr extends as {
        constructor(t) {
            super(), this.ko = t;
        }
    }

    class Cr {
        constructor(t) {
            this.persistence = t, 
            /** Tracks all documents that are active in Query views. */
            this.__ = new Hi, 
            /** The list of documents that are potentially GCed after each transaction. */
            this.f_ = null;
        }
        static d_(t) {
            return new Cr(t);
        }
        get w_() {
            if (this.f_) return this.f_;
            throw b();
        }
        Co(t, e, n) {
            return this.__.Co(n, e), this.w_.delete(n), rs.resolve();
        }
        No(t, e, n) {
            return this.__.No(n, e), this.w_.add(n), rs.resolve();
        }
        Ur(t, e) {
            return this.w_.add(e), rs.resolve();
        }
        removeTarget(t, e) {
            this.__.qu(e.targetId).forEach(t => this.w_.add(t));
            const n = this.persistence.Rh();
            return n.xo(t, e.targetId).next(t => {
                t.forEach(t => this.w_.add(t));
            }).next(() => n.yo(t, e));
        }
        u_() {
            this.f_ = new Set;
        }
        c_(t) {
            // Remove newly orphaned documents.
            const e = this.persistence.mh().so();
            return rs.forEach(this.w_, n => this.T_(t, n).next(t => {
                t || e.Jn(n);
            })).next(() => (this.f_ = null, e.apply(t)));
        }
        bh(t, e) {
            return this.T_(t, e).next(t => {
                t ? this.w_.delete(e) : this.w_.add(e);
            });
        }
        a_(t) {
            // For eager GC, we don't care about the document size, there are no size thresholds.
            return 0;
        }
        T_(t, e) {
            return rs.Kn([ () => rs.resolve(this.__.Kr(e)), () => this.persistence.Rh().Kr(t, e), () => this.persistence.l_(t, e) ]);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provides a simple helper class that implements the Stream interface to
     * bridge to other implementations that are streams but do not implement the
     * interface. The stream callbacks are invoked with the callOn... methods.
     */ class Dr {
        constructor(t) {
            this.E_ = t.E_, this.I_ = t.I_;
        }
        Ia(t) {
            this.A_ = t;
        }
        fa(t) {
            this.R_ = t;
        }
        onMessage(t) {
            this.m_ = t;
        }
        close() {
            this.I_();
        }
        send(t) {
            this.E_(t);
        }
        P_() {
            this.A_();
        }
        V_(t) {
            this.R_(t);
        }
        g_(t) {
            this.m_(t);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Nr = {
        BatchGetDocuments: "batchGet",
        Commit: "commit",
        RunQuery: "runQuery"
    };

    /**
     * Maps RPC names to the corresponding REST endpoint name.
     *
     * We use array notation to avoid mangling.
     */ class xr extends 
    /**
     * Base class for all Rest-based connections to the backend (WebChannel and
     * HTTP).
     */
    class {
        constructor(t) {
            this.y_ = t, this.et = t.et;
            const e = t.ssl ? "https" : "http";
            this.p_ = e + "://" + t.host, this.b_ = "projects/" + this.et.projectId + "/databases/" + this.et.database + "/documents";
        }
        Da(t, e, n, s) {
            const i = this.v_(t, e);
            V$1("RestConnection", "Sending: ", i, n);
            const r = {};
            return this.S_(r, s), this.C_(t, i, r, n).then(t => (V$1("RestConnection", "Received: ", t), 
            t), e => {
                throw y$1("RestConnection", t + " failed with error: ", e, "url: ", i, "request:", n), 
                e;
            });
        }
        Na(t, e, n, s) {
            // The REST API automatically aggregates all of the streamed results, so we
            // can just use the normal invoke() method.
            return this.Da(t, e, n, s);
        }
        /**
         * Modifies the headers for a request, adding any authorization token if
         * present and any additional headers for the request.
         */    S_(t, e) {
            if (t["X-Goog-Api-Client"] = "gl-js/ fire/7.17.1", 
            // Content-Type: text/plain will avoid preflight requests which might
            // mess with CORS and redirects by proxies. If we add custom headers
            // we will need to change this code to potentially use the $httpOverwrite
            // parameter supported by ESF to avoid	triggering preflight requests.
            t["Content-Type"] = "text/plain", e) for (const n in e.h) e.h.hasOwnProperty(n) && (t[n] = e.h[n]);
        }
        v_(t, e) {
            const n = Nr[t];
            return `${this.p_}/v1/${e}:${n}`;
        }
    }
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ {
        constructor(t) {
            super(t), this.forceLongPolling = t.forceLongPolling;
        }
        C_(t, e, n, s) {
            return new Promise((i, r) => {
                const o = new esm_5;
                o.listenOnce(esm_3.COMPLETE, () => {
                    try {
                        switch (o.getLastErrorCode()) {
                          case esm_2.NO_ERROR:
                            const e = o.getResponseJson();
                            V$1("Connection", "XHR received:", JSON.stringify(e)), i(e);
                            break;

                          case esm_2.TIMEOUT:
                            V$1("Connection", 'RPC "' + t + '" timed out'), r(new D$1(C$1.DEADLINE_EXCEEDED, "Request time out"));
                            break;

                          case esm_2.HTTP_ERROR:
                            const n = o.getStatus();
                            if (V$1("Connection", 'RPC "' + t + '" failed with status:', n, "response text:", o.getResponseText()), 
                            n > 0) {
                                const t = o.getResponseJson().error;
                                if (t && t.status && t.message) {
                                    const e = function(t) {
                                        const e = t.toLowerCase().replace("_", "-");
                                        return Object.values(C$1).indexOf(e) >= 0 ? e : C$1.UNKNOWN;
                                    }(t.status);
                                    r(new D$1(e, t.message));
                                } else r(new D$1(C$1.UNKNOWN, "Server responded with status " + o.getStatus()));
                            } else 
                            // If we received an HTTP_ERROR but there's no status code,
                            // it's most probably a connection issue
                            r(new D$1(C$1.UNAVAILABLE, "Connection failed."));
                            break;

                          default:
                            b();
                        }
                    } finally {
                        V$1("Connection", 'RPC "' + t + '" completed.');
                    }
                });
                const h = JSON.stringify(s);
                o.send(e, "POST", h, n, 15);
            });
        }
        Aa(t, e) {
            const n = [ this.p_, "/", "google.firestore.v1.Firestore", "/", t, "/channel" ], s = esm_1(), i = {
                // Required for backend stickiness, routing behavior is based on this
                // parameter.
                httpSessionIdParam: "gsessionid",
                initMessageHeaders: {},
                messageUrlParams: {
                    // This param is used to improve routing and project isolation by the
                    // backend and must be included in every request.
                    database: `projects/${this.et.projectId}/databases/${this.et.database}`
                },
                sendRawJson: !0,
                supportsCrossDomainXhr: !0,
                internalChannelParams: {
                    // Override the default timeout (randomized between 10-20 seconds) since
                    // a large write batch on a slow internet connection may take a long
                    // time to send to the backend. Rather than have WebChannel impose a
                    // tight timeout which could lead to infinite timeouts and retries, we
                    // set it very large (5-10 minutes) and rely on the browser's builtin
                    // timeouts to kick in if the request isn't working.
                    forwardChannelRequestTimeoutMs: 6e5
                },
                forceLongPolling: this.forceLongPolling
            };
            this.S_(i.initMessageHeaders, e), 
            // Sending the custom headers we just added to request.initMessageHeaders
            // (Authorization, etc.) will trigger the browser to make a CORS preflight
            // request because the XHR will no longer meet the criteria for a "simple"
            // CORS request:
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
            // Therefore to avoid the CORS preflight request (an extra network
            // roundtrip), we use the httpHeadersOverwriteParam option to specify that
            // the headers should instead be encoded into a special "$httpHeaders" query
            // parameter, which is recognized by the webchannel backend. This is
            // formally defined here:
            // https://github.com/google/closure-library/blob/b0e1815b13fb92a46d7c9b3c30de5d6a396a3245/closure/goog/net/rpc/httpcors.js#L32
            // TODO(b/145624756): There is a backend bug where $httpHeaders isn't respected if the request
            // doesn't have an Origin header. So we have to exclude a few browser environments that are
            // known to (sometimes) not include an Origin. See
            // https://github.com/firebase/firebase-js-sdk/issues/1491.
            isMobileCordova() || isReactNative() || isElectron() || isIE() || isUWP() || isBrowserExtension() || (i.httpHeadersOverwriteParam = "$httpHeaders");
            const r = n.join("");
            V$1("Connection", "Creating WebChannel: " + r, i);
            const o = s.createWebChannel(r, i);
            // WebChannel supports sending the first message with the handshake - saving
            // a network round trip. However, it will have to call send in the same
            // JS event loop as open. In order to enforce this, we delay actually
            // opening the WebChannel until send is called. Whether we have called
            // open is tracked with this variable.
                    let h = !1, d = !1;
            // A flag to determine whether the stream was closed (by us or through an
            // error/close event) to avoid delivering multiple close events or sending
            // on a closed stream
                    const w = new Dr({
                E_: t => {
                    d ? V$1("Connection", "Not sending because WebChannel is closed:", t) : (h || (V$1("Connection", "Opening WebChannel transport."), 
                    o.open(), h = !0), V$1("Connection", "WebChannel sending:", t), o.send(t));
                },
                I_: () => o.close()
            }), T = (t, e) => {
                // TODO(dimond): closure typing seems broken because WebChannel does
                // not implement goog.events.Listenable
                o.listen(t, t => {
                    try {
                        e(t);
                    } catch (t) {
                        setTimeout(() => {
                            throw t;
                        }, 0);
                    }
                });
            };
            // Closure events are guarded and exceptions are swallowed, so catch any
            // exception and rethrow using a setTimeout so they become visible again.
            // Note that eventually this function could go away if we are confident
            // enough the code is exception free.
                    return T(esm_4.EventType.OPEN, () => {
                d || V$1("Connection", "WebChannel transport opened.");
            }), T(esm_4.EventType.CLOSE, () => {
                d || (d = !0, V$1("Connection", "WebChannel transport closed"), w.V_());
            }), T(esm_4.EventType.ERROR, t => {
                d || (d = !0, y$1("Connection", "WebChannel transport errored:", t), w.V_(new D$1(C$1.UNAVAILABLE, "The operation could not be completed")));
            }), T(esm_4.EventType.MESSAGE, t => {
                var e;
                if (!d) {
                    const n = t.data[0];
                    v$1(!!n);
                    // TODO(b/35143891): There is a bug in One Platform that caused errors
                    // (and only errors) to be wrapped in an extra array. To be forward
                    // compatible with the bug we need to check either condition. The latter
                    // can be removed once the fix has been rolled out.
                    // Use any because msgData.error is not typed.
                    const s = n, i = s.error || (null === (e = s[0]) || void 0 === e ? void 0 : e.error);
                    if (i) {
                        V$1("Connection", "WebChannel received error:", i);
                        // error.status will be a string like 'OK' or 'NOT_FOUND'.
                        const t = i.status;
                        let e = function(t) {
                            // lookup by string
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const e = ot[t];
                            if (void 0 !== e) return ut(e);
                        }(t), n = i.message;
                        void 0 === e && (e = C$1.INTERNAL, n = "Unknown error status: " + t + " with message " + i.message), 
                        // Mark closed so no further events are propagated
                        d = !0, w.V_(new D$1(e, n)), o.close();
                    } else V$1("Connection", "WebChannel received:", n), w.g_(n);
                }
            }), setTimeout(() => {
                // Technically we could/should wait for the WebChannel opened event,
                // but because we want to send the first message with the WebChannel
                // handshake we pretend the channel opened here (asynchronously), and
                // then delay the actual open until the first message is sent.
                w.P_();
            }, 0), w;
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // References to `window` are guarded by BrowserConnectivityMonitor.isAvailable()
    /* eslint-disable no-restricted-globals */
    /**
     * Browser implementation of ConnectivityMonitor.
     */
    class kr {
        constructor() {
            this.D_ = () => this.N_(), this.x_ = () => this.k_(), this.O_ = [], this.F_();
        }
        Ja(t) {
            this.O_.push(t);
        }
        fh() {
            window.removeEventListener("online", this.D_), window.removeEventListener("offline", this.x_);
        }
        F_() {
            window.addEventListener("online", this.D_), window.addEventListener("offline", this.x_);
        }
        N_() {
            V$1("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
            for (const t of this.O_) t(0 /* AVAILABLE */);
        }
        k_() {
            V$1("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
            for (const t of this.O_) t(1 /* UNAVAILABLE */);
        }
        // TODO(chenbrian): Consider passing in window either into this component or
        // here for testing via FakeWindow.
        /** Checks that all used attributes of window are available. */
        static Qs() {
            return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Or {
        Ja(t) {
            // No-op.
        }
        fh() {
            // No-op.
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Initializes the WebChannelConnection for the browser. */ function Fr(t) {
        return Promise.resolve(new xr(t));
    }

    /** Return the Platform-specific connectivity monitor. */
    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function Mr(t) {
        return new he(t, /* useProto3Json= */ !0);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const $r = "You are using the memory-only build of Firestore. Persistence support is only available via the @firebase/firestore bundle or the firebase-firestore.js build.";

    /**
     * Provides all components needed for Firestore with in-memory persistence.
     * Uses EagerGC garbage collection.
     */ class Lr {
        async initialize(t) {
            this.el = this.M_(t), this.persistence = this.L_(t), await this.persistence.start(), 
            this.q_ = this.B_(t), this.Wa = this.U_(t);
        }
        B_(t) {
            return null;
        }
        U_(t) {
            /** Manages our in-memory or durable persistence. */
            return e = this.persistence, n = new gr, s = t.W_, new Li(e, n, s);
            var e, n, s;
        }
        L_(t) {
            if (t.j_.K_) throw new D$1(C$1.FAILED_PRECONDITION, $r);
            return new vr(Cr.d_);
        }
        M_(t) {
            return new or;
        }
        async terminate() {
            this.q_ && this.q_.stop(), await this.el.fh(), await this.persistence.fh();
        }
        clearPersistence(t, e) {
            throw new D$1(C$1.FAILED_PRECONDITION, $r);
        }
    }

    /**
     * Provides all components needed for Firestore with IndexedDB persistence.
     */ class qr extends Lr {
        async initialize(t) {
            await super.initialize(t), await async function(t) {
                const e = S$1(t), n = S$1(e.Nh);
                return e.persistence.runTransaction("Synchronize last document change read time", "readonly", t => n.no(t)).then(t => {
                    e.Dh = t;
                });
            }(this.Wa);
        }
        B_(t) {
            const e = this.persistence.br.ur;
            return new Ds(e, t.fi);
        }
        L_(t) {
            const e = Mi(t.y_.et, t.y_.persistenceKey), n = Mr(t.y_.et);
            return new Ni(t.j_.synchronizeTabs, e, t.clientId, Cs.er(t.j_.cacheSizeBytes), t.fi, Vs(), "undefined" != typeof document ? document : null, n, this.el, t.j_.Fo);
        }
        M_(t) {
            return new or;
        }
        clearPersistence(t, e) {
            return $i(Mi(t, e));
        }
    }

    /**
     * Provides all components needed for Firestore with multi-tab IndexedDB
     * persistence.
     *
     * In the legacy client, this provider is used to provide both multi-tab and
     * non-multi-tab persistence since we cannot tell at build time whether
     * `synchronizeTabs` will be enabled.
     */ class Br extends qr {
        constructor(t) {
            super(), this.Q_ = t;
        }
        async initialize(t) {
            await super.initialize(t), await this.Q_.initialize(this, t);
            const e = this.Q_.Eu;
            this.el instanceof rr && (this.el.Eu = {
                Dc: dr.bind(null, e),
                Nc: Ar.bind(null, e),
                xc: Rr.bind(null, e),
                Ih: Ir.bind(null, e)
            }, await this.el.start()), 
            // NOTE: This will immediately call the listener, so we make sure to
            // set it after localStore / remoteStore are started.
            await this.persistence.Xo(async t => {
                await wr(this.Q_.Eu, t), this.q_ && (t && !this.q_.dr ? this.q_.start(this.Wa) : t || this.q_.stop());
            });
        }
        M_(t) {
            if (t.j_.K_ && t.j_.synchronizeTabs) {
                const e = Vs();
                if (!rr.Qs(e)) throw new D$1(C$1.UNIMPLEMENTED, "IndexedDB persistence is only available on platforms that support LocalStorage.");
                const n = Mi(t.y_.et, t.y_.persistenceKey);
                return new rr(e, t.fi, n, t.clientId, t.W_);
            }
            return new or;
        }
    }

    /**
     * Initializes and wires the components that are needed to interface with the
     * network.
     */ class Ur {
        async initialize(t, e) {
            if (this.Wa) 
            // OnlineComponentProvider may get initialized multiple times if
            // multi-tab persistence is used.
            return;
            this.Wa = t.Wa, this.el = t.el, this.Ka = this.G_(e);
            const n = await this.z_(e);
            this.Ka.start(n), this.tl = this.H_(e), this.Eu = this.J_(e), this.Y_ = this.X_(e), 
            this.el.ka = t => this.Eu.Hc(t, 1 /* SharedClientState */), this.tl.Eu = this.Eu, 
            await this.tl.start(), await this.tl.Nu(this.Eu.dl);
        }
        z_(t) {
            return Fr(t.y_);
        }
        X_(t) {
            return new Pr(this.Eu);
        }
        G_(t) {
            const e = Mr(t.y_.et);
            return Qi(t.credentials, e);
        }
        H_(t) {
            return new zi(this.Wa, this.Ka, t.fi, t => this.Eu.Hc(t, 0 /* RemoteStore */), kr.Qs() ? new kr : new Or);
        }
        J_(t) {
            return function(t, e, n, 
            // PORTING NOTE: Manages state synchronization in multi-tab environments.
            s, i, r, o) {
                const h = new _r(t, e, n, s, i, r);
                return o && (h.fl = !0), h;
            }(this.Wa, this.tl, this.Ka, this.el, t.W_, t.nl, !t.j_.K_ || !t.j_.synchronizeTabs);
        }
        terminate() {
            return this.tl.fh();
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function Wr(t) {
        /**
     * Returns true if obj is an object and contains at least one of the specified
     * methods.
     */
        return function(t, e) {
            if ("object" != typeof t || null === t) return !1;
            const n = t;
            for (const t of e) if (t in n && "function" == typeof n[t]) return !0;
            return !1;
        }
        /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /*
     * A wrapper implementation of Observer<T> that will dispatch events
     * asynchronously. To allow immediate silencing, a mute call is added which
     * causes events scheduled to no longer be raised.
     */ (t, [ "next", "error", "complete" ]);
    }

    class Kr {
        constructor(t) {
            this.observer = t, 
            /**
             * When set to true, will not raise future events. Necessary to deal with
             * async detachment of listener.
             */
            this.muted = !1;
        }
        next(t) {
            this.observer.next && this.Z_(this.observer.next, t);
        }
        error(t) {
            this.observer.error ? this.Z_(this.observer.error, t) : console.error("Uncaught Error in snapshot listener:", t);
        }
        tf() {
            this.muted = !0;
        }
        Z_(t, e) {
            this.muted || setTimeout(() => {
                this.muted || t(e);
            }, 0);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Validates the invocation of functionName has the exact number of arguments.
     *
     * Forward the magic "arguments" variable as second parameter on which the
     * parameter validation is performed:
     * validateExactNumberOfArgs('myFunction', arguments, 2);
     */ function jr(t, e, n) {
        if (e.length !== n) throw new D$1(C$1.INVALID_ARGUMENT, `Function ${t}() requires ` + eo(n, "argument") + ", but was called with " + eo(e.length, "argument") + ".");
    }

    /**
     * Validates the invocation of functionName has at least the provided number of
     * arguments (but can have many more).
     *
     * Forward the magic "arguments" variable as second parameter on which the
     * parameter validation is performed:
     * validateAtLeastNumberOfArgs('myFunction', arguments, 2);
     */ function Qr(t, e, n) {
        if (e.length < n) throw new D$1(C$1.INVALID_ARGUMENT, `Function ${t}() requires at least ` + eo(n, "argument") + ", but was called with " + eo(e.length, "argument") + ".");
    }

    /**
     * Validates the provided argument is an array and has as least the expected
     * number of elements.
     */
    /**
     * Validates the provided positional argument has the native JavaScript type
     * using typeof checks.
     */
    function Gr(t, e, n, s) {
        !
        /** Helper to validate the type of a provided input. */
        function(t, e, n, s) {
            let i = !1;
            i = "object" === e ? Jr(s) : "non-empty string" === e ? "string" == typeof s && "" !== s : typeof s === e;
            if (!i) {
                const i = Yr(s);
                throw new D$1(C$1.INVALID_ARGUMENT, `Function ${t}() requires its ${n} to be of type ${e}, but it was: ${i}`);
            }
        }
        /**
     * Returns true if it's a non-null object without a custom prototype
     * (i.e. excludes Array, Date, etc.).
     */ (t, e, to(n) + " argument", s);
    }

    /**
     * Validates that `path` refers to a document (indicated by the fact it contains
     * an even numbers of segments).
     */ function zr(t) {
        if (!j.Z(t)) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`);
    }

    /**
     * Validates that `path` refers to a collection (indicated by the fact it
     * contains an odd numbers of segments).
     */ function Hr(t) {
        if (j.Z(t)) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`);
    }

    function Jr(t) {
        return "object" == typeof t && null !== t && (Object.getPrototypeOf(t) === Object.prototype || null === Object.getPrototypeOf(t));
    }

    /** Returns a string describing the type / value of the provided input. */ function Yr(t) {
        if (void 0 === t) return "undefined";
        if (null === t) return "null";
        if ("string" == typeof t) return t.length > 20 && (t = t.substring(0, 20) + "..."), 
        JSON.stringify(t);
        if ("number" == typeof t || "boolean" == typeof t) return "" + t;
        if ("object" == typeof t) {
            if (t instanceof Array) return "an array";
            {
                const e = 
                /** Hacky method to try to get the constructor name for an object. */
                function(t) {
                    if (t.constructor) {
                        const e = /function\s+([^\s(]+)\s*\(/.exec(t.constructor.toString());
                        if (e && e.length > 1) return e[1];
                    }
                    return null;
                }
                /**
     * Helper method to throw an error that the provided argument did not pass
     * an instanceof check.
     */ (t);
                return e ? `a custom ${e} object` : "an object";
            }
        }
        return "function" == typeof t ? "a function" : b();
    }

    function Xr(t, e, n, s) {
        const i = Yr(s);
        return new D$1(C$1.INVALID_ARGUMENT, `Function ${t}() requires its ${to(n)} argument to be a ${e}, but it was: ${i}`);
    }

    function Zr(t, e, n) {
        if (n <= 0) throw new D$1(C$1.INVALID_ARGUMENT, `Function ${t}() requires its ${to(e)} argument to be a positive number, but it was: ${n}.`);
    }

    /** Converts a number to its english word representation */ function to(t) {
        switch (t) {
          case 1:
            return "first";

          case 2:
            return "second";

          case 3:
            return "third";

          default:
            return t + "th";
        }
    }

    /**
     * Formats the given word as plural conditionally given the preceding number.
     */ function eo(t, e) {
        return `${t} ${e}` + (1 === t ? "" : "s");
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Helper function to assert Uint8Array is available at runtime. */ function no() {
        if ("undefined" == typeof Uint8Array) throw new D$1(C$1.UNIMPLEMENTED, "Uint8Arrays are not available in this environment.");
    }

    /** Helper function to assert Base64 functions are available at runtime. */ function so() {
        if ("undefined" == typeof atob) throw new D$1(C$1.UNIMPLEMENTED, "Blobs are unavailable in Firestore in this environment.");
    }

    /**
     * Immutable class holding a blob (binary data).
     * This class is directly exposed in the public API.
     *
     * Note that while you can't hide the constructor in JavaScript code, we are
     * using the hack above to make sure no-one outside this module can call it.
     */ class io {
        constructor(t) {
            so(), this.ef = t;
        }
        static fromBase64String(t) {
            jr("Blob.fromBase64String", arguments, 1), Gr("Blob.fromBase64String", "string", 1, t), 
            so();
            try {
                return new io(st.fromBase64String(t));
            } catch (t) {
                throw new D$1(C$1.INVALID_ARGUMENT, "Failed to construct Blob from Base64 string: " + t);
            }
        }
        static fromUint8Array(t) {
            if (jr("Blob.fromUint8Array", arguments, 1), no(), !(t instanceof Uint8Array)) throw Xr("Blob.fromUint8Array", "Uint8Array", 1, t);
            return new io(st.fromUint8Array(t));
        }
        toBase64() {
            return jr("Blob.toBase64", arguments, 0), so(), this.ef.toBase64();
        }
        toUint8Array() {
            return jr("Blob.toUint8Array", arguments, 0), no(), this.ef.toUint8Array();
        }
        toString() {
            return "Blob(base64: " + this.toBase64() + ")";
        }
        isEqual(t) {
            return this.ef.isEqual(t.ef);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // The objects that are a part of this API are exposed to third-parties as
    // compiled javascript so we want to flag our private members with a leading
    // underscore to discourage their use.
    /**
     * A field class base class that is shared by the lite, full and legacy SDK,
     * which supports shared code that deals with FieldPaths.
     */ class ro {
        constructor(t) {
            !function(t, e, n, s) {
                if (!(e instanceof Array) || e.length < s) throw new D$1(C$1.INVALID_ARGUMENT, `Function ${t}() requires its ${n} argument to be an array with at least ` + eo(s, "element") + ".");
            }("FieldPath", t, "fieldNames", 1);
            for (let e = 0; e < t.length; ++e) if (Gr("FieldPath", "string", e, t[e]), 0 === t[e].length) throw new D$1(C$1.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
            this.nf = new K$1(t);
        }
    }

    /**
     * A FieldPath refers to a field in a document. The path may consist of a single
     * field name (referring to a top-level field in the document), or a list of
     * field names (referring to a nested field in the document).
     */ class oo extends ro {
        /**
         * Creates a FieldPath from the provided field names. If more than one field
         * name is provided, the path will point to a nested field in a document.
         *
         * @param fieldNames A list of field names.
         */
        constructor(...t) {
            super(t);
        }
        static documentId() {
            /**
             * Internal Note: The backend doesn't technically support querying by
             * document ID. Instead it queries by the entire document name (full path
             * included), but in the cases we currently support documentId(), the net
             * effect is the same.
             */
            return new oo(K$1.H().U());
        }
        isEqual(t) {
            if (!(t instanceof oo)) throw Xr("isEqual", "FieldPath", 1, t);
            return this.nf.isEqual(t.nf);
        }
    }

    /**
     * Matches any characters in a field path string that are reserved.
     */ const ho = new RegExp("[~\\*/\\[\\]]");

    /**
     * Parses a field path string into a FieldPath, treating dots as separators.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An opaque base class for FieldValue sentinel objects in our public API that
     * is shared between the full, lite and legacy SDK.
     */
    class ao {
        constructor() {
            /** A pointer to the implementing class. */
            this.sf = this;
        }
    }

    class uo extends ao {
        constructor(t) {
            super(), this.if = t;
        }
        rf(t) {
            if (2 /* MergeSet */ !== t.hf) throw 1 /* Update */ === t.hf ? t.af(this.if + "() can only appear at the top level of your update data") : t.af(this.if + "() cannot be used with set() unless you pass {merge:true}");
            // No transform to add for a delete, but we need to add it to our
            // fieldMask so it gets deleted.
            return t.He.push(t.path), null;
        }
        isEqual(t) {
            return t instanceof uo;
        }
    }

    /**
     * Creates a child context for parsing SerializableFieldValues.
     *
     * This is different than calling `ParseContext.contextWith` because it keeps
     * the fieldTransforms and fieldMask separate.
     *
     * The created context has its `dataSource` set to `UserDataSource.Argument`.
     * Although these values are used with writes, any elements in these FieldValues
     * are not considered writes since they cannot contain any FieldValue sentinels,
     * etc.
     *
     * @param fieldValue The sentinel FieldValue for which to create a child
     *     context.
     * @param context The parent context.
     * @param arrayElement Whether or not the FieldValue has an array.
     */ function co(t, e, n) {
        return new Po({
            hf: 3 /* Argument */ ,
            uf: e.settings.uf,
            methodName: t.if,
            cf: n
        }, e.et, e.serializer, e.ignoreUndefinedProperties);
    }

    class lo extends ao {
        constructor(t) {
            super(), this.if = t;
        }
        rf(t) {
            return new tn(t.path, new je);
        }
        isEqual(t) {
            return t instanceof lo;
        }
    }

    class _o extends ao {
        constructor(t, e) {
            super(), this.if = t, this.lf = e;
        }
        rf(t) {
            const e = co(this, t, 
            /*array=*/ !0), n = this.lf.map(t => vo(t, e)), s = new Qe(n);
            return new tn(t.path, s);
        }
        isEqual(t) {
            // TODO(mrschmidt): Implement isEquals
            return this === t;
        }
    }

    class fo extends ao {
        constructor(t, e) {
            super(), this.if = t, this.lf = e;
        }
        rf(t) {
            const e = co(this, t, 
            /*array=*/ !0), n = this.lf.map(t => vo(t, e)), s = new ze(n);
            return new tn(t.path, s);
        }
        isEqual(t) {
            // TODO(mrschmidt): Implement isEquals
            return this === t;
        }
    }

    class wo extends ao {
        constructor(t, e) {
            super(), this.if = t, this._f = e;
        }
        rf(t) {
            const e = new Je(t.serializer, ce(t.serializer, this._f));
            return new tn(t.path, e);
        }
        isEqual(t) {
            // TODO(mrschmidt): Implement isEquals
            return this === t;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Immutable class representing a geo point as latitude-longitude pair.
     * This class is directly exposed in the public API, including its constructor.
     */ class To {
        constructor(t, e) {
            if (jr("GeoPoint", arguments, 2), Gr("GeoPoint", "number", 1, t), Gr("GeoPoint", "number", 2, e), 
            !isFinite(t) || t < -90 || t > 90) throw new D$1(C$1.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + t);
            if (!isFinite(e) || e < -180 || e > 180) throw new D$1(C$1.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + e);
            this.ff = t, this.df = e;
        }
        /**
         * Returns the latitude of this geo point, a number between -90 and 90.
         */    get latitude() {
            return this.ff;
        }
        /**
         * Returns the longitude of this geo point, a number between -180 and 180.
         */    get longitude() {
            return this.df;
        }
        isEqual(t) {
            return this.ff === t.ff && this.df === t.df;
        }
        /**
         * Actually private to JS consumers of our API, so this function is prefixed
         * with an underscore.
         */    V(t) {
            return F$1(this.ff, t.ff) || F$1(this.df, t.df);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Eo = /^__.*__$/;

    /**
     * A reference to a document in a Firebase project.
     *
     * This class serves as a common base class for the public DocumentReferences
     * exposed in the lite, full and legacy SDK.
     */ class Io {
        constructor(t, e, n) {
            this.wf = t, this.Tf = e, this.Ef = n;
        }
    }

    /** The result of parsing document data (e.g. for a setData call). */ class Ao {
        constructor(t, e, n) {
            this.data = t, this.He = e, this.fieldTransforms = n;
        }
        If(t, e) {
            const n = [];
            return null !== this.He ? n.push(new fn(t, this.data, this.He, e)) : n.push(new _n(t, this.data, e)), 
            this.fieldTransforms.length > 0 && n.push(new wn(t, this.fieldTransforms)), n;
        }
    }

    /** The result of parsing "update" data (i.e. for an updateData call). */ class Ro {
        constructor(t, e, n) {
            this.data = t, this.He = e, this.fieldTransforms = n;
        }
        If(t, e) {
            const n = [ new fn(t, this.data, this.He, e) ];
            return this.fieldTransforms.length > 0 && n.push(new wn(t, this.fieldTransforms)), 
            n;
        }
    }

    function mo(t) {
        switch (t) {
          case 0 /* Set */ :
     // fall through
                  case 2 /* MergeSet */ :
     // fall through
                  case 1 /* Update */ :
            return !0;

          case 3 /* Argument */ :
          case 4 /* ArrayArgument */ :
            return !1;

          default:
            throw b();
        }
    }

    /** A "context" object passed around while parsing user data. */ class Po {
        /**
         * Initializes a ParseContext with the given source and path.
         *
         * @param settings The settings for the parser.
         * @param databaseId The database ID of the Firestore instance.
         * @param serializer The serializer to use to generate the Value proto.
         * @param ignoreUndefinedProperties Whether to ignore undefined properties
         * rather than throw.
         * @param fieldTransforms A mutable list of field transforms encountered while
         *     parsing the data.
         * @param fieldMask A mutable list of field paths encountered while parsing
         *     the data.
         *
         * TODO(b/34871131): We don't support array paths right now, so path can be
         * null to indicate the context represents any location within an array (in
         * which case certain features will not work and errors will be somewhat
         * compromised).
         */
        constructor(t, e, n, s, i, r) {
            this.settings = t, this.et = e, this.serializer = n, this.ignoreUndefinedProperties = s, 
            // Minor hack: If fieldTransforms is undefined, we assume this is an
            // external call and we need to validate the entire path.
            void 0 === i && this.Af(), this.fieldTransforms = i || [], this.He = r || [];
        }
        get path() {
            return this.settings.path;
        }
        get hf() {
            return this.settings.hf;
        }
        /** Returns a new context with the specified settings overwritten. */    Rf(t) {
            return new Po(Object.assign(Object.assign({}, this.settings), t), this.et, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.He);
        }
        mf(t) {
            var e;
            const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.Rf({
                path: n,
                cf: !1
            });
            return s.Pf(t), s;
        }
        Vf(t) {
            var e;
            const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.Rf({
                path: n,
                cf: !1
            });
            return s.Af(), s;
        }
        gf(t) {
            // TODO(b/34871131): We don't support array paths right now; so make path
            // undefined.
            return this.Rf({
                path: void 0,
                cf: !0
            });
        }
        af(t) {
            return ko(t, this.settings.methodName, this.settings.yf || !1, this.path, this.settings.uf);
        }
        /** Returns 'true' if 'fieldPath' was traversed when creating this context. */    contains(t) {
            return void 0 !== this.He.find(e => t.L(e)) || void 0 !== this.fieldTransforms.find(e => t.L(e.field));
        }
        Af() {
            // TODO(b/34871131): Remove null check once we have proper paths for fields
            // within arrays.
            if (this.path) for (let t = 0; t < this.path.length; t++) this.Pf(this.path.get(t));
        }
        Pf(t) {
            if (0 === t.length) throw this.af("Document fields must not be empty");
            if (mo(this.hf) && Eo.test(t)) throw this.af('Document fields cannot begin and end with "__"');
        }
    }

    /**
     * Helper for parsing raw user input (provided via the API) into internal model
     * classes.
     */ class Vo {
        constructor(t, e, n) {
            this.et = t, this.ignoreUndefinedProperties = e, this.serializer = n || Mr(t);
        }
        /** Creates a new top-level parse context. */    pf(t, e, n, s = !1) {
            return new Po({
                hf: t,
                methodName: e,
                uf: n,
                path: K$1.K(),
                cf: !1,
                yf: s
            }, this.et, this.serializer, this.ignoreUndefinedProperties);
        }
    }

    /** Parse document data from a set() call. */ function go(t, e, n, s, i, r = {}) {
        const o = t.pf(r.merge || r.mergeFields ? 2 /* MergeSet */ : 0 /* Set */ , e, n, i);
        Do("Data must be an object, but it was:", o, s);
        const h = So(s, o);
        let a, u;
        if (r.merge) a = new Ze(o.He), u = o.fieldTransforms; else if (r.mergeFields) {
            const t = [];
            for (const s of r.mergeFields) {
                let i;
                if (s instanceof ro) i = s.nf; else {
                    if ("string" != typeof s) throw b();
                    i = xo(e, s, n);
                }
                if (!o.contains(i)) throw new D$1(C$1.INVALID_ARGUMENT, `Field '${i}' is specified in your field mask but missing from your input data.`);
                Oo(t, i) || t.push(i);
            }
            a = new Ze(t), u = o.fieldTransforms.filter(t => a.en(t.field));
        } else a = null, u = o.fieldTransforms;
        return new Ao(new Rn(h), a, u);
    }

    /** Parse update data from an update() call. */ function yo(t, e, n, s) {
        const i = t.pf(1 /* Update */ , e, n);
        Do("Data must be an object, but it was:", i, s);
        const r = [], o = new mn;
        $t(s, (t, s) => {
            const h = xo(e, t, n), a = i.Vf(h);
            if (s instanceof ao && s.sf instanceof uo) 
            // Add it to the field mask, but don't add anything to updateData.
            r.push(h); else {
                const t = vo(s, a);
                null != t && (r.push(h), o.set(h, t));
            }
        });
        const h = new Ze(r);
        return new Ro(o.sn(), h, i.fieldTransforms);
    }

    /** Parse update data from a list of field/value arguments. */ function po(t, e, n, s, i, r) {
        const o = t.pf(1 /* Update */ , e, n), h = [ No(e, s, n) ], a = [ i ];
        if (r.length % 2 != 0) throw new D$1(C$1.INVALID_ARGUMENT, `Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);
        for (let t = 0; t < r.length; t += 2) h.push(No(e, r[t])), a.push(r[t + 1]);
        const u = [], c = new mn;
        // We iterate in reverse order to pick the last value for a field if the
        // user specified the field multiple times.
        for (let t = h.length - 1; t >= 0; --t) if (!Oo(u, h[t])) {
            const e = h[t], n = a[t], s = o.Vf(e);
            if (n instanceof ao && n.sf instanceof uo) 
            // Add it to the field mask, but don't add anything to updateData.
            u.push(e); else {
                const t = vo(n, s);
                null != t && (u.push(e), c.set(e, t));
            }
        }
        const l = new Ze(u);
        return new Ro(c.sn(), l, o.fieldTransforms);
    }

    /**
     * Parse a "query value" (e.g. value in a where filter or a value in a cursor
     * bound).
     *
     * @param allowArrays Whether the query value is an array that may directly
     * contain additional arrays (e.g. the operand of an `in` query).
     */ function bo(t, e, n, s = !1) {
        return vo(n, t.pf(s ? 4 /* ArrayArgument */ : 3 /* Argument */ , e));
    }

    /**
     * Parses user data to Protobuf Values.
     *
     * @param input Data to be parsed.
     * @param context A context object representing the current path being parsed,
     * the source of the data being parsed, etc.
     * @return The parsed value, or null if the value was a FieldValue sentinel
     * that should not be included in the resulting parsed data.
     */ function vo(t, e) {
        if (Co(t)) return Do("Unsupported field value:", e, t), So(t, e);
        if (t instanceof ao) 
        // FieldValues usually parse into transforms (except FieldValue.delete())
        // in which case we do not want to include this field in our parsed data
        // (as doing so will overwrite the field directly prior to the transform
        // trying to transform it). So we don't add this location to
        // context.fieldMask and we return null as our parsing result.
        /**
     * "Parses" the provided FieldValueImpl, adding any necessary transforms to
     * context.fieldTransforms.
     */
        return function(t, e) {
            // Sentinels are only supported with writes, and not within arrays.
            if (!mo(e.hf)) throw e.af(t.if + "() can only be used with update() and set()");
            if (!e.path) throw e.af(t.if + "() is not currently supported inside arrays");
            const n = t.rf(e);
            n && e.fieldTransforms.push(n);
        }
        /**
     * Helper to parse a scalar value (i.e. not an Object, Array, or FieldValue)
     *
     * @return The parsed value
     */ (t, e), null;
        if (
        // If context.path is null we are inside an array and we don't support
        // field mask paths more granular than the top-level array.
        e.path && e.He.push(e.path), t instanceof Array) {
            // TODO(b/34871131): Include the path containing the array in the error
            // message.
            // In the case of IN queries, the parsed data is an array (representing
            // the set of values to be included for the IN query) that may directly
            // contain additional arrays (each representing an individual field
            // value), so we disable this validation.
            if (e.settings.cf && 4 /* ArrayArgument */ !== e.hf) throw e.af("Nested arrays are not supported");
            return function(t, e) {
                const n = [];
                let s = 0;
                for (const i of t) {
                    let t = vo(i, e.gf(s));
                    null == t && (
                    // Just include nulls in the array for fields being replaced with a
                    // sentinel.
                    t = {
                        nullValue: "NULL_VALUE"
                    }), n.push(t), s++;
                }
                return {
                    arrayValue: {
                        values: n
                    }
                };
            }(t, e);
        }
        return function(t, e) {
            if (null === t) return {
                nullValue: "NULL_VALUE"
            };
            if ("number" == typeof t) return ce(e.serializer, t);
            if ("boolean" == typeof t) return {
                booleanValue: t
            };
            if ("string" == typeof t) return {
                stringValue: t
            };
            if (t instanceof Date) {
                const n = L$1.fromDate(t);
                return {
                    timestampValue: le(e.serializer, n)
                };
            }
            if (t instanceof L$1) {
                // Firestore backend truncates precision down to microseconds. To ensure
                // offline mode works the same with regards to truncation, perform the
                // truncation immediately without waiting for the backend to do that.
                const n = new L$1(t.seconds, 1e3 * Math.floor(t.nanoseconds / 1e3));
                return {
                    timestampValue: le(e.serializer, n)
                };
            }
            if (t instanceof To) return {
                geoPointValue: {
                    latitude: t.latitude,
                    longitude: t.longitude
                }
            };
            if (t instanceof io) return {
                bytesValue: _e(e.serializer, t)
            };
            if (t instanceof Io) {
                const n = e.et, s = t.wf;
                if (!s.isEqual(n)) throw e.af(`Document reference is for database ${s.projectId}/${s.database} but should be for database ${n.projectId}/${n.database}`);
                return {
                    referenceValue: we(t.wf || e.et, t.Tf.path)
                };
            }
            if (void 0 === t && e.ignoreUndefinedProperties) return null;
            throw e.af("Unsupported field value: " + Yr(t));
        }
        /**
     * Checks whether an object looks like a JSON object that should be converted
     * into a struct. Normal class/prototype instances are considered to look like
     * JSON objects since they should be converted to a struct value. Arrays, Dates,
     * GeoPoints, etc. are not considered to look like JSON objects since they map
     * to specific FieldValue types other than ObjectValue.
     */ (t, e);
    }

    function So(t, e) {
        const n = {};
        return Lt(t) ? 
        // If we encounter an empty object, we explicitly add it to the update
        // mask to ensure that the server creates a map entry.
        e.path && e.path.length > 0 && e.He.push(e.path) : $t(t, (t, s) => {
            const i = vo(s, e.mf(t));
            null != i && (n[t] = i);
        }), {
            mapValue: {
                fields: n
            }
        };
    }

    function Co(t) {
        return !("object" != typeof t || null === t || t instanceof Array || t instanceof Date || t instanceof L$1 || t instanceof To || t instanceof io || t instanceof Io || t instanceof ao);
    }

    function Do(t, e, n) {
        if (!Co(n) || !Jr(n)) {
            const s = Yr(n);
            throw "an object" === s ? e.af(t + " a custom object") : e.af(t + " " + s);
        }
    }

    /**
     * Helper that calls fromDotSeparatedString() but wraps any error thrown.
     */ function No(t, e, n) {
        if (e instanceof ro) return e.nf;
        if ("string" == typeof e) return xo(t, e);
        throw ko("Field path arguments must be of type string or FieldPath.", t, 
        /* hasConverter= */ !1, 
        /* path= */ void 0, n);
    }

    /**
     * Wraps fromDotSeparatedString with an error message about the method that
     * was thrown.
     * @param methodName The publicly visible method name
     * @param path The dot-separated string form of a field path which will be split
     * on dots.
     * @param targetDoc The document against which the field path will be evaluated.
     */ function xo(t, e, n) {
        try {
            return function(t) {
                if (t.search(ho) >= 0) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`);
                try {
                    return new oo(...t.split("."));
                } catch (e) {
                    throw new D$1(C$1.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
                }
            }(e).nf;
        } catch (e) {
            throw ko((s = e) instanceof Error ? s.message : s.toString(), t, 
            /* hasConverter= */ !1, 
            /* path= */ void 0, n);
        }
        /**
     * Extracts the message from a caught exception, which should be an Error object
     * though JS doesn't guarantee that.
     */
        var s;
        /** Checks `haystack` if FieldPath `needle` is present. Runs in O(n). */}

    function ko(t, e, n, s, i) {
        const r = s && !s.$(), o = void 0 !== i;
        let h = `Function ${e}() called with invalid data`;
        n && (h += " (via `toFirestore()`)"), h += ". ";
        let a = "";
        return (r || o) && (a += " (found", r && (a += " in field " + s), o && (a += " in document " + i), 
        a += ")"), new D$1(C$1.INVALID_ARGUMENT, h + t + a);
    }

    function Oo(t, e) {
        return t.some(t => t.isEqual(e));
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Internal transaction object responsible for accumulating the mutations to
     * perform and the base versions for any documents read.
     */ class Fo {
        constructor(t) {
            this.Ka = t, 
            // The version of each document that was read during this transaction.
            this.bf = new Map, this.mutations = [], this.vf = !1, 
            /**
             * A deferred usage error that occurred previously in this transaction that
             * will cause the transaction to fail once it actually commits.
             */
            this.Sf = null, 
            /**
             * Set of documents that have been written in the transaction.
             *
             * When there's more than one write to the same key in a transaction, any
             * writes after the first are handled differently.
             */
            this.Cf = new Set;
        }
        async Df(t) {
            if (this.Nf(), this.mutations.length > 0) throw new D$1(C$1.INVALID_ARGUMENT, "Firestore transactions require all reads to be executed before all writes.");
            const e = await async function(t, e) {
                const n = S$1(t), s = me(n.serializer) + "/documents", i = {
                    documents: e.map(t => Ee(n.serializer, t))
                }, r = await n.Na("BatchGetDocuments", s, i), o = new Map;
                r.forEach(t => {
                    const e = ge(n.serializer, t);
                    o.set(e.key.toString(), e);
                });
                const h = [];
                return e.forEach(t => {
                    const e = o.get(t.toString());
                    v$1(!!e), h.push(e);
                }), h;
            }(this.Ka, t);
            return e.forEach(t => {
                t instanceof yn || t instanceof gn ? this.xf(t) : b();
            }), e;
        }
        set(t, e) {
            this.write(e.If(t, this.Xe(t))), this.Cf.add(t);
        }
        update(t, e) {
            try {
                this.write(e.If(t, this.kf(t)));
            } catch (t) {
                this.Sf = t;
            }
            this.Cf.add(t);
        }
        delete(t) {
            this.write([ new In(t, this.Xe(t)) ]), this.Cf.add(t);
        }
        async commit() {
            if (this.Nf(), this.Sf) throw this.Sf;
            const t = this.bf;
            // For each mutation, note that the doc was written.
                    this.mutations.forEach(e => {
                t.delete(e.key.toString());
            }), 
            // For each document that was read but not written to, we want to perform
            // a `verify` operation.
            t.forEach((t, e) => {
                const n = new j(U$1.W(e));
                this.mutations.push(new An(n, this.Xe(n)));
            }), await async function(t, e) {
                const n = S$1(t), s = me(n.serializer) + "/documents", i = {
                    writes: e.map(t => pe(n.serializer, t))
                };
                await n.Da("Commit", s, i);
            }(this.Ka, this.mutations), this.vf = !0;
        }
        xf(t) {
            let e;
            if (t instanceof gn) e = t.version; else {
                if (!(t instanceof yn)) throw b();
                // For deleted docs, we must use baseVersion 0 when we overwrite them.
                e = q$1.min();
            }
            const n = this.bf.get(t.key.toString());
            if (n) {
                if (!e.isEqual(n)) 
                // This transaction will fail no matter what.
                throw new D$1(C$1.ABORTED, "Document version changed between two reads.");
            } else this.bf.set(t.key.toString(), e);
        }
        /**
         * Returns the version of this document when it was read in this transaction,
         * as a precondition, or no precondition if it was not read.
         */    Xe(t) {
            const e = this.bf.get(t.toString());
            return !this.Cf.has(t) && e ? sn.updateTime(e) : sn.Ze();
        }
        /**
         * Returns the precondition for a document if the operation is an update.
         */    kf(t) {
            const e = this.bf.get(t.toString());
            // The first time a document is written, we want to take into account the
            // read time and existence
                    if (!this.Cf.has(t) && e) {
                if (e.isEqual(q$1.min())) 
                // The document doesn't exist, so fail the transaction.
                // This has to be validated locally because you can't send a
                // precondition that a document does not exist without changing the
                // semantics of the backend write to be an insert. This is the reverse
                // of what we want, since we want to assert that the document doesn't
                // exist but then send the update and have it fail. Since we can't
                // express that to the backend, we have to validate locally.
                // Note: this can change once we can send separate verify writes in the
                // transaction.
                throw new D$1(C$1.INVALID_ARGUMENT, "Can't update a document that doesn't exist.");
                // Document exists, base precondition on document update time.
                            return sn.updateTime(e);
            }
            // Document was not read, so we just use the preconditions for a blind
            // update.
            return sn.exists(!0);
        }
        write(t) {
            this.Nf(), this.mutations = this.mutations.concat(t);
        }
        Nf() {}
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * TransactionRunner encapsulates the logic needed to run and retry transactions
     * with backoff.
     */
    class Mo {
        constructor(t, e, n, s) {
            this.fi = t, this.Ka = e, this.updateFunction = n, this.Ti = s, this.Of = 5, this.vi = new fs(this.fi, "transaction_retry" /* TransactionRetry */);
        }
        /** Runs the transaction and sets the result on deferred. */    run() {
            this.Ff();
        }
        Ff() {
            this.vi.Ls(async () => {
                const t = new Fo(this.Ka), e = this.Mf(t);
                e && e.then(e => {
                    this.fi.Ri(() => t.commit().then(() => {
                        this.Ti.resolve(e);
                    }).catch(t => {
                        this.$f(t);
                    }));
                }).catch(t => {
                    this.$f(t);
                });
            });
        }
        Mf(t) {
            try {
                const e = this.updateFunction(t);
                return !z(e) && e.catch && e.then ? e : (this.Ti.reject(Error("Transaction callback must return a Promise")), 
                null);
            } catch (t) {
                // Do not retry errors thrown by user provided updateFunction.
                return this.Ti.reject(t), null;
            }
        }
        $f(t) {
            this.Of > 0 && this.Lf(t) ? (this.Of -= 1, this.fi.Ri(() => (this.Ff(), Promise.resolve()))) : this.Ti.reject(t);
        }
        Lf(t) {
            if ("FirebaseError" === t.name) {
                // In transactions, the backend will fail outdated reads with FAILED_PRECONDITION and
                // non-matching document versions with ABORTED. These errors should be retried.
                const e = t.code;
                return "aborted" === e || "failed-precondition" === e || !at(e);
            }
            return !1;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function $o(t, e, n) {
        const s = new _s;
        return t.Ri(() => e.write(n, s)), s.promise;
    }

    function Lo(t, e, n, s) {
        return t.enqueue(() => (n.th(s), s ? e.enableNetwork() : e.disableNetwork()));
    }

    function qo(t, e, n, s, i) {
        const r = new Kr(i), o = new Vr(n, r, s);
        return t.Ri(() => e.listen(o)), () => {
            r.tf(), t.Ri(() => e.wu(o));
        };
    }

    /**
     * Retrieves a latency-compensated document from the backend via a
     * SnapshotListener.
     */
    function Bo(t, e, n, s) {
        const i = new _s, r = qo(t, e, Cn(n.path), {
            includeMetadataChanges: !0,
            jl: !0
        }, {
            next: t => {
                // Remove query first before passing event to user to avoid
                // user actions affecting the now stale query.
                r();
                const e = t.docs.has(n);
                !e && t.fromCache ? 
                // TODO(dimond): If we're online and the document doesn't
                // exist then we resolve with a doc.exists set to false. If
                // we're offline however, we reject the Promise in this
                // case. Two options: 1) Cache the negative response from
                // the server so we can deliver that even when you're
                // offline 2) Actually reject the Promise in the online case
                // if the document doesn't exist.
                i.reject(new D$1(C$1.UNAVAILABLE, "Failed to get document because the client is offline.")) : e && t.fromCache && s && "server" === s.source ? i.reject(new D$1(C$1.UNAVAILABLE, 'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')) : i.resolve(t);
            },
            error: t => i.reject(t)
        });
        return i.promise;
    }

    /**
     * Retrieves a latency-compensated query snapshot from the backend via a
     * SnapshotListener.
     */
    function Uo(t, e, n, s) {
        const i = new _s, r = qo(t, e, n, {
            includeMetadataChanges: !0,
            jl: !0
        }, {
            next: t => {
                // Remove query first before passing event to user to avoid
                // user actions affecting the now stale query.
                r(), t.fromCache && s && "server" === s.source ? i.reject(new D$1(C$1.UNAVAILABLE, 'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')) : i.resolve(t);
            },
            error: t => i.reject(t)
        });
        return i.promise;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Wo = new Map;

    // settings() defaults:
    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The root reference to the Firestore Lite database.
     */
    class Ko {
        constructor(t, e) {
            this.app = t, this.qf = "(lite)", this.Bf = !1, 
            // TODO(firestoreexp): `deleteApp()` should call the delete method above,
            // but it still calls INTERNAL.delete().
            this.INTERNAL = {
                delete: () => this.delete()
            }, this.wf = Ko.Uf(t), this.Wf = new x$1(e);
        }
        get Kf() {
            return this.Bf;
        }
        get jf() {
            return void 0 !== this.Qf;
        }
        Gf(t) {
            if (this.Bf) throw new D$1(C$1.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. initializeFirestore() cannot be called after calling getFirestore().");
            this.zf = t;
        }
        Hf() {
            return this.zf || (this.zf = {}), this.Bf = !0, this.zf;
        }
        static Uf(t) {
            if (!Object.prototype.hasOwnProperty.apply(t.options, [ "projectId" ])) throw new D$1(C$1.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
            return new G$1(t.options.projectId);
        }
        delete() {
            return this.Qf || (this.Qf = this.Jf()), this.Qf;
        }
        /**
         * Terminates all components used by this client. Subclasses can override
         * this method to clean up their own dependencies, but must also call this
         * method.
         *
         * Only ever called once.
         */    Jf() {
            /**
     * Removes all components associated with the provided instance. Must be called
     * when the Firestore instance is terminated.
     */
            return async function(t) {
                const e = await Wo.get(t);
                if (e) return V$1("ComponentProvider", "Removing Datastore"), Wo.delete(t), (await e).xa();
            }(this);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Converts Firestore's internal types to the JavaScript types that we expose
     * to the user.
     */ class jo {
        constructor(t, e, n, s) {
            this.et = t, this.timestampsInSnapshots = e, this.Yf = n, this.Xf = s;
        }
        Zf(t) {
            switch (Wt(t)) {
              case 0 /* NullValue */ :
                return null;

              case 1 /* BooleanValue */ :
                return t.booleanValue;

              case 2 /* NumberValue */ :
                return Yt(t.integerValue || t.doubleValue);

              case 3 /* TimestampValue */ :
                return this.td(t.timestampValue);

              case 4 /* ServerTimestampValue */ :
                return this.ed(t);

              case 5 /* StringValue */ :
                return t.stringValue;

              case 6 /* BlobValue */ :
                return new io(Xt(t.bytesValue));

              case 7 /* RefValue */ :
                return this.nd(t.referenceValue);

              case 8 /* GeoPointValue */ :
                return this.sd(t.geoPointValue);

              case 9 /* ArrayValue */ :
                return this.rd(t.arrayValue);

              case 10 /* ObjectValue */ :
                return this.od(t.mapValue);

              default:
                throw b();
            }
        }
        od(t) {
            const e = {};
            return $t(t.fields || {}, (t, n) => {
                e[t] = this.Zf(n);
            }), e;
        }
        sd(t) {
            return new To(Yt(t.latitude), Yt(t.longitude));
        }
        rd(t) {
            return (t.values || []).map(t => this.Zf(t));
        }
        ed(t) {
            switch (this.Yf) {
              case "previous":
                const e = function t(e) {
                    const n = e.mapValue.fields.__previous_value__;
                    return qt(n) ? t(n) : n;
                }(t);
                return null == e ? null : this.Zf(e);

              case "estimate":
                return this.td(Bt(t));

              default:
                return null;
            }
        }
        td(t) {
            const e = Jt(t), n = new L$1(e.seconds, e.nanos);
            return this.timestampsInSnapshots ? n : n.toDate();
        }
        nd(t) {
            const e = U$1.W(t);
            v$1(qe(e));
            const n = new G$1(e.get(1), e.get(3)), s = new j(e.k(5));
            return n.isEqual(this.et) || 
            // TODO(b/64130202): Somehow support foreign references.
            g$1(`Document ${s} contains a document reference within a different database (${n.projectId}/${n.database}) which is not supported. It will be treated as a reference in the current database (${this.et.projectId}/${this.et.database}) instead.`), 
            this.Xf(s);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Constant used to indicate the LRU garbage collection should be disabled.
     * Set this value as the `cacheSizeBytes` on the settings passed to the
     * `Firestore` instance.
     */ const Qo = Cs.ir;

    class Go {
        constructor(t, e) {
            this.hasPendingWrites = t, this.fromCache = e;
        }
        isEqual(t) {
            return this.hasPendingWrites === t.hasPendingWrites && this.fromCache === t.fromCache;
        }
    }

    function zo(t, e, n, s, i, r, o) {
        let h;
        if (i.G()) {
            if ("array-contains" /* ARRAY_CONTAINS */ === r || "array-contains-any" /* ARRAY_CONTAINS_ANY */ === r) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid Query. You can't perform '${r}' queries on FieldPath.documentId().`);
            if ("in" /* IN */ === r || "not-in" /* NOT_IN */ === r) {
                Yo(o, r);
                const e = [];
                for (const n of o) e.push(Jo(s, t, n));
                h = {
                    arrayValue: {
                        values: e
                    }
                };
            } else h = Jo(s, t, o);
        } else "in" /* IN */ !== r && "not-in" /* NOT_IN */ !== r && "array-contains-any" /* ARRAY_CONTAINS_ANY */ !== r || Yo(o, r), 
        h = bo(n, e, o, 
        /* allowArrays= */ "in" /* IN */ === r || "not-in" /* NOT_IN */ === r);
        const a = Ln.create(i, r, h);
        return function(t, e) {
            if (e.mn()) {
                const n = t.Rn();
                if (null !== n && !n.isEqual(e.field)) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid query. All where filters with an inequality (<, <=, >, or >=) must be on the same field. But you have inequality filters on '${n.toString()}' and '${e.field.toString()}'`);
                const s = t.An();
                null !== s && Xo(t, e.field, s);
            }
            const n = t.Pn(
            /**
     * Given an operator, returns the set of operators that cannot be used with it.
     *
     * Operators in a query must adhere to the following set of rules:
     * 1. Only one array operator is allowed.
     * 2. Only one disjunctive operator is allowed.
     * 3. NOT_EQUAL cannot be used with another NOT_EQUAL operator.
     * 4. NOT_IN cannot be used with array, disjunctive, or NOT_EQUAL operators.
     *
     * Array operators: ARRAY_CONTAINS, ARRAY_CONTAINS_ANY
     * Disjunctive operators: IN, ARRAY_CONTAINS_ANY, NOT_IN
     */
            function(t) {
                switch (t) {
                  case "!=" /* NOT_EQUAL */ :
                    return [ "!=" /* NOT_EQUAL */ , "not-in" /* NOT_IN */ ];

                  case "array-contains" /* ARRAY_CONTAINS */ :
                    return [ "array-contains" /* ARRAY_CONTAINS */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ , "not-in" /* NOT_IN */ ];

                  case "in" /* IN */ :
                    return [ "array-contains-any" /* ARRAY_CONTAINS_ANY */ , "in" /* IN */ , "not-in" /* NOT_IN */ ];

                  case "array-contains-any" /* ARRAY_CONTAINS_ANY */ :
                    return [ "array-contains" /* ARRAY_CONTAINS */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ , "in" /* IN */ , "not-in" /* NOT_IN */ ];

                  case "not-in" /* NOT_IN */ :
                    return [ "array-contains" /* ARRAY_CONTAINS */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ , "in" /* IN */ , "not-in" /* NOT_IN */ , "!=" /* NOT_EQUAL */ ];

                  default:
                    return [];
                }
            }(e.op));
            if (null !== n) 
            // Special case when it's a duplicate op to give a slightly clearer error message.
            throw n === e.op ? new D$1(C$1.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${e.op.toString()}' filter.`) : new D$1(C$1.INVALID_ARGUMENT, `Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`);
        }(t, a), a;
    }

    function Ho(t, e, n) {
        if (null !== t.startAt) throw new D$1(C$1.INVALID_ARGUMENT, "Invalid query. You must not call startAt() or startAfter() before calling orderBy().");
        if (null !== t.endAt) throw new D$1(C$1.INVALID_ARGUMENT, "Invalid query. You must not call endAt() or endBefore() before calling orderBy().");
        const s = new Zn(e, n);
        return function(t, e) {
            if (null === t.An()) {
                // This is the first order by. It must match any inequality.
                const n = t.Rn();
                null !== n && Xo(t, n, e.field);
            }
        }(t, s), s;
    }

    /**
     * Create a Bound from a query and a document.
     *
     * Note that the Bound will always include the key of the document
     * and so only the provided document will compare equal to the returned
     * position.
     *
     * Will throw if the document does not contain all fields of the order by
     * of the query or if any of the fields in the order by are an uncommitted
     * server timestamp.
     */
    /**
     * Parses the given documentIdValue into a ReferenceValue, throwing
     * appropriate errors if the value is anything other than a DocumentReference
     * or String, or if the string is malformed.
     */
    function Jo(t, e, n) {
        if ("string" == typeof n) {
            if ("" === n) throw new D$1(C$1.INVALID_ARGUMENT, "Invalid query. When querying with FieldPath.documentId(), you must provide a valid document ID, but it was an empty string.");
            if (!Dn(e) && -1 !== n.indexOf("/")) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid query. When querying a collection by FieldPath.documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);
            const s = e.path.child(U$1.W(n));
            if (!j.Z(s)) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid query. When querying a collection group by FieldPath.documentId(), the value provided must result in a valid document path, but '${s}' is not because it has an odd number of segments (${s.length}).`);
            return Zt(t, new j(s));
        }
        if (n instanceof Io) return Zt(t, n.Tf);
        throw new D$1(C$1.INVALID_ARGUMENT, "Invalid query. When querying with FieldPath.documentId(), you must provide a valid string or a DocumentReference, but it was: " + Yr(n) + ".");
    }

    /**
     * Validates that the value passed into a disjunctive filter satisfies all
     * array requirements.
     */ function Yo(t, e) {
        if (!Array.isArray(t) || 0 === t.length) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${e.toString()}' filters.`);
        if (t.length > 10) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid Query. '${e.toString()}' filters support a maximum of 10 elements in the value array.`);
        if ("in" /* IN */ === e || "array-contains-any" /* ARRAY_CONTAINS_ANY */ === e) {
            if (t.indexOf(null) >= 0) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid Query. '${e.toString()}' filters cannot contain 'null' in the value array.`);
            if (t.filter(t => Number.isNaN(t)).length > 0) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid Query. '${e.toString()}' filters cannot contain 'NaN' in the value array.`);
        }
    }

    function Xo(t, e, n) {
        if (!n.isEqual(e)) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid query. You have a where filter with an inequality (<, <=, >, or >=) on field '${e.toString()}' and so you must also use '${e.toString()}' as your first orderBy(), but your first orderBy() is on field '${n.toString()}' instead.`);
    }

    function Zo(t) {
        if (t.In() && 0 === t.ln.length) throw new D$1(C$1.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
    }

    /**
     * Calculates the array of firestore.DocumentChange's for a given ViewSnapshot.
     *
     * Exported for testing.
     *
     * @param snapshot The ViewSnapshot that represents the expected state.
     * @param includeMetadataChanges Whether to include metadata changes.
     * @param converter A factory function that returns a QueryDocumentSnapshot.
     * @return An objecyt that matches the firestore.DocumentChange API.
     */ function th(t) {
        switch (t) {
          case 0 /* Added */ :
            return "added";

          case 2 /* Modified */ :
          case 3 /* Metadata */ :
            return "modified";

          case 1 /* Removed */ :
            return "removed";

          default:
            return b();
        }
    }

    /**
     * Converts custom model object of type T into DocumentData by applying the
     * converter if it exists.
     *
     * This function is used when converting user objects to DocumentData
     * because we want to provide the user with a more specific error message if
     * their set() or fails due to invalid data originating from a toFirestore()
     * call.
     */ function eh(t, e, n) {
        let s;
        // Cast to `any` in order to satisfy the union type constraint on
        // toFirestore().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return s = t ? n && (n.merge || n.mergeFields) ? t.toFirestore(e, n) : t.toFirestore(e) : e, 
        s;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const nh = new Map, sh = new Map;

    // The components module manages the lifetime of dependencies of the Firestore
    // client. Dependencies can be lazily constructed and only one exists per
    // Firestore instance.
    // Instance maps that ensure that only one component provider exists per
    // Firestore instance.
    async function ih(t, e, n) {
        const s = new _s;
        nh.set(t, s.promise);
        const i = await t.hd();
        i.j_ = e, V$1("ComponentProvider", "Initializing OfflineComponentProvider"), await n.initialize(i), 
        t.ad(e => 
        // TODO(firestorexp): This should be a retryable IndexedDB operation
        t.ud.Ri(() => 
        // TODO(firestorexp): Make sure handleUserChange is a no-op if user
        // didn't change
        n.Wa.Oh(e))), 
        // When a user calls clearPersistence() in one client, all other clients
        // need to be terminated to allow the delete to succeed.
        n.persistence.Zo(() => t.delete()), s.resolve(n);
    }

    async function rh(t, e) {
        const n = new _s;
        sh.set(t, n.promise);
        const s = await t.hd(), i = await oh(t);
        V$1("ComponentProvider", "Initializing OnlineComponentProvider"), await e.initialize(i, s), 
        // The CredentialChangeListener of the online component provider takes
        // precedence over the offline component provider.
        t.ad(n => t.ud.Ri(() => e.tl.Du(n))), n.resolve(e);
    }

    function oh(t) {
        return ah(t), nh.has(t) || (V$1("ComponentProvider", "Using default OfflineComponentProvider"), 
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        ih(t, {
            K_: !1
        }, new Lr)), nh.get(t);
    }

    function hh(t) {
        return ah(t), sh.has(t) || (V$1("ComponentProvider", "Using default OnlineComponentProvider"), 
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        rh(t, new Ur)), sh.get(t);
    }

    function ah(t) {
        if (t.jf) throw new D$1(C$1.FAILED_PRECONDITION, "The client has already been terminated.");
    }

    function uh(t) {
        return hh(t).then(t => t.Eu);
    }

    function ch(t) {
        return hh(t).then(t => t.tl);
    }

    function lh(t) {
        return hh(t).then(t => t.Y_);
    }

    function _h(t) {
        return oh(t).then(t => t.persistence);
    }

    function fh(t) {
        return oh(t).then(t => t.Wa);
    }

    /**
     * Removes all components associated with the provided instance. Must be called
     * when the Firestore instance is terminated.
     */
    /**
     * The root reference to the Firestore database and the entry point for the
     * tree-shakeable SDK.
     */
    class dh extends Ko {
        constructor(t, e) {
            super(t, e), this.ud = new ys, this.ld = O$1.P(), this._d = new _s, this.fd = A$1.UNAUTHENTICATED, 
            this.dd = () => {}, this.qf = t.name, this.Wf.R(t => {
                this.fd = t, this._d.resolve();
            });
        }
        ad(t) {
            V$1("Firestore", "Registering credential change listener"), this.dd = t, 
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._d.promise.then(() => this.dd(this.fd));
        }
        async hd() {
            var t, e;
            const n = this.Hf();
            await this._d.promise;
            const s = new Q$1(this.wf, this.qf, null !== (t = n.host) && void 0 !== t ? t : "firestore.googleapis.com", null === (e = n.ssl) || void 0 === e || e, 
            /* forceLongPolling= */ !1);
            return {
                fi: this.ud,
                y_: s,
                clientId: this.ld,
                credentials: this.Wf,
                W_: this.fd,
                nl: 100,
                // Note: This will be overwritten if IndexedDB persistence is enabled.
                j_: {
                    K_: !1
                }
            };
        }
        Hf() {
            return super.Hf();
        }
        Jf() {
            return this.ud.Oi(async () => {
                await super.Jf(), await async function(t) {
                    const e = sh.get(t);
                    e && (V$1("ComponentProvider", "Removing OnlineComponentProvider"), sh.delete(t), 
                    await (await e).terminate());
                    const n = nh.get(t);
                    n && (V$1("ComponentProvider", "Removing OfflineComponentProvider"), nh.delete(t), 
                    await (await n).terminate());
                }
                /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (this), 
                // `removeChangeListener` must be called after shutting down the
                // RemoteStore as it will prevent the RemoteStore from retrieving
                // auth tokens.
                this.Wf.m();
            });
        }
    }

    function wh(e, n) {
        const s = app._getProvider(e, "firestore-exp").getImmediate();
        if (void 0 !== n.cacheSizeBytes && n.cacheSizeBytes !== Qo && n.cacheSizeBytes < Cs.rr) throw new D$1(C$1.INVALID_ARGUMENT, "cacheSizeBytes must be at least " + Cs.rr);
        return s.Gf(n), s;
    }

    function Th(e) {
        return app._getProvider(e, "firestore-exp").getImmediate();
    }

    function Eh(t) {
        const e = bn(t, dh);
        gh(e);
        // `_getSettings()` freezes the client settings and prevents further changes
        // to the components (as `verifyNotInitialized()` would fail). Components can
        // then be accessed via `getOfflineComponentProvider()` and
        // `getOnlineComponentProvider()`
        const n = e.Hf();
        // TODO(firestoreexp): Add forceOwningTab
            return ih(e, {
            K_: !0,
            synchronizeTabs: !1,
            cacheSizeBytes: n.cacheSizeBytes || Cs.or,
            Fo: !1
        }, new qr);
    }

    function Ih(t) {
        const e = bn(t, dh);
        gh(e);
        // `_getSettings()` freezes the client settings and prevents further changes
        // to the components (as `verifyNotInitialized()` would fail). Components can
        // then be accessed via `getOfflineComponentProvider()` and
        // `getOnlineComponentProvider()`
        const n = e.Hf(), s = new Ur, i = new Br(s);
        return ih(e, {
            K_: !0,
            synchronizeTabs: !0,
            cacheSizeBytes: n.cacheSizeBytes || Cs.or,
            Fo: !1
        }, i).then(() => rh(e, s));
    }

    function Ah(t) {
        const e = bn(t, dh);
        if (e.Kf && !e.jf) throw new D$1(C$1.FAILED_PRECONDITION, "Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");
        const n = new _s;
        return e.ud.Di(async () => {
            try {
                await $i(Mi(e.wf, e.qf)), n.resolve();
            } catch (t) {
                n.reject(t);
            }
        }), n.promise;
    }

    function Rh(t) {
        const e = bn(t, dh);
        return uh(e).then(t => function(t, e) {
            const n = new _s;
            return t.Ri(() => e.yl(n)), n.promise;
        }(e.ud, t));
    }

    function mh(t) {
        const e = bn(t, dh);
        return Promise.all([ ch(e), _h(e) ]).then(([t, n]) => Lo(e.ud, t, n, 
        /* enabled= */ !0));
    }

    function Ph(t) {
        const e = bn(t, dh);
        return Promise.all([ ch(e), _h(e) ]).then(([t, n]) => Lo(e.ud, t, n, 
        /* enabled= */ !1));
    }

    function Vh(t) {
        app._removeServiceInstance(t.app, "firestore-exp");
        return bn(t, dh).delete();
    }

    function gh(t) {
        if (t.Kf) throw new D$1(C$1.FAILED_PRECONDITION, "Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A FieldPath refers to a field in a document. The path may consist of a single
     * field name (referring to a top-level field in the document), or a list of
     * field names (referring to a nested field in the document).
     */
    class yh extends ro {
        // Note: This class is stripped down a copy of the FieldPath class in the
        // legacy SDK. The changes are:
        // - The `documentId()` static method has been removed
        // - Input validation is limited to errors that cannot be caught by the
        //   TypeScript transpiler.
        /**
         * Creates a FieldPath from the provided field names. If more than one field
         * name is provided, the path will point to a nested field in a document.
         *
         * @param fieldNames A list of field names.
         */
        constructor(...t) {
            super(t);
        }
        isEqual(t) {
            const e = bn(t, yh);
            return this.nf.isEqual(e.nf);
        }
    }

    function ph() {
        return new yh("__name__");
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A reference to a particular document in a collection in the database.
     */ class bh extends Io {
        constructor(t, e, n) {
            super(t.wf, new j(n), e), this.firestore = t, this.converter = e, this.wd = n, this.type = "document";
        }
        get id() {
            return this.wd.M();
        }
        get path() {
            return this.wd.U();
        }
        withConverter(t) {
            return new bh(this.firestore, t, this.wd);
        }
    }

    class vh {
        // This is the lite version of the Query class in the main SDK.
        constructor(t, e, n) {
            this.firestore = t, this.converter = e, this.Td = n, this.type = "query";
        }
        withConverter(t) {
            return new vh(this.firestore, t, this.Td);
        }
    }

    class Sh {}

    function Ch(t, ...e) {
        let n = bn(t, vh);
        for (const t of e) n = t.apply(n);
        return n;
    }

    class Dh extends Sh {
        constructor(t, e, n) {
            super(), this.Ed = t, this.Id = e, this.Ad = n, this.type = "where";
        }
        apply(t) {
            const e = Xh(t.firestore), n = zo(t.Td, "where", e, t.firestore.wf, this.Ed, this.Id, this.Ad);
            return new vh(t.firestore, t.converter, function(t, e) {
                const n = t.filters.concat([ e ]);
                return new vn(t.path, t.collectionGroup, t.ln.slice(), n, t.limit, t._n, t.startAt, t.endAt);
            }(t.Td, n));
        }
    }

    function Nh(t, e, n) {
        // TODO(firestorelite): Consider validating the enum strings (note that
        // TypeScript does not support passing invalid values).
        const s = e, i = ea$1("where", t);
        return new Dh(i, s, n);
    }

    class xh extends Sh {
        constructor(t, e) {
            super(), this.Ed = t, this.Rd = e, this.type = "orderBy";
        }
        apply(t) {
            const e = Ho(t.Td, this.Ed, this.Rd);
            return new vh(t.firestore, t.converter, function(t, e) {
                // TODO(dimond): validate that orderBy does not list the same key twice.
                const n = t.ln.concat([ e ]);
                return new vn(t.path, t.collectionGroup, n, t.filters.slice(), t.limit, t._n, t.startAt, t.endAt);
            }(t.Td, e));
        }
    }

    function kh(t, e = "asc") {
        // TODO(firestorelite): Consider validating the enum strings (note that
        // TypeScript does not support passing invalid values).
        const n = e, s = ea$1("orderBy", t);
        return new xh(s, n);
    }

    class Oh extends Sh {
        constructor(t, e, n) {
            super(), this.type = t, this.md = e, this.Pd = n;
        }
        apply(t) {
            return new vh(t.firestore, t.converter, function(t, e, n) {
                return new vn(t.path, t.collectionGroup, t.ln.slice(), t.filters.slice(), e, n, t.startAt, t.endAt);
            }(t.Td, this.md, this.Pd));
        }
    }

    function Fh(t) {
        return Zr("limit", 1, t), new Oh("limit", t, "F" /* First */);
    }

    function Mh(t) {
        return Zr("limitToLast", 1, t), new Oh("limitToLast", t, "L" /* Last */);
    }

    class $h extends Sh {
        constructor(t, e, n) {
            super(), this.type = t, this.Vd = e, this.gd = n;
        }
        apply(t) {
            const e = Kh(t, this.type, this.Vd, this.gd);
            return new vh(t.firestore, t.converter, function(t, e) {
                return new vn(t.path, t.collectionGroup, t.ln.slice(), t.filters.slice(), t.limit, t._n, e, t.endAt);
            }(t.Td, e));
        }
    }

    function Lh(...t) {
        return new $h("startAt", t, /*before=*/ !0);
    }

    function qh(...t) {
        return new $h("startAfter", t, 
        /*before=*/ !1);
    }

    class Bh extends Sh {
        constructor(t, e, n) {
            super(), this.type = t, this.Vd = e, this.gd = n;
        }
        apply(t) {
            const e = Kh(t, this.type, this.Vd, this.gd);
            return new vh(t.firestore, t.converter, function(t, e) {
                return new vn(t.path, t.collectionGroup, t.ln.slice(), t.filters.slice(), t.limit, t._n, t.startAt, e);
            }(t.Td, e));
        }
    }

    function Uh(...t) {
        return new Bh("endBefore", t, /*before=*/ !0);
    }

    function Wh(...t) {
        return new Bh("endAt", t, /*before=*/ !1);
    }

    /** Helper function to create a bound from a document or fields */ function Kh(t, e, n, s) {
        if (n[0] instanceof Zh) return jr(e, n, 1), function(t, e, n, s, i) {
            if (!s) throw new D$1(C$1.NOT_FOUND, "Can't use a DocumentSnapshot that doesn't exist for " + n + "().");
            const r = [];
            // Because people expect to continue/end a query at the exact document
            // provided, we need to use the implicit sort order rather than the explicit
            // sort order, because it's guaranteed to contain the document key. That way
            // the position becomes unambiguous and the query continues/ends exactly at
            // the provided document. Without the key (by using the explicit sort
            // orders), multiple documents could match the position, yielding duplicate
            // results.
                    for (const n of Nn(t)) if (n.field.G()) r.push(Zt(e, s.key)); else {
                const t = s.field(n.field);
                if (qt(t)) throw new D$1(C$1.INVALID_ARGUMENT, 'Invalid query. You are trying to start or end a query using a document for which the field "' + n.field + '" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');
                if (null === t) {
                    const t = n.field.U();
                    throw new D$1(C$1.INVALID_ARGUMENT, `Invalid query. You are trying to start or end a query using a document for which the field '${t}' (used as the orderBy) does not exist.`);
                }
                r.push(t);
            }
            return new Hn(r, i);
        }
        /**
     * Converts a list of field values to a Bound for the given query.
     */ (t.Td, t.firestore.wf, e, n[0].yd, s);
        {
            const i = Xh(t.firestore);
            return function(t, e, n, s, i, r) {
                // Use explicit order by's because it has to match the query the user made
                const o = t.ln;
                if (i.length > o.length) throw new D$1(C$1.INVALID_ARGUMENT, `Too many arguments provided to ${s}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);
                const h = [];
                for (let r = 0; r < i.length; r++) {
                    const a = i[r];
                    if (o[r].field.G()) {
                        if ("string" != typeof a) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid query. Expected a string for document ID in ${s}(), but got a ${typeof a}`);
                        if (!Dn(t) && -1 !== a.indexOf("/")) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid query. When querying a collection and ordering by FieldPath.documentId(), the value passed to ${s}() must be a plain document ID, but '${a}' contains a slash.`);
                        const n = t.path.child(U$1.W(a));
                        if (!j.Z(n)) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid query. When querying a collection group and ordering by FieldPath.documentId(), the value passed to ${s}() must result in a valid document path, but '${n}' is not because it contains an odd number of segments.`);
                        const i = new j(n);
                        h.push(Zt(e, i));
                    } else {
                        const t = bo(n, s, a);
                        h.push(t);
                    }
                }
                return new Hn(h, r);
            }(t.Td, t.firestore.wf, i, e, n, s);
        }
    }

    class jh extends vh {
        constructor(t, e, n) {
            super(t, n, Cn(e)), this.firestore = t, this.wd = e, this.type = "collection";
        }
        get id() {
            return this.Td.path.M();
        }
        get path() {
            return this.Td.path.U();
        }
        withConverter(t) {
            return new jh(this.firestore, this.wd, t);
        }
    }

    function Qh(t, e) {
        if (Gr("collection", "non-empty string", 2, e), t instanceof Ko) {
            const n = U$1.W(e);
            return Hr(n), new jh(t, n, /* converter= */ null);
        }
        {
            if (!(t instanceof bh || t instanceof jh)) throw new D$1(C$1.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
            const n = U$1.W(t.path).child(U$1.W(e));
            return Hr(n), new jh(t.firestore, n, 
            /* converter= */ null);
        }
    }

    // TODO(firestorelite): Consider using ErrorFactory -
    // https://github.com/firebase/firebase-js-sdk/blob/0131e1f/packages/util/src/errors.ts#L106
    function Gh(t, e) {
        const n = bn(t, Ko);
        if (Gr("collectionGroup", "non-empty string", 1, e), e.indexOf("/") >= 0) throw new D$1(C$1.INVALID_ARGUMENT, `Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);
        return new vh(n, 
        /* converter= */ null, function(t) {
            return new vn(U$1.K(), t);
        }(e));
    }

    function zh(t, e) {
        if (
        // We allow omission of 'pathString' but explicitly prohibit passing in both
        // 'undefined' and 'null'.
        1 === arguments.length && (e = O$1.P()), Gr("doc", "non-empty string", 2, e), t instanceof Ko) {
            const n = U$1.W(e);
            return zr(n), new bh(t, /* converter= */ null, n);
        }
        {
            if (!(t instanceof bh || t instanceof jh)) throw new D$1(C$1.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
            const n = t.wd.child(U$1.W(e));
            return zr(n), new bh(t.firestore, t instanceof jh ? t.converter : null, n);
        }
    }

    function Hh(t) {
        if (t instanceof jh) {
            const e = t.wd.O();
            return e.$() ? null : new bh(t.firestore, 
            /* converter= */ null, e);
        }
        {
            const e = bn(t, bh);
            return new jh(e.firestore, e.Tf.path.O(), e.Ef);
        }
    }

    function Jh(t, e) {
        return (t instanceof bh || t instanceof jh) && (e instanceof bh || e instanceof jh) && (t.firestore === e.firestore && t.path === e.path && t.converter === e.converter);
    }

    function Yh(t, e) {
        return t instanceof vh && e instanceof vh && (t.firestore === e.firestore && kn(t.Td, e.Td) && t.converter === e.converter);
    }

    function Xh(t) {
        const e = t.Hf(), n = Mr(t.wf);
        return new Vo(t.wf, !!e.ignoreUndefinedProperties, n);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Zh {
        // Note: This class is stripped down version of the DocumentSnapshot in
        // the legacy SDK. The changes are:
        // - No support for SnapshotMetadata.
        // - No support for SnapshotOptions.
        constructor(t, e, n, s) {
            this.pd = t, this.Tf = e, this.yd = n, this.Ef = s;
        }
        get id() {
            return this.Tf.path.M();
        }
        get ref() {
            return new bh(this.pd, this.Ef, this.Tf.path);
        }
        exists() {
            return null !== this.yd;
        }
        data() {
            if (this.yd) {
                if (this.Ef) {
                    // We only want to use the converter and create a new DocumentSnapshot
                    // if a converter has been provided.
                    const t = new ta$1(this.pd, this.Tf, this.yd, 
                    /* converter= */ null);
                    return this.Ef.fromFirestore(t);
                }
                return new jo(this.pd.wf, 
                /* timestampsInSnapshots= */ !0, 
                /* serverTimestampBehavior=*/ "none", t => new bh(this.pd, 
                /* converter= */ null, t.path)).Zf(this.yd.cn());
            }
        }
        get(t) {
            if (this.yd) {
                const e = this.yd.data().field(ea$1("DocumentSnapshot.get", t));
                if (null !== e) {
                    return new jo(this.pd.wf, 
                    /* timestampsInSnapshots= */ !0, 
                    /* serverTimestampBehavior=*/ "none", t => new bh(this.pd, this.Ef, t.path)).Zf(e);
                }
            }
        }
    }

    class ta$1 extends Zh {
        data() {
            return super.data();
        }
    }

    /**
     * Helper that calls fromDotSeparatedString() but wraps any error thrown.
     */ function ea$1(t, e) {
        if ("string" == typeof e) return xo(t, e);
        return bn(e, yh).nf;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class na$1 extends Zh {
        constructor(t, e, n, s, i) {
            super(t, e, n, i), this.pd = t, this.metadata = s, this.bd = bn(t, dh);
        }
        exists() {
            return super.exists();
        }
        data(t) {
            if (this.yd) {
                if (this.Ef) {
                    // We only want to use the converter and create a new DocumentSnapshot
                    // if a converter has been provided.
                    const e = new sa$1(this.pd, this.Tf, this.yd, this.metadata, 
                    /* converter= */ null);
                    return this.Ef.fromFirestore(e, t);
                }
                return new jo(this.bd.wf, 
                /* timestampsInSnapshots= */ !0, (null == t ? void 0 : t.serverTimestamps) || "none", t => new bh(this.pd, 
                /* converter= */ null, t.path)).Zf(this.yd.cn());
            }
        }
        get(t, e = {}) {
            if (this.yd) {
                const n = this.yd.data().field(ea$1("DocumentSnapshot.get", t));
                if (null !== n) {
                    return new jo(this.bd.wf, 
                    /* timestampsInSnapshots= */ !0, e.serverTimestamps || "none", t => new bh(this.pd, this.Ef, t.path)).Zf(n);
                }
            }
        }
    }

    class sa$1 extends na$1 {
        data(t = {}) {
            return super.data(t);
        }
    }

    class ia {
        constructor(t, e, n) {
            this.pd = t, this.query = e, this.vd = n, this.metadata = new Go(n.hasPendingWrites, n.fromCache);
        }
        get docs() {
            const t = [];
            return this.forEach(e => t.push(e)), t;
        }
        get size() {
            return this.vd.docs.size;
        }
        get empty() {
            return 0 === this.size;
        }
        forEach(t, e) {
            this.vd.docs.forEach(n => {
                t.call(e, this.Sd(n, this.vd.fromCache, this.vd.Ht.has(n.key)));
            });
        }
        docChanges(t = {}) {
            const e = !!t.includeMetadataChanges;
            if (e && this.vd.Yt) throw new D$1(C$1.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
            return this.Cd && this.Dd === e || (this.Cd = function(t, e, n) {
                if (t.zt.$()) {
                    // Special case the first snapshot because index calculation is easy and
                    // fast
                    let e, s = 0;
                    return t.docChanges.map(i => {
                        const r = n(i.doc, t.fromCache, t.Ht.has(i.doc.key));
                        return e = i.doc, {
                            type: "added",
                            doc: r,
                            oldIndex: -1,
                            newIndex: s++
                        };
                    });
                }
                {
                    // A DocumentSet that is updated incrementally as changes are applied to use
                    // to lookup the index of a document.
                    let s = t.zt;
                    return t.docChanges.filter(t => e || 3 /* Metadata */ !== t.type).map(e => {
                        const i = n(e.doc, t.fromCache, t.Ht.has(e.doc.key));
                        let r = -1, o = -1;
                        return 0 /* Added */ !== e.type && (r = s.indexOf(e.doc.key), s = s.delete(e.doc.key)), 
                        1 /* Removed */ !== e.type && (s = s.add(e.doc), o = s.indexOf(e.doc.key)), {
                            type: th(e.type),
                            doc: i,
                            oldIndex: r,
                            newIndex: o
                        };
                    });
                }
            }(this.vd, e, this.Sd.bind(this)), this.Dd = e), this.Cd;
        }
        Sd(t, e, n) {
            return new sa$1(this.pd, t.key, t, new Go(n, e), this.query.converter);
        }
    }

    // TODO(firestoreexp): Add tests for snapshotEqual with different snapshot
    // metadata
    function ra$1(t, e) {
        return t instanceof na$1 && e instanceof na$1 ? t.pd === e.pd && t.Tf.isEqual(e.Tf) && (null === t.yd ? null === e.yd : t.yd.isEqual(e.yd)) && t.Ef === e.Ef : t instanceof ia && e instanceof ia && (t.pd === e.pd && Yh(t.query, e.query) && t.metadata.isEqual(e.metadata) && t.vd.isEqual(e.vd));
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class oa$1 {
        constructor(t, e) {
            this.pd = t, this.Nd = e, this.xd = [], this.kd = !1, this.Od = Xh(t);
        }
        set(t, e, n) {
            this.Fd();
            const s = ha$1(t, this.pd), i = eh(s.Ef, e, n), r = go(this.Od, "WriteBatch.set", s.Tf, i, null !== s.Ef, n);
            return this.xd = this.xd.concat(r.If(s.Tf, sn.Ze())), this;
        }
        update(t, e, n, ...s) {
            this.Fd();
            const i = ha$1(t, this.pd);
            let r;
            return r = "string" == typeof e || e instanceof yh ? po(this.Od, "WriteBatch.update", i.Tf, e, n, s) : yo(this.Od, "WriteBatch.update", i.Tf, e), 
            this.xd = this.xd.concat(r.If(i.Tf, sn.exists(!0))), this;
        }
        delete(t) {
            this.Fd();
            const e = ha$1(t, this.pd);
            return this.xd = this.xd.concat(new In(e.Tf, sn.Ze())), this;
        }
        commit() {
            return this.Fd(), this.kd = !0, this.xd.length > 0 ? this.Nd(this.xd) : Promise.resolve();
        }
        Fd() {
            if (this.kd) throw new D$1(C$1.FAILED_PRECONDITION, "A write batch can no longer be used after commit() has been called.");
        }
    }

    function ha$1(t, e) {
        if (t.firestore !== e) throw new D$1(C$1.INVALID_ARGUMENT, "Provided document reference is from a different Firestore instance.");
        return bn(t, bh);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // TODO(mrschmidt) Consider using `BaseTransaction` as the base class in the
    // legacy SDK.
    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class aa$1 extends class {
        constructor(t, e) {
            this.pd = t, this.Md = e, this.Od = Xh(t);
        }
        get(t) {
            const e = ha$1(t, this.pd);
            return this.Md.Df([ e.Tf ]).then(t => {
                if (!t || 1 !== t.length) return b();
                const n = t[0];
                if (n instanceof yn) return new Zh(this.pd, e.Tf, null, e.Ef);
                if (n instanceof gn) return new Zh(this.pd, n.key, n, e.Ef);
                throw b();
            });
        }
        set(t, e, n) {
            const s = ha$1(t, this.pd), i = eh(s.Ef, e, n), r = go(this.Od, "Transaction.set", s.Tf, i, null !== s.Ef, n);
            return this.Md.set(s.Tf, r), this;
        }
        update(t, e, n, ...s) {
            const i = ha$1(t, this.pd);
            let r;
            return r = "string" == typeof e || e instanceof yh ? po(this.Od, "Transaction.update", i.Tf, e, n, s) : yo(this.Od, "Transaction.update", i.Tf, e), 
            this.Md.update(i.Tf, r), this;
        }
        delete(t) {
            const e = ha$1(t, this.pd);
            return this.Md.delete(e.Tf), this;
        }
    } {
        // This class implements the same logic as the Transaction API in the Lite SDK
        // but is subclassed in order to return its own DocumentSnapshot types.
        constructor(t, e) {
            super(t, e), this.pd = t;
        }
        get(t) {
            const e = ha$1(t, this.pd);
            return super.get(t).then(t => new na$1(this.pd, e.Tf, t.yd, new Go(
            /* hasPendingWrites= */ !1, 
            /* fromCache= */ !1), e.Ef));
        }
    }

    function ua$1(t, e) {
        const n = bn(t, dh);
        /**
     * Returns an initialized and started Datastore for the given Firestore
     * instance. Callers must invoke removeDatastore() when the Firestore
     * instance is terminated.
     */
        return function(t) {
            var e, n;
            if (t.jf) throw new D$1(C$1.FAILED_PRECONDITION, "The client has already been terminated.");
            if (!Wo.has(t)) {
                V$1("ComponentProvider", "Initializing Datastore");
                const s = t.Hf(), i = new Q$1(t.wf, t.qf, null !== (e = s.host) && void 0 !== e ? e : "firestore.googleapis.com", null === (n = s.ssl) || void 0 === n || n, 
                /* forceLongPolling= */ !1), r = Fr(i).then(e => {
                    const n = Mr(i.et), s = Qi(t.Wf, n);
                    return s.start(e), s;
                });
                Wo.set(t, r);
            }
            return Wo.get(t);
        }(n).then(async t => {
            const s = new _s;
            return new Mo(new ys, t, t => e(new aa$1(n, t)), s).run(), s.promise;
        });
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function ca$1(t) {
        const e = bn(t, bh), n = bn(e.firestore, dh);
        return lh(n).then(t => Bo(n.ud, t, e.Tf).then(t => Pa$1(n, e, t)));
    }

    function la$1(t) {
        const e = bn(t, bh), n = bn(e.firestore, dh);
        return fh(n).then(t => async function(t, e, n) {
            const s = new _s;
            return await t.enqueue(async () => {
                try {
                    const t = await e.zh(n);
                    t instanceof gn ? s.resolve(t) : t instanceof yn ? s.resolve(null) : s.reject(new D$1(C$1.UNAVAILABLE, "Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"));
                } catch (t) {
                    const e = ps(t, `Failed to get document '${n} from cache`);
                    s.reject(e);
                }
            }), s.promise;
        }(n.ud, t, e.Tf).then(t => new na$1(n, e.Tf, t, new Go(t instanceof gn && t.nn, 
        /* fromCache= */ !0), e.Ef)));
    }

    function _a$1(t) {
        const e = bn(t, bh), n = bn(e.firestore, dh);
        return lh(n).then(t => Bo(n.ud, t, e.Tf, {
            source: "server"
        }).then(t => Pa$1(n, e, t)));
    }

    function fa$1(t) {
        const e = bn(t, vh), n = bn(t.firestore, dh);
        return Zo(e.Td), lh(n).then(t => Uo(n.ud, t, e.Td).then(t => new ia(n, e, t)));
    }

    function da$1(t) {
        const e = bn(t, vh), n = bn(t.firestore, dh);
        return fh(n).then(t => async function(t, e, n) {
            const s = new _s;
            return await t.enqueue(async () => {
                try {
                    const t = await e.Yh(n, 
                    /* usePreviousResults= */ !0), i = new ur(n, t.Xh), r = i.Uc(t.documents), o = i.ts(r, 
                    /* updateLimboDocuments= */ !1);
                    s.resolve(o.snapshot);
                } catch (t) {
                    const e = ps(t, `Failed to execute query '${n} against cache`);
                    s.reject(e);
                }
            }), s.promise;
        }(n.ud, t, e.Td).then(t => new ia(n, e, t)));
    }

    function wa(t) {
        const e = bn(t, vh), n = bn(t.firestore, dh);
        return lh(n).then(t => Uo(n.ud, t, e.Td, {
            source: "server"
        }).then(t => new ia(n, e, t)));
    }

    function Ta$1(t, e, n) {
        const s = bn(t, bh), i = bn(s.firestore, dh), r = eh(s.Ef, e, n), o = go(Xh(i), "setDoc", s.Tf, r, null !== s.Ef, n);
        return uh(i).then(t => $o(i.ud, t, o.If(s.Tf, sn.Ze())));
    }

    function Ea$1(t, e, n, ...s) {
        const i = bn(t, bh), r = bn(i.firestore, dh), o = Xh(r);
        let h;
        return h = "string" == typeof e || e instanceof yh ? po(o, "updateDoc", i.Tf, e, n, s) : yo(o, "updateDoc", i.Tf, e), 
        uh(r).then(t => $o(r.ud, t, h.If(i.Tf, sn.exists(!0))));
    }

    function Ia$1(t) {
        const e = bn(t, bh), n = bn(e.firestore, dh);
        return uh(n).then(t => $o(n.ud, t, [ new In(e.Tf, sn.Ze()) ]));
    }

    function Aa$1(t, e) {
        const n = bn(t, jh), s = bn(n.firestore, dh), i = zh(n), r = eh(n.converter, e), o = go(Xh(n.firestore), "addDoc", i.Tf, r, null !== n.converter, {});
        return uh(s).then(t => $o(s.ud, t, o.If(i.Tf, sn.exists(!1)))).then(() => i);
    }

    function Ra$1(t, ...e) {
        var n, s, i;
        let r = {
            includeMetadataChanges: !1
        }, o = 0;
        "object" != typeof e[o] || Wr(e[o]) || (r = e[o], o++);
        const h = {
            includeMetadataChanges: r.includeMetadataChanges
        };
        if (Wr(e[o])) {
            const t = e[o];
            e[o] = null === (n = t.next) || void 0 === n ? void 0 : n.bind(t), e[o + 1] = null === (s = t.error) || void 0 === s ? void 0 : s.bind(t), 
            e[o + 2] = null === (i = t.complete) || void 0 === i ? void 0 : i.bind(t);
        }
        let a;
        if (t instanceof bh) {
            const n = bn(t.firestore, dh), s = {
                next: s => {
                    e[o] && e[o](Pa$1(n, t, s));
                },
                error: e[o + 1],
                complete: e[o + 2]
            };
            a = lh(n).then(e => qo(n.ud, e, Cn(t.Tf.path), h, s));
        } else {
            const n = bn(t, vh), s = bn(n.firestore, dh), i = {
                next: t => {
                    e[o] && e[o](new ia(s, n, t));
                },
                error: e[o + 1],
                complete: e[o + 2]
            };
            Zo(n.Td), a = lh(s).then(t => qo(s.ud, t, n.Td, h, i));
        }
        // TODO(firestorexp): Add test that verifies that we don't raise a snapshot if
        // unsubscribe is called before `asyncObserver` resolves.
            return () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            a.then(t => t());
        };
    }

    function ma(t, e) {
        const n = bn(t, dh), s = Wr(e) ? e : {
            next: e
        }, i = lh(n).then(t => function(t, e, n) {
            const s = new Kr(n);
            return t.Ri(async () => e.Ml(s)), () => {
                s.tf(), t.Ri(async () => e.$l(s));
            };
        }(n.ud, t, s));
        // TODO(firestorexp): Add test that verifies that we don't raise a snapshot if
        // unsubscribe is called before `asyncObserver` resolves.
        return () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            i.then(t => t());
        };
    }

    /**
     * Converts a ViewSnapshot that contains the single document specified by `ref`
     * to a DocumentSnapshot.
     */ function Pa$1(t, e, n) {
        const s = n.docs.get(e.Tf);
        return new na$1(t, e.Tf, s, new Go(n.hasPendingWrites, n.fromCache), e.Ef);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** The public FieldValue class of the lite API. */ class Va$1 extends ao {}

    /**
     * A delegate class that allows the FieldValue implementations returned by
     * deleteField(), serverTimestamp(), arrayUnion(), arrayRemove() and
     * increment() to be an instance of the lite FieldValue class declared above.
     *
     * We don't directly subclass `FieldValue` in the various field value
     * implementations as the base FieldValue class differs between the lite, full
     * and legacy SDK.
     */ class ga extends Va$1 {
        constructor(t) {
            super(), this.sf = t, this.if = t.if;
        }
        rf(t) {
            return this.sf.rf(t);
        }
        isEqual(t) {
            return t instanceof ga && this.sf.isEqual(t.sf);
        }
    }

    function ya$1() {
        return new ga(new uo("deleteField"));
    }

    function pa$1() {
        return new ga(new lo("serverTimestamp"));
    }

    function ba$1(...t) {
        // NOTE: We don't actually parse the data until it's used in set() or
        // update() since we'd need the Firestore instance to do this.
        return Qr("arrayUnion()", arguments, 1), new ga(new _o("arrayUnion", t));
    }

    function va(...t) {
        // NOTE: We don't actually parse the data until it's used in set() or
        // update() since we'd need the Firestore instance to do this.
        return Qr("arrayRemove()", arguments, 1), new ga(new fo("arrayRemove", t));
    }

    function Sa$1(t) {
        return new ga(new wo("increment", t));
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function Ca$1(t) {
        const e = bn(t, dh);
        return new oa$1(e, t => uh(e).then(n => $o(e.ud, n, t)));
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ app._registerComponent(new Component("firestore-exp", t => ((t, e) => new dh(t, e))(t.getProvider("app-exp").getImmediate(), t.getProvider("auth-internal")), "PUBLIC" /* PUBLIC */)), 
    app.registerVersion("firestore-exp", "0.0.800", "node");

    exports.Blob = io;
    exports.CollectionReference = jh;
    exports.DocumentReference = bh;
    exports.DocumentSnapshot = na$1;
    exports.FieldPath = yh;
    exports.FieldValue = Va$1;
    exports.FirebaseFirestore = dh;
    exports.GeoPoint = To;
    exports.Query = vh;
    exports.QueryConstraint = Sh;
    exports.QueryDocumentSnapshot = sa$1;
    exports.QuerySnapshot = ia;
    exports.SnapshotMetadata = Go;
    exports.Timestamp = L$1;
    exports.Transaction = aa$1;
    exports.WriteBatch = oa$1;
    exports.addDoc = Aa$1;
    exports.arrayRemove = va;
    exports.arrayUnion = ba$1;
    exports.clearIndexedDbPersistence = Ah;
    exports.collection = Qh;
    exports.collectionGroup = Gh;
    exports.deleteDoc = Ia$1;
    exports.deleteField = ya$1;
    exports.disableNetwork = Ph;
    exports.doc = zh;
    exports.documentId = ph;
    exports.enableIndexedDbPersistence = Eh;
    exports.enableMultiTabIndexedDbPersistence = Ih;
    exports.enableNetwork = mh;
    exports.endAt = Wh;
    exports.endBefore = Uh;
    exports.getDoc = ca$1;
    exports.getDocFromCache = la$1;
    exports.getDocFromServer = _a$1;
    exports.getDocs = fa$1;
    exports.getDocsFromCache = da$1;
    exports.getDocsFromServer = wa;
    exports.getFirestore = Th;
    exports.increment = Sa$1;
    exports.initializeFirestore = wh;
    exports.limit = Fh;
    exports.limitToLast = Mh;
    exports.onSnapshot = Ra$1;
    exports.onSnapshotsInSync = ma;
    exports.orderBy = kh;
    exports.parent = Hh;
    exports.query = Ch;
    exports.queryEqual = Yh;
    exports.refEqual = Jh;
    exports.runTransaction = ua$1;
    exports.serverTimestamp = pa$1;
    exports.setDoc = Ta$1;
    exports.setLogLevel = P$1;
    exports.snapshotEqual = ra$1;
    exports.startAfter = qh;
    exports.startAt = Lh;
    exports.terminate = Vh;
    exports.updateDoc = Ea$1;
    exports.waitForPendingWrites = Rh;
    exports.where = Nh;
    exports.writeBatch = Ca$1;

    Object.defineProperty(exports, '__esModule', { value: true });


              }).apply(this, arguments);
            } catch(err) {
                console.error(err);
                throw new Error(
                  'Cannot instantiate firebase-firestore.js - ' +
                  'be sure to load firebase-app.js first.'
                );
              }

})));
//# sourceMappingURL=firebase-firestore.js.map
