/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../src/js/aui-css-deprecations.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../src/js/aui-css-deprecations.js":
/*!*****************************************!*\
  !*** ../src/js/aui-css-deprecations.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _deprecation = __webpack_require__(/*! ./aui/internal/deprecation */ "../src/js/aui/internal/deprecation.js");

var _amdify = __webpack_require__(/*! ./aui/internal/amdify */ "../src/js/aui/internal/amdify.js");

var _amdify2 = _interopRequireDefault(_amdify);

var _deprecatedAdg2Icons = __webpack_require__(/*! ./aui/internal/deprecation/deprecated-adg2-icons */ "../src/js/aui/internal/deprecation/deprecated-adg2-icons.js");

var _deprecatedAdg2Icons2 = _interopRequireDefault(_deprecatedAdg2Icons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _deprecation.css)('.aui-badge', {
    displayName: 'AUI Badges class'
});
(0, _deprecation.css)('.aui-message span.aui-icon', {
    displayName: 'Message icon span'
});
(0, _deprecation.css)('.aui-tabs.vertical-tabs', {
    displayName: 'Vertical tabs'
});
(0, _deprecation.css)('form.aui span.content');
(0, _deprecation.css)(['form.aui .button', 'form.aui .buttons-container'], {
    displayName: 'Unprefixed buttons',
    alternativeName: 'aui-button and aui-buttons'
});
(0, _deprecation.css)(['form.aui .icon-date', 'form.aui .icon-range', 'form.aui .icon-help', 'form.aui .icon-required', 'form.aui .icon-inline-help', 'form.aui .icon-users', '.aui-icon-date', '.aui-icon-range', '.aui-icon-help', '.aui-icon-required', '.aui-icon-users', '.aui-icon-inline-help'], {
    displayName: 'Form icons'
});
(0, _deprecation.css)(['.aui-icon.icon-move-d', '.aui-icon.icon-move', '.aui-icon.icon-dropdown-d', '.aui-icon.icon-dropdown', '.aui-icon.icon-dropdown-active-d', '.aui-icon.icon-dropdown-active', '.aui-icon.icon-minimize-d', '.aui-icon.icon-minimize', '.aui-icon.icon-maximize-d', '.aui-icon.icon-maximize'], {
    displayName: 'Core icons'
});
(0, _deprecation.css)(['.aui-message.error', '.aui-message.warning', '.aui-message.hint', '.aui-message.info', '.aui-message.success'], {
    displayName: 'Unprefixed message types AUI-2150'
});
(0, _deprecation.css)(['.aui-dropdown2 .active', '.aui-dropdown2 .checked', '.aui-dropdown2 .disabled', '.aui-dropdown2 .interactive'], {
    displayName: 'Unprefixed dropdown2 css AUI-2150'
});

// 5.9.0
// -----

var fiveNineZero = {
    // Inline Dialog
    'arrow': 'aui-inline-dialog-arrow',
    'contents': 'aui-inline-dialog-contents',

    // Messages
    'error': 'aui-message-error',
    'generic': 'aui-message-generic',
    'hint': 'aui-message-hint',
    'info': 'aui-message-info',
    'success': 'aui-message-success',
    'warning': 'aui-message-warning'
};
var name;

for (name in fiveNineZero) {
    if (Object.hasOwnProperty.call(fiveNineZero, name)) {
        (0, _deprecation.css)(name, {
            alternativeName: fiveNineZero[name],
            removeVersion: '8.0.0',
            sinceVersion: '5.9.0'
        });
    }
}

// 6.1.0
// -----

(0, _deprecation.css)(['.aui-header-logo-atlassian', '.aui-header-logo-aui', '.aui-header-logo-bamboo', '.aui-header-logo-bitbucket', '.aui-header-logo-stash', '.aui-header-logo-clover', '.aui-header-logo-confluence', '.aui-header-logo-crowd', '.aui-header-logo-crucible', '.aui-header-logo-fecru', '.aui-header-logo-fisheye', '.aui-header-logo-hipchat', '.aui-header-logo-jira', '.aui-header-logo-jira-core', '.aui-header-logo-jira-software', '.aui-header-logo-jira-service-desk', '.aui-header-logo-answer', '.aui-header-logo-community', '.aui-header-logo-developers', '.aui-header-logo-expert', '.aui-header-logo-partner-program', '.aui-header-logo-marketplace', '.aui-header-logo-support', '.aui-header-logo-university', '.aui-header-logo-cloud'], {
    displayName: 'Atlassian Brand Logos'
});

