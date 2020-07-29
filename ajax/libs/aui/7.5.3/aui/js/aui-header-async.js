/*!
 * @atlassian/aui - Atlassian User Interface Framework
 * @version v7.5.3
 * @link https://docs.atlassian.com/aui/latest/
 * @license SEE LICENSE IN LICENSE.md
 * @author Atlassian Pty Ltd.
 */
// src/js/aui/header-async.js
(typeof window === 'undefined' ? global : window).__47fe79c8802d9dbfbd6bf121fa825fc7 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _createHeader = __48956bbd6689a94e8a3f7eff8261ecc1;
  
  var _createHeader2 = _interopRequireDefault(_createHeader);
  
  var _skate = __d64bc1bf8ec33b28bcc8f4843a4dd565;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var Header = (0, _skate2.default)('aui-header', {
      type: _skate2.default.type.CLASSNAME,
      created: function created(element) {
          (0, _createHeader2.default)(element);
      }
  });
  
  exports.default = Header;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/js/aui-header-async.js
(typeof window === 'undefined' ? global : window).__bc1ede8288731417086a3de5948c477c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  __47fe79c8802d9dbfbd6bf121fa825fc7;
  
  exports.default = window.AJS;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);