/**
  * vee-validate vundefined
  * (c) 2020 Abdelrahman Awad
  * @license MIT
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
  (global = global || self, factory(global.VeeValidate = {}, global.Vue));
}(this, (function (exports, vue) { 'use strict';

  function isCallable(fn) {
      return typeof fn === 'function';
  }
  const isObject = (obj) => obj !== null && obj && typeof obj === 'object' && !Array.isArray(obj);

  const RULES = {};
  /**
   * Adds a custom validator to the list of validation rules.
   */
  function defineRule(id, validator) {
      // makes sure new rules are properly formatted.
      guardExtend(id, validator);
      RULES[id] = validator;
  }
  /**
   * Gets an already defined rule
   */
  function resolveRule(id) {
      return RULES[id];
  }
  /**
   * Guards from extension violations.
   */
  function guardExtend(id, validator) {
      if (isCallable(validator)) {
          return;
      }
      throw new Error(`Extension Error: The validator '${id}' must be a function.`);
  }

  function isLocator(value) {
      return isCallable(value) && !!value.__locatorRef;
  }
  /**
   * Checks if an tag name is a native HTML tag and not a Vue component
   */
  function isHTMLTag(tag) {
      return ['input', 'textarea', 'select'].includes(tag);
  }
  function isYupValidator(value) {
      return value && isCallable(value.validate);
  }

  function genFieldErrorId(fieldName) {
      return `v_${fieldName}_error`;
  }

  const isEvent = (evt) => {
      if (!evt) {
          return false;
      }
      if (typeof Event !== 'undefined' && isCallable(Event) && evt instanceof Event) {
          return true;
      }
      // this is for IE
      /* istanbul ignore next */
      if (evt && evt.srcElement) {
          return true;
      }
      return false;
  };
  function normalizeEventValue(value) {
      if (!isEvent(value)) {
          return value;
      }
      const input = value.target;
      if (input.type === 'file' && input.files) {
          return Array.from(input.files);
      }
      return input.value;
  }

  function unwrap(ref) {
      return vue.isRef(ref) ? ref.value : ref;
  }
  function useRefsObjToComputed(refsObj) {
      return vue.computed(() => {
          return Object.keys(refsObj).reduce((acc, key) => {
              acc[key] = refsObj[key].value;
              return acc;
          }, {});
      });
  }

  /**
   * Normalizes the given rules expression.
   */
  function normalizeRules(rules) {
      // if falsy value return an empty object.
      const acc = {};
      Object.defineProperty(acc, '_$$isNormalized', {
          value: true,
          writable: false,
          enumerable: false,
          configurable: false,
      });
      if (!rules) {
          return acc;
      }
      // If its a single validate function or a yup fn, leave as is.
      if (isCallable(rules) || isYupValidator(rules)) {
          return rules;
      }
      // Object is already normalized, skip.
      if (isObject(rules) && rules._$$isNormalized) {
          return rules;
      }
      if (isObject(rules)) {
          return Object.keys(rules).reduce((prev, curr) => {
              const params = normalizeParams(rules[curr]);
              if (rules[curr] !== false) {
                  prev[curr] = buildParams(params);
              }
              return prev;
          }, acc);
      }
      /* istanbul ignore if */
      if (typeof rules !== 'string') {
          return acc;
      }
      return rules.split('|').reduce((prev, rule) => {
          const parsedRule = parseRule(rule);
          if (!parsedRule.name) {
              return prev;
          }
          prev[parsedRule.name] = buildParams(parsedRule.params);
          return prev;
      }, acc);
  }
  /**
   * Normalizes a rule param.
   */
  function normalizeParams(params) {
      if (params === true) {
          return [];
      }
      if (Array.isArray(params)) {
          return params;
      }
      if (isObject(params)) {
          return params;
      }
      return [params];
  }
  function buildParams(provided) {
      const mapValueToLocator = (value) => {
          // A target param using interpolation
          if (typeof value === 'string' && value[0] === '@') {
              return createLocator(value.slice(1));
          }
          return value;
      };
      if (Array.isArray(provided)) {
          return provided.map(mapValueToLocator);
      }
      return Object.keys(provided).reduce((prev, key) => {
          prev[key] = mapValueToLocator(provided[key]);
          return prev;
      }, {});
  }
  /**
   * Parses a rule string expression.
   */
  const parseRule = (rule) => {
      let params = [];
      const name = rule.split(':')[0];
      if (rule.includes(':')) {
          params = rule.split(':').slice(1).join(':').split(',');
      }
      return { name, params };
  };
  function createLocator(value) {
      const locator = (crossTable) => {
          const val = crossTable[value];
          return val;
      };
      locator.__locatorRef = value;
      return locator;
  }
  function extractLocators(params) {
      if (Array.isArray(params)) {
          return params.filter(isLocator);
      }
      return Object.keys(params)
          .filter(key => isLocator(params[key]))
          .map(key => params[key]);
  }

  const normalizeChildren = (context, slotProps) => {
      if (!context.slots.default) {
          return [];
      }
      return context.slots.default(slotProps) || [];
  };

  const DEFAULT_CONFIG = {
      generateMessage: ({ field }) => `${field} is not valid.`,
      skipOptional: true,
      bails: true,
  };
  let currentConfig = Object.assign({}, DEFAULT_CONFIG);
  const getConfig = () => currentConfig;
  const setConfig = (newConf) => {
      currentConfig = Object.assign(Object.assign({}, currentConfig), newConf);
  };
  const configure = (cfg) => {
      setConfig(cfg);
  };

  /**
   * Validates a value against the rules.
   */
  async function validate(value, rules, options = {}) {
      const shouldBail = options === null || options === void 0 ? void 0 : options.bails;
      const skipIfEmpty = options === null || options === void 0 ? void 0 : options.skipIfEmpty;
      const field = {
          name: (options === null || options === void 0 ? void 0 : options.name) || '{field}',
          rules: normalizeRules(rules),
          bails: shouldBail !== null && shouldBail !== void 0 ? shouldBail : true,
          skipIfEmpty: skipIfEmpty !== null && skipIfEmpty !== void 0 ? skipIfEmpty : true,
          forceRequired: false,
          crossTable: (options === null || options === void 0 ? void 0 : options.values) || {},
      };
      const result = await _validate(field, value);
      const errors = result.errors;
      return {
          errors,
      };
  }
  /**
   * Starts the validation process.
   */
  async function _validate(field, value) {
      // if a generic function, use it as the pipeline.
      if (isCallable(field.rules)) {
          const result = await field.rules(value);
          const isValid = typeof result !== 'string' && result;
          return {
              errors: !isValid ? [result] : [],
          };
      }
      if (isYupValidator(field.rules)) {
          return validateFieldWithYup(field, value);
      }
      const errors = [];
      const rules = Object.keys(field.rules);
      const length = rules.length;
      for (let i = 0; i < length; i++) {
          const rule = rules[i];
          const result = await _test(field, value, {
              name: rule,
              params: field.rules[rule],
          });
          if (result.error) {
              errors.push(result.error);
              if (field.bails) {
                  return {
                      errors,
                  };
              }
          }
      }
      return {
          errors,
      };
  }
  /**
   * Handles yup validation
   */
  async function validateFieldWithYup(field, value) {
      const result = await field.rules
          .validate(value)
          .then(() => true)
          .catch((err) => {
          // Yup errors have a name prop one them.
          // https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
          if (err.name === 'ValidationError') {
              return err.message;
          }
          // re-throw the error so we don't hide it
          throw err;
      });
      const isValid = typeof result !== 'string' && result;
      return {
          errors: !isValid ? [result] : [],
      };
  }
  /**
   * Tests a single input value against a rule.
   */
  async function _test(field, value, rule) {
      const validator = resolveRule(rule.name);
      if (!validator) {
          throw new Error(`No such validator '${rule.name}' exists.`);
      }
      const params = fillTargetValues(rule.params, field.crossTable);
      const ctx = {
          field: field.name,
          value,
          form: field.crossTable,
          rule,
      };
      const result = await validator(value, params, ctx);
      if (typeof result === 'string') {
          return {
              error: result,
          };
      }
      return {
          error: result ? undefined : _generateFieldError(ctx),
      };
  }
  /**
   * Generates error messages.
   */
  function _generateFieldError(fieldCtx) {
      const message = getConfig().generateMessage;
      return message(fieldCtx);
  }
  function fillTargetValues(params, crossTable) {
      const normalize = (value) => {
          if (isLocator(value)) {
              return value(crossTable);
          }
          return value;
      };
      if (Array.isArray(params)) {
          return params.map(normalize);
      }
      return Object.keys(params).reduce((acc, param) => {
          acc[param] = normalize(params[param]);
          return acc;
      }, {});
  }

  /**
   * Creates a field composite.
   */
  function useField(fieldName, rules, opts) {
      const { value, form, immediate, bails, disabled } = normalizeOptions(opts);
      const { meta, errors, onBlur, handleChange, reset, patch } = useValidationState(value);
      const nonYupSchemaRules = extractRuleFromSchema(form === null || form === void 0 ? void 0 : form.schema, unwrap(fieldName));
      const normalizedRules = vue.computed(() => {
          return normalizeRules(nonYupSchemaRules || unwrap(rules));
      });
      const runValidation = async () => {
          var _a;
          meta.pending.value = true;
          if (!form || !form.validateSchema) {
              const result = await validate(value.value, normalizedRules.value, {
                  name: unwrap(fieldName),
                  values: (_a = form === null || form === void 0 ? void 0 : form.values.value) !== null && _a !== void 0 ? _a : {},
                  bails,
              });
              // Must be updated regardless if a mutation is needed or not
              // FIXME: is this needed?
              meta.valid.value = !result.errors.length;
              meta.invalid.value = !!result.errors.length;
              meta.pending.value = false;
              return result;
          }
          const results = await form.validateSchema();
          meta.pending.value = false;
          return results[unwrap(fieldName)];
      };
      const runValidationWithMutation = () => runValidation().then(patch);
      vue.onMounted(() => {
          runValidation().then(result => {
              if (immediate) {
                  patch(result);
              }
          });
      });
      const errorMessage = vue.computed(() => {
          return errors.value[0];
      });
      const aria = useAriAttrs(fieldName, meta);
      const field = {
          name: fieldName,
          value: value,
          meta,
          errors,
          errorMessage,
          aria,
          reset,
          validate: runValidationWithMutation,
          handleChange,
          onBlur,
          disabled,
          setValidationState: patch,
      };
      vue.watch(value, runValidationWithMutation, {
          deep: true,
      });
      if (vue.isRef(rules)) {
          vue.watch(rules, runValidationWithMutation, {
              deep: true,
          });
      }
      // if no associated form return the field API immediately
      if (!form) {
          return field;
      }
      // associate the field with the given form
      form.register(field);
      // extract cross-field dependencies in a computed prop
      const dependencies = vue.computed(() => {
          const rulesVal = normalizedRules.value;
          // is falsy, a function schema or a yup schema
          if (!rulesVal || isCallable(rulesVal) || isCallable(rulesVal.validate)) {
              return [];
          }
          return Object.keys(rulesVal).reduce((acc, rule) => {
              const deps = extractLocators(normalizedRules.value[rule]).map((dep) => dep.__locatorRef);
              acc.push(...deps);
              return acc;
          }, []);
      });
      // Adds a watcher that runs the validation whenever field dependencies change
      vue.watchEffect(() => {
          // Skip if no dependencies
          if (!dependencies.value.length) {
              return;
          }
          // For each dependent field, validate it if it was validated before
          dependencies.value.forEach(dep => {
              if (dep in form.values.value && meta.validated.value) {
                  runValidationWithMutation();
              }
          });
      });
      return field;
  }
  /**
   * Normalizes partial field options to include the full
   */
  function normalizeOptions(opts) {
      const form = vue.inject('$_veeForm', undefined);
      const defaults = () => ({
          value: vue.ref(undefined),
          immediate: false,
          bails: true,
          rules: '',
          disabled: false,
          form,
      });
      if (!opts) {
          return defaults();
      }
      return Object.assign(Object.assign({}, defaults()), (opts || {}));
  }
  /**
   * Manages the validation state of a field.
   */
  function useValidationState(value) {
      const errors = vue.ref([]);
      const { onBlur, reset: resetFlags, meta } = useMeta();
      const initialValue = value.value;
      // Common input/change event handler
      const handleChange = (e) => {
          value.value = normalizeEventValue(e);
          meta.dirty.value = true;
          meta.pristine.value = false;
      };
      // Updates the validation state with the validation result
      function patch(result) {
          errors.value = result.errors;
          meta.changed.value = initialValue !== value.value;
          meta.valid.value = !result.errors.length;
          meta.invalid.value = !!result.errors.length;
          meta.validated.value = true;
          return result;
      }
      // Resets the validation state
      const reset = () => {
          errors.value = [];
          resetFlags();
      };
      return {
          meta,
          errors,
          patch,
          reset,
          onBlur,
          handleChange,
      };
  }
  /**
   * Exposes meta flags state and some associated actions with them.
   */
  function useMeta() {
      const initialMeta = () => ({
          untouched: true,
          touched: false,
          dirty: false,
          pristine: true,
          valid: false,
          invalid: false,
          validated: false,
          pending: false,
          changed: false,
          passed: false,
          failed: false,
      });
      const flags = vue.reactive(initialMeta());
      const passed = vue.computed(() => {
          return flags.valid && flags.validated;
      });
      const failed = vue.computed(() => {
          return flags.invalid && flags.validated;
      });
      /**
       * Handles common onBlur meta update
       */
      const onBlur = () => {
          flags.touched = true;
          flags.untouched = false;
      };
      /**
       * Resets the flag state
       */
      function reset() {
          const defaults = initialMeta();
          Object.keys(flags).forEach((key) => {
              // Skip these, since they are computed anyways
              if (key === 'passed' || key === 'failed') {
                  return;
              }
              flags[key] = defaults[key];
          });
      }
      return {
          meta: Object.assign(Object.assign({}, vue.toRefs(flags)), { passed,
              failed }),
          onBlur,
          reset,
      };
  }
  function useAriAttrs(fieldName, meta) {
      return vue.computed(() => {
          return {
              'aria-invalid': meta.failed.value ? 'true' : 'false',
              'aria-describedBy': genFieldErrorId(unwrap(fieldName)),
          };
      });
  }
  /**
   * Extracts the validation rules from a schema
   */
  function extractRuleFromSchema(schema, fieldName) {
      // no schema at all
      if (!schema) {
          return undefined;
      }
      // there is a key on the schema object for this field
      return schema[fieldName];
  }

  const Field = vue.defineComponent({
      name: 'Field',
      props: {
          as: {
              type: [String, Object],
              default: undefined,
          },
          name: {
              type: String,
              required: true,
          },
          rules: {
              type: [Object, String, Function],
              default: null,
          },
          immediate: {
              type: Boolean,
              default: false,
          },
          bails: {
              type: Boolean,
              default: () => getConfig().bails,
          },
          disabled: {
              type: Boolean,
              default: false,
          },
      },
      setup(props, ctx) {
          const fieldName = props.name;
          // FIXME: is this right?
          const disabled = vue.computed(() => props.disabled);
          const rules = vue.computed(() => props.rules);
          const { errors, value, errorMessage, validate: validateField, handleChange, onBlur, reset, meta, aria } = useField(fieldName, rules, {
              immediate: props.immediate,
              bails: props.bails,
              disabled,
          });
          const unwrappedMeta = useRefsObjToComputed(meta);
          const slotProps = vue.computed(() => {
              return {
                  field: {
                      name: fieldName,
                      disabled: props.disabled,
                      onInput: handleChange,
                      onChange: handleChange,
                      'onUpdate:modelValue': handleChange,
                      onBlur: onBlur,
                      value: value.value,
                  },
                  aria: aria.value,
                  meta: unwrappedMeta.value,
                  errors: errors.value,
                  errorMessage: errorMessage.value,
                  validate: validateField,
                  reset,
                  handleChange,
              };
          });
          return () => {
              const children = normalizeChildren(ctx, slotProps.value);
              if (props.as) {
                  return vue.h(props.as, Object.assign(Object.assign(Object.assign({}, ctx.attrs), slotProps.value.field), (isHTMLTag(props.as) ? slotProps.value.aria : {})), children);
              }
              return children;
          };
      },
  });

  function useForm(opts) {
      const fields = vue.ref([]);
      const isSubmitting = vue.ref(false);
      const fieldsById = vue.computed(() => {
          return fields.value.reduce((acc, field) => {
              acc[field.name] = field;
              return acc;
          }, {});
      });
      const activeFields = vue.computed(() => {
          return fields.value.filter(field => !unwrap(field.disabled));
      });
      const values = vue.computed(() => {
          return activeFields.value.reduce((acc, field) => {
              acc[field.name] = field.value;
              return acc;
          }, {});
      });
      const controller = {
          register(field) {
              var _a;
              const name = unwrap(field.name);
              // Set the initial value for that field
              if ((_a = opts === null || opts === void 0 ? void 0 : opts.initialValues) === null || _a === void 0 ? void 0 : _a[name]) {
                  field.value.value = opts === null || opts === void 0 ? void 0 : opts.initialValues[name];
              }
              fields.value.push(field);
          },
          fields: fieldsById,
          values,
          schema: opts === null || opts === void 0 ? void 0 : opts.validationSchema,
          validateSchema: isYupValidator(opts === null || opts === void 0 ? void 0 : opts.validationSchema)
              ? (shouldMutate = false) => {
                  return validateYupSchema(controller, shouldMutate);
              }
              : undefined,
      };
      const validate = async () => {
          if (controller.validateSchema) {
              return controller.validateSchema(true).then(results => {
                  return Object.keys(results).every(r => !results[r].errors.length);
              });
          }
          const results = await Promise.all(activeFields.value.map((f) => {
              return f.validate();
          }));
          return results.every(r => !r.errors.length);
      };
      const errors = vue.computed(() => {
          return activeFields.value.reduce((acc, field) => {
              acc[field.name] = field.errorMessage;
              return acc;
          }, {});
      });
      const handleReset = () => {
          fields.value.forEach((f) => f.reset());
      };
      const handleSubmit = (fn) => {
          return function submissionHandler(e) {
              if (e instanceof Event) {
                  e.preventDefault();
                  e.stopPropagation();
              }
              isSubmitting.value = true;
              return validate()
                  .then(result => {
                  if (result && typeof fn === 'function') {
                      return fn(values.value, e);
                  }
              })
                  .then(() => {
                  isSubmitting.value = false;
              }, err => {
                  isSubmitting.value = false;
                  // re-throw the err so it doesn't go silent
                  throw err;
              });
          };
      };
      const submitForm = handleSubmit((_, e) => {
          if (e) {
              e.target.submit();
          }
      });
      const meta = useFormMeta(fields);
      vue.provide('$_veeForm', controller);
      vue.provide('$_veeFormErrors', errors);
      return {
          errors,
          meta,
          form: controller,
          values,
          validate,
          isSubmitting,
          handleReset,
          handleSubmit,
          submitForm,
      };
  }
  const MERGE_STRATEGIES = {
      valid: 'every',
      invalid: 'some',
      dirty: 'some',
      pristine: 'every',
      touched: 'some',
      untouched: 'every',
      pending: 'some',
      validated: 'every',
      changed: 'some',
      passed: 'every',
      failed: 'some',
  };
  function useFormMeta(fields) {
      const flags = Object.keys(MERGE_STRATEGIES);
      return flags.reduce((acc, flag) => {
          acc[flag] = vue.computed(() => {
              const mergeMethod = MERGE_STRATEGIES[flag];
              return fields.value[mergeMethod](field => field.meta[flag]);
          });
          return acc;
      }, {});
  }
  async function validateYupSchema(form, shouldMutate = false) {
      const errors = await form.schema
          .validate(form.values.value, { abortEarly: false })
          .then(() => [])
          .catch((err) => {
          // Yup errors have a name prop one them.
          // https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
          if (err.name !== 'ValidationError') {
              throw err;
          }
          // list of aggregated errors
          return err.inner || [];
      });
      const fields = form.fields.value;
      const errorsByPath = errors.reduce((acc, err) => {
          acc[err.path] = err;
          return acc;
      }, {});
      // Aggregates the validation result
      const aggregatedResult = Object.keys(fields).reduce((result, fieldId) => {
          const field = fields[fieldId];
          const messages = (errorsByPath[fieldId] || { errors: [] }).errors;
          const fieldResult = {
              errors: messages,
          };
          result[fieldId] = fieldResult;
          if (shouldMutate || field.meta.validated) {
              field.setValidationState(fieldResult);
          }
          return result;
      }, {});
      return aggregatedResult;
  }

  const Form = vue.defineComponent({
      name: 'Form',
      inheritAttrs: false,
      props: {
          as: {
              type: String,
              default: 'form',
          },
          validationSchema: {
              type: Object,
              default: undefined,
          },
          initialValues: {
              type: Object,
              default: undefined,
          },
      },
      setup(props, ctx) {
          const { errors, validate, handleSubmit, handleReset, values, meta, isSubmitting, submitForm } = useForm({
              validationSchema: props.validationSchema,
              initialValues: props.initialValues,
          });
          const unwrappedMeta = useRefsObjToComputed(meta);
          const slotProps = vue.computed(() => {
              return {
                  meta: unwrappedMeta.value,
                  errors: errors.value,
                  values: values.value,
                  isSubmitting: isSubmitting.value,
                  validate,
                  handleSubmit,
                  handleReset,
                  submitForm,
              };
          });
          const onSubmit = ctx.attrs.onSubmit ? handleSubmit(ctx.attrs.onSubmit) : submitForm;
          function handleFormReset() {
              handleReset();
              if (typeof ctx.attrs.onReset === 'function') {
                  ctx.attrs.onReset();
              }
          }
          return () => {
              const children = normalizeChildren(ctx, slotProps.value);
              if (!props.as) {
                  return children;
              }
              // Attributes to add on a native `form` tag
              const formAttrs = props.as === 'form'
                  ? {
                      // Disables native validation as vee-validate will handle it.
                      novalidate: true,
                  }
                  : {};
              return vue.h(props.as, Object.assign(Object.assign(Object.assign({}, formAttrs), ctx.attrs), { onSubmit, onReset: handleFormReset }), children);
          };
      },
  });

  const ErrorMessage = vue.defineComponent({
      props: {
          as: {
              type: String,
              default: undefined,
          },
          name: {
              type: String,
              required: true,
          },
      },
      setup(props, ctx) {
          const errors = vue.inject('$_veeFormErrors', undefined);
          const message = vue.computed(() => {
              return errors.value[props.name];
          });
          return () => {
              const children = normalizeChildren(ctx, {
                  message: message.value,
              });
              const tag = props.as;
              const attrs = {
                  id: genFieldErrorId(props.name),
                  role: 'alert',
              };
              // If no tag was specified and there are children
              // render the slot as is without wrapping it
              if (!tag && children.length) {
                  return children;
              }
              // If no children in slot
              // render whatever specified and fallback to a <span> with the message in it's contents
              if (!children.length) {
                  return vue.h(tag || 'span', attrs, message.value);
              }
              return vue.h(tag, Object.assign(Object.assign({}, attrs), ctx.attrs), children);
          };
      },
  });

  exports.ErrorMessage = ErrorMessage;
  exports.Field = Field;
  exports.Form = Form;
  exports.configure = configure;
  exports.defineRule = defineRule;
  exports.useField = useField;
  exports.useForm = useForm;
  exports.validate = validate;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