// 7.1.0
// -----

(0, _deprecation.css)('.aui-badge', {
    displayName: 'AUI Badge CSS class',
    alternativeName: 'aui-badge',
    sinceVersion: '7.1.0',
    extraInfo: 'The badge pattern is best used as a web component instead of a CSS class'
});

// 7.5.0
// -----

(0, _deprecation.css)(['.aui-iconfont-image-extrasmall'], {
    displayName: 'Special size icon names',
    sinceVersion: '7.5.0',
    extraInfo: 'The only size variant allowed for icon names is `-small`.'
});

(0, _deprecation.css)('.aui-icon-dropdown', {
    displayName: 'AUI dropdown icon element',
    alternativeName: '.aui-icon-chevron-down',
    sinceVersion: '7.5.0',
    extraInfo: 'Use of an explicit element for the dropdown icon is part of a ' + 'deprecated markup pattern for dropdowns and should not be used. If you must ' + 'render an explicit icon element for a dropdown trigger, use the new ' + 'alternative class name.'
});

// New ADGS names for the old ADG2 icon
_deprecatedAdg2Icons2.default.forEach(function (_ref) {
    var newName = _ref.newName,
        oldName = _ref.oldName;
    return (0, _deprecation.css)('.aui-iconfont-' + oldName, {
        displayName: 'ADG2 icon',
        alternativeName: '.aui-iconfont-' + newName,
        sinceVersion: '7.5.0',
        removeVersion: '8.0.0',
        extraInfo: 'Use the new ADGS icon CSS class name'
    });
});

// 7.8.0
(0, _deprecation.css)('.aui-table-interactive', {
    alternativeName: '.aui-table-list',
    sinceVersion: '7.8.0',
    removeInVersion: '8.0.0',
    extraInfo: 'The "interactive" suffix caused some confusion when contrasted with sortable tables.' + 'The name has been updated to reflect its intended purpose: displaying lists of data in a tabular format.'
});

(0, _amdify2.default)('aui/css-deprecation-warnings');

/***/ }),

/***/ "../src/js/aui/internal/amdify.js":
/*!****************************************!*\
  !*** ../src/js/aui/internal/amdify.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (name, fn) {
    if (window.define) {
        var alias = window.define;
        alias(name, [], function () {
            return fn;
        });
    }
    return fn;
};

module.exports = exports["default"];

/***/ }),

/***/ "../src/js/aui/internal/deprecation.js":
/*!*********************************************!*\
  !*** ../src/js/aui/internal/deprecation.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getMessageLogger = exports.propertyDeprecationSupported = exports.obj = exports.prop = exports.css = exports.construct = exports.fn = undefined;

var _jquery = __webpack_require__(/*! ../jquery */ "../src/js/aui/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _globalize = __webpack_require__(/*! ./globalize */ "../src/js/aui/internal/globalize.js");

