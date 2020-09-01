/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
import React, { forwardRef, useCallback, useMemo, useEffect, useState } from 'react';
import ModalPortal from './ModalPortal';
import ModalAnimation from './ModalAnimation';
import ModalContent from './ModalContent';
import ModalFocusTrap from './ModalFocusTrap';
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

var Modal = forwardRef(function (props, forwardedRef) {
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

  var _useState = useState(false),
      isActive = _useState[0],
      setIsActive = _useState[1]; // Set a unique model identifier to correctly route dismissals and check
  // the layering of modals.


  var modalId = useMemo(function () {
    return uniqueModalIdentifier++;
  }, []); // Search the stack and remove the exact modal.

  var onDismissCallback = useCallback(function () {
    removeActiveModal(modalId);

    if (onDismiss) {
      onDismiss();
    }
  }, [modalId, onDismiss]);
  var onShowCallback = useCallback(function () {
    addActiveModal(modalId, setIsActive);

    if (onShow) {
      onShow();
    }
  }, [modalId, onShow]); // Remove the modal from the active modals stack when this component
  // undergoes a cleanup (e.g., unmounting).

  useEffect(function () {
    return function () {
      return removeActiveModal(modalId);
    };
  }, [modalId]);
  return React.createElement(ModalPortal, null, React.createElement(ModalAnimation, {
    animationType: animationType,
    onDismiss: onDismissCallback,
    onShow: onShowCallback,
    visible: visible
  }, React.createElement(ModalFocusTrap, {
    active: isActive
  }, React.createElement(ModalContent, {
    active: isActive,
    onRequestClose: onRequestClose,
    ref: forwardedRef,
    transparent: transparent
  }, children))));
});
export default Modal;