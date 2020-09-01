"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ModalPortal = _interopRequireDefault(require("./ModalPortal"));

var _ModalAnimation = _interopRequireDefault(require("./ModalAnimation"));

var _ModalContent = _interopRequireDefault(require("./ModalContent"));

var _ModalFocusTrap = _interopRequireDefault(require("./ModalFocusTrap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
var uniqueModalIdentifier = 0;
var activeModalStack = [];
var activeModalListeners = {};

function notifyActiveModalListeners() {
  if (activeModalStack.length > 0) {
    var activeModalId = activeModalStack[activeModalStack.length - 1];
    activeModalStack.forEach(function (modalId) {
      if (activeModalListeners[modalId] != null) {
        activeModalListeners[modalId](modalId === activeModalId);
      }
    });
  }
}

function addActiveModal(modalId, listener) {
  removeActiveModal(modalId);
  activeModalStack.push(modalId);
  activeModalListeners[modalId] = listener;
  notifyActiveModalListeners();
}

function removeActiveModal(modalId) {
  if (activeModalListeners[modalId] != null) {
    // Notify the active modal that is it closing
    activeModalListeners[modalId](false);
    delete activeModalListeners[modalId];
  }

  var index = activeModalStack.indexOf(modalId);

  if (index !== -1) {
    activeModalStack.splice(index, 1);
    notifyActiveModalListeners();
  }
}

var Modal = (0, _react.forwardRef)(function (props, forwardedRef) {
  var _props$visible = props.visible,
      visible = _props$visible === void 0 ? false : _props$visible,
      _props$animationType = props.animationType,
      animationType = _props$animationType === void 0 ? 'none' : _props$animationType,
      _props$transparent = props.transparent,
      transparent = _props$transparent === void 0 ? false : _props$transparent,
      children = props.children,
      onShow = props.onShow,
      onDismiss = props.onDismiss,
      onRequestClose = props.onRequestClose;

  var _useState = (0, _react.useState)(false),
      isActive = _useState[0],
      setIsActive = _useState[1]; // Set a unique model identifier to correctly route dismissals and check
  // the layering of modals.


  var modalId = (0, _react.useMemo)(function () {
    return uniqueModalIdentifier++;
  }, []); // Search the stack and remove the exact modal.

  var onDismissCallback = (0, _react.useCallback)(function () {
    removeActiveModal(modalId);

    if (onDismiss) {
      onDismiss();
    }
  }, [modalId, onDismiss]);
  var onShowCallback = (0, _react.useCallback)(function () {
    addActiveModal(modalId, setIsActive);

    if (onShow) {
      onShow();
    }
  }, [modalId, onShow]); // Remove the modal from the active modals stack when this component
  // undergoes a cleanup (e.g., unmounting).

  (0, _react.useEffect)(function () {
    return function () {
      return removeActiveModal(modalId);
    };
  }, [modalId]);
  return _react.default.createElement(_ModalPortal.default, null, _react.default.createElement(_ModalAnimation.default, {
    animationType: animationType,
    onDismiss: onDismissCallback,
    onShow: onShowCallback,
    visible: visible
  }, _react.default.createElement(_ModalFocusTrap.default, {
    active: isActive
  }, _react.default.createElement(_ModalContent.default, {
    active: isActive,
    onRequestClose: onRequestClose,
    ref: forwardedRef,
    transparent: transparent
  }, children))));
});
var _default = Modal;
exports.default = _default;
module.exports = exports.default;