var _globalize2 = _interopRequireDefault(_globalize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var has = Object.prototype.hasOwnProperty;
var deprecationCalls = [];
var deprecatedSelectorMap = [];

function toSentenceCase(str) {
    str += '';

    if (!str) {
        return '';
    }

    return str.charAt(0).toUpperCase() + str.substring(1);
}

function getDeprecatedLocation(printFrameOffset) {
    var err = new Error();
    var stack = err.stack || err.stacktrace;
    var stackMessage = stack && stack.replace(/^Error\n/, '') || '';

    if (stackMessage) {
        stackMessage = stackMessage.split('\n');
        return stackMessage[printFrameOffset + 2];
    }
    return stackMessage;
}

function logger() {
    if (typeof console !== 'undefined' && console.warn) {
        Function.prototype.apply.call(console.warn, console, arguments);
    }
}

/**
 * Return a function that logs a deprecation warning to the console the first time it is called from a certain location.
 * It will also print the stack frame of the calling function.
 *
 * @param {string} displayName the name of the thing being deprecated
 * @param {object} options
 * @param {string} options.removeInVersion the version this will be removed in
 * @param {string} options.alternativeName the name of an alternative to use
 * @param {string} options.sinceVersion the version this has been deprecated since
 * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
 * @param {string} options.extraObject an extra object that will be printed at the end
 * @param {string} options.deprecationType type of the deprecation to append to the start of the deprecation message. e.g. JS or CSS
 * @return {Function} that logs the warning and stack frame of the calling function. Takes in an optional parameter for the offset of
 * the stack frame to print, the default is 0. For example, 0 will log it for the line of the calling function,
 * -1 will print the location the logger was called from
 */
function getShowDeprecationMessage(displayName, options) {
    // This can be used internally to pas in a showmessage fn
    if (typeof displayName === 'function') {
        return displayName;
    }

    var called = false;
    options = options || {};

    return function (printFrameOffset) {
        var deprecatedLocation = getDeprecatedLocation(printFrameOffset ? printFrameOffset : 1) || '';
        // Only log once if the stack frame doesn't exist to avoid spamming the console/test output
        if (!called || deprecationCalls.indexOf(deprecatedLocation) === -1) {
            deprecationCalls.push(deprecatedLocation);

            called = true;

            var deprecationType = options.deprecationType + ' ' || '';

            var message = 'DEPRECATED ' + deprecationType + '- ' + toSentenceCase(displayName) + ' has been deprecated' + (options.sinceVersion ? ' since ' + options.sinceVersion : '') + ' and will be removed in ' + (options.removeInVersion || 'a future release') + '.';

            if (options.alternativeName) {
                message += ' Use ' + options.alternativeName + ' instead. ';
            }

            if (options.extraInfo) {
                message += ' ' + options.extraInfo;
            }

            if (deprecatedLocation === '') {
                deprecatedLocation = ' \n ' + 'No stack trace of the deprecated usage is available in your current browser.';
            } else {
                deprecatedLocation = ' \n ' + deprecatedLocation;
            }

            if (options.extraObject) {
                message += '\n';
                logger(message, options.extraObject, deprecatedLocation);
            } else {
                logger(message, deprecatedLocation);
            }
        }
    };
}

function logCssDeprecation(selectorMap, newNode) {
    var displayName = selectorMap.options.displayName;
    displayName = displayName ? ' (' + displayName + ')' : '';

    var options = _jquery2.default.extend({
        deprecationType: 'CSS',
        extraObject: newNode
    }, selectorMap.options);

    getShowDeprecationMessage('\'' + selectorMap.selector + '\' pattern' + displayName, options)();
}

/**
* Returns a wrapped version of the function that logs a deprecation warning when the function is used.
* @param {Function} fn the fn to wrap
* @param {string} displayName the name of the fn to be displayed in the message
* @param {string} options.removeInVersion the version this will be removed in
* @param {string} options.alternativeName the name of an alternative to use
* @param {string} options.sinceVersion the version this has been deprecated since
* @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
* @return {Function} wrapping the original function
*/
function deprecateFunctionExpression(fn, displayName, options) {
    options = options || {};
    options.deprecationType = options.deprecationType || 'JS';

    var showDeprecationMessage = getShowDeprecationMessage(displayName || fn.name || 'this function', options);
    return function () {
        showDeprecationMessage();
        return fn.apply(this, arguments);
    };
}

/**
* Returns a wrapped version of the constructor that logs a deprecation warning when the constructor is instantiated.
* @param {Function} constructorFn the constructor function to wrap
* @param {string} displayName the name of the fn to be displayed in the message
* @param {string} options.removeInVersion the version this will be removed in
* @param {string} options.alternativeName the name of an alternative to use
* @param {string} options.sinceVersion the version this has been deprecated since
* @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
* @return {Function} wrapping the original function
*/
function deprecateConstructor(constructorFn, displayName, options) {
    options = options || {};
    options.deprecationType = options.deprecationType || 'JS';

    var deprecatedConstructor = deprecateFunctionExpression(constructorFn, displayName, options);
    deprecatedConstructor.prototype = constructorFn.prototype;
    _jquery2.default.extend(deprecatedConstructor, constructorFn); //copy static methods across;

    return deprecatedConstructor;
}

var supportsProperties = false;
try {
    if (Object.defineProperty) {
        Object.defineProperty({}, 'blam', { get: function get() {}, set: function set() {} });
        exports.propertyDeprecationSupported = supportsProperties = true;
    }
} catch (e) {}
/* IE8 doesn't support on non-DOM elements */


/**
* Wraps a "value" object property in a deprecation warning in browsers supporting Object.defineProperty
* @param {Object} obj the object containing the property
* @param {string} prop the name of the property to deprecate
* @param {string} options.removeInVersion the version this will be removed in
* @param {string} options.displayName the display name of the property to deprecate (optional, will fall back to the property name)
* @param {string} options.alternativeName the name of an alternative to use
* @param {string} options.sinceVersion the version this has been deprecated since
* @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
*/
function deprecateValueProperty(obj, prop, options) {
    if (supportsProperties) {
        var oldVal = obj[prop];
        options = options || {};
        options.deprecationType = options.deprecationType || 'JS';

        var displayNameOrShowMessageFn = options.displayName || prop;
        var showDeprecationMessage = getShowDeprecationMessage(displayNameOrShowMessageFn, options);
        Object.defineProperty(obj, prop, {
            get: function get() {
                showDeprecationMessage();
                return oldVal;
            },
            set: function set(val) {
                oldVal = val;
                showDeprecationMessage();
                return val;
            }
        });
    }
}

/**
* Wraps an object property in a deprecation warning, if possible. functions will always log warnings, but other
* types of properties will only log in browsers supporting Object.defineProperty
* @param {Object} obj the object containing the property
* @param {string} prop the name of the property to deprecate
* @param {string} options.removeInVersion the version this will be removed in
* @param {string} options.displayName the display name of the property to deprecate (optional, will fall back to the property name)
* @param {string} options.alternativeName the name of an alternative to use
* @param {string} options.sinceVersion the version this has been deprecated since
* @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
*/
function deprecateObjectProperty(obj, prop, options) {
    if (typeof obj[prop] === 'function') {
        options = options || {};
        options.deprecationType = options.deprecationType || 'JS';

        var displayNameOrShowMessageFn = options.displayName || prop;
        obj[prop] = deprecateFunctionExpression(obj[prop], displayNameOrShowMessageFn, options);
    } else {
        deprecateValueProperty(obj, prop, options);
    }
}

/**
* Wraps all an objects properties in a deprecation warning, if possible. functions will always log warnings, but other
* types of properties will only log in browsers supporting Object.defineProperty
* @param {Object} obj the object to be wrapped
* @param {string} objDisplayPrefix the object's prefix to be used in logs
* @param {string} options.removeInVersion the version this will be removed in
* @param {string} options.alternativeNamePrefix the name of another object to prefix the deprecated objects properties with
* @param {string} options.sinceVersion the version this has been deprecated since
* @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
*/
function deprecateAllProperties(obj, objDisplayPrefix, options) {
    options = options || {};
    for (var attr in obj) {
        if (has.call(obj, attr)) {
            options.deprecationType = options.deprecationType || 'JS';
            options.displayName = objDisplayPrefix + attr;
            options.alternativeName = options.alternativeNamePrefix && options.alternativeNamePrefix + attr;
            deprecateObjectProperty(obj, attr, _jquery2.default.extend({}, options));
        }
    }
}

function matchesSelector(el, selector) {
    return (el.matches || el.msMatchesSelector || el.webkitMatchesSelector || el.mozMatchesSelector || el.oMatchesSelector).call(el, selector);
}

function handleAddingSelector(options) {
    return function (selector) {
        var selectorMap = {
            selector: selector,
            options: options || {}
        };

        deprecatedSelectorMap.push(selectorMap);

        // Search if matches have already been added
        var matches = document.querySelectorAll(selector);
        for (var i = 0; i < matches.length; i++) {
            logCssDeprecation(selectorMap, matches[i]);
        }
    };
}

/**
* Return a function that logs a deprecation warning to the console the first time it is called from a certain location.
* It will also print the stack frame of the calling function.
*
* @param {string|Array} selectors a selector or list of selectors that match deprecated markup
* @param {object} options
* @param {string} options.displayName a name describing these selectors
* @param {string} options.alternativeName the name of an alternative to use
* @param {string} options.removeInVersion the version these will be removed in
* @param {string} options.sinceVersion the version these have been deprecated since
* @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
*/
function deprecateCSS(selectors, options) {
    if (!window.MutationObserver) {
        logger('CSS could not be deprecated as Mutation Observer was not found.');
        return;
    }

    if (typeof selectors === 'string') {
        selectors = [selectors];
    }

    selectors.forEach(handleAddingSelector(options));
}

function testAndHandleDeprecation(newNode) {
    return function (selectorMap) {
        if (matchesSelector(newNode, selectorMap.selector)) {
            logCssDeprecation(selectorMap, newNode);
        }
    };
}

if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            // TODO - should this also look at class changes, if possible?
            var addedNodes = mutation.addedNodes;

            for (var i = 0; i < addedNodes.length; i++) {
                var newNode = addedNodes[i];
                if (newNode.nodeType === 1) {
                    deprecatedSelectorMap.forEach(testAndHandleDeprecation(newNode));
                }
            }
        });
    });

    var config = {
        childList: true,
        subtree: true
    };

    observer.observe(document, config);
}

