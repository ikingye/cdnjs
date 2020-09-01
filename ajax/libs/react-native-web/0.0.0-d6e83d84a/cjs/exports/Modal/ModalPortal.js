"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = require("react");

var _reactDom = _interopRequireDefault(require("react-dom"));

var _ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
function ModalPortal(props) {
  var children = props.children; // Only create the element once.

  var element = (0, _react.useMemo)(function () {
    return document.createElement('div');
  }, []);
  (0, _react.useEffect)(function () {
    if (_ExecutionEnvironment.canUseDOM) {
      var body = document.body;

      if (body != null) {
        body.appendChild(element);
        return function () {
          body.removeChild(element);
        };
      }
    }
  }, [element]);
  return _reactDom.default.createPortal(children, element);
}

var _default = ModalPortal;
exports.default = _default;
module.exports = exports.default;