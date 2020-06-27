import EmblaCarousel from './embla-carousel.js';
import { useState, createRef, useEffect, useCallback, createElement } from 'react';

var canUseDOM = !!(typeof window !== 'undefined' && window.document);

function useEmblaCarousel(options) {
  var _a = useState(),
      embla = _a[0],
      setEmbla = _a[1];

  var container = createRef();
  useEffect(function () {
    if (canUseDOM && (container === null || container === void 0 ? void 0 : container.current)) {
      setEmbla(EmblaCarousel(container.current, options));
    }
  }, [container, options]);
  useEffect(function () {
    return function () {
      return embla === null || embla === void 0 ? void 0 : embla.destroy();
    };
  }, []);
  var Carousel = useCallback(function (_a) {
    var _b = _a.htmlTagName,
        htmlTagName = _b === void 0 ? 'div' : _b,
        className = _a.className,
        children = _a.children;
    return createElement(htmlTagName, {
      className: className,
      ref: container,
      style: {
        overflow: 'hidden'
      }
    }, children);
  }, []);
  return [Carousel, embla];
}

export { useEmblaCarousel };
//# sourceMappingURL=embla-carousel-react.js.map
