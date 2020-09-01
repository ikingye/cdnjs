/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
import React, { forwardRef, useCallback, useEffect } from 'react';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import View from '../View';
import StyleSheet from '../StyleSheet';
var ModalContent = forwardRef(function (props, forwardedRef) {
  var active = props.active,
      children = props.children,
      onRequestClose = props.onRequestClose,
      transparent = props.transparent;
  var closeOnEscapeCallback = useCallback(function (e) {
    if (active && e.key === 'Escape') {
      e.stopPropagation();

      if (onRequestClose) {
        onRequestClose();
      }
    }
  }, [active, onRequestClose]);
  useEffect(function () {
    if (canUseDOM) {
      document.addEventListener('keyup', closeOnEscapeCallback, false);
      return function () {
        document.removeEventListener('keyup', closeOnEscapeCallback, false);
      };
    }
  }, [closeOnEscapeCallback]);
  return React.createElement(View, {
    accessibilityRole: active ? 'dialog' : null,
    "aria-modal": true,
    ref: forwardedRef,
    style: [styles.modal, transparent ? styles.modalTransparent : styles.modalOpaque]
  }, React.createElement(View, {
    style: styles.container
  }, children));
});
var styles = StyleSheet.create({
  modal: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999
  },
  modalTransparent: {
    backgroundColor: 'transparent'
  },
  modalOpaque: {
    backgroundColor: 'white'
  },
  container: {
    flex: 1
  }
});
export default ModalContent;