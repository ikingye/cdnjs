/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
import { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';

function ModalPortal(props) {
  var children = props.children; // Only create the element once.

  var element = useMemo(function () {
    return document.createElement('div');
  }, []);
  useEffect(function () {
    if (canUseDOM) {
      var body = document.body;

      if (body != null) {
        body.appendChild(element);
        return function () {
          body.removeChild(element);
        };
      }
    }
  }, [element]);
  return ReactDOM.createPortal(children, element);
}

export default ModalPortal;