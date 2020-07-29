var __assign=function(){return (__assign=Object.assign||function(e){for(var a,s=1,t=arguments.length;s<t;s++){ for(var r in a=arguments[s]){ Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r]); } }return e}).apply(this,arguments)};function mergeData(){
var arguments$1 = arguments;
for(var e,a,s={},t=arguments.length;t--;){ for(var r=0,c=Object.keys(arguments[t]);r<c.length;r++){ switch(e=c[r]){case"class":case"style":case"directives":Array.isArray(s[e])||(s[e]=[]),s[e]=s[e].concat(arguments$1[t][e]);break;case"staticClass":if(!arguments$1[t][e]){ break; }void 0===s[e]&&(s[e]=""),s[e]&&(s[e]+=" "),s[e]+=arguments$1[t][e].trim();break;case"on":case"nativeOn":s[e]||(s[e]={});for(var n=0,o=Object.keys(arguments[t][e]||{});n<o.length;n++){ a=o[n],s[e][a]?s[e][a]=[].concat(s[e][a],arguments$1[t][e][a]):s[e][a]=arguments$1[t][e][a]; }break;case"attrs":case"props":case"domProps":case"scopedSlots":case"staticStyle":case"hook":case"transition":s[e]||(s[e]={}),s[e]=__assign({},arguments$1[t][e],s[e]);break;case"slot":case"key":case"ref":case"tag":case"show":case"keepAlive":default:s[e]||(s[e]=arguments$1[t][e]);} } }return s}

var NavbarForm = {
  functional: true,
  render: function render (h, ref) {
    var children = ref.children;
    var data = ref.data;
    var props = ref.props;

    return h(
      'form',
      mergeData(data, {
        class: {
          'navbar-form': true,
          'navbar-left': props.left,
          'navbar-right': props.right
        }
      }),
      children
    )
  },
  props: {
    left: Boolean,
    right: Boolean
  }
};

export default NavbarForm;
//# sourceMappingURL=NavbarForm.js.map
