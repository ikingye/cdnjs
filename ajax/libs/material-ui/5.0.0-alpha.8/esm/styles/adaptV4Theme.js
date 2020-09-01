import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import createBreakpoints from './createBreakpoints';
import createSpacing from './createSpacing';
export default function adaptV4Theme(inputTheme) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(['Material-UI: adaptV4Theme() is deprecated.', 'Follow the upgrade guide on http://next.material-ui.com/guides/migration-v4/#theme'].join('\n'));
  }

  var _inputTheme$props = inputTheme.props,
      props = _inputTheme$props === void 0 ? {} : _inputTheme$props,
      _inputTheme$defaultPr = inputTheme.defaultProps,
      defaultProps = _inputTheme$defaultPr === void 0 ? {} : _inputTheme$defaultPr,
      _inputTheme$styleOver = inputTheme.styleOverrides,
      styleOverrides = _inputTheme$styleOver === void 0 ? {} : _inputTheme$styleOver,
      _inputTheme$overrides = inputTheme.overrides,
      overrides = _inputTheme$overrides === void 0 ? {} : _inputTheme$overrides,
      _inputTheme$mixins = inputTheme.mixins,
      mixins = _inputTheme$mixins === void 0 ? {} : _inputTheme$mixins,
      other = _objectWithoutProperties(inputTheme, ["props", "defaultProps", "styleOverrides", "overrides", "mixins"]);

  var theme = _extends({}, other, {
    components: {}
  }); // default props


  Object.keys(defaultProps).forEach(function (component) {
    var componentValue = theme.components[component] || {};
    componentValue.defaultProps = defaultProps[component];
    theme.components[component] = componentValue;
  });
  Object.keys(props).forEach(function (component) {
    var componentValue = theme.components[component] || {};
    componentValue.defaultProps = props[component];
    theme.components[component] = componentValue;
  }); // css overrides

  Object.keys(styleOverrides).forEach(function (component) {
    var componentValue = theme.components[component] || {};
    componentValue.styleOverrides = styleOverrides[component];
    theme.components[component] = componentValue;
  });
  Object.keys(overrides).forEach(function (component) {
    var componentValue = theme.components[component] || {};
    componentValue.styleOverrides = overrides[component];
    theme.components[component] = componentValue;
  }); // theme.mixins.gutters

  var breakpoints = createBreakpoints(inputTheme.breakpoints || {});
  var spacing = createSpacing(inputTheme.spacing);
  theme.mixins = _extends({
    gutters: function gutters() {
      var styles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _extends({
        paddingLeft: spacing(2),
        paddingRight: spacing(2)
      }, styles, _defineProperty({}, breakpoints.up('sm'), _extends({
        paddingLeft: spacing(3),
        paddingRight: spacing(3)
      }, styles[breakpoints.up('sm')])));
    }
  }, mixins);
  return theme;
}