var deprecate = {
    fn: deprecateFunctionExpression,
    construct: deprecateConstructor,
    css: deprecateCSS,
    prop: deprecateObjectProperty,
    obj: deprecateAllProperties,
    propertyDeprecationSupported: supportsProperties,
    getMessageLogger: getShowDeprecationMessage
};

(0, _globalize2.default)('deprecate', deprecate);

exports.fn = deprecateFunctionExpression;
exports.construct = deprecateConstructor;
exports.css = deprecateCSS;
exports.prop = deprecateObjectProperty;
exports.obj = deprecateAllProperties;
exports.propertyDeprecationSupported = supportsProperties;
exports.getMessageLogger = getShowDeprecationMessage;

/***/ }),

/***/ "../src/js/aui/internal/deprecation/deprecated-adg2-icons.js":
/*!*******************************************************************!*\
  !*** ../src/js/aui/internal/deprecation/deprecated-adg2-icons.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var deprecatedIcons = [{
    newName: 'menu',
    oldName: 'appswitcher'
}, {
    newName: 'refresh',
    oldName: 'build'
}, {
    newName: 'cross',
    oldName: 'close-dialog'
}, {
    newName: 'chevron-right',
    oldName: 'collapsed'
}, {
    newName: 'settings',
    oldName: 'configure'
}, {
    newName: 'copy',
    oldName: 'copy-clipboard'
}, {
    newName: 'trash',
    oldName: 'delete'
}, {
    newName: 'detail-view',
    oldName: 'details'
}, {
    newName: 'arrow-left',
    oldName: 'devtools-arrow-left'
}, {
    newName: 'arrow-right',
    oldName: 'devtools-arrow-right'
}, {
    newName: 'sign-in',
    oldName: 'devtools-checkout'
}, {
    newName: 'import',
    oldName: 'devtools-clone'
}, {
    newName: 'folder-filled',
    oldName: 'devtools-folder-closed'
}, {
    newName: 'export',
    oldName: 'devtools-pull-request'
}, {
    newName: 'tag',
    oldName: 'devtools-tag'
}, {
    newName: 'tag',
    oldName: 'devtools-tag-small'
}, {
    newName: 'menu',
    oldName: 'drag-vertical'
}, {
    newName: 'edit-filled',
    oldName: 'edit'
}, {
    newName: 'edit-filled',
    oldName: 'edit-small'
}, {
    newName: 'chevron-up',
    oldName: 'expanded'
}, {
    newName: 'vid-full-screen-on',
    oldName: 'focus'
}, {
    newName: 'more-vertical',
    oldName: 'handle-horizontal'
}, {
    newName: 'question-circle',
    oldName: 'help'
}, {
    newName: 'home-circle',
    oldName: 'homepage'
}, {
    newName: 'image',
    oldName: 'image-extrasmall'
}, {
    newName: 'info-circle',
    oldName: 'info'
}, {
    newName: 'world',
    oldName: 'weblink'
}, {
    newName: 'add-circle',
    oldName: 'list-add'
}, {
    newName: 'cross-circle',
    oldName: 'list-remove'
}, {
    newName: 'lock-filled',
    oldName: 'locked'
}, {
    newName: 'lock-filled',
    oldName: 'locked-small'
}, {
    newName: 'document',
    oldName: 'page-blank'
}, {
    newName: 'document',
    oldName: 'doc'
}, {
    newName: 'documents',
    oldName: 'pages'
}, {
    newName: 'cross-circle',
    oldName: 'remove'
}, {
    newName: 'cross-circle',
    oldName: 'remove-label'
}, {
    newName: 'search',
    oldName: 'search-small'
}, {
    newName: 'person-circle',
    oldName: 'space-personal'
}, {
    newName: 'star-filled',
    oldName: 'star'
}, {
    newName: 'check',
    oldName: 'success'
}, {
    newName: 'recent',
    oldName: 'time'
}, {
    newName: 'vid-full-screen-off',
    oldName: 'unfocus'
}, {
    newName: 'unlock-filled',
    oldName: 'unlocked'
}, {
    newName: 'star',
    oldName: 'unstar'
}, {
    newName: 'watch',
    oldName: 'unwatch'
}, {
    newName: 'arrow-up',
    oldName: 'up'
}, {
    newName: 'arrow-down',
    oldName: 'down'
}, {
    newName: 'person',
    oldName: 'user'
}, {
    newName: 'watch-filled',
    oldName: 'view'
}, {
    newName: 'room-menu',
    oldName: 'view-list'
}, {
    newName: 'menu',
    oldName: 'view-table'
}, {
    newName: 'watch-filled',
    oldName: 'watch'
}, {
    newName: 'tray',
    oldName: 'workbox'
}, {
    newName: 'bullet-list',
    oldName: 'configure-columns'
}, {
    newName: 'image',
    oldName: 'file-image'
}, {
    newName: 'group',
    oldName: 'admin-roles'
}, {
    newName: 'vid-pause',
    oldName: 'pause'
}, {
    newName: 'refresh',
    oldName: 'refresh-small'
}, {
    newName: 'swap',
    oldName: 'switch-small'
}, {
    newName: 'arrow-down-small',
    oldName: 'arrow-down'
}, {
    newName: 'arrow-up-small',
    oldName: 'arrow-up'
}, {
    newName: 'email',
    oldName: 'email-large'
}, {
    newName: 'documents',
    oldName: 'pages-large'
}, {
    newName: 'person',
    oldName: 'user-large'
}, {
    newName: 'documents',
    oldName: 'bp-decisions'
}, {
    newName: 'documents',
    oldName: 'bp-default'
}, {
    newName: 'documents',
    oldName: 'bp-files'
}, {
    newName: 'documents',
    oldName: 'bp-requirements'
}, {
    newName: 'documents',
    oldName: 'bp-howto'
}, {
    newName: 'documents',
    oldName: 'bp-jira'
}, {
    newName: 'documents',
    oldName: 'bp-meeting'
}, {
    newName: 'documents',
    oldName: 'bp-retrospective'
}, {
    newName: 'documents',
    oldName: 'bp-sharedlinks'
}, {
    newName: 'documents',
    oldName: 'bp-troubleshooting'
}, {
    newName: 'upload',
    oldName: 'deploy'
}, {
    newName: 'file',
    oldName: 'page-default'
}, {
    newName: 'shortcut',
    oldName: 'sidebar-link'
}, {
    newName: 'shortcut',
    oldName: 'sidebar-link-large'
}, {
    newName: 'incomplete-build',
    oldName: 'devtools-task-cancelled'
}, {
    newName: 'plan-disabled',
    oldName: 'devtools-task-disabled'
}, {
    newName: 'queued-build',
    oldName: 'devtools-task-in-progress'
}, {
    newName: 'branch',
    oldName: 'devtools-branch'
}, {
    newName: 'branch',
    oldName: 'devtools-branch-small'
}, {
    newName: 'commits',
    oldName: 'devtools-commit'
}, {
    newName: 'create-fork',
    oldName: 'devtools-for'
}, {
    newName: 'bold',
    oldName: 'editor-bold'
}, {
    newName: 'italic',
    oldName: 'editor-italic'
}, {
    newName: 'underline',
    oldName: 'editor-underline'
}, {
    newName: 'text-color',
    oldName: 'editor-color'
}, {
    newName: 'left-alignment',
    oldName: 'editor-align-left'
}, {
    newName: 'right-alignment',
    oldName: 'editor-align-right'
}, {
    newName: 'center-alignment',
    oldName: 'editor-align-center'
}, {
    newName: 'indent-left-mall',
    oldName: 'editor-indent'
}, {
    newName: 'indent-right-mall',
    oldName: 'editor-outdent'
}, {
    newName: 'number-list-mall',
    oldName: 'editor-list-number'
}, {
    newName: 'bullet-list-mall',
    oldName: 'editor-list-bullet'
}, {
    newName: 'mention',
    oldName: 'editor-mention'
}, {
    newName: 'table-of-contents-mall',
    oldName: 'editor-macro-toc'
}, {
    newName: 'advanced',
    oldName: 'editor-style'
}, {
    newName: 'symbol',
    oldName: 'editor-symbol'
}, {
    newName: 'horizontal-rule',
    oldName: 'editor-hr'
}, {
    newName: 'page-layout-toggle',
    oldName: 'editor-layout'
}, {
    newName: 'table',
    oldName: 'editor-table'
}, {
    newName: 'location',
    oldName: 'nav-children-large'
}, {
    newName: 'location',
    oldName: 'nav-children'
}, {
    newName: 'single-column',
    oldName: 'layout-1col-large'
}, {
    newName: 'two-column',
    oldName: 'layout-2col-large'
}, {
    newName: 'right-side-bar',
    oldName: 'layout-2col-left-large'
}, {
    newName: 'left-side-bar',
    oldName: 'layout-2col-right-large'
}, {
    newName: 'three-column-side-bars',
    oldName: 'layout-3col-center-large'
}, {
    newName: 'three-column',
    oldName: 'layout-3col-large'
}, {
    newName: 'heading-column',
    oldName: 'table-header-column'
}, {
    newName: 'heading-row',
    oldName: 'table-header-row'
}, {
    newName: 'insert-row-after',
    oldName: 'table-row-down'
}, {
    newName: 'insert-row-before',
    oldName: 'table-row-up'
}, {
    newName: 'remove-row',
    oldName: 'table-row-remove'
}, {
    newName: 'remove-column',
    oldName: 'table-col-remove'
}, {
    newName: 'insert-column-before',
    oldName: 'table-col-left'
}, {
    newName: 'insert-column-after',
    oldName: 'table-col-right'
}, {
    newName: 'remove-table',
    oldName: 'table-remove'
}, {
    newName: 'merge-table-cells',
    oldName: 'table-merge'
}, {
    newName: 'split-merged-table-cells',
    oldName: 'table-split'
}, {
    newName: 'copy-table-row',
    oldName: 'table-copy-row'
}, {
    newName: 'paste-table-row',
    oldName: 'table-paste-row'
}, {
    newName: 'cut-table-row',
    oldName: 'table-cut-row'
}, {
    newName: 'team-calendar',
    oldName: 'teamcals-large'
}, {
    newName: 'team-calendar',
    oldName: 'teamcals'
}, {
    newName: 'emoji',
    oldName: 'editor-emoticon'
}, {
    newName: 'help',
    oldName: 'editor-help'
}, {
    newName: 'task',
    oldName: 'editor-task'
}, {
    newName: 'like',
    oldName: 'like-small'
}, {
    newName: 'submodule',
    oldName: 'devtools-submodule'
}];

exports.default = deprecatedIcons;
module.exports = exports['default'];

/***/ }),

/***/ "../src/js/aui/internal/globalize.js":
/*!*******************************************!*\
  !*** ../src/js/aui/internal/globalize.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = globalize;
var NAMESPACE = 'AJS';

function globalize(name, value) {
    if (_typeof(window[NAMESPACE]) !== 'object') {
        window[NAMESPACE] = {};
    }

    return window[NAMESPACE][name] = value;
}
module.exports = exports['default'];

/***/ }),

/***/ "../src/js/aui/jquery.js":
/*!*******************************!*\
  !*** ../src/js/aui/jquery.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = window.jQuery || window.Zepto;
module.exports = exports["default"];

/***/ })

/******/ });
//# sourceMappingURL=aui-css-deprecations.js.map