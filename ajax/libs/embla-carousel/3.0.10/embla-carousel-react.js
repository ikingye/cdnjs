'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var emblaCarousel = require('./embla-carousel.js');
var react = require('react');

var canUseDOM = !!(typeof window !== 'undefined' && window.document);

function useEmblaCarousel(options) {
  var _a = react.useState(),
      embla = _a[0],
      setEmbla = _a[1];

  var container = react.createRef();
  react.useEffect(function () {
    if (canUseDOM && (container === null || container === void 0 ? void 0 : container.current)) {
      setEmbla(emblaCarousel.default(container.current, options));
    }
  }, [container, options]);
  react.useEffect(function () {
    return function () {
      return embla === null || embla === void 0 ? void 0 : embla.destroy();
    };
  }, []);
  var Carousel = react.useCallback(function (_a) {
    var _b = _a.htmlTagName,
        htmlTagName = _b === void 0 ? 'div' : _b,
        className = _a.className,
        children = _a.children;
    return react.createElement(htmlTagName, {
      className: className,
      ref: container,
      style: {
        overflow: 'hidden'
      }
    }, children);
  }, []);
  return [Carousel, embla];
}

exports.useEmblaCarousel = useEmblaCarousel;
//# sourceMappingURL=embla-carousel-react.js.map
