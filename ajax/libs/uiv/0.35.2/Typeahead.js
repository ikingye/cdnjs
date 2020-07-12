function isExist(obj) {
  return typeof obj !== 'undefined' && obj !== null;
}

function isFunction(obj) {
  return typeof obj === 'function';
}



function isString(obj) {
  return typeof obj === 'string';
}

function isBoolean(obj) {
  return typeof obj === 'boolean';
}

function getRequest(url) {
  var request = new window.XMLHttpRequest();
  var data = {};
  var p = {
    then: function then(fn1, fn2) {
      return p.done(fn1).fail(fn2);
    },
    catch: function _catch(fn) {
      return p.fail(fn);
    },
    always: function always(fn) {
      return p.done(fn).fail(fn);
    }
  };
  var statuses = ['done', 'fail'];
  statuses.forEach(function (name) {
    data[name] = [];
    p[name] = function (fn) {
      if (fn instanceof Function) data[name].push(fn);
      return p;
    };
  });
  p.done(JSON.parse);
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      var e = { status: request.status };
      if (request.status === 200) {
        var response = request.responseText;
        for (var i in data.done) {
          if (data.done.hasOwnProperty(i) && isFunction(data.done[i])) {
            var value = data.done[i](response);
            if (isExist(value)) {
              response = value;
            }
          }
        }
      } else {
        data.fail.forEach(function (fail) {
          return fail(e);
        });
      }
    }
  };
  request.open('GET', url);
  request.setRequestHeader('Accept', 'application/json');
  request.send();
  return p;
}

var EVENTS = {
  MOUSE_ENTER: 'mouseenter',
  MOUSE_LEAVE: 'mouseleave',
  MOUSE_DOWN: 'mousedown',
  MOUSE_UP: 'mouseup',
  FOCUS: 'focus',
  BLUR: 'blur',
  CLICK: 'click',
  INPUT: 'input',
  KEY_DOWN: 'keydown',
  KEY_UP: 'keyup',
  KEY_PRESS: 'keypress',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  TOUCH_START: 'touchstart',
  TOUCH_END: 'touchend'
};















function on(element, event, handler) {
  element.addEventListener(event, handler);
}

function off(element, event, handler) {
  element.removeEventListener(event, handler);
}

function isElement(el) {
  return el && el.nodeType === Node.ELEMENT_NODE;
}



function ensureElementMatchesFunction() {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s);
      var i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
    };
  }
}







function setDropdownPosition(dropdown, trigger) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var doc = document.documentElement;
  var containerScrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  var containerScrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
  var rect = trigger.getBoundingClientRect();
  var dropdownRect = dropdown.getBoundingClientRect();
  dropdown.style.right = 'auto';
  dropdown.style.bottom = 'auto';
  if (options.menuRight) {
    dropdown.style.left = containerScrollLeft + rect.left + rect.width - dropdownRect.width + 'px';
  } else {
    dropdown.style.left = containerScrollLeft + rect.left + 'px';
  }
  if (options.dropup) {
    dropdown.style.top = containerScrollTop + rect.top - dropdownRect.height - 4 + 'px';
  } else {
    dropdown.style.top = containerScrollTop + rect.top + rect.height + 'px';
  }
}













function focus(el) {
  if (!isElement(el)) {
    return;
  }
  el.getAttribute('tabindex') ? null : el.setAttribute('tabindex', '-1');
  el.focus();
}

var DEFAULT_TAG = 'div';

