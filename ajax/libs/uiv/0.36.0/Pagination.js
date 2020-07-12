function range(end) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var arr = [];
  for (var i = start; i < end; i += step) {
    arr.push(i);
  }
  return arr;
}

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var Pagination = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('nav', { class: _vm.navClasses, attrs: { "aria-label": "Page navigation" } }, [_c('ul', { staticClass: "pagination", class: _vm.classes }, [_vm.boundaryLinks ? _c('li', { class: { disabled: _vm.value <= 1 || _vm.disabled } }, [_c('a', { attrs: { "href": "#", "role": "button", "aria-label": "First" }, on: { "click": function click($event) {
          $event.preventDefault();return _vm.onPageChange(1);
        } } }, [_c('span', { attrs: { "aria-hidden": "true" } }, [_vm._v("«")])])]) : _vm._e(), _vm._v(" "), _vm.directionLinks ? _c('li', { class: { disabled: _vm.value <= 1 || _vm.disabled } }, [_c('a', { attrs: { "href": "#", "role": "button", "aria-label": "Previous" }, on: { "click": function click($event) {
          $event.preventDefault();return _vm.onPageChange(_vm.value - 1);
        } } }, [_c('span', { attrs: { "aria-hidden": "true" } }, [_vm._v("‹")])])]) : _vm._e(), _vm._v(" "), _vm.sliceStart > 0 ? _c('li', { class: { disabled: _vm.disabled } }, [_c('a', { attrs: { "href": "#", "role": "button", "aria-label": "Previous group" }, on: { "click": function click($event) {
          $event.preventDefault();return _vm.toPage(1);
        } } }, [_c('span', { attrs: { "aria-hidden": "true" } }, [_vm._v("…")])])]) : _vm._e(), _vm._v(" "), _vm._l(_vm.sliceArray, function (item) {
      return _c('li', { key: item, class: { active: _vm.value === item + 1, disabled: _vm.disabled } }, [_c('a', { attrs: { "href": "#", "role": "button" }, on: { "click": function click($event) {
            $event.preventDefault();return _vm.onPageChange(item + 1);
          } } }, [_vm._v(_vm._s(item + 1))])]);
    }), _vm._v(" "), _vm.sliceStart < _vm.totalPage - _vm.maxSize ? _c('li', { class: { disabled: _vm.disabled } }, [_c('a', { attrs: { "href": "#", "role": "button", "aria-label": "Next group" }, on: { "click": function click($event) {
          $event.preventDefault();return _vm.toPage(0);
        } } }, [_c('span', { attrs: { "aria-hidden": "true" } }, [_vm._v("…")])])]) : _vm._e(), _vm._v(" "), _vm.directionLinks ? _c('li', { class: { disabled: _vm.value >= _vm.totalPage || _vm.disabled } }, [_c('a', { attrs: { "href": "#", "role": "button", "aria-label": "Next" }, on: { "click": function click($event) {
          $event.preventDefault();return _vm.onPageChange(_vm.value + 1);
        } } }, [_c('span', { attrs: { "aria-hidden": "true" } }, [_vm._v("›")])])]) : _vm._e(), _vm._v(" "), _vm.boundaryLinks ? _c('li', { class: { disabled: _vm.value >= _vm.totalPage || _vm.disabled } }, [_c('a', { attrs: { "href": "#", "role": "button", "aria-label": "Last" }, on: { "click": function click($event) {
          $event.preventDefault();return _vm.onPageChange(_vm.totalPage);
        } } }, [_c('span', { attrs: { "aria-hidden": "true" } }, [_vm._v("»")])])]) : _vm._e()], 2)]);
  }, staticRenderFns: [],
  props: {
    value: {
      type: Number,
      required: true,
      validator: function validator(v) {
        return v >= 1;
      }
    },
    boundaryLinks: {
      type: Boolean,
      default: false
    },
    directionLinks: {
      type: Boolean,
      default: true
    },
    size: String,
    align: String,
    totalPage: {
      type: Number,
      required: true,
      validator: function validator(v) {
        return v >= 0;
      }
    },
    maxSize: {
      type: Number,
      default: 5,
      validator: function validator(v) {
        return v >= 0;
      }
    },
    disabled: Boolean
  },
  data: function data() {
    return {
      sliceStart: 0
    };
  },

  computed: {
    navClasses: function navClasses() {
      return defineProperty({}, 'text-' + this.align, Boolean(this.align));
    },
    classes: function classes() {
      return defineProperty({}, 'pagination-' + this.size, Boolean(this.size));
    },
    sliceArray: function sliceArray() {
      return range(this.totalPage).slice(this.sliceStart, this.sliceStart + this.maxSize);
    }
  },
  methods: {
    calculateSliceStart: function calculateSliceStart() {
      var currentPage = this.value;
      var chunkSize = this.maxSize;
      var currentChunkStart = this.sliceStart;
      var currentChunkEnd = currentChunkStart + chunkSize;
      if (currentPage > currentChunkEnd) {
        var lastChunkStart = this.totalPage - chunkSize;
        if (currentPage > lastChunkStart) {
          this.sliceStart = lastChunkStart;
        } else {
          this.sliceStart = currentPage - 1;
        }
      } else if (currentPage < currentChunkStart + 1) {
        if (currentPage > chunkSize) {
          this.sliceStart = currentPage - chunkSize;
        } else {
          this.sliceStart = 0;
        }
      }
    },
    onPageChange: function onPageChange(page) {
      if (!this.disabled && page > 0 && page <= this.totalPage && page !== this.value) {
        this.$emit('input', page);
        this.$emit('change', page);
      }
    },
    toPage: function toPage(pre) {
      if (this.disabled) {
        return;
      }
      var chunkSize = this.maxSize;
      var currentChunkStart = this.sliceStart;
      var lastChunkStart = this.totalPage - chunkSize;
      var start = pre ? currentChunkStart - chunkSize : currentChunkStart + chunkSize;
      if (start < 0) {
        this.sliceStart = 0;
      } else if (start > lastChunkStart) {
        this.sliceStart = lastChunkStart;
      } else {
        this.sliceStart = start;
      }
    }
  },
  created: function created() {
    this.$watch(function (vm) {
      return [vm.value, vm.maxSize, vm.totalPage].join();
    }, this.calculateSliceStart, {
      immediate: true
    });
  }
};

export default Pagination;
//# sourceMappingURL=Pagination.js.map
