function mergeData() {
  for (var e, a, s = {}, t = arguments.length; t--;) {
    for (var r = 0, c = Object.keys(arguments[t]); r < c.length; r++) {
      switch (e = c[r]) {case "class":case "style":case "directives":
          Array.isArray(s[e]) || (s[e] = []), s[e] = s[e].concat(arguments[t][e]);break;case "staticClass":
          if (!arguments[t][e]) break;void 0 === s[e] && (s[e] = ""), s[e] && (s[e] += " "), s[e] += arguments[t][e].trim();break;case "on":case "nativeOn":
          s[e] || (s[e] = {});for (var o = 0, n = Object.keys(arguments[t][e]); o < n.length; o++) {
            a = n[o], s[e][a] ? s[e][a] = [].concat(s[e][a], arguments[t][e][a]) : s[e][a] = arguments[t][e][a];
          }break;case "attrs":case "props":case "domProps":case "scopedSlots":case "staticStyle":case "hook":case "transition":
          s[e] || (s[e] = {}), s[e] = __assign({}, arguments[t][e], s[e]);break;case "slot":case "key":case "ref":case "tag":case "show":case "keepAlive":default:
          s[e] || (s[e] = arguments[t][e]);}
    }
  }return s;
}var __assign = Object.assign || function (e) {
  for (var a, s = 1, t = arguments.length; s < t; s++) {
    a = arguments[s];for (var r in a) {
      Object.prototype.hasOwnProperty.call(a, r) && (e[r] = a[r]);
    }
  }return e;
};

var linkMixin = {
  props: {
    // <a> props
    href: String,
    target: String,
    // <router-link> props
    to: null,
    replace: {
      type: Boolean,
      default: false
    },
    append: {
      type: Boolean,
      default: false
    },
    exact: {
      type: Boolean,
      default: false
    }
  }
};

var BreadcrumbItem = {
  functional: true,
  mixins: [linkMixin],
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    var slot = void 0;
    if (props.active) {
      slot = children;
    } else if (props.to) {
      slot = [h('router-link', {
        props: {
          to: props.to,
          replace: props.replace,
          append: props.append,
          exact: props.exact
        }
      }, children)];
    } else {
      slot = [h('a', {
        attrs: {
          href: props.href,
          target: props.target
        }
      }, children)];
    }
    return h('li', mergeData(data, { class: { active: props.active } }), slot);
  },

  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
};

var Breadcrumbs = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    var slot = [];
    if (children && children.length) {
      slot = children;
    } else if (props.items) {
      slot = props.items.map(function (item, index) {
        return h(BreadcrumbItem, {
          key: item.hasOwnProperty('key') ? item.key : index,
          props: {
            active: item.hasOwnProperty('active') ? item.active : index === props.items.length - 1,
            href: item.href,
            target: item.target,
            to: item.to,
            replace: item.replace,
            append: item.append,
            exact: item.exact
          }
        }, item.text);
      });
    }
    return h('ol', mergeData(data, { class: 'breadcrumb' }), slot);
  },

  props: {
    items: Array
  }
};

export default Breadcrumbs;
//# sourceMappingURL=Breadcrumbs.js.map