var Dropdown = {
  render: function render(h) {
    return h(this.tag, {
      class: {
        'btn-group': this.tag === DEFAULT_TAG,
        dropdown: !this.dropup,
        dropup: this.dropup,
        open: this.show
      }
    }, [this.$slots.default, h('ul', {
      class: {
        'dropdown-menu': true,
        'dropdown-menu-right': this.menuRight
      },
      ref: 'dropdown'
    }, [this.$slots.dropdown])]);
  },

  props: {
    tag: {
      type: String,
      default: DEFAULT_TAG
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    value: Boolean,
    dropup: {
      type: Boolean,
      default: false
    },
    menuRight: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    notCloseElements: Array,
    positionElement: null
  },
  data: function data() {
    return {
      show: false,
      triggerEl: undefined
    };
  },

  watch: {
    value: function value(v) {
      this.toggle(v);
    }
  },
  mounted: function mounted() {
    this.initTrigger();
    if (this.triggerEl) {
      on(this.triggerEl, EVENTS.CLICK, this.toggle);
      on(this.triggerEl, EVENTS.KEY_DOWN, this.onKeyPress);
    }
    on(this.$refs.dropdown, EVENTS.KEY_DOWN, this.onKeyPress);
    on(window, EVENTS.CLICK, this.windowClicked);
    on(window, EVENTS.TOUCH_END, this.windowClicked);
    if (this.value) {
      this.toggle(true);
    }
  },
  beforeDestroy: function beforeDestroy() {
    this.removeDropdownFromBody();
    if (this.triggerEl) {
      off(this.triggerEl, EVENTS.CLICK, this.toggle);
      off(this.triggerEl, EVENTS.KEY_DOWN, this.onKeyPress);
    }
    off(this.$refs.dropdown, EVENTS.KEY_DOWN, this.onKeyPress);
    off(window, EVENTS.CLICK, this.windowClicked);
    off(window, EVENTS.TOUCH_END, this.windowClicked);
  },

  methods: {
    onKeyPress: function onKeyPress(event) {
      if (this.show) {
        var dropdownEl = this.$refs.dropdown;
        var keyCode = event.keyCode || event.which;
        if (keyCode === 27) {
          this.toggle(false);
          this.triggerEl && this.triggerEl.focus();
        } else if (keyCode === 13) {
          var currentFocus = dropdownEl.querySelector('li > a:focus');
          currentFocus && currentFocus.click();
        } else if (keyCode === 38 || keyCode === 40) {
          event.preventDefault();
          event.stopPropagation();
          var _currentFocus = dropdownEl.querySelector('li > a:focus');
          var items = dropdownEl.querySelectorAll('li:not(.disabled) > a');
          if (!_currentFocus) {
            focus(items[0]);
          } else {
            for (var i = 0; i < items.length; i++) {
              if (_currentFocus === items[i]) {
                if (keyCode === 38 && i < items.length > 0) {
                  focus(items[i - 1]);
                } else if (keyCode === 40 && i < items.length - 1) {
                  focus(items[i + 1]);
                }
                break;
              }
            }
          }
        }
      }
    },
    initTrigger: function initTrigger() {
      var trigger = this.$el.querySelector('[data-role="trigger"]') || this.$el.querySelector('.dropdown-toggle') || this.$el.firstChild;
      this.triggerEl = trigger && trigger !== this.$refs.dropdown ? trigger : null;
    },
    toggle: function toggle(show) {
      if (this.disabled) {
        return;
      }
      if (isBoolean(show)) {
        this.show = show;
      } else {
        this.show = !this.show;
      }
      if (this.appendToBody) {
        this.show ? this.appendDropdownToBody() : this.removeDropdownFromBody();
      }
      this.$emit('input', this.show);
    },
    windowClicked: function windowClicked(event) {
      var target = event.target;
      if (this.show && target) {
        var targetInNotCloseElements = false;
        if (this.notCloseElements) {
          for (var i = 0, l = this.notCloseElements.length; i < l; i++) {
            var isTargetInElement = this.notCloseElements[i].contains(target);
            var shouldBreak = isTargetInElement;
            if (this.appendToBody) {
              var isTargetInDropdown = this.$refs.dropdown.contains(target);
              var isElInElements = this.notCloseElements.indexOf(this.$el) >= 0;
              shouldBreak = isTargetInElement || isTargetInDropdown && isElInElements;
            }
            if (shouldBreak) {
              targetInNotCloseElements = true;
              break;
            }
          }
        }
        var targetInDropdownBody = this.$refs.dropdown.contains(target);
        var targetInTrigger = this.$el.contains(target) && !targetInDropdownBody;
        // normally, a dropdown select event is handled by @click that trigger after @touchend
        // then @touchend event have to be ignore in this case
        var targetInDropdownAndIsTouchEvent = targetInDropdownBody && event.type === 'touchend';
        if (!targetInTrigger && !targetInNotCloseElements && !targetInDropdownAndIsTouchEvent) {
          this.toggle(false);
        }
      }
    },
    appendDropdownToBody: function appendDropdownToBody() {
      try {
        var el = this.$refs.dropdown;
        el.style.display = 'block';
        document.body.appendChild(el);
        var positionElement = this.positionElement || this.$el;
        setDropdownPosition(el, positionElement, this);
      } catch (e) {
        // Silent
      }
    },
    removeDropdownFromBody: function removeDropdownFromBody() {
      try {
        var el = this.$refs.dropdown;
        el.removeAttribute('style');
        this.$el.appendChild(el);
      } catch (e) {
        // Silent
      }
    }
  }
};

var Typeahead = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('dropdown', { ref: "dropdown", attrs: { "tag": "section", "append-to-body": _vm.appendToBody, "not-close-elements": _vm.elements, "position-element": _vm.inputEl }, model: { value: _vm.open, callback: function callback($$v) {
          _vm.open = $$v;
        }, expression: "open" } }, [_c('template', { slot: "dropdown" }, [_vm._t("item", _vm._l(_vm.items, function (item, index) {
      return _c('li', { class: { active: _vm.activeIndex === index } }, [_c('a', { attrs: { "href": "#" }, on: { "click": function click($event) {
            $event.preventDefault();return _vm.selectItem(item);
          } } }, [_c('span', { domProps: { "innerHTML": _vm._s(_vm.highlight(item)) } })])]);
    }), { "items": _vm.items, "activeIndex": _vm.activeIndex, "select": _vm.selectItem, "highlight": _vm.highlight }), _vm._v(" "), !_vm.items || _vm.items.length === 0 ? _vm._t("empty") : _vm._e()], 2)], 2);
  }, staticRenderFns: [],
  components: { Dropdown: Dropdown },
  props: {
    value: {
      required: true
    },
    data: Array,
    itemKey: String,
    appendToBody: {
      type: Boolean,
      default: false
    },
    ignoreCase: {
      type: Boolean,
      default: true
    },
    matchStart: {
      type: Boolean,
      default: false
    },
    forceSelect: {
      type: Boolean,
      default: false
    },
    forceClear: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 10
    },
    asyncSrc: String,
    asyncKey: String,
    asyncFunction: Function,
    debounce: {
      type: Number,
      default: 200
    },
    openOnFocus: {
      type: Boolean,
      default: true
    },
    openOnEmpty: {
      type: Boolean,
      default: false
    },
    target: {
      required: true
    },
    preselect: {
      type: Boolean,
      default: true
    }
  },
  data: function data() {
    return {
      inputEl: null,
      items: [],
      activeIndex: 0,
      timeoutID: 0,
      elements: [],
      open: false,
      dropdownMenuEl: null
    };
  },

  computed: {
    regexOptions: function regexOptions() {
      var options = '';
      if (this.ignoreCase) {
        options += 'i';
      }
      if (!this.matchStart) {
        options += 'g';
      }
      return options;
    }
  },
  mounted: function mounted() {
    var _this = this;

    ensureElementMatchesFunction();
    this.$nextTick(function () {
      _this.initInputElByTarget(_this.target);
      _this.initListeners();
      _this.dropdownMenuEl = _this.$refs.dropdown.$el.querySelector('.dropdown-menu');
      // set input text if v-model not empty
      if (_this.value) {
        _this.setInputTextByValue(_this.value);
      }
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.removeListeners();
  },

  watch: {
    target: function target(el) {
      this.removeListeners();
      this.initInputElByTarget(el);
      this.initListeners();
    },
    value: function value(_value) {
      this.setInputTextByValue(_value);
    }
  },
  methods: {
    setInputTextByValue: function setInputTextByValue(value) {
      if (isString(value)) {
        // direct
        this.inputEl.value = value;
      } else if (value) {
        // is object
        this.inputEl.value = this.itemKey ? value[this.itemKey] : value;
      } else if (value === null) {
        // is null or undefined or something else not valid
        this.inputEl.value = '';
      }
    },
    hasEmptySlot: function hasEmptySlot() {
      return !!this.$slots['empty'] || !!this.$scopedSlots['empty'];
    },
    initInputElByTarget: function initInputElByTarget(target) {
      if (!target) {
        return;
      }
      if (isString(target)) {
        // is selector
        this.inputEl = document.querySelector(target);
      } else if (isElement(target)) {
        // is element
        this.inputEl = target;
      } else if (isElement(target.$el)) {
        // is component
        this.inputEl = target.$el;
      }
    },
    initListeners: function initListeners() {
      if (this.inputEl) {
        this.elements = [this.inputEl];
        on(this.inputEl, EVENTS.FOCUS, this.inputFocused);
        on(this.inputEl, EVENTS.BLUR, this.inputBlured);
        on(this.inputEl, EVENTS.INPUT, this.inputChanged);
        on(this.inputEl, EVENTS.KEY_DOWN, this.inputKeyPressed);
      }
    },
    removeListeners: function removeListeners() {
      this.elements = [];
      if (this.inputEl) {
        off(this.inputEl, EVENTS.FOCUS, this.inputFocused);
        off(this.inputEl, EVENTS.BLUR, this.inputBlured);
        off(this.inputEl, EVENTS.INPUT, this.inputChanged);
        off(this.inputEl, EVENTS.KEY_DOWN, this.inputKeyPressed);
      }
    },
    prepareItems: function prepareItems(data) {
      var disableFilters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (disableFilters) {
        this.items = data.slice(0, this.limit);
        return;
      }
      this.items = [];
      this.activeIndex = this.preselect ? 0 : -1;
      for (var i = 0, l = data.length; i < l; i++) {
        var item = data[i];
        var key = this.itemKey ? item[this.itemKey] : item;
        key = key.toString();
        var index = -1;
        if (this.ignoreCase) {
          index = key.toLowerCase().indexOf(this.inputEl.value.toLowerCase());
        } else {
          index = key.indexOf(this.inputEl.value);
        }
        if (this.matchStart ? index === 0 : index >= 0) {
          this.items.push(item);
        }
        if (this.items.length >= this.limit) {
          break;
        }
      }
    },
    fetchItems: function fetchItems(value, debounce) {
      var _this2 = this;

      clearTimeout(this.timeoutID);
      if (value === '' && !this.openOnEmpty) {
        this.open = false;
      } else if (this.data) {
        this.prepareItems(this.data);
        this.open = this.hasEmptySlot() || Boolean(this.items.length);
      } else if (this.asyncSrc) {
        this.timeoutID = setTimeout(function () {
          _this2.$emit('loading');
          getRequest(_this2.asyncSrc + encodeURIComponent(value)).then(function (data) {
            if (_this2.inputEl.matches(':focus')) {
              _this2.prepareItems(_this2.asyncKey ? data[_this2.asyncKey] : data, true);
              _this2.open = _this2.hasEmptySlot() || Boolean(_this2.items.length);
            }
            _this2.$emit('loaded');
          }).catch(function (err) {
            console.error(err);
            _this2.$emit('loaded-error');
          });
        }, debounce);
      } else if (this.asyncFunction) {
        var cb = function cb(data) {
          if (_this2.inputEl.matches(':focus')) {
            _this2.prepareItems(data, true);
            _this2.open = _this2.hasEmptySlot() || Boolean(_this2.items.length);
          }
          _this2.$emit('loaded');
        };
        this.timeoutID = setTimeout(function () {
          _this2.$emit('loading');
          _this2.asyncFunction(value, cb);
        }, debounce);
      }
    },
    inputChanged: function inputChanged() {
      var value = this.inputEl.value;
      this.fetchItems(value, this.debounce);
      this.$emit('input', this.forceSelect ? undefined : value);
    },
    inputFocused: function inputFocused() {
      if (this.openOnFocus) {
        var value = this.inputEl.value;
        this.fetchItems(value, 0);
      }
    },
    inputBlured: function inputBlured() {
      var _this3 = this;

      if (!this.dropdownMenuEl.matches(':hover')) {
        this.open = false;
      }
      if (this.inputEl && this.forceClear) {
        this.$nextTick(function () {
          if (typeof _this3.value === 'undefined') {
            _this3.inputEl.value = '';
          }
        });
      }
    },
    inputKeyPressed: function inputKeyPressed(event) {
      event.stopPropagation();
      if (this.open) {
        switch (event.keyCode) {
          case 13:
            if (this.activeIndex >= 0) {
              this.selectItem(this.items[this.activeIndex]);
            } else {
              this.open = false;
            }
            event.preventDefault();
            break;
          case 27:
            this.open = false;
            break;
          case 38:
            this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : 0;
            break;
          case 40:
            var maxIndex = this.items.length - 1;
            this.activeIndex = this.activeIndex < maxIndex ? this.activeIndex + 1 : maxIndex;
            break;
        }
      }
    },
    selectItem: function selectItem(item) {
      this.$emit('input', item);
      this.open = false;
    },
    highlight: function highlight(item) {
      var value = this.itemKey ? item[this.itemKey] : item;
      var inputValue = this.inputEl.value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      return value.replace(new RegExp('' + inputValue, this.regexOptions), '<b>$&</b>');
    }
  }
};

export default Typeahead;
//# sourceMappingURL=Typeahead.js.map
