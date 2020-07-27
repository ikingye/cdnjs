var __assign=function(){return (__assign=Object.assign||function(e){for(var a,s=1,t=arguments.length;s<t;s++){ for(var r in a=arguments[s]){ Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r]); } }return e}).apply(this,arguments)};function mergeData(){
var arguments$1 = arguments;
for(var e,a,s={},t=arguments.length;t--;){ for(var r=0,c=Object.keys(arguments[t]);r<c.length;r++){ switch(e=c[r]){case"class":case"style":case"directives":Array.isArray(s[e])||(s[e]=[]),s[e]=s[e].concat(arguments$1[t][e]);break;case"staticClass":if(!arguments$1[t][e]){ break; }void 0===s[e]&&(s[e]=""),s[e]&&(s[e]+=" "),s[e]+=arguments$1[t][e].trim();break;case"on":case"nativeOn":s[e]||(s[e]={});for(var n=0,o=Object.keys(arguments[t][e]||{});n<o.length;n++){ a=o[n],s[e][a]?s[e][a]=[].concat(s[e][a],arguments$1[t][e][a]):s[e][a]=arguments$1[t][e][a]; }break;case"attrs":case"props":case"domProps":case"scopedSlots":case"staticStyle":case"hook":case"transition":s[e]||(s[e]={}),s[e]=__assign({},arguments$1[t][e],s[e]);break;case"slot":case"key":case"ref":case"tag":case"show":case"keepAlive":default:s[e]||(s[e]=arguments$1[t][e]);} } }return s}

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
  render: function render (h, ref) {
    var props = ref.props;
    var data = ref.data;
    var children = ref.children;

    var slot;
    if (props.active) {
      slot = children;
    } else if (props.to) {
      slot = [
        h('router-link', {
          props: {
            to: props.to,
            replace: props.replace,
            append: props.append,
            exact: props.exact
          }
        }, children)
      ];
    } else {
      slot = [
        h('a', {
          attrs: {
            href: props.href,
            target: props.target
          }
        }, children)
      ];
    }
    return h('li', mergeData(data, {class: {active: props.active}}), slot)
  },
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
};

export default BreadcrumbItem;
//# sourceMappingURL=BreadcrumbItem.js.map
