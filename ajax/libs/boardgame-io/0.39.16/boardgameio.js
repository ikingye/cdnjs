'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var redux = require('redux');
var produce = _interopDefault(require('immer'));
var flatted = require('flatted');
var React = _interopDefault(require('react'));
var PropTypes = _interopDefault(require('prop-types'));
var io = _interopDefault(require('socket.io-client'));

function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, callback) {
    const unsub = store.subscribe(callback);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, fn) {
    return definition[1]
        ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
        : ctx.$$scope.ctx;
}
function get_slot_changes(definition, ctx, changed, fn) {
    return definition[1]
        ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
        : ctx.$$scope.changed || {};
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
let running = false;
function run_tasks() {
    tasks.forEach(task => {
        if (!task[0](now())) {
            tasks.delete(task);
            task[1]();
        }
    });
    running = tasks.size > 0;
    if (running)
        raf(run_tasks);
}
function loop(fn) {
    let task;
    if (!running) {
        running = true;
        raf(run_tasks);
    }
    return {
        promise: new Promise(fulfil => {
            tasks.add(task = [fn, fulfil]);
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else
        node.setAttribute(attribute, value);
}
function to_number(value) {
    return value === '' ? undefined : +value;
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let stylesheet;
let active = 0;
let current_rules = {};
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    if (!current_rules[name]) {
        if (!stylesheet) {
            const style = element('style');
            document.head.appendChild(style);
            stylesheet = style.sheet;
        }
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    node.style.animation = (node.style.animation || '')
        .split(', ')
        .filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    )
        .join(', ');
    if (name && !--active)
        clear_rules();
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        let i = stylesheet.cssRules.length;
        while (i--)
            stylesheet.deleteRule(i);
        current_rules = {};
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = current_component;
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment) {
        $$.update($$.dirty);
        run_all($$.before_update);
        $$.fragment.p($$.dirty, $$.ctx);
        $$.dirty = null;
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

const globals = (typeof window !== 'undefined' ? window : global);

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    if (component.$$.fragment) {
        run_all(component.$$.on_destroy);
        component.$$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        component.$$.on_destroy = component.$$.fragment = null;
        component.$$.ctx = {};
    }
}
function make_dirty(component, key) {
    if (!component.$$.dirty) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty = blank_object();
    }
    component.$$.dirty[key] = true;
}
function init(component, options, instance, create_fragment, not_equal, prop_names) {
    const parent_component = current_component;
    set_current_component(component);
    const props = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props: prop_names,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty: null
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, props, (key, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                if ($$.bound[key])
                    $$.bound[key](value);
                if (ready)
                    make_dirty(component, key);
            }
            return ret;
        })
        : props;
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment($$.ctx);
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
const MAKE_MOVE = 'MAKE_MOVE';
const GAME_EVENT = 'GAME_EVENT';
const REDO = 'REDO';
const RESET = 'RESET';
const SYNC = 'SYNC';
const UNDO = 'UNDO';
const UPDATE = 'UPDATE';
const PLUGIN = 'PLUGIN';

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Generate a move to be dispatched to the game move reducer.
 *
 * @param {string} type - The move type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
const makeMove = (type, args, playerID, credentials) => ({
    type: MAKE_MOVE,
    payload: { type, args, playerID, credentials },
});
/**
 * Generate a game event to be dispatched to the flow reducer.
 *
 * @param {string} type - The event type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
const gameEvent = (type, args, playerID, credentials) => ({
    type: GAME_EVENT,
    payload: { type, args, playerID, credentials },
});
/**
 * Generate an automatic game event that is a side-effect of a move.
 * @param {string} type - The event type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
const automaticGameEvent = (type, args, playerID, credentials) => ({
    type: GAME_EVENT,
    payload: { type, args, playerID, credentials },
    automatic: true,
});
const sync = (info) => ({
    type: SYNC,
    state: info.state,
    log: info.log,
    initialState: info.initialState,
    clientOnly: true,
});
/**
 * Used to update the Redux store's state in response to
 * an action coming from another player.
 * @param {object} state - The state to restore.
 * @param {Array} deltalog - A log delta.
 */
const update$1 = (state, deltalog) => ({
    type: UPDATE,
    state,
    deltalog,
    clientOnly: true,
});
/**
 * Used to reset the game state.
 * @param {object} state - The initial state.
 */
const reset = (state) => ({
    type: RESET,
    state,
    clientOnly: true,
});
/**
 * Used to undo the last move.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
const undo = (playerID, credentials) => ({
    type: UNDO,
    payload: { type: null, args: null, playerID, credentials },
});
/**
 * Used to redo the last undone move.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
const redo = (playerID, credentials) => ({
    type: REDO,
    payload: { type: null, args: null, playerID, credentials },
});
/**
 * Allows plugins to define their own actions and intercept them.
 */
const plugin = (type, args, playerID, credentials) => ({
    type: PLUGIN,
    payload: { type, args, playerID, credentials },
});

var ActionCreators = /*#__PURE__*/Object.freeze({
    makeMove: makeMove,
    gameEvent: gameEvent,
    automaticGameEvent: automaticGameEvent,
    sync: sync,
    update: update$1,
    reset: reset,
    undo: undo,
    redo: redo,
    plugin: plugin
});

/**
 * Moves can return this when they want to indicate
 * that the combination of arguments is illegal and
 * the move ought to be discarded.
 */
const INVALID_MOVE = 'INVALID_MOVE';

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Plugin that allows using Immer to make immutable changes
 * to G by just mutating it.
 */
const ImmerPlugin = {
    name: 'plugin-immer',
    fnWrap: (move) => (G, ctx, ...args) => {
        let isInvalid = false;
        const newG = produce(G, G => {
            const result = move(G, ctx, ...args);
            if (result === INVALID_MOVE) {
                isInvalid = true;
                return;
            }
            return result;
        });
        if (isInvalid)
            return INVALID_MOVE;
        return newG;
    },
};

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
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
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

// Inlined version of Alea from https://github.com/davidbau/seedrandom.

/*
 * Copyright 2015 David Bau.
 *
 * Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software
 * and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
function Alea(seed) {
  var me = this,
      mash = Mash();

  me.next = function () {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32

    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  }; // Apply the seeding algorithm from Baagoe.


  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);

  if (me.s0 < 0) {
    me.s0 += 1;
  }

  me.s1 -= mash(seed);

  if (me.s1 < 0) {
    me.s1 += 1;
  }

  me.s2 -= mash(seed);

  if (me.s2 < 0) {
    me.s2 += 1;
  }

  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function mash(data) {
    data = data.toString();

    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }

    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}

function alea(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.quick = prng;

  if (state) {
    if (_typeof(state) == 'object') copy(state, xg);

    prng.state = function () {
      return copy(xg, {});
    };
  }

  return prng;
}

/**
 * Random
 *
 * Calls that require a pseudorandom number generator.
 * Uses a seed from ctx, and also persists the PRNG
 * state in ctx so that moves can stay pure.
 */

var Random =
/*#__PURE__*/
function () {
  /**
   * constructor
   * @param {object} ctx - The ctx object to initialize from.
   */
  function Random(state) {
    _classCallCheck(this, Random);

    // If we are on the client, the seed is not present.
    // Just use a temporary seed to execute the move without
    // crashing it. The move state itself is discarded,
    // so the actual value doesn't matter.
    this.state = state;
    this.used = false;
  }

  _createClass(Random, [{
    key: "isUsed",
    value: function isUsed() {
      return this.used;
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.state;
    }
    /**
     * Generate a random number.
     */

  }, {
    key: "_random",
    value: function _random() {
      this.used = true;
      var R = this.state;
      var fn;

      if (R.prngstate === undefined) {
        // No call to a random function has been made.
        fn = new alea(R.seed, {
          state: true
        });
      } else {
        fn = new alea('', {
          state: R.prngstate
        });
      }

      var number = fn();
      this.state = _objectSpread2({}, R, {
        prngstate: fn.state()
      });
      return number;
    }
  }, {
    key: "api",
    value: function api() {
      var random = this._random.bind(this);

      var SpotValue = {
        D4: 4,
        D6: 6,
        D8: 8,
        D10: 10,
        D12: 12,
        D20: 20
      }; // Generate functions for predefined dice values D4 - D20.

      var predefined = {};

      var _loop = function _loop(key) {
        var spotvalue = SpotValue[key];

        predefined[key] = function (diceCount) {
          if (diceCount === undefined) {
            return Math.floor(random() * spotvalue) + 1;
          } else {
            return _toConsumableArray(new Array(diceCount).keys()).map(function () {
              return Math.floor(random() * spotvalue) + 1;
            });
          }
        };
      };

      for (var key in SpotValue) {
        _loop(key);
      }

      return _objectSpread2({}, predefined, {
        /**
         * Roll a die of specified spot value.
         *
         * @param {number} spotvalue - The die dimension (default: 6).
         * @param {number} diceCount - number of dice to throw.
         *                             if not defined, defaults to 1 and returns the value directly.
         *                             if defined, returns an array containing the random dice values.
         */
        Die: function Die(spotvalue, diceCount) {
          if (spotvalue === undefined) {
            spotvalue = 6;
          }

          if (diceCount === undefined) {
            return Math.floor(random() * spotvalue) + 1;
          } else {
            return _toConsumableArray(new Array(diceCount).keys()).map(function () {
              return Math.floor(random() * spotvalue) + 1;
            });
          }
        },

        /**
         * Generate a random number between 0 and 1.
         */
        Number: function Number() {
          return random();
        },

        /**
         * Shuffle an array.
         *
         * @param {Array} deck - The array to shuffle. Does not mutate
         *                       the input, but returns the shuffled array.
         */
        Shuffle: function Shuffle(deck) {
          var clone = deck.slice(0);
          var srcIndex = deck.length;
          var dstIndex = 0;
          var shuffled = new Array(srcIndex);

          while (srcIndex) {
            var randIndex = srcIndex * random() | 0;
            shuffled[dstIndex++] = clone[randIndex];
            clone[randIndex] = clone[--srcIndex];
          }

          return shuffled;
        },
        _obj: this
      });
    }
  }]);

  return Random;
}();
/**
 * Generates a new seed from the current date / time.
 */

Random.seed = function () {
  return (+new Date()).toString(36).slice(-10);
};

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
const RandomPlugin = {
    name: 'random',
    noClient: ({ api }) => {
        return api._obj.isUsed();
    },
    flush: ({ api }) => {
        return api._obj.getState();
    },
    api: ({ data }) => {
        const random = new Random(data);
        return random.api();
    },
    setup: ({ game }) => {
        let seed = game.seed;
        if (seed === undefined) {
            seed = Random.seed();
        }
        return { seed };
    },
};

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Events
 */
class Events {
    constructor(flow, playerID) {
        this.flow = flow;
        this.playerID = playerID;
        this.dispatch = [];
    }
    /**
     * Attaches the Events API to ctx.
     * @param {object} ctx - The ctx object to attach to.
     */
    api(ctx) {
        const events = {
            _obj: this,
        };
        const { phase, turn } = ctx;
        for (const key of this.flow.eventNames) {
            events[key] = (...args) => {
                this.dispatch.push({ key, args, phase, turn });
            };
        }
        return events;
    }
    isUsed() {
        return this.dispatch.length > 0;
    }
    /**
     * Updates ctx with the triggered events.
     * @param {object} state - The state object { G, ctx }.
     */
    update(state) {
        for (let i = 0; i < this.dispatch.length; i++) {
            const item = this.dispatch[i];
            // If the turn already ended some other way,
            // don't try to end the turn again.
            if (item.key === 'endTurn' && item.turn !== state.ctx.turn) {
                continue;
            }
            // If the phase already ended some other way,
            // don't try to end the phase again.
            if ((item.key === 'endPhase' || item.key === 'setPhase') &&
                item.phase !== state.ctx.phase) {
                continue;
            }
            const action = automaticGameEvent(item.key, item.args, this.playerID);
            state = {
                ...state,
                ...this.flow.processEvent(state, action),
            };
        }
        return state;
    }
}

/*
 * Copyright 2020 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
const EventsPlugin = {
    name: 'events',
    noClient: ({ api }) => {
        return api._obj.isUsed();
    },
    dangerouslyFlushRawState: ({ state, api }) => {
        return api._obj.update(state);
    },
    api: ({ game, playerID, ctx }) => {
        return new Events(game.flow, playerID).api(ctx);
    },
};

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * List of plugins that are always added.
 */
const DEFAULT_PLUGINS = [ImmerPlugin, RandomPlugin, EventsPlugin];
/**
 * Allow plugins to intercept actions and process them.
 */
const ProcessAction = (state, action, opts) => {
    opts.game.plugins
        .filter(plugin => plugin.action !== undefined)
        .filter(plugin => plugin.name === action.payload.type)
        .forEach(plugin => {
        const name = plugin.name;
        const pluginState = state.plugins[name] || { data: {} };
        const data = plugin.action(pluginState.data, action.payload);
        state = {
            ...state,
            plugins: {
                ...state.plugins,
                [name]: { ...pluginState, data },
            },
        };
    });
    return state;
};
/**
 * The API's created by various plugins are stored in the plugins
 * section of the state object:
 *
 * {
 *   G: {},
 *   ctx: {},
 *   plugins: {
 *     plugin-a: {
 *       data: {},  // this is generated by the plugin at Setup / Flush.
 *       api: {},   // this is ephemeral and generated by Enhance.
 *     }
 *   }
 * }
 *
 * This function takes these API's and stuffs them back into
 * ctx for consumption inside a move function or hook.
 */
const EnhanceCtx = (state) => {
    let ctx = { ...state.ctx };
    const plugins = state.plugins || {};
    Object.entries(plugins).forEach(([name, { api }]) => {
        ctx[name] = api;
    });
    return ctx;
};
/**
 * Applies the provided plugins to the given move / flow function.
 *
 * @param {function} fn - The move function or trigger to apply the plugins to.
 * @param {object} plugins - The list of plugins.
 */
const FnWrap = (fn, plugins) => {
    const reducer = (acc, { fnWrap }) => fnWrap(acc);
    return [...DEFAULT_PLUGINS, ...plugins]
        .filter(plugin => plugin.fnWrap !== undefined)
        .reduce(reducer, fn);
};
/**
 * Allows the plugin to generate its initial state.
 */
const Setup = (state, opts) => {
    [...DEFAULT_PLUGINS, ...opts.game.plugins]
        .filter(plugin => plugin.setup !== undefined)
        .forEach(plugin => {
        const name = plugin.name;
        const data = plugin.setup({
            G: state.G,
            ctx: state.ctx,
            game: opts.game,
        });
        state = {
            ...state,
            plugins: {
                ...state.plugins,
                [name]: { data },
            },
        };
    });
    return state;
};
/**
 * Invokes the plugin before a move or event.
 * The API that the plugin generates is stored inside
 * the `plugins` section of the state (which is subsequently
 * merged into ctx).
 */
const Enhance = (state, opts) => {
    [...DEFAULT_PLUGINS, ...opts.game.plugins]
        .filter(plugin => plugin.api !== undefined)
        .forEach(plugin => {
        const name = plugin.name;
        const pluginState = state.plugins[name] || { data: {} };
        const api = plugin.api({
            G: state.G,
            ctx: state.ctx,
            data: pluginState.data,
            game: opts.game,
            playerID: opts.playerID,
        });
        state = {
            ...state,
            plugins: {
                ...state.plugins,
                [name]: { ...pluginState, api },
            },
        };
    });
    return state;
};
/**
 * Allows plugins to update their state after a move / event.
 */
const Flush = (state, opts) => {
    // Note that we flush plugins in reverse order, to make sure that plugins
    // that come before in the chain are still available.
    [...DEFAULT_PLUGINS, ...opts.game.plugins].reverse().forEach(plugin => {
        const name = plugin.name;
        const pluginState = state.plugins[name] || { data: {} };
        if (plugin.flush) {
            const newData = plugin.flush({
                G: state.G,
                ctx: state.ctx,
                game: opts.game,
                api: pluginState.api,
                data: pluginState.data,
            });
            state = {
                ...state,
                plugins: {
                    ...state.plugins,
                    [plugin.name]: { data: newData },
                },
            };
        }
        else if (plugin.dangerouslyFlushRawState) {
            state = plugin.dangerouslyFlushRawState({
                state,
                game: opts.game,
                api: pluginState.api,
                data: pluginState.data,
            });
            // Remove everything other than data.
            const data = state.plugins[name].data;
            state = {
                ...state,
                plugins: {
                    ...state.plugins,
                    [plugin.name]: { data },
                },
            };
        }
    });
    return state;
};
/**
 * Allows plugins to indicate if they should not be materialized on the client.
 * This will cause the client to discard the state update and wait for the
 * master instead.
 */
const NoClient = (state, opts) => {
    return [...DEFAULT_PLUGINS, ...opts.game.plugins]
        .filter(plugin => plugin.noClient !== undefined)
        .map(plugin => {
        const name = plugin.name;
        const pluginState = state.plugins[name];
        if (pluginState) {
            return plugin.noClient({
                G: state.G,
                ctx: state.ctx,
                game: opts.game,
                api: pluginState.api,
                data: pluginState.data,
            });
        }
        return false;
    })
        .some(value => value === true);
};

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
const production = process.env.NODE_ENV === 'production';
const logfn = production ? () => { } : console.log;
const errorfn = console.error;
function info(msg) {
    logfn(`INFO: ${msg}`);
}
function error(error) {
    errorfn('ERROR:', error);
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Event to change the active players (and their stages) in the current turn.
 */
function SetActivePlayersEvent(state, _playerID, arg) {
    return { ...state, ctx: SetActivePlayers(state.ctx, arg) };
}
function SetActivePlayers(ctx, arg) {
    let { _prevActivePlayers } = ctx;
    let activePlayers = {};
    let _nextActivePlayers = null;
    let _activePlayersMoveLimit = {};
    if (Array.isArray(arg)) {
        // support a simple array of player IDs as active players
        let value = {};
        arg.forEach(v => (value[v] = Stage.NULL));
        activePlayers = value;
    }
    else {
        // process active players argument object
        if (arg.next) {
            _nextActivePlayers = arg.next;
        }
        if (arg.revert) {
            _prevActivePlayers = _prevActivePlayers.concat({
                activePlayers: ctx.activePlayers,
                _activePlayersMoveLimit: ctx._activePlayersMoveLimit,
                _activePlayersNumMoves: ctx._activePlayersNumMoves,
            });
        }
        else {
            _prevActivePlayers = [];
        }
        if (arg.currentPlayer !== undefined) {
            ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, ctx.currentPlayer, arg.currentPlayer);
        }
        if (arg.others !== undefined) {
            for (let i = 0; i < ctx.playOrder.length; i++) {
                const id = ctx.playOrder[i];
                if (id !== ctx.currentPlayer) {
                    ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, id, arg.others);
                }
            }
        }
        if (arg.all !== undefined) {
            for (let i = 0; i < ctx.playOrder.length; i++) {
                const id = ctx.playOrder[i];
                ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, id, arg.all);
            }
        }
        if (arg.value) {
            for (const id in arg.value) {
                ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, id, arg.value[id]);
            }
        }
        if (arg.moveLimit) {
            for (const id in activePlayers) {
                if (_activePlayersMoveLimit[id] === undefined) {
                    _activePlayersMoveLimit[id] = arg.moveLimit;
                }
            }
        }
    }
    if (Object.keys(activePlayers).length == 0) {
        activePlayers = null;
    }
    if (Object.keys(_activePlayersMoveLimit).length == 0) {
        _activePlayersMoveLimit = null;
    }
    let _activePlayersNumMoves = {};
    for (const id in activePlayers) {
        _activePlayersNumMoves[id] = 0;
    }
    return {
        ...ctx,
        activePlayers,
        _activePlayersMoveLimit,
        _activePlayersNumMoves,
        _prevActivePlayers,
        _nextActivePlayers,
    };
}
/**
 * Update activePlayers, setting it to previous, next or null values
 * when it becomes empty.
 * @param ctx
 */
function UpdateActivePlayersOnceEmpty(ctx) {
    let { activePlayers, _activePlayersMoveLimit, _activePlayersNumMoves, _prevActivePlayers, } = ctx;
    if (activePlayers && Object.keys(activePlayers).length == 0) {
        if (ctx._nextActivePlayers) {
            ctx = SetActivePlayers(ctx, ctx._nextActivePlayers);
            ({
                activePlayers,
                _activePlayersMoveLimit,
                _activePlayersNumMoves,
                _prevActivePlayers,
            } = ctx);
        }
        else if (_prevActivePlayers.length > 0) {
            const lastIndex = _prevActivePlayers.length - 1;
            ({
                activePlayers,
                _activePlayersMoveLimit,
                _activePlayersNumMoves,
            } = _prevActivePlayers[lastIndex]);
            _prevActivePlayers = _prevActivePlayers.slice(0, lastIndex);
        }
        else {
            activePlayers = null;
            _activePlayersMoveLimit = null;
        }
    }
    return {
        ...ctx,
        activePlayers,
        _activePlayersMoveLimit,
        _activePlayersNumMoves,
        _prevActivePlayers,
    };
}
/**
 * Apply an active player argument to the given player ID
 * @param {Object} activePlayers
 * @param {Object} _activePlayersMoveLimit
 * @param {String} playerID The player to apply the parameter to
 * @param {(String|Object)} arg An active player argument
 */
function ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, playerID, arg) {
    if (typeof arg !== 'object' || arg === Stage.NULL) {
        arg = { stage: arg };
    }
    if (arg.stage !== undefined) {
        activePlayers[playerID] = arg.stage;
        if (arg.moveLimit)
            _activePlayersMoveLimit[playerID] = arg.moveLimit;
    }
}
/**
 * Converts a playOrderPos index into its value in playOrder.
 * @param {Array} playOrder - An array of player ID's.
 * @param {number} playOrderPos - An index into the above.
 */
function getCurrentPlayer(playOrder, playOrderPos) {
    // convert to string in case playOrder is set to number[]
    return playOrder[playOrderPos] + '';
}
/**
 * Called at the start of a turn to initialize turn order state.
 *
 * TODO: This is called inside StartTurn, which is called from
 * both UpdateTurn and StartPhase (so it's called at the beginning
 * of a new phase as well as between turns). We should probably
 * split it into two.
 */
function InitTurnOrderState(state, turn) {
    let { G, ctx } = state;
    const ctxWithAPI = EnhanceCtx(state);
    const order = turn.order;
    let playOrder = [...new Array(ctx.numPlayers)].map((_, i) => i + '');
    if (order.playOrder !== undefined) {
        playOrder = order.playOrder(G, ctxWithAPI);
    }
    const playOrderPos = order.first(G, ctxWithAPI);
    const posType = typeof playOrderPos;
    if (posType !== 'number') {
        error(`invalid value returned by turn.order.first — expected number got ${posType} “${playOrderPos}”.`);
    }
    const currentPlayer = getCurrentPlayer(playOrder, playOrderPos);
    ctx = { ...ctx, currentPlayer, playOrderPos, playOrder };
    ctx = SetActivePlayers(ctx, turn.activePlayers || {});
    return ctx;
}
/**
 * Called at the end of each turn to update the turn order state.
 * @param {object} G - The game object G.
 * @param {object} ctx - The game object ctx.
 * @param {object} turn - A turn object for this phase.
 * @param {string} endTurnArg - An optional argument to endTurn that
                                may specify the next player.
 */
function UpdateTurnOrderState(state, currentPlayer, turn, endTurnArg) {
    const order = turn.order;
    let { G, ctx } = state;
    let playOrderPos = ctx.playOrderPos;
    let endPhase = false;
    if (endTurnArg && endTurnArg !== true) {
        if (typeof endTurnArg !== 'object') {
            error(`invalid argument to endTurn: ${endTurnArg}`);
        }
        Object.keys(endTurnArg).forEach(arg => {
            switch (arg) {
                case 'remove':
                    currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
                    break;
                case 'next':
                    playOrderPos = ctx.playOrder.indexOf(endTurnArg.next);
                    currentPlayer = endTurnArg.next;
                    break;
                default:
                    error(`invalid argument to endTurn: ${arg}`);
            }
        });
    }
    else {
        const ctxWithAPI = EnhanceCtx(state);
        const t = order.next(G, ctxWithAPI);
        const type = typeof t;
        if (t !== undefined && type !== 'number') {
            error(`invalid value returned by turn.order.next — expected number or undefined got ${type} “${t}”.`);
        }
        if (t === undefined) {
            endPhase = true;
        }
        else {
            playOrderPos = t;
            currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
        }
    }
    ctx = {
        ...ctx,
        playOrderPos,
        currentPlayer,
    };
    return { endPhase, ctx };
}
/**
 * Set of different turn orders possible in a phase.
 * These are meant to be passed to the `turn` setting
 * in the flow objects.
 *
 * Each object defines the first player when the phase / game
 * begins, and also a function `next` to determine who the
 * next player is when the turn ends.
 *
 * The phase ends if next() returns undefined.
 */
const TurnOrder = {
    /**
     * DEFAULT
     *
     * The default round-robin turn order.
     */
    DEFAULT: {
        first: (G, ctx) => ctx.turn === 0
            ? ctx.playOrderPos
            : (ctx.playOrderPos + 1) % ctx.playOrder.length,
        next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
    },
    /**
     * RESET
     *
     * Similar to DEFAULT, but starts from 0 each time.
     */
    RESET: {
        first: () => 0,
        next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
    },
    /**
     * CONTINUE
     *
     * Similar to DEFAULT, but starts with the player who ended the last phase.
     */
    CONTINUE: {
        first: (G, ctx) => ctx.playOrderPos,
        next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
    },
    /**
     * ONCE
     *
     * Another round-robin turn order, but goes around just once.
     * The phase ends after all players have played.
     */
    ONCE: {
        first: () => 0,
        next: (G, ctx) => {
            if (ctx.playOrderPos < ctx.playOrder.length - 1) {
                return ctx.playOrderPos + 1;
            }
        },
    },
    /**
     * CUSTOM
     *
     * Identical to DEFAULT, but also sets playOrder at the
     * beginning of the phase.
     *
     * @param {Array} playOrder - The play order.
     */
    CUSTOM: (playOrder) => ({
        playOrder: () => playOrder,
        first: () => 0,
        next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
    }),
    /**
     * CUSTOM_FROM
     *
     * Identical to DEFAULT, but also sets playOrder at the
     * beginning of the phase to a value specified by a field
     * in G.
     *
     * @param {string} playOrderField - Field in G.
     */
    CUSTOM_FROM: (playOrderField) => ({
        playOrder: (G) => G[playOrderField],
        first: () => 0,
        next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
    }),
};
const Stage = {
    NULL: null,
};

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Flow
 *
 * Creates a reducer that updates ctx (analogous to how moves update G).
 */
function Flow({ moves, phases, endIf, onEnd, turn, events, plugins, disableUndo, }) {
    // Attach defaults.
    if (moves === undefined) {
        moves = {};
    }
    if (events === undefined) {
        events = {};
    }
    if (plugins === undefined) {
        plugins = [];
    }
    if (phases === undefined) {
        phases = {};
    }
    if (!endIf)
        endIf = () => undefined;
    if (!onEnd)
        onEnd = G => G;
    if (!turn)
        turn = {};
    const phaseMap = { ...phases };
    if ('' in phaseMap) {
        error('cannot specify phase with empty name');
    }
    phaseMap[''] = {};
    let moveMap = {};
    let moveNames = new Set();
    let startingPhase = null;
    Object.keys(moves).forEach(name => moveNames.add(name));
    const HookWrapper = (fn) => {
        const withPlugins = FnWrap(fn, plugins);
        return (state) => {
            const ctxWithAPI = EnhanceCtx(state);
            return withPlugins(state.G, ctxWithAPI);
        };
    };
    const TriggerWrapper = (endIf) => {
        return (state) => {
            let ctxWithAPI = EnhanceCtx(state);
            return endIf(state.G, ctxWithAPI);
        };
    };
    const wrapped = {
        onEnd: HookWrapper(onEnd),
        endIf: TriggerWrapper(endIf),
    };
    for (let phase in phaseMap) {
        const conf = phaseMap[phase];
        if (conf.start === true) {
            startingPhase = phase;
        }
        if (conf.moves !== undefined) {
            for (let move of Object.keys(conf.moves)) {
                moveMap[phase + '.' + move] = conf.moves[move];
                moveNames.add(move);
            }
        }
        if (conf.endIf === undefined) {
            conf.endIf = () => undefined;
        }
        if (conf.onBegin === undefined) {
            conf.onBegin = G => G;
        }
        if (conf.onEnd === undefined) {
            conf.onEnd = G => G;
        }
        if (conf.turn === undefined) {
            conf.turn = turn;
        }
        if (conf.turn.order === undefined) {
            conf.turn.order = TurnOrder.DEFAULT;
        }
        if (conf.turn.onBegin === undefined) {
            conf.turn.onBegin = G => G;
        }
        if (conf.turn.onEnd === undefined) {
            conf.turn.onEnd = G => G;
        }
        if (conf.turn.endIf === undefined) {
            conf.turn.endIf = () => false;
        }
        if (conf.turn.onMove === undefined) {
            conf.turn.onMove = G => G;
        }
        if (conf.turn.stages === undefined) {
            conf.turn.stages = {};
        }
        for (const stage in conf.turn.stages) {
            const stageConfig = conf.turn.stages[stage];
            const moves = stageConfig.moves || {};
            for (let move of Object.keys(moves)) {
                let key = phase + '.' + stage + '.' + move;
                moveMap[key] = moves[move];
                moveNames.add(move);
            }
        }
        conf.wrapped = {
            onBegin: HookWrapper(conf.onBegin),
            onEnd: HookWrapper(conf.onEnd),
            endIf: TriggerWrapper(conf.endIf),
        };
        conf.turn.wrapped = {
            onMove: HookWrapper(conf.turn.onMove),
            onBegin: HookWrapper(conf.turn.onBegin),
            onEnd: HookWrapper(conf.turn.onEnd),
            endIf: TriggerWrapper(conf.turn.endIf),
        };
    }
    function GetPhase(ctx) {
        return ctx.phase ? phaseMap[ctx.phase] : phaseMap[''];
    }
    function OnMove(s) {
        return s;
    }
    function Process(state, events) {
        const phasesEnded = new Set();
        const turnsEnded = new Set();
        for (let i = 0; i < events.length; i++) {
            const { fn, arg, ...rest } = events[i];
            // Detect a loop of EndPhase calls.
            // This could potentially even be an infinite loop
            // if the endIf condition of each phase blindly
            // returns true. The moment we detect a single
            // loop, we just bail out of all phases.
            if (fn === EndPhase) {
                turnsEnded.clear();
                const phase = state.ctx.phase;
                if (phasesEnded.has(phase)) {
                    const ctx = { ...state.ctx, phase: null };
                    return { ...state, ctx };
                }
                phasesEnded.add(phase);
            }
            // Process event.
            let next = [];
            state = fn(state, {
                ...rest,
                arg,
                next,
            });
            if (fn === EndGame) {
                break;
            }
            // Check if we should end the game.
            const shouldEndGame = ShouldEndGame(state);
            if (shouldEndGame) {
                events.push({
                    fn: EndGame,
                    arg: shouldEndGame,
                    turn: state.ctx.turn,
                    phase: state.ctx.phase,
                    automatic: true,
                });
                continue;
            }
            // Check if we should end the phase.
            const shouldEndPhase = ShouldEndPhase(state);
            if (shouldEndPhase) {
                events.push({
                    fn: EndPhase,
                    arg: shouldEndPhase,
                    turn: state.ctx.turn,
                    phase: state.ctx.phase,
                    automatic: true,
                });
                continue;
            }
            // Check if we should end the turn.
            if (fn === OnMove) {
                const shouldEndTurn = ShouldEndTurn(state);
                if (shouldEndTurn) {
                    events.push({
                        fn: EndTurn,
                        arg: shouldEndTurn,
                        turn: state.ctx.turn,
                        phase: state.ctx.phase,
                        automatic: true,
                    });
                    continue;
                }
            }
            events.push(...next);
        }
        return state;
    }
    ///////////
    // Start //
    ///////////
    function StartGame(state, { next }) {
        next.push({ fn: StartPhase });
        return state;
    }
    function StartPhase(state, { next }) {
        let { G, ctx } = state;
        const conf = GetPhase(ctx);
        // Run any phase setup code provided by the user.
        G = conf.wrapped.onBegin(state);
        next.push({ fn: StartTurn });
        return { ...state, G, ctx };
    }
    function StartTurn(state, { currentPlayer }) {
        let { G, ctx } = state;
        const conf = GetPhase(ctx);
        // Initialize the turn order state.
        if (currentPlayer) {
            ctx = { ...ctx, currentPlayer };
            if (conf.turn.activePlayers) {
                ctx = SetActivePlayers(ctx, conf.turn.activePlayers);
            }
        }
        else {
            // This is only called at the beginning of the phase
            // when there is no currentPlayer yet.
            ctx = InitTurnOrderState(state, conf.turn);
        }
        const turn = ctx.turn + 1;
        ctx = { ...ctx, turn, numMoves: 0, _prevActivePlayers: [] };
        G = conf.turn.wrapped.onBegin({ ...state, G, ctx });
        const _undo = disableUndo ? [] : [{ G, ctx }];
        return { ...state, G, ctx, _undo, _redo: [] };
    }
    ////////////
    // Update //
    ////////////
    function UpdatePhase(state, { arg, next, phase }) {
        const conf = GetPhase({ phase });
        let { ctx } = state;
        if (arg && arg.next) {
            if (arg.next in phaseMap) {
                ctx = { ...ctx, phase: arg.next };
            }
            else {
                error('invalid phase: ' + arg.next);
                return state;
            }
        }
        else if (conf.next !== undefined) {
            ctx = { ...ctx, phase: conf.next };
        }
        else {
            ctx = { ...ctx, phase: null };
        }
        state = { ...state, ctx };
        // Start the new phase.
        next.push({ fn: StartPhase });
        return state;
    }
    function UpdateTurn(state, { arg, currentPlayer, next }) {
        let { G, ctx } = state;
        const conf = GetPhase(ctx);
        // Update turn order state.
        const { endPhase, ctx: newCtx } = UpdateTurnOrderState(state, currentPlayer, conf.turn, arg);
        ctx = newCtx;
        state = { ...state, G, ctx };
        if (endPhase) {
            next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
        }
        else {
            next.push({ fn: StartTurn, currentPlayer: ctx.currentPlayer });
        }
        return state;
    }
    function UpdateStage(state, { arg, playerID }) {
        if (typeof arg === 'string') {
            arg = { stage: arg };
        }
        let { ctx } = state;
        let { activePlayers, _activePlayersMoveLimit, _activePlayersNumMoves, } = ctx;
        if (arg.stage) {
            if (activePlayers === null) {
                activePlayers = {};
            }
            activePlayers[playerID] = arg.stage;
            _activePlayersNumMoves[playerID] = 0;
            if (arg.moveLimit) {
                if (_activePlayersMoveLimit === null) {
                    _activePlayersMoveLimit = {};
                }
                _activePlayersMoveLimit[playerID] = arg.moveLimit;
            }
        }
        ctx = {
            ...ctx,
            activePlayers,
            _activePlayersMoveLimit,
            _activePlayersNumMoves,
        };
        return { ...state, ctx };
    }
    ///////////////
    // ShouldEnd //
    ///////////////
    function ShouldEndGame(state) {
        return wrapped.endIf(state);
    }
    function ShouldEndPhase(state) {
        const conf = GetPhase(state.ctx);
        return conf.wrapped.endIf(state);
    }
    function ShouldEndTurn(state) {
        const conf = GetPhase(state.ctx);
        // End the turn if the required number of moves has been made.
        const currentPlayerMoves = state.ctx.numMoves || 0;
        if (conf.turn.moveLimit && currentPlayerMoves >= conf.turn.moveLimit) {
            return true;
        }
        return conf.turn.wrapped.endIf(state);
    }
    /////////
    // End //
    /////////
    function EndGame(state, { arg, phase }) {
        state = EndPhase(state, { phase });
        if (arg === undefined) {
            arg = true;
        }
        state = { ...state, ctx: { ...state.ctx, gameover: arg } };
        // Run game end hook.
        const G = wrapped.onEnd(state);
        return { ...state, G };
    }
    function EndPhase(state, { arg, next, turn, automatic }) {
        // End the turn first.
        state = EndTurn(state, { turn, force: true });
        let G = state.G;
        let ctx = state.ctx;
        if (next) {
            next.push({ fn: UpdatePhase, arg, phase: ctx.phase });
        }
        // If we aren't in a phase, there is nothing else to do.
        if (ctx.phase === null) {
            return state;
        }
        // Run any cleanup code for the phase that is about to end.
        const conf = GetPhase(ctx);
        G = conf.wrapped.onEnd(state);
        // Reset the phase.
        ctx = { ...ctx, phase: null };
        // Add log entry.
        const action = gameEvent('endPhase', arg);
        const logEntry = {
            action,
            _stateID: state._stateID,
            turn: state.ctx.turn,
            phase: state.ctx.phase,
        };
        if (automatic) {
            logEntry.automatic = true;
        }
        const deltalog = [...state.deltalog, logEntry];
        return { ...state, G, ctx, deltalog };
    }
    function EndTurn(state, { arg, next, turn, force, automatic, playerID }) {
        // This is not the turn that EndTurn was originally
        // called for. The turn was probably ended some other way.
        if (turn !== state.ctx.turn) {
            return state;
        }
        let { G, ctx } = state;
        const conf = GetPhase(ctx);
        // Prevent ending the turn if moveLimit hasn't been reached.
        const currentPlayerMoves = ctx.numMoves || 0;
        if (!force &&
            conf.turn.moveLimit &&
            currentPlayerMoves < conf.turn.moveLimit) {
            info(`cannot end turn before making ${conf.turn.moveLimit} moves`);
            return state;
        }
        // Run turn-end triggers.
        G = conf.turn.wrapped.onEnd(state);
        if (next) {
            next.push({ fn: UpdateTurn, arg, currentPlayer: ctx.currentPlayer });
        }
        // Reset activePlayers.
        ctx = { ...ctx, activePlayers: null };
        // Remove player from playerOrder
        if (arg && arg.remove) {
            playerID = playerID || ctx.currentPlayer;
            const playOrder = ctx.playOrder.filter(i => i != playerID);
            const playOrderPos = ctx.playOrderPos > playOrder.length - 1 ? 0 : ctx.playOrderPos;
            ctx = { ...ctx, playOrder, playOrderPos };
            if (playOrder.length === 0) {
                next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
                return state;
            }
        }
        // Add log entry.
        const action = gameEvent('endTurn', arg);
        const logEntry = {
            action,
            _stateID: state._stateID,
            turn: state.ctx.turn,
            phase: state.ctx.phase,
        };
        if (automatic) {
            logEntry.automatic = true;
        }
        const deltalog = [...(state.deltalog || []), logEntry];
        return { ...state, G, ctx, deltalog, _undo: [], _redo: [] };
    }
    function EndStage(state, { arg, next, automatic, playerID }) {
        playerID = playerID || state.ctx.currentPlayer;
        let { ctx } = state;
        let { activePlayers, _activePlayersMoveLimit } = ctx;
        const playerInStage = activePlayers !== null && playerID in activePlayers;
        if (!arg && playerInStage) {
            const conf = GetPhase(ctx);
            const stage = conf.turn.stages[activePlayers[playerID]];
            if (stage && stage.next)
                arg = stage.next;
        }
        if (next && arg) {
            next.push({ fn: UpdateStage, arg, playerID });
        }
        // If player isn’t in a stage, there is nothing else to do.
        if (!playerInStage)
            return state;
        // Remove player from activePlayers.
        activePlayers = Object.keys(activePlayers)
            .filter(id => id !== playerID)
            .reduce((obj, key) => {
            obj[key] = activePlayers[key];
            return obj;
        }, {});
        if (_activePlayersMoveLimit) {
            // Remove player from _activePlayersMoveLimit.
            _activePlayersMoveLimit = Object.keys(_activePlayersMoveLimit)
                .filter(id => id !== playerID)
                .reduce((obj, key) => {
                obj[key] = _activePlayersMoveLimit[key];
                return obj;
            }, {});
        }
        ctx = UpdateActivePlayersOnceEmpty({
            ...ctx,
            activePlayers,
            _activePlayersMoveLimit,
        });
        // Add log entry.
        const action = gameEvent('endStage', arg);
        const logEntry = {
            action,
            _stateID: state._stateID,
            turn: state.ctx.turn,
            phase: state.ctx.phase,
        };
        if (automatic) {
            logEntry.automatic = true;
        }
        const deltalog = [...(state.deltalog || []), logEntry];
        return { ...state, ctx, deltalog };
    }
    /**
     * Retrieves the relevant move that can be played by playerID.
     *
     * If ctx.activePlayers is set (i.e. one or more players are in some stage),
     * then it attempts to find the move inside the stages config for
     * that turn. If the stage for a player is '', then the player is
     * allowed to make a move (as determined by the phase config), but
     * isn't restricted to a particular set as defined in the stage config.
     *
     * If not, it then looks for the move inside the phase.
     *
     * If it doesn't find the move there, it looks at the global move definition.
     *
     * @param {object} ctx
     * @param {string} name
     * @param {string} playerID
     */
    function GetMove(ctx, name, playerID) {
        const conf = GetPhase(ctx);
        const stages = conf.turn.stages;
        const { activePlayers } = ctx;
        if (activePlayers &&
            activePlayers[playerID] !== undefined &&
            activePlayers[playerID] !== Stage.NULL &&
            stages[activePlayers[playerID]] !== undefined &&
            stages[activePlayers[playerID]].moves !== undefined) {
            // Check if moves are defined for the player's stage.
            const stage = stages[activePlayers[playerID]];
            const moves = stage.moves;
            if (name in moves) {
                return moves[name];
            }
        }
        else if (conf.moves) {
            // Check if moves are defined for the current phase.
            if (name in conf.moves) {
                return conf.moves[name];
            }
        }
        else if (name in moves) {
            // Check for the move globally.
            return moves[name];
        }
        return null;
    }
    function ProcessMove(state, action) {
        let conf = GetPhase(state.ctx);
        const move = GetMove(state.ctx, action.type, action.playerID);
        const shouldCount = !move || typeof move === 'function' || move.noLimit !== true;
        let { ctx } = state;
        let { _activePlayersNumMoves } = ctx;
        const { playerID } = action;
        let numMoves = state.ctx.numMoves;
        if (shouldCount) {
            if (playerID == state.ctx.currentPlayer) {
                numMoves++;
            }
            if (ctx.activePlayers)
                _activePlayersNumMoves[playerID]++;
        }
        state = {
            ...state,
            ctx: {
                ...ctx,
                numMoves,
                _activePlayersNumMoves,
            },
        };
        if (ctx._activePlayersMoveLimit &&
            _activePlayersNumMoves[playerID] >= ctx._activePlayersMoveLimit[playerID]) {
            state = EndStage(state, { playerID, automatic: true });
        }
        const G = conf.turn.wrapped.onMove(state);
        state = { ...state, G };
        let events = [{ fn: OnMove }];
        return Process(state, events);
    }
    function SetStageEvent(state, playerID, arg) {
        return Process(state, [{ fn: EndStage, arg, playerID }]);
    }
    function EndStageEvent(state, playerID) {
        return Process(state, [{ fn: EndStage, playerID }]);
    }
    function SetPhaseEvent(state, _playerID, newPhase) {
        return Process(state, [
            {
                fn: EndPhase,
                phase: state.ctx.phase,
                turn: state.ctx.turn,
                arg: { next: newPhase },
            },
        ]);
    }
    function EndPhaseEvent(state) {
        return Process(state, [
            { fn: EndPhase, phase: state.ctx.phase, turn: state.ctx.turn },
        ]);
    }
    function EndTurnEvent(state, _playerID, arg) {
        return Process(state, [
            { fn: EndTurn, turn: state.ctx.turn, phase: state.ctx.phase, arg },
        ]);
    }
    function PassEvent(state, _playerID, arg) {
        return Process(state, [
            {
                fn: EndTurn,
                turn: state.ctx.turn,
                phase: state.ctx.phase,
                force: true,
                arg,
            },
        ]);
    }
    function EndGameEvent(state, _playerID, arg) {
        return Process(state, [
            { fn: EndGame, turn: state.ctx.turn, phase: state.ctx.phase, arg },
        ]);
    }
    const eventHandlers = {
        endStage: EndStageEvent,
        setStage: SetStageEvent,
        endTurn: EndTurnEvent,
        pass: PassEvent,
        endPhase: EndPhaseEvent,
        setPhase: SetPhaseEvent,
        endGame: EndGameEvent,
        setActivePlayers: SetActivePlayersEvent,
    };
    let enabledEventNames = [];
    if (events.endTurn !== false) {
        enabledEventNames.push('endTurn');
    }
    if (events.pass !== false) {
        enabledEventNames.push('pass');
    }
    if (events.endPhase !== false) {
        enabledEventNames.push('endPhase');
    }
    if (events.setPhase !== false) {
        enabledEventNames.push('setPhase');
    }
    if (events.endGame !== false) {
        enabledEventNames.push('endGame');
    }
    if (events.setActivePlayers !== false) {
        enabledEventNames.push('setActivePlayers');
    }
    if (events.endStage !== false) {
        enabledEventNames.push('endStage');
    }
    if (events.setStage !== false) {
        enabledEventNames.push('setStage');
    }
    function ProcessEvent(state, action) {
        const { type, playerID, args } = action.payload;
        if (eventHandlers.hasOwnProperty(type)) {
            const eventArgs = [state, playerID].concat(args);
            return eventHandlers[type].apply({}, eventArgs);
        }
        return state;
    }
    function IsPlayerActive(_G, ctx, playerID) {
        if (ctx.activePlayers) {
            return playerID in ctx.activePlayers;
        }
        return ctx.currentPlayer === playerID;
    }
    return {
        ctx: (numPlayers) => ({
            numPlayers,
            turn: 0,
            currentPlayer: '0',
            playOrder: [...new Array(numPlayers)].map((_d, i) => i + ''),
            playOrderPos: 0,
            phase: startingPhase,
            activePlayers: null,
        }),
        init: (state) => {
            return Process(state, [{ fn: StartGame }]);
        },
        isPlayerActive: IsPlayerActive,
        eventHandlers,
        eventNames: Object.keys(eventHandlers),
        enabledEventNames,
        moveMap,
        moveNames: [...moveNames.values()],
        processMove: ProcessMove,
        processEvent: ProcessEvent,
        getMove: GetMove,
    };
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
function IsProcessed(game) {
    return game.processMove !== undefined;
}
/**
 * Helper to generate the game move reducer. The returned
 * reducer has the following signature:
 *
 * (G, action, ctx) => {}
 *
 * You can roll your own if you like, or use any Redux
 * addon to generate such a reducer.
 *
 * The convention used in this framework is to
 * have action.type contain the name of the move, and
 * action.args contain any additional arguments as an
 * Array.
 */
function ProcessGameConfig(game) {
    // The Game() function has already been called on this
    // config object, so just pass it through.
    if (IsProcessed(game)) {
        return game;
    }
    if (game.name === undefined)
        game.name = 'default';
    if (game.disableUndo === undefined)
        game.disableUndo = false;
    if (game.setup === undefined)
        game.setup = () => ({});
    if (game.moves === undefined)
        game.moves = {};
    if (game.playerView === undefined)
        game.playerView = G => G;
    if (game.plugins === undefined)
        game.plugins = [];
    game.plugins.forEach(plugin => {
        if (plugin.name === undefined) {
            throw new Error('Plugin missing name attribute');
        }
        if (plugin.name.includes(' ')) {
            throw new Error(plugin.name + ': Plugin name must not include spaces');
        }
    });
    if (game.name.includes(' ')) {
        throw new Error(game.name + ': Game name must not include spaces');
    }
    const flow = Flow(game);
    return {
        ...game,
        flow,
        moveNames: flow.moveNames,
        pluginNames: game.plugins.map(p => p.name),
        processMove: (state, action) => {
            let moveFn = flow.getMove(state.ctx, action.type, action.playerID);
            if (IsLongFormMove(moveFn)) {
                moveFn = moveFn.move;
            }
            if (moveFn instanceof Function) {
                const fn = FnWrap(moveFn, game.plugins);
                const ctxWithAPI = {
                    ...EnhanceCtx(state),
                    playerID: action.playerID,
                };
                let args = [];
                if (action.args !== undefined) {
                    args = args.concat(action.args);
                }
                return fn(state.G, ctxWithAPI, ...args);
            }
            error(`invalid move object: ${action.type}`);
            return state.G;
        },
    };
}
function IsLongFormMove(move) {
    return move instanceof Object && move.move !== undefined;
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
}

function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    const od = target_opacity * (1 - opacity);
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
    };
}

/* src/client/debug/Menu.svelte generated by Svelte v3.12.1 */

function add_css() {
	var style = element("style");
	style.id = 'svelte-19bfq8g-style';
	style.textContent = ".menu.svelte-19bfq8g{display:flex;margin-top:-10px;flex-direction:row;border:1px solid #ccc;border-radius:5px 5px 0 0;height:25px;line-height:25px;margin-right:-500px;transform-origin:bottom right;transform:rotate(-90deg) translate(0, -500px)}.menu-item.svelte-19bfq8g{line-height:25px;cursor:pointer;background:#fefefe;color:#555;padding-left:15px;padding-right:15px;text-align:center}.menu-item.svelte-19bfq8g:last-child{border-radius:0 5px 0 0}.menu-item.svelte-19bfq8g:first-child{border-radius:5px 0 0 0}.menu-item.active.svelte-19bfq8g{cursor:default;font-weight:bold;background:#ddd;color:#555}.menu-item.svelte-19bfq8g:hover{background:#ddd;color:#555}";
	append(document.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.key = list[i][0];
	child_ctx.label = list[i][1].label;
	return child_ctx;
}

// (55:2) {#each Object.entries(panes).reverse() as [key, {label}
function create_each_block(ctx) {
	var div, t0_value = ctx.label + "", t0, t1, dispose;

	function click_handler() {
		return ctx.click_handler(ctx);
	}

	return {
		c() {
			div = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr(div, "class", "menu-item svelte-19bfq8g");
			toggle_class(div, "active", ctx.pane == ctx.key);
			dispose = listen(div, "click", click_handler);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.panes) && t0_value !== (t0_value = ctx.label + "")) {
				set_data(t0, t0_value);
			}

			if ((changed.pane || changed.panes)) {
				toggle_class(div, "active", ctx.pane == ctx.key);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			dispose();
		}
	};
}

function create_fragment(ctx) {
	var div;

	let each_value = Object.entries(ctx.panes).reverse();

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			attr(div, "class", "menu svelte-19bfq8g");
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},

		p(changed, ctx) {
			if (changed.pane || changed.panes) {
				each_value = Object.entries(ctx.panes).reverse();

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { pane, panes } = $$props;
  const dispatch = createEventDispatcher();

	const click_handler = ({ key }) => dispatch('change', key);

	$$self.$set = $$props => {
		if ('pane' in $$props) $$invalidate('pane', pane = $$props.pane);
		if ('panes' in $$props) $$invalidate('panes', panes = $$props.panes);
	};

	return { pane, panes, dispatch, click_handler };
}

class Menu extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-19bfq8g-style")) add_css();
		init(this, options, instance, create_fragment, safe_not_equal, ["pane", "panes"]);
	}
}

/* src/client/debug/main/Hotkey.svelte generated by Svelte v3.12.1 */

function add_css$1() {
	var style = element("style");
	style.id = 'svelte-1olzq4i-style';
	style.textContent = ".key.svelte-1olzq4i{display:flex;flex-direction:row;align-items:center}.key-box.svelte-1olzq4i{cursor:pointer;min-width:10px;padding-left:5px;padding-right:5px;height:20px;line-height:20px;text-align:center;border:1px solid #ccc;box-shadow:1px 1px 1px #888;background:#eee;color:#444}.key-box.svelte-1olzq4i:hover{background:#ddd}.key.active.svelte-1olzq4i .key-box.svelte-1olzq4i{background:#ddd;border:1px solid #999;box-shadow:none}.label.svelte-1olzq4i{margin-left:10px}";
	append(document.head, style);
}

// (77:2) {#if label}
function create_if_block(ctx) {
	var div, t;

	return {
		c() {
			div = element("div");
			t = text(ctx.label);
			attr(div, "class", "label svelte-1olzq4i");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p(changed, ctx) {
			if (changed.label) {
				set_data(t, ctx.label);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function create_fragment$1(ctx) {
	var div1, div0, t0, t1, dispose;

	var if_block = (ctx.label) && create_if_block(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(ctx.value);
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "key-box svelte-1olzq4i");
			attr(div1, "class", "key svelte-1olzq4i");
			toggle_class(div1, "active", ctx.active);

			dispose = [
				listen(window, "keydown", ctx.Keypress),
				listen(div0, "click", ctx.Activate)
			];
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
		},

		p(changed, ctx) {
			if (changed.value) {
				set_data(t0, ctx.value);
			}

			if (ctx.label) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(div1, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (changed.active) {
				toggle_class(div1, "active", ctx.active);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			if (if_block) if_block.d();
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let $disableHotkeys;

	let { value, onPress = null, label = null, disable = false } = $$props;

  const { disableHotkeys } = getContext('hotkeys'); component_subscribe($$self, disableHotkeys, $$value => { $disableHotkeys = $$value; $$invalidate('$disableHotkeys', $disableHotkeys); });

  let active = false;

  function Deactivate() {
    $$invalidate('active', active = false);
  }

  function Activate() {
    $$invalidate('active', active = true);
    setTimeout(Deactivate, 200);
    if (onPress) {
      setTimeout(onPress, 1);
    }
  }

  function Keypress(e) {
    if (
      !$disableHotkeys && !disable &&
      !e.ctrlKey && !e.metaKey &&
      e.key == value
    ) {
      e.preventDefault();
      Activate();
    }
  }

	$$self.$set = $$props => {
		if ('value' in $$props) $$invalidate('value', value = $$props.value);
		if ('onPress' in $$props) $$invalidate('onPress', onPress = $$props.onPress);
		if ('label' in $$props) $$invalidate('label', label = $$props.label);
		if ('disable' in $$props) $$invalidate('disable', disable = $$props.disable);
	};

	return {
		value,
		onPress,
		label,
		disable,
		disableHotkeys,
		active,
		Activate,
		Keypress
	};
}

class Hotkey extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1olzq4i-style")) add_css$1();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["value", "onPress", "label", "disable"]);
	}
}

/* src/client/debug/main/InteractiveFunction.svelte generated by Svelte v3.12.1 */

function add_css$2() {
	var style = element("style");
	style.id = 'svelte-1mppqmp-style';
	style.textContent = ".move.svelte-1mppqmp{display:flex;flex-direction:row;cursor:pointer;margin-left:10px;color:#666}.move.svelte-1mppqmp:hover{color:#333}.move.active.svelte-1mppqmp{color:#111;font-weight:bold}.arg-field.svelte-1mppqmp{outline:none;font-family:monospace}";
	append(document.head, style);
}

function create_fragment$2(ctx) {
	var div, span0, t0, t1, span1, t3, span2, t4, span3, dispose;

	return {
		c() {
			div = element("div");
			span0 = element("span");
			t0 = text(ctx.name);
			t1 = space();
			span1 = element("span");
			span1.textContent = "(";
			t3 = space();
			span2 = element("span");
			t4 = space();
			span3 = element("span");
			span3.textContent = ")";
			attr(span2, "class", "arg-field svelte-1mppqmp");
			attr(span2, "contenteditable", "");
			attr(div, "class", "move svelte-1mppqmp");
			toggle_class(div, "active", ctx.active);

			dispose = [
				listen(span2, "blur", ctx.Deactivate),
				listen(span2, "keypress", stop_propagation(keypress_handler)),
				listen(span2, "keydown", ctx.OnKeyDown),
				listen(div, "click", ctx.Activate)
			];
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, span0);
			append(span0, t0);
			append(div, t1);
			append(div, span1);
			append(div, t3);
			append(div, span2);
			ctx.span2_binding(span2);
			append(div, t4);
			append(div, span3);
		},

		p(changed, ctx) {
			if (changed.name) {
				set_data(t0, ctx.name);
			}

			if (changed.active) {
				toggle_class(div, "active", ctx.active);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			ctx.span2_binding(null);
			run_all(dispose);
		}
	};
}

const keypress_handler = () => {};

function instance$2($$self, $$props, $$invalidate) {
	let { Activate, Deactivate, name, active } = $$props;
  let span;
  const dispatch = createEventDispatcher();

  function Submit() {
    try {
      const value = span.innerText;
      let argArray = new Function(`return [${value}]`)();
      dispatch('submit', argArray);
    } catch (error) {
      dispatch('error', error);
    }
    $$invalidate('span', span.innerText = '', span);
  }

  function OnKeyDown(e) {
    if (e.key == 'Enter') {
      e.preventDefault();
      Submit();
    }

    if (e.key == 'Escape') {
      e.preventDefault();
      Deactivate();
    }
  }

  afterUpdate(() => {
    if (active) {
      span.focus();
    } else {
      span.blur();
    }
  });

	function span2_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			$$invalidate('span', span = $$value);
		});
	}

	$$self.$set = $$props => {
		if ('Activate' in $$props) $$invalidate('Activate', Activate = $$props.Activate);
		if ('Deactivate' in $$props) $$invalidate('Deactivate', Deactivate = $$props.Deactivate);
		if ('name' in $$props) $$invalidate('name', name = $$props.name);
		if ('active' in $$props) $$invalidate('active', active = $$props.active);
	};

	return {
		Activate,
		Deactivate,
		name,
		active,
		span,
		OnKeyDown,
		span2_binding
	};
}

class InteractiveFunction extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1mppqmp-style")) add_css$2();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["Activate", "Deactivate", "name", "active"]);
	}
}

/* src/client/debug/main/Move.svelte generated by Svelte v3.12.1 */

function add_css$3() {
	var style = element("style");
	style.id = 'svelte-smqssc-style';
	style.textContent = ".move-error.svelte-smqssc{color:#a00;font-weight:bold}.wrapper.svelte-smqssc{display:flex;flex-direction:row;align-items:center}";
	append(document.head, style);
}

// (65:2) {#if error}
function create_if_block$1(ctx) {
	var span, t;

	return {
		c() {
			span = element("span");
			t = text(ctx.error);
			attr(span, "class", "move-error svelte-smqssc");
		},

		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},

		p(changed, ctx) {
			if (changed.error) {
				set_data(t, ctx.error);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

function create_fragment$3(ctx) {
	var div1, div0, t0, t1, current;

	var hotkey = new Hotkey({
		props: { value: ctx.shortcut, onPress: ctx.Activate }
	});

	var interactivefunction = new InteractiveFunction({
		props: {
		Activate: ctx.Activate,
		Deactivate: ctx.Deactivate,
		name: ctx.name,
		active: ctx.active
	}
	});
	interactivefunction.$on("submit", ctx.Submit);
	interactivefunction.$on("error", ctx.Error);

	var if_block = (ctx.error) && create_if_block$1(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			hotkey.$$.fragment.c();
			t0 = space();
			interactivefunction.$$.fragment.c();
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "wrapper svelte-smqssc");
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			mount_component(hotkey, div0, null);
			append(div0, t0);
			mount_component(interactivefunction, div0, null);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
			current = true;
		},

		p(changed, ctx) {
			var hotkey_changes = {};
			if (changed.shortcut) hotkey_changes.value = ctx.shortcut;
			hotkey.$set(hotkey_changes);

			var interactivefunction_changes = {};
			if (changed.name) interactivefunction_changes.name = ctx.name;
			if (changed.active) interactivefunction_changes.active = ctx.active;
			interactivefunction.$set(interactivefunction_changes);

			if (ctx.error) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					if_block.m(div1, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		i(local) {
			if (current) return;
			transition_in(hotkey.$$.fragment, local);

			transition_in(interactivefunction.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(hotkey.$$.fragment, local);
			transition_out(interactivefunction.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			destroy_component(hotkey);

			destroy_component(interactivefunction);

			if (if_block) if_block.d();
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { shortcut, name, fn } = $$props;

  const {disableHotkeys} = getContext('hotkeys');

  let error$1 = '';
  let active = false;

  function Activate() {
    disableHotkeys.set(true);
    $$invalidate('active', active = true);
  }

  function Deactivate() {
    disableHotkeys.set(false);
    $$invalidate('error', error$1 = '');
    $$invalidate('active', active = false);
  }

  function Submit(e) {
    $$invalidate('error', error$1 = '');
    Deactivate();
    fn.apply(this, e.detail);
  }

  function Error(e) {
    $$invalidate('error', error$1 = e.detail);
    error(e.detail);
  }

	$$self.$set = $$props => {
		if ('shortcut' in $$props) $$invalidate('shortcut', shortcut = $$props.shortcut);
		if ('name' in $$props) $$invalidate('name', name = $$props.name);
		if ('fn' in $$props) $$invalidate('fn', fn = $$props.fn);
	};

	return {
		shortcut,
		name,
		fn,
		error: error$1,
		active,
		Activate,
		Deactivate,
		Submit,
		Error
	};
}

class Move extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-smqssc-style")) add_css$3();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["shortcut", "name", "fn"]);
	}
}

/* src/client/debug/main/Controls.svelte generated by Svelte v3.12.1 */

function add_css$4() {
	var style = element("style");
	style.id = 'svelte-1x2w9i0-style';
	style.textContent = "li.svelte-1x2w9i0{list-style:none;margin:none;margin-bottom:5px}";
	append(document.head, style);
}

function create_fragment$4(ctx) {
	var section, li0, t0, li1, t1, li2, t2, li3, current;

	var hotkey0 = new Hotkey({
		props: {
		value: "1",
		onPress: ctx.client.reset,
		label: "reset"
	}
	});

	var hotkey1 = new Hotkey({
		props: {
		value: "2",
		onPress: ctx.Save,
		label: "save"
	}
	});

	var hotkey2 = new Hotkey({
		props: {
		value: "3",
		onPress: ctx.Restore,
		label: "restore"
	}
	});

	var hotkey3 = new Hotkey({
		props: {
		value: ".",
		disable: true,
		label: "hide"
	}
	});

	return {
		c() {
			section = element("section");
			li0 = element("li");
			hotkey0.$$.fragment.c();
			t0 = space();
			li1 = element("li");
			hotkey1.$$.fragment.c();
			t1 = space();
			li2 = element("li");
			hotkey2.$$.fragment.c();
			t2 = space();
			li3 = element("li");
			hotkey3.$$.fragment.c();
			attr(li0, "class", "svelte-1x2w9i0");
			attr(li1, "class", "svelte-1x2w9i0");
			attr(li2, "class", "svelte-1x2w9i0");
			attr(li3, "class", "svelte-1x2w9i0");
			attr(section, "id", "debug-controls");
			attr(section, "class", "controls");
		},

		m(target, anchor) {
			insert(target, section, anchor);
			append(section, li0);
			mount_component(hotkey0, li0, null);
			append(section, t0);
			append(section, li1);
			mount_component(hotkey1, li1, null);
			append(section, t1);
			append(section, li2);
			mount_component(hotkey2, li2, null);
			append(section, t2);
			append(section, li3);
			mount_component(hotkey3, li3, null);
			current = true;
		},

		p(changed, ctx) {
			var hotkey0_changes = {};
			if (changed.client) hotkey0_changes.onPress = ctx.client.reset;
			hotkey0.$set(hotkey0_changes);
		},

		i(local) {
			if (current) return;
			transition_in(hotkey0.$$.fragment, local);

			transition_in(hotkey1.$$.fragment, local);

			transition_in(hotkey2.$$.fragment, local);

			transition_in(hotkey3.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(hotkey0.$$.fragment, local);
			transition_out(hotkey1.$$.fragment, local);
			transition_out(hotkey2.$$.fragment, local);
			transition_out(hotkey3.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			destroy_component(hotkey0);

			destroy_component(hotkey1);

			destroy_component(hotkey2);

			destroy_component(hotkey3);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let { client } = $$props;

  function Save() {
    // get state to persist and overwrite deltalog, _undo, and _redo
    const state = client.getState();
    const json = flatted.stringify({
      ...state,
      _undo: [],
      _redo: [],
      deltalog: [],
    });
    window.localStorage.setItem('gamestate', json);
    window.localStorage.setItem('initialState', flatted.stringify(client.initialState));
  }

  function Restore() {
    const gamestateJSON = window.localStorage.getItem('gamestate');
    const initialStateJSON = window.localStorage.getItem('initialState');
    if (gamestateJSON !== null && initialStateJSON !== null) {
      const gamestate = flatted.parse(gamestateJSON);
      const initialState = flatted.parse(initialStateJSON);
      client.store.dispatch(sync({ state: gamestate, initialState }));
    }
  }

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return { client, Save, Restore };
}

class Controls extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1x2w9i0-style")) add_css$4();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/main/PlayerInfo.svelte generated by Svelte v3.12.1 */

function add_css$5() {
	var style = element("style");
	style.id = 'svelte-6sf87x-style';
	style.textContent = ".player-box.svelte-6sf87x{display:flex;flex-direction:row}.player.svelte-6sf87x{cursor:pointer;text-align:center;width:30px;height:30px;line-height:30px;background:#eee;border:3px solid #fefefe;box-sizing:content-box}.player.current.svelte-6sf87x{background:#555;color:#eee;font-weight:bold}.player.active.svelte-6sf87x{border:3px solid #ff7f50}";
	append(document.head, style);
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.player = list[i];
	return child_ctx;
}

// (49:2) {#each players as player}
function create_each_block$1(ctx) {
	var div, t0_value = ctx.player + "", t0, t1, dispose;

	function click_handler() {
		return ctx.click_handler(ctx);
	}

	return {
		c() {
			div = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr(div, "class", "player svelte-6sf87x");
			toggle_class(div, "current", ctx.player == ctx.ctx.currentPlayer);
			toggle_class(div, "active", ctx.player == ctx.playerID);
			dispose = listen(div, "click", click_handler);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.players) && t0_value !== (t0_value = ctx.player + "")) {
				set_data(t0, t0_value);
			}

			if ((changed.players || changed.ctx)) {
				toggle_class(div, "current", ctx.player == ctx.ctx.currentPlayer);
			}

			if ((changed.players || changed.playerID)) {
				toggle_class(div, "active", ctx.player == ctx.playerID);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			dispose();
		}
	};
}

function create_fragment$5(ctx) {
	var div;

	let each_value = ctx.players;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			attr(div, "class", "player-box svelte-6sf87x");
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},

		p(changed, ctx) {
			if (changed.players || changed.ctx || changed.playerID) {
				each_value = ctx.players;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let { ctx, playerID } = $$props;

  const dispatch = createEventDispatcher();
  function OnClick(player) {
    if (player == playerID) {
      dispatch("change", { playerID: null });
    } else {
      dispatch("change", { playerID: player });
    }
  }

  let players;

	const click_handler = ({ player }) => OnClick(player);

	$$self.$set = $$props => {
		if ('ctx' in $$props) $$invalidate('ctx', ctx = $$props.ctx);
		if ('playerID' in $$props) $$invalidate('playerID', playerID = $$props.playerID);
	};

	$$self.$$.update = ($$dirty = { ctx: 1 }) => {
		if ($$dirty.ctx) { $$invalidate('players', players = ctx ? [...Array(ctx.numPlayers).keys()].map(i => i.toString()) : []); }
	};

	return {
		ctx,
		playerID,
		OnClick,
		players,
		click_handler
	};
}

class PlayerInfo extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-6sf87x-style")) add_css$5();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["ctx", "playerID"]);
	}
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
function AssignShortcuts(moveNames, eventNames, blacklist) {
  var shortcuts = {};
  var events = {};

  for (var name in moveNames) {
    events[name] = name;
  }

  for (var _name in eventNames) {
    events[_name] = _name;
  }

  var taken = {};

  for (var i = 0; i < blacklist.length; i++) {
    var c = blacklist[i];
    taken[c] = true;
  } // Try assigning the first char of each move as the shortcut.


  var t = taken;
  var canUseFirstChar = true;

  for (var _name2 in events) {
    var shortcut = _name2[0];

    if (t[shortcut]) {
      canUseFirstChar = false;
      break;
    }

    t[shortcut] = true;
    shortcuts[_name2] = shortcut;
  }

  if (canUseFirstChar) {
    return shortcuts;
  } // If those aren't unique, use a-z.


  t = taken;
  var next = 97;
  shortcuts = {};

  for (var _name3 in events) {
    var _shortcut = String.fromCharCode(next);

    while (t[_shortcut]) {
      next++;
      _shortcut = String.fromCharCode(next);
    }

    t[_shortcut] = true;
    shortcuts[_name3] = _shortcut;
  }

  return shortcuts;
}

/* src/client/debug/main/Main.svelte generated by Svelte v3.12.1 */

function add_css$6() {
	var style = element("style");
	style.id = 'svelte-1vg2l2b-style';
	style.textContent = ".json.svelte-1vg2l2b{font-family:monospace;color:#888}label.svelte-1vg2l2b{font-weight:bold;font-size:1.1em;display:inline}h3.svelte-1vg2l2b{text-transform:uppercase}li.svelte-1vg2l2b{list-style:none;margin:none;margin-bottom:5px}.events.svelte-1vg2l2b{display:flex;flex-direction:column}.events.svelte-1vg2l2b button.svelte-1vg2l2b{width:100px}.events.svelte-1vg2l2b button.svelte-1vg2l2b:not(:last-child){margin-bottom:10px}";
	append(document.head, style);
}

function get_each_context$2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.name = list[i][0];
	child_ctx.fn = list[i][1];
	return child_ctx;
}

// (85:2) {#each Object.entries(client.moves) as [name, fn]}
function create_each_block$2(ctx) {
	var li, t, current;

	var move = new Move({
		props: {
		shortcut: ctx.shortcuts[ctx.name],
		fn: ctx.fn,
		name: ctx.name
	}
	});

	return {
		c() {
			li = element("li");
			move.$$.fragment.c();
			t = space();
			attr(li, "class", "svelte-1vg2l2b");
		},

		m(target, anchor) {
			insert(target, li, anchor);
			mount_component(move, li, null);
			append(li, t);
			current = true;
		},

		p(changed, ctx) {
			var move_changes = {};
			if (changed.client) move_changes.shortcut = ctx.shortcuts[ctx.name];
			if (changed.client) move_changes.fn = ctx.fn;
			if (changed.client) move_changes.name = ctx.name;
			move.$set(move_changes);
		},

		i(local) {
			if (current) return;
			transition_in(move.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(move.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(li);
			}

			destroy_component(move);
		}
	};
}

// (96:2) {#if client.events.endTurn}
function create_if_block_2(ctx) {
	var button, dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "End Turn";
			attr(button, "class", "svelte-1vg2l2b");
			dispose = listen(button, "click", ctx.click_handler);
		},

		m(target, anchor) {
			insert(target, button, anchor);
		},

		d(detaching) {
			if (detaching) {
				detach(button);
			}

			dispose();
		}
	};
}

// (99:2) {#if ctx.phase && client.events.endPhase}
function create_if_block_1(ctx) {
	var button, dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "End Phase";
			attr(button, "class", "svelte-1vg2l2b");
			dispose = listen(button, "click", ctx.click_handler_1);
		},

		m(target, anchor) {
			insert(target, button, anchor);
		},

		d(detaching) {
			if (detaching) {
				detach(button);
			}

			dispose();
		}
	};
}

// (102:2) {#if ctx.activePlayers && client.events.endStage}
function create_if_block$2(ctx) {
	var button, dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "End Stage";
			attr(button, "class", "svelte-1vg2l2b");
			dispose = listen(button, "click", ctx.click_handler_2);
		},

		m(target, anchor) {
			insert(target, button, anchor);
		},

		d(detaching) {
			if (detaching) {
				detach(button);
			}

			dispose();
		}
	};
}

function create_fragment$6(ctx) {
	var section0, h30, t1, t2, section1, h31, t4, t5, section2, h32, t7, t8, section3, h33, t10, div, t11, t12, t13, section4, label0, t15, pre0, t16_value = JSON.stringify(ctx.G, null, 2) + "", t16, t17, section5, label1, t19, pre1, t20_value = JSON.stringify(SanitizeCtx(ctx.ctx), null, 2) + "", t20, current;

	var controls = new Controls({ props: { client: ctx.client } });

	var playerinfo = new PlayerInfo({
		props: {
		ctx: ctx.ctx,
		playerID: ctx.playerID
	}
	});
	playerinfo.$on("change", ctx.change_handler);

	let each_value = Object.entries(ctx.client.moves);

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	var if_block0 = (ctx.client.events.endTurn) && create_if_block_2(ctx);

	var if_block1 = (ctx.ctx.phase && ctx.client.events.endPhase) && create_if_block_1(ctx);

	var if_block2 = (ctx.ctx.activePlayers && ctx.client.events.endStage) && create_if_block$2(ctx);

	return {
		c() {
			section0 = element("section");
			h30 = element("h3");
			h30.textContent = "Controls";
			t1 = space();
			controls.$$.fragment.c();
			t2 = space();
			section1 = element("section");
			h31 = element("h3");
			h31.textContent = "Players";
			t4 = space();
			playerinfo.$$.fragment.c();
			t5 = space();
			section2 = element("section");
			h32 = element("h3");
			h32.textContent = "Moves";
			t7 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t8 = space();
			section3 = element("section");
			h33 = element("h3");
			h33.textContent = "Events";
			t10 = space();
			div = element("div");
			if (if_block0) if_block0.c();
			t11 = space();
			if (if_block1) if_block1.c();
			t12 = space();
			if (if_block2) if_block2.c();
			t13 = space();
			section4 = element("section");
			label0 = element("label");
			label0.textContent = "G";
			t15 = space();
			pre0 = element("pre");
			t16 = text(t16_value);
			t17 = space();
			section5 = element("section");
			label1 = element("label");
			label1.textContent = "ctx";
			t19 = space();
			pre1 = element("pre");
			t20 = text(t20_value);
			attr(h30, "class", "svelte-1vg2l2b");
			attr(h31, "class", "svelte-1vg2l2b");
			attr(h32, "class", "svelte-1vg2l2b");
			attr(h33, "class", "svelte-1vg2l2b");
			attr(div, "class", "events svelte-1vg2l2b");
			attr(label0, "class", "svelte-1vg2l2b");
			attr(pre0, "class", "json svelte-1vg2l2b");
			attr(label1, "class", "svelte-1vg2l2b");
			attr(pre1, "class", "json svelte-1vg2l2b");
		},

		m(target, anchor) {
			insert(target, section0, anchor);
			append(section0, h30);
			append(section0, t1);
			mount_component(controls, section0, null);
			insert(target, t2, anchor);
			insert(target, section1, anchor);
			append(section1, h31);
			append(section1, t4);
			mount_component(playerinfo, section1, null);
			insert(target, t5, anchor);
			insert(target, section2, anchor);
			append(section2, h32);
			append(section2, t7);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(section2, null);
			}

			insert(target, t8, anchor);
			insert(target, section3, anchor);
			append(section3, h33);
			append(section3, t10);
			append(section3, div);
			if (if_block0) if_block0.m(div, null);
			append(div, t11);
			if (if_block1) if_block1.m(div, null);
			append(div, t12);
			if (if_block2) if_block2.m(div, null);
			insert(target, t13, anchor);
			insert(target, section4, anchor);
			append(section4, label0);
			append(section4, t15);
			append(section4, pre0);
			append(pre0, t16);
			insert(target, t17, anchor);
			insert(target, section5, anchor);
			append(section5, label1);
			append(section5, t19);
			append(section5, pre1);
			append(pre1, t20);
			current = true;
		},

		p(changed, ctx) {
			var controls_changes = {};
			if (changed.client) controls_changes.client = ctx.client;
			controls.$set(controls_changes);

			var playerinfo_changes = {};
			if (changed.ctx) playerinfo_changes.ctx = ctx.ctx;
			if (changed.playerID) playerinfo_changes.playerID = ctx.playerID;
			playerinfo.$set(playerinfo_changes);

			if (changed.shortcuts || changed.client) {
				each_value = Object.entries(ctx.client.moves);

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(section2, null);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}
				check_outros();
			}

			if (ctx.client.events.endTurn) {
				if (!if_block0) {
					if_block0 = create_if_block_2(ctx);
					if_block0.c();
					if_block0.m(div, t11);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.ctx.phase && ctx.client.events.endPhase) {
				if (!if_block1) {
					if_block1 = create_if_block_1(ctx);
					if_block1.c();
					if_block1.m(div, t12);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (ctx.ctx.activePlayers && ctx.client.events.endStage) {
				if (!if_block2) {
					if_block2 = create_if_block$2(ctx);
					if_block2.c();
					if_block2.m(div, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if ((!current || changed.G) && t16_value !== (t16_value = JSON.stringify(ctx.G, null, 2) + "")) {
				set_data(t16, t16_value);
			}

			if ((!current || changed.ctx) && t20_value !== (t20_value = JSON.stringify(SanitizeCtx(ctx.ctx), null, 2) + "")) {
				set_data(t20, t20_value);
			}
		},

		i(local) {
			if (current) return;
			transition_in(controls.$$.fragment, local);

			transition_in(playerinfo.$$.fragment, local);

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o(local) {
			transition_out(controls.$$.fragment, local);
			transition_out(playerinfo.$$.fragment, local);

			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section0);
			}

			destroy_component(controls);

			if (detaching) {
				detach(t2);
				detach(section1);
			}

			destroy_component(playerinfo);

			if (detaching) {
				detach(t5);
				detach(section2);
			}

			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach(t8);
				detach(section3);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();

			if (detaching) {
				detach(t13);
				detach(section4);
				detach(t17);
				detach(section5);
			}
		}
	};
}

function SanitizeCtx(ctx) {
  let r = {};
  for (const key in ctx) {
    if (!key.startsWith('_')) {
      r[key] = ctx[key];
    }
  }
  return r;
}

function instance$6($$self, $$props, $$invalidate) {
	let { client } = $$props;

  const shortcuts = AssignShortcuts(client.moves, client.events, 'mlia');

  let playerID = client.playerID;
  let ctx = {};
  let G = {};
  client.subscribe((state) => {
    if (state) {
      $$invalidate('G', G = state.G);
      $$invalidate('ctx', ctx = state.ctx);
    }
    $$invalidate('playerID', playerID = client.playerID);
  });

	const change_handler = (e) => client.updatePlayerID(e.detail.playerID);

	const click_handler = () => client.events.endTurn();

	const click_handler_1 = () => client.events.endPhase();

	const click_handler_2 = () => client.events.endStage();

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return {
		client,
		shortcuts,
		playerID,
		ctx,
		G,
		change_handler,
		click_handler,
		click_handler_1,
		click_handler_2
	};
}

class Main extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1vg2l2b-style")) add_css$6();
		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/info/Item.svelte generated by Svelte v3.12.1 */

function add_css$7() {
	var style = element("style");
	style.id = 'svelte-13qih23-style';
	style.textContent = ".item.svelte-13qih23{padding:10px}.item.svelte-13qih23:not(:first-child){border-top:1px dashed #aaa}.item.svelte-13qih23 div.svelte-13qih23{float:right;text-align:right}";
	append(document.head, style);
}

function create_fragment$7(ctx) {
	var div1, strong, t0, t1, div0, t2_value = JSON.stringify(ctx.value) + "", t2;

	return {
		c() {
			div1 = element("div");
			strong = element("strong");
			t0 = text(ctx.name);
			t1 = space();
			div0 = element("div");
			t2 = text(t2_value);
			attr(div0, "class", "svelte-13qih23");
			attr(div1, "class", "item svelte-13qih23");
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, strong);
			append(strong, t0);
			append(div1, t1);
			append(div1, div0);
			append(div0, t2);
		},

		p(changed, ctx) {
			if (changed.name) {
				set_data(t0, ctx.name);
			}

			if ((changed.value) && t2_value !== (t2_value = JSON.stringify(ctx.value) + "")) {
				set_data(t2, t2_value);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div1);
			}
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let { name, value } = $$props;

	$$self.$set = $$props => {
		if ('name' in $$props) $$invalidate('name', name = $$props.name);
		if ('value' in $$props) $$invalidate('value', value = $$props.value);
	};

	return { name, value };
}

class Item extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-13qih23-style")) add_css$7();
		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["name", "value"]);
	}
}

/* src/client/debug/info/Info.svelte generated by Svelte v3.12.1 */

function add_css$8() {
	var style = element("style");
	style.id = 'svelte-1yzq5o8-style';
	style.textContent = ".gameinfo.svelte-1yzq5o8{padding:10px}";
	append(document.head, style);
}

// (17:2) {#if $client.isMultiplayer}
function create_if_block$3(ctx) {
	var span, t, current;

	var item0 = new Item({
		props: { name: "isConnected", value: ctx.$client.isConnected }
	});

	var item1 = new Item({
		props: {
		name: "isMultiplayer",
		value: ctx.$client.isMultiplayer
	}
	});

	return {
		c() {
			span = element("span");
			item0.$$.fragment.c();
			t = space();
			item1.$$.fragment.c();
		},

		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(item0, span, null);
			append(span, t);
			mount_component(item1, span, null);
			current = true;
		},

		p(changed, ctx) {
			var item0_changes = {};
			if (changed.$client) item0_changes.value = ctx.$client.isConnected;
			item0.$set(item0_changes);

			var item1_changes = {};
			if (changed.$client) item1_changes.value = ctx.$client.isMultiplayer;
			item1.$set(item1_changes);
		},

		i(local) {
			if (current) return;
			transition_in(item0.$$.fragment, local);

			transition_in(item1.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(item0.$$.fragment, local);
			transition_out(item1.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(span);
			}

			destroy_component(item0);

			destroy_component(item1);
		}
	};
}

function create_fragment$8(ctx) {
	var section, t0, t1, t2, current;

	var item0 = new Item({
		props: { name: "gameID", value: ctx.client.gameID }
	});

	var item1 = new Item({
		props: { name: "playerID", value: ctx.client.playerID }
	});

	var item2 = new Item({
		props: { name: "isActive", value: ctx.$client.isActive }
	});

	var if_block = (ctx.$client.isMultiplayer) && create_if_block$3(ctx);

	return {
		c() {
			section = element("section");
			item0.$$.fragment.c();
			t0 = space();
			item1.$$.fragment.c();
			t1 = space();
			item2.$$.fragment.c();
			t2 = space();
			if (if_block) if_block.c();
			attr(section, "class", "gameinfo svelte-1yzq5o8");
		},

		m(target, anchor) {
			insert(target, section, anchor);
			mount_component(item0, section, null);
			append(section, t0);
			mount_component(item1, section, null);
			append(section, t1);
			mount_component(item2, section, null);
			append(section, t2);
			if (if_block) if_block.m(section, null);
			current = true;
		},

		p(changed, ctx) {
			var item0_changes = {};
			if (changed.client) item0_changes.value = ctx.client.gameID;
			item0.$set(item0_changes);

			var item1_changes = {};
			if (changed.client) item1_changes.value = ctx.client.playerID;
			item1.$set(item1_changes);

			var item2_changes = {};
			if (changed.$client) item2_changes.value = ctx.$client.isActive;
			item2.$set(item2_changes);

			if (ctx.$client.isMultiplayer) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(section, null);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(item0.$$.fragment, local);

			transition_in(item1.$$.fragment, local);

			transition_in(item2.$$.fragment, local);

			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(item0.$$.fragment, local);
			transition_out(item1.$$.fragment, local);
			transition_out(item2.$$.fragment, local);
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			destroy_component(item0);

			destroy_component(item1);

			destroy_component(item2);

			if (if_block) if_block.d();
		}
	};
}

function instance$8($$self, $$props, $$invalidate) {
	let $client;

	let { client } = $$props; component_subscribe($$self, client, $$value => { $client = $$value; $$invalidate('$client', $client); });

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return { client, $client };
}

class Info extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1yzq5o8-style")) add_css$8();
		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/log/TurnMarker.svelte generated by Svelte v3.12.1 */

function add_css$9() {
	var style = element("style");
	style.id = 'svelte-6eza86-style';
	style.textContent = ".turn-marker.svelte-6eza86{display:flex;justify-content:center;align-items:center;grid-column:1;background:#555;color:#eee;text-align:center;font-weight:bold;border:1px solid #888}";
	append(document.head, style);
}

function create_fragment$9(ctx) {
	var div, t;

	return {
		c() {
			div = element("div");
			t = text(ctx.turn);
			attr(div, "class", "turn-marker svelte-6eza86");
			attr(div, "style", ctx.style);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p(changed, ctx) {
			if (changed.turn) {
				set_data(t, ctx.turn);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let { turn, numEvents } = $$props;
  const style = `grid-row: span ${numEvents}`;

	$$self.$set = $$props => {
		if ('turn' in $$props) $$invalidate('turn', turn = $$props.turn);
		if ('numEvents' in $$props) $$invalidate('numEvents', numEvents = $$props.numEvents);
	};

	return { turn, numEvents, style };
}

class TurnMarker extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-6eza86-style")) add_css$9();
		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["turn", "numEvents"]);
	}
}

/* src/client/debug/log/PhaseMarker.svelte generated by Svelte v3.12.1 */

function add_css$a() {
	var style = element("style");
	style.id = 'svelte-1t4xap-style';
	style.textContent = ".phase-marker.svelte-1t4xap{grid-column:3;background:#555;border:1px solid #888;color:#eee;text-align:center;font-weight:bold;padding-top:10px;padding-bottom:10px;text-orientation:sideways;writing-mode:vertical-rl;line-height:30px;width:100%}";
	append(document.head, style);
}

function create_fragment$a(ctx) {
	var div, t_value = ctx.phase || '' + "", t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "phase-marker svelte-1t4xap");
			attr(div, "style", ctx.style);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p(changed, ctx) {
			if ((changed.phase) && t_value !== (t_value = ctx.phase || '' + "")) {
				set_data(t, t_value);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	let { phase, numEvents } = $$props;

  const style = `grid-row: span ${numEvents}`;

	$$self.$set = $$props => {
		if ('phase' in $$props) $$invalidate('phase', phase = $$props.phase);
		if ('numEvents' in $$props) $$invalidate('numEvents', numEvents = $$props.numEvents);
	};

	return { phase, numEvents, style };
}

class PhaseMarker extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1t4xap-style")) add_css$a();
		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["phase", "numEvents"]);
	}
}

/* src/client/debug/log/CustomPayload.svelte generated by Svelte v3.12.1 */

function create_fragment$b(ctx) {
	var div, t;

	return {
		c() {
			div = element("div");
			t = text(ctx.custompayload);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance$b($$self, $$props, $$invalidate) {
	let { payload } = $$props;
  const custompayload =
    payload !== undefined ? JSON.stringify(payload, null, 4) : '';

	$$self.$set = $$props => {
		if ('payload' in $$props) $$invalidate('payload', payload = $$props.payload);
	};

	return { payload, custompayload };
}

class CustomPayload extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$b, create_fragment$b, safe_not_equal, ["payload"]);
	}
}

/* src/client/debug/log/LogEvent.svelte generated by Svelte v3.12.1 */

function add_css$b() {
	var style = element("style");
	style.id = 'svelte-10wdo7v-style';
	style.textContent = ".log-event.svelte-10wdo7v{grid-column:2;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;justify-content:center;background:#fff;border:1px dotted #ccc;border-left:5px solid #ccc;padding:5px;text-align:center;color:#888;font-size:14px;min-height:25px;line-height:25px}.log-event.svelte-10wdo7v:hover{border-style:solid;background:#eee}.log-event.pinned.svelte-10wdo7v{border-style:solid;background:#eee;opacity:1}.player0.svelte-10wdo7v{border-left-color:#ff851b}.player1.svelte-10wdo7v{border-left-color:#7fdbff}.player2.svelte-10wdo7v{border-left-color:#0074d9}.player3.svelte-10wdo7v{border-left-color:#39cccc}.player4.svelte-10wdo7v{border-left-color:#3d9970}.player5.svelte-10wdo7v{border-left-color:#2ecc40}.player6.svelte-10wdo7v{border-left-color:#01ff70}.player7.svelte-10wdo7v{border-left-color:#ffdc00}.player8.svelte-10wdo7v{border-left-color:#001f3f}.player9.svelte-10wdo7v{border-left-color:#ff4136}.player10.svelte-10wdo7v{border-left-color:#85144b}.player11.svelte-10wdo7v{border-left-color:#f012be}.player12.svelte-10wdo7v{border-left-color:#b10dc9}.player13.svelte-10wdo7v{border-left-color:#111111}.player14.svelte-10wdo7v{border-left-color:#aaaaaa}.player15.svelte-10wdo7v{border-left-color:#dddddd}";
	append(document.head, style);
}

// (122:2) {:else}
function create_else_block(ctx) {
	var current;

	var custompayload = new CustomPayload({ props: { payload: ctx.payload } });

	return {
		c() {
			custompayload.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(custompayload, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var custompayload_changes = {};
			if (changed.payload) custompayload_changes.payload = ctx.payload;
			custompayload.$set(custompayload_changes);
		},

		i(local) {
			if (current) return;
			transition_in(custompayload.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(custompayload.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(custompayload, detaching);
		}
	};
}

// (120:2) {#if payloadComponent}
function create_if_block$4(ctx) {
	var switch_instance_anchor, current;

	var switch_value = ctx.payloadComponent;

	function switch_props(ctx) {
		return { props: { payload: ctx.payload } };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			if (switch_instance) switch_instance.$$.fragment.c();
			switch_instance_anchor = empty();
		},

		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			var switch_instance_changes = {};
			if (changed.payload) switch_instance_changes.payload = ctx.payload;

			if (switch_value !== (switch_value = ctx.payloadComponent)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},

		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

			current = true;
		},

		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(switch_instance_anchor);
			}

			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function create_fragment$c(ctx) {
	var div1, div0, t0_value = ctx.action.payload.type + "", t0, t1, t2_value = ctx.args.join(',') + "", t2, t3, t4, current_block_type_index, if_block, current, dispose;

	var if_block_creators = [
		create_if_block$4,
		create_else_block
	];

	var if_blocks = [];

	function select_block_type(changed, ctx) {
		if (ctx.payloadComponent) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(null, ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = text("(");
			t2 = text(t2_value);
			t3 = text(")");
			t4 = space();
			if_block.c();
			attr(div1, "class", "log-event player" + ctx.playerID + " svelte-10wdo7v");
			toggle_class(div1, "pinned", ctx.pinned);

			dispose = [
				listen(div1, "click", ctx.click_handler),
				listen(div1, "mouseenter", ctx.mouseenter_handler),
				listen(div1, "mouseleave", ctx.mouseleave_handler)
			];
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div0, t1);
			append(div0, t2);
			append(div0, t3);
			append(div1, t4);
			if_blocks[current_block_type_index].m(div1, null);
			current = true;
		},

		p(changed, ctx) {
			if ((!current || changed.action) && t0_value !== (t0_value = ctx.action.payload.type + "")) {
				set_data(t0, t0_value);
			}

			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(changed, ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});
				check_outros();

				if_block = if_blocks[current_block_type_index];
				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}
				transition_in(if_block, 1);
				if_block.m(div1, null);
			}

			if (changed.pinned) {
				toggle_class(div1, "pinned", ctx.pinned);
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			if_blocks[current_block_type_index].d();
			run_all(dispose);
		}
	};
}

function instance$c($$self, $$props, $$invalidate) {
	let { logIndex, action, pinned, payload, payloadComponent } = $$props;

  const dispatch = createEventDispatcher();

  const args = action.payload.args || [];
  const playerID = action.payload.playerID;

	const click_handler = () => dispatch('click', { logIndex });

	const mouseenter_handler = () => dispatch('mouseenter', { logIndex });

	const mouseleave_handler = () => dispatch('mouseleave');

	$$self.$set = $$props => {
		if ('logIndex' in $$props) $$invalidate('logIndex', logIndex = $$props.logIndex);
		if ('action' in $$props) $$invalidate('action', action = $$props.action);
		if ('pinned' in $$props) $$invalidate('pinned', pinned = $$props.pinned);
		if ('payload' in $$props) $$invalidate('payload', payload = $$props.payload);
		if ('payloadComponent' in $$props) $$invalidate('payloadComponent', payloadComponent = $$props.payloadComponent);
	};

	return {
		logIndex,
		action,
		pinned,
		payload,
		payloadComponent,
		dispatch,
		args,
		playerID,
		click_handler,
		mouseenter_handler,
		mouseleave_handler
	};
}

class LogEvent extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-10wdo7v-style")) add_css$b();
		init(this, options, instance$c, create_fragment$c, safe_not_equal, ["logIndex", "action", "pinned", "payload", "payloadComponent"]);
	}
}

/* node_modules/svelte-icons/components/IconBase.svelte generated by Svelte v3.12.1 */

function add_css$c() {
	var style = element("style");
	style.id = 'svelte-c8tyih-style';
	style.textContent = "svg.svelte-c8tyih{stroke:currentColor;fill:currentColor;stroke-width:0;width:100%;height:auto;max-height:100%}";
	append(document.head, style);
}

// (18:2) {#if title}
function create_if_block$5(ctx) {
	var title_1, t;

	return {
		c() {
			title_1 = svg_element("title");
			t = text(ctx.title);
		},

		m(target, anchor) {
			insert(target, title_1, anchor);
			append(title_1, t);
		},

		p(changed, ctx) {
			if (changed.title) {
				set_data(t, ctx.title);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(title_1);
			}
		}
	};
}

function create_fragment$d(ctx) {
	var svg, if_block_anchor, current;

	var if_block = (ctx.title) && create_if_block$5(ctx);

	const default_slot_template = ctx.$$slots.default;
	const default_slot = create_slot(default_slot_template, ctx, null);

	return {
		c() {
			svg = svg_element("svg");
			if (if_block) if_block.c();
			if_block_anchor = empty();

			if (default_slot) default_slot.c();

			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "viewBox", ctx.viewBox);
			attr(svg, "class", "svelte-c8tyih");
		},

		l(nodes) {
			if (default_slot) default_slot.l(svg_nodes);
		},

		m(target, anchor) {
			insert(target, svg, anchor);
			if (if_block) if_block.m(svg, null);
			append(svg, if_block_anchor);

			if (default_slot) {
				default_slot.m(svg, null);
			}

			current = true;
		},

		p(changed, ctx) {
			if (ctx.title) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block$5(ctx);
					if_block.c();
					if_block.m(svg, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (default_slot && default_slot.p && changed.$$scope) {
				default_slot.p(
					get_slot_changes(default_slot_template, ctx, changed, null),
					get_slot_context(default_slot_template, ctx, null)
				);
			}

			if (!current || changed.viewBox) {
				attr(svg, "viewBox", ctx.viewBox);
			}
		},

		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},

		o(local) {
			transition_out(default_slot, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(svg);
			}

			if (if_block) if_block.d();

			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let { title = null, viewBox } = $$props;

	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ('title' in $$props) $$invalidate('title', title = $$props.title);
		if ('viewBox' in $$props) $$invalidate('viewBox', viewBox = $$props.viewBox);
		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
	};

	return { title, viewBox, $$slots, $$scope };
}

class IconBase extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-c8tyih-style")) add_css$c();
		init(this, options, instance$d, create_fragment$d, safe_not_equal, ["title", "viewBox"]);
	}
}

/* node_modules/svelte-icons/fa/FaArrowAltCircleDown.svelte generated by Svelte v3.12.1 */

// (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
function create_default_slot(ctx) {
	var path;

	return {
		c() {
			path = svg_element("path");
			attr(path, "d", "M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zM212 140v116h-70.9c-10.7 0-16.1 13-8.5 20.5l114.9 114.3c4.7 4.7 12.2 4.7 16.9 0l114.9-114.3c7.6-7.6 2.2-20.5-8.5-20.5H300V140c0-6.6-5.4-12-12-12h-64c-6.6 0-12 5.4-12 12z");
		},

		m(target, anchor) {
			insert(target, path, anchor);
		},

		d(detaching) {
			if (detaching) {
				detach(path);
			}
		}
	};
}

function create_fragment$e(ctx) {
	var current;

	var iconbase_spread_levels = [
		{ viewBox: "0 0 512 512" },
		ctx.$$props
	];

	let iconbase_props = {
		$$slots: { default: [create_default_slot] },
		$$scope: { ctx }
	};
	for (var i = 0; i < iconbase_spread_levels.length; i += 1) {
		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
	}
	var iconbase = new IconBase({ props: iconbase_props });

	return {
		c() {
			iconbase.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(iconbase, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var iconbase_changes = (changed.$$props) ? get_spread_update(iconbase_spread_levels, [
									iconbase_spread_levels[0],
			get_spread_object(ctx.$$props)
								]) : {};
			if (changed.$$scope) iconbase_changes.$$scope = { changed, ctx };
			iconbase.$set(iconbase_changes);
		},

		i(local) {
			if (current) return;
			transition_in(iconbase.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(iconbase.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(iconbase, detaching);
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	$$self.$set = $$new_props => {
		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
	};

	return {
		$$props,
		$$props: $$props = exclude_internal_props($$props)
	};
}

class FaArrowAltCircleDown extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$e, create_fragment$e, safe_not_equal, []);
	}
}

/* src/client/debug/mcts/Action.svelte generated by Svelte v3.12.1 */

function add_css$d() {
	var style = element("style");
	style.id = 'svelte-1a7time-style';
	style.textContent = "div.svelte-1a7time{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:500px}";
	append(document.head, style);
}

function create_fragment$f(ctx) {
	var div, t;

	return {
		c() {
			div = element("div");
			t = text(ctx.text);
			attr(div, "alt", ctx.text);
			attr(div, "class", "svelte-1a7time");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p(changed, ctx) {
			if (changed.text) {
				set_data(t, ctx.text);
				attr(div, "alt", ctx.text);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance$f($$self, $$props, $$invalidate) {
	let { action } = $$props;

  let text;

	$$self.$set = $$props => {
		if ('action' in $$props) $$invalidate('action', action = $$props.action);
	};

	$$self.$$.update = ($$dirty = { action: 1 }) => {
		if ($$dirty.action) { {
        const { type, args } = action.payload;
        const argsFormatted = (args || []).join(',');
        $$invalidate('text', text = `${type}(${argsFormatted})`);
      } }
	};

	return { action, text };
}

class Action extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1a7time-style")) add_css$d();
		init(this, options, instance$f, create_fragment$f, safe_not_equal, ["action"]);
	}
}

/* src/client/debug/mcts/Table.svelte generated by Svelte v3.12.1 */

function add_css$e() {
	var style = element("style");
	style.id = 'svelte-ztcwsu-style';
	style.textContent = "table.svelte-ztcwsu{font-size:12px;border-collapse:collapse;border:1px solid #ddd;padding:0}tr.svelte-ztcwsu{cursor:pointer}tr.svelte-ztcwsu:hover td.svelte-ztcwsu{background:#eee}tr.selected.svelte-ztcwsu td.svelte-ztcwsu{background:#eee}td.svelte-ztcwsu{padding:10px;height:10px;line-height:10px;font-size:12px;border:none}th.svelte-ztcwsu{background:#888;color:#fff;padding:10px;text-align:center}";
	append(document.head, style);
}

function get_each_context$3(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.child = list[i];
	child_ctx.i = i;
	return child_ctx;
}

// (86:2) {#each children as child, i}
function create_each_block$3(ctx) {
	var tr, td0, t0_value = ctx.child.value + "", t0, t1, td1, t2_value = ctx.child.visits + "", t2, t3, td2, t4, current, dispose;

	var action = new Action({ props: { action: ctx.child.parentAction } });

	function click_handler() {
		return ctx.click_handler(ctx);
	}

	function mouseout_handler() {
		return ctx.mouseout_handler(ctx);
	}

	function mouseover_handler() {
		return ctx.mouseover_handler(ctx);
	}

	return {
		c() {
			tr = element("tr");
			td0 = element("td");
			t0 = text(t0_value);
			t1 = space();
			td1 = element("td");
			t2 = text(t2_value);
			t3 = space();
			td2 = element("td");
			action.$$.fragment.c();
			t4 = space();
			attr(td0, "class", "svelte-ztcwsu");
			attr(td1, "class", "svelte-ztcwsu");
			attr(td2, "class", "svelte-ztcwsu");
			attr(tr, "class", "svelte-ztcwsu");
			toggle_class(tr, "clickable", ctx.children.length > 0);
			toggle_class(tr, "selected", ctx.i === ctx.selectedIndex);

			dispose = [
				listen(tr, "click", click_handler),
				listen(tr, "mouseout", mouseout_handler),
				listen(tr, "mouseover", mouseover_handler)
			];
		},

		m(target, anchor) {
			insert(target, tr, anchor);
			append(tr, td0);
			append(td0, t0);
			append(tr, t1);
			append(tr, td1);
			append(td1, t2);
			append(tr, t3);
			append(tr, td2);
			mount_component(action, td2, null);
			append(tr, t4);
			current = true;
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((!current || changed.children) && t0_value !== (t0_value = ctx.child.value + "")) {
				set_data(t0, t0_value);
			}

			if ((!current || changed.children) && t2_value !== (t2_value = ctx.child.visits + "")) {
				set_data(t2, t2_value);
			}

			var action_changes = {};
			if (changed.children) action_changes.action = ctx.child.parentAction;
			action.$set(action_changes);

			if (changed.children) {
				toggle_class(tr, "clickable", ctx.children.length > 0);
			}

			if (changed.selectedIndex) {
				toggle_class(tr, "selected", ctx.i === ctx.selectedIndex);
			}
		},

		i(local) {
			if (current) return;
			transition_in(action.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(action.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(tr);
			}

			destroy_component(action);

			run_all(dispose);
		}
	};
}

function create_fragment$g(ctx) {
	var table, thead, t_5, tbody, current;

	let each_value = ctx.children;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			table = element("table");
			thead = element("thead");
			thead.innerHTML = `<th class="svelte-ztcwsu">Value</th> <th class="svelte-ztcwsu">Visits</th> <th class="svelte-ztcwsu">Action</th>`;
			t_5 = space();
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			attr(table, "class", "svelte-ztcwsu");
		},

		m(target, anchor) {
			insert(target, table, anchor);
			append(table, thead);
			append(table, t_5);
			append(table, tbody);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}

			current = true;
		},

		p(changed, ctx) {
			if (changed.children || changed.selectedIndex) {
				each_value = ctx.children;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(tbody, null);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o(local) {
			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(table);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$g($$self, $$props, $$invalidate) {
	let { root, selectedIndex = null } = $$props;

  const dispatch = createEventDispatcher();

  let parents = [];
  let children = [];

  function Select(node, i) {
    dispatch('select', { node, selectedIndex: i });
  }

  function Preview(node, i) {
    if (selectedIndex === null) {
      dispatch('preview', { node });
    }
  }

	const click_handler = ({ child, i }) => Select(child, i);

	const mouseout_handler = ({ i }) => Preview(null);

	const mouseover_handler = ({ child, i }) => Preview(child);

	$$self.$set = $$props => {
		if ('root' in $$props) $$invalidate('root', root = $$props.root);
		if ('selectedIndex' in $$props) $$invalidate('selectedIndex', selectedIndex = $$props.selectedIndex);
	};

	$$self.$$.update = ($$dirty = { root: 1, parents: 1 }) => {
		if ($$dirty.root || $$dirty.parents) { {
        let t = root;
        $$invalidate('parents', parents = []);
        while (t.parent) {
          const parent = t.parent;
          const { type, args } = t.parentAction.payload;
          const argsFormatted = (args || []).join(',');
          const arrowText = `${type}(${argsFormatted})`;
          parents.push({ parent, arrowText });
          t = parent;
        }
        parents.reverse();
    
        $$invalidate('children', children = [...root.children]
                       .sort((a, b) => (a.visits < b.visits ? 1 : -1))
                       .slice(0, 50));
      } }
	};

	return {
		root,
		selectedIndex,
		children,
		Select,
		Preview,
		click_handler,
		mouseout_handler,
		mouseover_handler
	};
}

class Table extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-ztcwsu-style")) add_css$e();
		init(this, options, instance$g, create_fragment$g, safe_not_equal, ["root", "selectedIndex"]);
	}
}

/* src/client/debug/mcts/MCTS.svelte generated by Svelte v3.12.1 */

function add_css$f() {
	var style = element("style");
	style.id = 'svelte-1f0amz4-style';
	style.textContent = ".visualizer.svelte-1f0amz4{display:flex;flex-direction:column;align-items:center;padding:50px}.preview.svelte-1f0amz4{opacity:0.5}.icon.svelte-1f0amz4{color:#777;width:32px;height:32px;margin-bottom:20px}";
	append(document.head, style);
}

function get_each_context$4(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.node = list[i].node;
	child_ctx.selectedIndex = list[i].selectedIndex;
	child_ctx.i = i;
	return child_ctx;
}

// (50:4) {#if i !== 0}
function create_if_block_2$1(ctx) {
	var div, current;

	var arrow = new FaArrowAltCircleDown({});

	return {
		c() {
			div = element("div");
			arrow.$$.fragment.c();
			attr(div, "class", "icon svelte-1f0amz4");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(arrow, div, null);
			current = true;
		},

		i(local) {
			if (current) return;
			transition_in(arrow.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(arrow.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_component(arrow);
		}
	};
}

// (61:6) {:else}
function create_else_block$1(ctx) {
	var current;

	function select_handler_1(...args) {
		return ctx.select_handler_1(ctx, ...args);
	}

	var table = new Table({
		props: {
		root: ctx.node,
		selectedIndex: ctx.selectedIndex
	}
	});
	table.$on("select", select_handler_1);

	return {
		c() {
			table.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(table, target, anchor);
			current = true;
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			var table_changes = {};
			if (changed.nodes) table_changes.root = ctx.node;
			if (changed.nodes) table_changes.selectedIndex = ctx.selectedIndex;
			table.$set(table_changes);
		},

		i(local) {
			if (current) return;
			transition_in(table.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(table.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(table, detaching);
		}
	};
}

// (57:6) {#if i === nodes.length - 1}
function create_if_block_1$1(ctx) {
	var current;

	function select_handler(...args) {
		return ctx.select_handler(ctx, ...args);
	}

	function preview_handler(...args) {
		return ctx.preview_handler(ctx, ...args);
	}

	var table = new Table({ props: { root: ctx.node } });
	table.$on("select", select_handler);
	table.$on("preview", preview_handler);

	return {
		c() {
			table.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(table, target, anchor);
			current = true;
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			var table_changes = {};
			if (changed.nodes) table_changes.root = ctx.node;
			table.$set(table_changes);
		},

		i(local) {
			if (current) return;
			transition_in(table.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(table.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(table, detaching);
		}
	};
}

// (49:2) {#each nodes as { node, selectedIndex }
function create_each_block$4(ctx) {
	var t, section, current_block_type_index, if_block1, current;

	var if_block0 = (ctx.i !== 0) && create_if_block_2$1();

	var if_block_creators = [
		create_if_block_1$1,
		create_else_block$1
	];

	var if_blocks = [];

	function select_block_type(changed, ctx) {
		if (ctx.i === ctx.nodes.length - 1) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(null, ctx);
	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if (if_block0) if_block0.c();
			t = space();
			section = element("section");
			if_block1.c();
		},

		m(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t, anchor);
			insert(target, section, anchor);
			if_blocks[current_block_type_index].m(section, null);
			current = true;
		},

		p(changed, ctx) {
			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(changed, ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});
				check_outros();

				if_block1 = if_blocks[current_block_type_index];
				if (!if_block1) {
					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block1.c();
				}
				transition_in(if_block1, 1);
				if_block1.m(section, null);
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},

		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},

		d(detaching) {
			if (if_block0) if_block0.d(detaching);

			if (detaching) {
				detach(t);
				detach(section);
			}

			if_blocks[current_block_type_index].d();
		}
	};
}

// (69:2) {#if preview}
function create_if_block$6(ctx) {
	var div, t, section, current;

	var arrow = new FaArrowAltCircleDown({});

	var table = new Table({ props: { root: ctx.preview } });

	return {
		c() {
			div = element("div");
			arrow.$$.fragment.c();
			t = space();
			section = element("section");
			table.$$.fragment.c();
			attr(div, "class", "icon svelte-1f0amz4");
			attr(section, "class", "preview svelte-1f0amz4");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(arrow, div, null);
			insert(target, t, anchor);
			insert(target, section, anchor);
			mount_component(table, section, null);
			current = true;
		},

		p(changed, ctx) {
			var table_changes = {};
			if (changed.preview) table_changes.root = ctx.preview;
			table.$set(table_changes);
		},

		i(local) {
			if (current) return;
			transition_in(arrow.$$.fragment, local);

			transition_in(table.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(arrow.$$.fragment, local);
			transition_out(table.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_component(arrow);

			if (detaching) {
				detach(t);
				detach(section);
			}

			destroy_component(table);
		}
	};
}

function create_fragment$h(ctx) {
	var div, t, current;

	let each_value = ctx.nodes;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	var if_block = (ctx.preview) && create_if_block$6(ctx);

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			if (if_block) if_block.c();
			attr(div, "class", "visualizer svelte-1f0amz4");
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			append(div, t);
			if (if_block) if_block.m(div, null);
			current = true;
		},

		p(changed, ctx) {
			if (changed.nodes) {
				each_value = ctx.nodes;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$4(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$4(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, t);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}
				check_outros();
			}

			if (ctx.preview) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$6(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(if_block);
			current = true;
		},

		o(local) {
			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);

			if (if_block) if_block.d();
		}
	};
}

function instance$h($$self, $$props, $$invalidate) {
	let { metadata } = $$props;

  let nodes = [];
  let preview = null;

  function SelectNode({ node, selectedIndex }, i) {
    $$invalidate('preview', preview = null);
    $$invalidate('nodes', nodes[i].selectedIndex = selectedIndex, nodes);
    $$invalidate('nodes', nodes = [...nodes.slice(0, i + 1), { node }]);
  }

  function PreviewNode({ node }, i) {
    $$invalidate('preview', preview = node);
  }

	const select_handler = ({ i }, e) => SelectNode(e.detail, i);

	const preview_handler = ({ i }, e) => PreviewNode(e.detail);

	const select_handler_1 = ({ i }, e) => SelectNode(e.detail, i);

	$$self.$set = $$props => {
		if ('metadata' in $$props) $$invalidate('metadata', metadata = $$props.metadata);
	};

	$$self.$$.update = ($$dirty = { metadata: 1 }) => {
		if ($$dirty.metadata) { {
        $$invalidate('nodes', nodes = [{ node: metadata }]);
      } }
	};

	return {
		metadata,
		nodes,
		preview,
		SelectNode,
		PreviewNode,
		select_handler,
		preview_handler,
		select_handler_1
	};
}

class MCTS extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1f0amz4-style")) add_css$f();
		init(this, options, instance$h, create_fragment$h, safe_not_equal, ["metadata"]);
	}
}

/* src/client/debug/log/Log.svelte generated by Svelte v3.12.1 */

function add_css$g() {
	var style = element("style");
	style.id = 'svelte-1pq5e4b-style';
	style.textContent = ".gamelog.svelte-1pq5e4b{display:grid;grid-template-columns:30px 1fr 30px;grid-auto-rows:auto;grid-auto-flow:column}";
	append(document.head, style);
}

function get_each_context$5(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.phase = list[i].phase;
	child_ctx.i = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.action = list[i].action;
	child_ctx.payload = list[i].payload;
	child_ctx.i = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.turn = list[i].turn;
	child_ctx.i = i;
	return child_ctx;
}

// (137:4) {#if i in turnBoundaries}
function create_if_block_1$2(ctx) {
	var current;

	var turnmarker = new TurnMarker({
		props: {
		turn: ctx.turn,
		numEvents: ctx.turnBoundaries[ctx.i]
	}
	});

	return {
		c() {
			turnmarker.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(turnmarker, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var turnmarker_changes = {};
			if (changed.renderedLogEntries) turnmarker_changes.turn = ctx.turn;
			if (changed.turnBoundaries) turnmarker_changes.numEvents = ctx.turnBoundaries[ctx.i];
			turnmarker.$set(turnmarker_changes);
		},

		i(local) {
			if (current) return;
			transition_in(turnmarker.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(turnmarker.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(turnmarker, detaching);
		}
	};
}

// (136:2) {#each renderedLogEntries as { turn }
function create_each_block_2(ctx) {
	var if_block_anchor, current;

	var if_block = (ctx.i in ctx.turnBoundaries) && create_if_block_1$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},

		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			if (ctx.i in ctx.turnBoundaries) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_1$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (if_block) if_block.d(detaching);

			if (detaching) {
				detach(if_block_anchor);
			}
		}
	};
}

// (142:2) {#each renderedLogEntries as { action, payload }
function create_each_block_1(ctx) {
	var current;

	var logevent = new LogEvent({
		props: {
		pinned: ctx.i === ctx.pinned,
		logIndex: ctx.i,
		action: ctx.action,
		payload: ctx.payload
	}
	});
	logevent.$on("click", ctx.OnLogClick);
	logevent.$on("mouseenter", ctx.OnMouseEnter);
	logevent.$on("mouseleave", ctx.OnMouseLeave);

	return {
		c() {
			logevent.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(logevent, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var logevent_changes = {};
			if (changed.pinned) logevent_changes.pinned = ctx.i === ctx.pinned;
			if (changed.renderedLogEntries) logevent_changes.action = ctx.action;
			if (changed.renderedLogEntries) logevent_changes.payload = ctx.payload;
			logevent.$set(logevent_changes);
		},

		i(local) {
			if (current) return;
			transition_in(logevent.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(logevent.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(logevent, detaching);
		}
	};
}

// (154:4) {#if i in phaseBoundaries}
function create_if_block$7(ctx) {
	var current;

	var phasemarker = new PhaseMarker({
		props: {
		phase: ctx.phase,
		numEvents: ctx.phaseBoundaries[ctx.i]
	}
	});

	return {
		c() {
			phasemarker.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(phasemarker, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var phasemarker_changes = {};
			if (changed.renderedLogEntries) phasemarker_changes.phase = ctx.phase;
			if (changed.phaseBoundaries) phasemarker_changes.numEvents = ctx.phaseBoundaries[ctx.i];
			phasemarker.$set(phasemarker_changes);
		},

		i(local) {
			if (current) return;
			transition_in(phasemarker.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(phasemarker.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(phasemarker, detaching);
		}
	};
}

// (153:2) {#each renderedLogEntries as { phase }
function create_each_block$5(ctx) {
	var if_block_anchor, current;

	var if_block = (ctx.i in ctx.phaseBoundaries) && create_if_block$7(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},

		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			if (ctx.i in ctx.phaseBoundaries) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$7(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (if_block) if_block.d(detaching);

			if (detaching) {
				detach(if_block_anchor);
			}
		}
	};
}

function create_fragment$i(ctx) {
	var div, t0, t1, current, dispose;

	let each_value_2 = ctx.renderedLogEntries;

	let each_blocks_2 = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
		each_blocks_2[i] = null;
	});

	let each_value_1 = ctx.renderedLogEntries;

	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
		each_blocks_1[i] = null;
	});

	let each_value = ctx.renderedLogEntries;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
	}

	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].c();
			}

			t0 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t1 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			attr(div, "class", "gamelog svelte-1pq5e4b");
			toggle_class(div, "pinned", ctx.pinned);
			dispose = listen(window, "keydown", ctx.OnKeyDown);
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].m(div, null);
			}

			append(div, t0);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div, null);
			}

			append(div, t1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},

		p(changed, ctx) {
			if (changed.turnBoundaries || changed.renderedLogEntries) {
				each_value_2 = ctx.renderedLogEntries;

				let i;
				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(changed, child_ctx);
						transition_in(each_blocks_2[i], 1);
					} else {
						each_blocks_2[i] = create_each_block_2(child_ctx);
						each_blocks_2[i].c();
						transition_in(each_blocks_2[i], 1);
						each_blocks_2[i].m(div, t0);
					}
				}

				group_outros();
				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
					out(i);
				}
				check_outros();
			}

			if (changed.pinned || changed.renderedLogEntries) {
				each_value_1 = ctx.renderedLogEntries;

				let i;
				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(changed, child_ctx);
						transition_in(each_blocks_1[i], 1);
					} else {
						each_blocks_1[i] = create_each_block_1(child_ctx);
						each_blocks_1[i].c();
						transition_in(each_blocks_1[i], 1);
						each_blocks_1[i].m(div, t1);
					}
				}

				group_outros();
				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
					out_1(i);
				}
				check_outros();
			}

			if (changed.phaseBoundaries || changed.renderedLogEntries) {
				each_value = ctx.renderedLogEntries;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$5(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$5(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out_2(i);
				}
				check_outros();
			}

			if (changed.pinned) {
				toggle_class(div, "pinned", ctx.pinned);
			}
		},

		i(local) {
			if (current) return;
			for (let i = 0; i < each_value_2.length; i += 1) {
				transition_in(each_blocks_2[i]);
			}

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks_1[i]);
			}

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o(local) {
			each_blocks_2 = each_blocks_2.filter(Boolean);
			for (let i = 0; i < each_blocks_2.length; i += 1) {
				transition_out(each_blocks_2[i]);
			}

			each_blocks_1 = each_blocks_1.filter(Boolean);
			for (let i = 0; i < each_blocks_1.length; i += 1) {
				transition_out(each_blocks_1[i]);
			}

			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks_2, detaching);

			destroy_each(each_blocks_1, detaching);

			destroy_each(each_blocks, detaching);

			dispose();
		}
	};
}

function instance$i($$self, $$props, $$invalidate) {
	let $client;

	let { client } = $$props; component_subscribe($$self, client, $$value => { $client = $$value; $$invalidate('$client', $client); });

  const { secondaryPane } = getContext('secondaryPane');

  const initialState = client.getInitialState();
  let { log } = $client;
  let pinned = null;

  function rewind(logIndex) {
    let state = initialState;
    for (let i = 0; i < log.length; i++) {
      const { action, automatic } = log[i];

      if (!automatic) {
        state = client.reducer(state, action);
      }

      if (action.type == MAKE_MOVE) {
        if (logIndex == 0) {
          break;
        }

        logIndex--;
      }
    }
    return { G: state.G, ctx: state.ctx };
  }

  function OnLogClick(e) {
    const { logIndex } = e.detail;
    const state = rewind(logIndex);
    const renderedLogEntries = log.filter(e => e.action.type == MAKE_MOVE);
    client.overrideGameState(state);

    if (pinned == logIndex) {
      $$invalidate('pinned', pinned = null);
      secondaryPane.set(null);
    } else {
      $$invalidate('pinned', pinned = logIndex);
      const { metadata } = renderedLogEntries[logIndex].action.payload;
      if (metadata) {
        secondaryPane.set({ component: MCTS, metadata });
      }
    }
  }

  function OnMouseEnter(e) {
    const { logIndex } = e.detail;
    if (pinned === null) {
      const state = rewind(logIndex);
      client.overrideGameState(state);
    }
  }

  function OnMouseLeave() {
    if (pinned === null) {
      client.overrideGameState(null);
    }
  }

  function Reset() {
    $$invalidate('pinned', pinned = null);
    client.overrideGameState(null);
    secondaryPane.set(null);
  }

  onDestroy(Reset);

  function OnKeyDown(e) {
    // ESC.
    if (e.keyCode == 27) {
      Reset();
    }
  }

  let renderedLogEntries;
  let turnBoundaries = {};
  let phaseBoundaries = {};

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	$$self.$$.update = ($$dirty = { $client: 1, log: 1, renderedLogEntries: 1 }) => {
		if ($$dirty.$client || $$dirty.log || $$dirty.renderedLogEntries) { {
        $$invalidate('log', log = $client.log);
        $$invalidate('renderedLogEntries', renderedLogEntries = log.filter(e => e.action.type == MAKE_MOVE));
    
        let eventsInCurrentPhase = 0;
        let eventsInCurrentTurn = 0;
    
        $$invalidate('turnBoundaries', turnBoundaries = {});
        $$invalidate('phaseBoundaries', phaseBoundaries = {});
    
        for (let i = 0; i < renderedLogEntries.length; i++) {
          const { action, payload, turn, phase } = renderedLogEntries[i];
    
          eventsInCurrentTurn++;
          eventsInCurrentPhase++;
    
          if (
            i == renderedLogEntries.length - 1 ||
            renderedLogEntries[i + 1].turn != turn
          ) {
            $$invalidate('turnBoundaries', turnBoundaries[i] = eventsInCurrentTurn, turnBoundaries);
            eventsInCurrentTurn = 0;
          }
    
          if (
            i == renderedLogEntries.length - 1 ||
            renderedLogEntries[i + 1].phase != phase
          ) {
            $$invalidate('phaseBoundaries', phaseBoundaries[i] = eventsInCurrentPhase, phaseBoundaries);
            eventsInCurrentPhase = 0;
          }
        }
      } }
	};

	return {
		client,
		pinned,
		OnLogClick,
		OnMouseEnter,
		OnMouseLeave,
		OnKeyDown,
		renderedLogEntries,
		turnBoundaries,
		phaseBoundaries
	};
}

class Log extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1pq5e4b-style")) add_css$g();
		init(this, options, instance$i, create_fragment$i, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/ai/Options.svelte generated by Svelte v3.12.1 */
const { Object: Object_1 } = globals;

function add_css$h() {
	var style = element("style");
	style.id = 'svelte-7cel4i-style';
	style.textContent = "label.svelte-7cel4i{font-weight:bold;color:#999}.option.svelte-7cel4i{margin-bottom:20px}.value.svelte-7cel4i{font-weight:bold}input[type='checkbox'].svelte-7cel4i{vertical-align:middle}";
	append(document.head, style);
}

function get_each_context$6(ctx, list, i) {
	const child_ctx = Object_1.create(ctx);
	child_ctx.key = list[i][0];
	child_ctx.value = list[i][1];
	return child_ctx;
}

// (39:4) {#if value.range}
function create_if_block_1$3(ctx) {
	var span, t0_value = ctx.values[ctx.key] + "", t0, t1, input, input_min_value, input_max_value, dispose;

	function input_change_input_handler() {
		ctx.input_change_input_handler.call(input, ctx);
	}

	return {
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			input = element("input");
			attr(span, "class", "value svelte-7cel4i");
			attr(input, "type", "range");
			attr(input, "min", input_min_value = ctx.value.range.min);
			attr(input, "max", input_max_value = ctx.value.range.max);

			dispose = [
				listen(input, "change", input_change_input_handler),
				listen(input, "input", input_change_input_handler),
				listen(input, "change", ctx.OnChange)
			];
		},

		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			insert(target, t1, anchor);
			insert(target, input, anchor);

			set_input_value(input, ctx.values[ctx.key]);
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.values || changed.bot) && t0_value !== (t0_value = ctx.values[ctx.key] + "")) {
				set_data(t0, t0_value);
			}

			if ((changed.values || changed.Object || changed.bot)) set_input_value(input, ctx.values[ctx.key]);

			if ((changed.bot) && input_min_value !== (input_min_value = ctx.value.range.min)) {
				attr(input, "min", input_min_value);
			}

			if ((changed.bot) && input_max_value !== (input_max_value = ctx.value.range.max)) {
				attr(input, "max", input_max_value);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(span);
				detach(t1);
				detach(input);
			}

			run_all(dispose);
		}
	};
}

// (44:4) {#if typeof value.value === 'boolean'}
function create_if_block$8(ctx) {
	var input, dispose;

	function input_change_handler() {
		ctx.input_change_handler.call(input, ctx);
	}

	return {
		c() {
			input = element("input");
			attr(input, "type", "checkbox");
			attr(input, "class", "svelte-7cel4i");

			dispose = [
				listen(input, "change", input_change_handler),
				listen(input, "change", ctx.OnChange)
			];
		},

		m(target, anchor) {
			insert(target, input, anchor);

			input.checked = ctx.values[ctx.key];
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.values || changed.Object || changed.bot)) input.checked = ctx.values[ctx.key];
		},

		d(detaching) {
			if (detaching) {
				detach(input);
			}

			run_all(dispose);
		}
	};
}

// (35:0) {#each Object.entries(bot.opts()) as [key, value]}
function create_each_block$6(ctx) {
	var div, label, t0_value = ctx.key + "", t0, t1, t2, t3;

	var if_block0 = (ctx.value.range) && create_if_block_1$3(ctx);

	var if_block1 = (typeof ctx.value.value === 'boolean') && create_if_block$8(ctx);

	return {
		c() {
			div = element("div");
			label = element("label");
			t0 = text(t0_value);
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			t3 = space();
			attr(label, "class", "svelte-7cel4i");
			attr(div, "class", "option svelte-7cel4i");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, label);
			append(label, t0);
			append(div, t1);
			if (if_block0) if_block0.m(div, null);
			append(div, t2);
			if (if_block1) if_block1.m(div, null);
			append(div, t3);
		},

		p(changed, ctx) {
			if ((changed.bot) && t0_value !== (t0_value = ctx.key + "")) {
				set_data(t0, t0_value);
			}

			if (ctx.value.range) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_1$3(ctx);
					if_block0.c();
					if_block0.m(div, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (typeof ctx.value.value === 'boolean') {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block$8(ctx);
					if_block1.c();
					if_block1.m(div, t3);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function create_fragment$j(ctx) {
	var each_1_anchor;

	let each_value = ctx.Object.entries(ctx.bot.opts());

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},

		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
		},

		p(changed, ctx) {
			if (changed.Object || changed.bot || changed.values) {
				each_value = ctx.Object.entries(ctx.bot.opts());

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$6(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$6(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach(each_1_anchor);
			}
		}
	};
}

function instance$j($$self, $$props, $$invalidate) {
	let { bot } = $$props;

  let values = {};
  for (let [key, value] of Object.entries(bot.opts())) {
    $$invalidate('values', values[key] = value.value, values);
  }

  function OnChange() {
    for (let [key, value] of Object.entries(values)) {
      bot.setOpt(key, value);
    }
  }

	function input_change_input_handler({ key }) {
		values[key] = to_number(this.value);
		$$invalidate('values', values);
		$$invalidate('Object', Object);
		$$invalidate('bot', bot);
	}

	function input_change_handler({ key }) {
		values[key] = this.checked;
		$$invalidate('values', values);
		$$invalidate('Object', Object);
		$$invalidate('bot', bot);
	}

	$$self.$set = $$props => {
		if ('bot' in $$props) $$invalidate('bot', bot = $$props.bot);
	};

	return {
		bot,
		values,
		OnChange,
		Object,
		input_change_input_handler,
		input_change_handler
	};
}

class Options extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-7cel4i-style")) add_css$h();
		init(this, options, instance$j, create_fragment$j, safe_not_equal, ["bot"]);
	}
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Returns true if a move can be undone.
 */
const CanUndoMove = (G, ctx, move) => {
    function HasUndoable(move) {
        return move.undoable !== undefined;
    }
    function IsFunction(undoable) {
        return undoable instanceof Function;
    }
    if (!HasUndoable(move)) {
        return true;
    }
    if (IsFunction(move.undoable)) {
        return move.undoable(G, ctx);
    }
    return move.undoable;
};
/**
 * CreateGameReducer
 *
 * Creates the main game state reducer.
 */
function CreateGameReducer({ game, isClient, }) {
    game = ProcessGameConfig(game);
    /**
     * GameReducer
     *
     * Redux reducer that maintains the overall game state.
     * @param {object} state - The state before the action.
     * @param {object} action - A Redux action.
     */
    return (state = null, action) => {
        switch (action.type) {
            case GAME_EVENT: {
                state = { ...state, deltalog: [] };
                // Process game events only on the server.
                // These events like `endTurn` typically
                // contain code that may rely on secret state
                // and cannot be computed on the client.
                if (isClient) {
                    return state;
                }
                // Disallow events once the game is over.
                if (state.ctx.gameover !== undefined) {
                    error(`cannot call event after game end`);
                    return state;
                }
                // Ignore the event if the player isn't active.
                if (action.payload.playerID !== null &&
                    action.payload.playerID !== undefined &&
                    !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)) {
                    error(`disallowed event: ${action.payload.type}`);
                    return state;
                }
                // Execute plugins.
                state = Enhance(state, {
                    game,
                    isClient: false,
                    playerID: action.payload.playerID,
                });
                // Process event.
                let newState = game.flow.processEvent(state, action);
                // Execute plugins.
                newState = Flush(newState, { game, isClient: false });
                return { ...newState, _stateID: state._stateID + 1 };
            }
            case MAKE_MOVE: {
                state = { ...state, deltalog: [] };
                // Check whether the move is allowed at this time.
                const move = game.flow.getMove(state.ctx, action.payload.type, action.payload.playerID || state.ctx.currentPlayer);
                if (move === null) {
                    error(`disallowed move: ${action.payload.type}`);
                    return state;
                }
                // Don't run move on client if move says so.
                if (isClient && move.client === false) {
                    return state;
                }
                // Disallow moves once the game is over.
                if (state.ctx.gameover !== undefined) {
                    error(`cannot make move after game end`);
                    return state;
                }
                // Ignore the move if the player isn't active.
                if (action.payload.playerID !== null &&
                    action.payload.playerID !== undefined &&
                    !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)) {
                    error(`disallowed move: ${action.payload.type}`);
                    return state;
                }
                // Execute plugins.
                state = Enhance(state, {
                    game,
                    isClient,
                    playerID: action.payload.playerID,
                });
                // Process the move.
                let G = game.processMove(state, action.payload);
                // The game declared the move as invalid.
                if (G === INVALID_MOVE) {
                    error(`invalid move: ${action.payload.type} args: ${action.payload.args}`);
                    return state;
                }
                // Create a log entry for this move.
                let logEntry = {
                    action,
                    _stateID: state._stateID,
                    turn: state.ctx.turn,
                    phase: state.ctx.phase,
                };
                if (move.redact === true) {
                    logEntry.redact = true;
                }
                const newState = {
                    ...state,
                    G,
                    deltalog: [logEntry],
                    _stateID: state._stateID + 1,
                };
                // Some plugin indicated that it is not suitable to be
                // materialized on the client (and must wait for the server
                // response instead).
                if (isClient && NoClient(newState, { game })) {
                    return state;
                }
                state = newState;
                // If we're on the client, just process the move
                // and no triggers in multiplayer mode.
                // These will be processed on the server, which
                // will send back a state update.
                if (isClient) {
                    state = Flush(state, {
                        game,
                        isClient: true,
                    });
                    return state;
                }
                const prevTurnCount = state.ctx.turn;
                // Allow the flow reducer to process any triggers that happen after moves.
                state = game.flow.processMove(state, action.payload);
                state = Flush(state, { game });
                // Update undo / redo state.
                // Only update undo stack if the turn has not been ended
                if (state.ctx.turn === prevTurnCount && !game.disableUndo) {
                    state._undo = state._undo.concat({
                        G: state.G,
                        ctx: state.ctx,
                        moveType: action.payload.type,
                    });
                }
                // Always reset redo stack when making a move
                state._redo = [];
                return state;
            }
            case RESET:
            case UPDATE:
            case SYNC: {
                return action.state;
            }
            case UNDO: {
                if (game.disableUndo) {
                    error("Undo is not enabled");
                    return state;
                }
                const { _undo, _redo } = state;
                if (_undo.length < 2) {
                    return state;
                }
                const last = _undo[_undo.length - 1];
                const restore = _undo[_undo.length - 2];
                // Only allow undoable moves to be undone.
                const lastMove = game.flow.getMove(restore.ctx, last.moveType, action.payload.playerID);
                if (!CanUndoMove(state.G, state.ctx, lastMove)) {
                    return state;
                }
                return {
                    ...state,
                    G: restore.G,
                    ctx: restore.ctx,
                    _undo: _undo.slice(0, _undo.length - 1),
                    _redo: [last, ..._redo],
                };
            }
            case REDO: {
                const { _undo, _redo } = state;
                if (game.disableUndo) {
                    error("Redo is not enabled");
                    return state;
                }
                if (_redo.length == 0) {
                    return state;
                }
                const first = _redo[0];
                return {
                    ...state,
                    G: first.G,
                    ctx: first.ctx,
                    _undo: [..._undo, first],
                    _redo: _redo.slice(1),
                };
            }
            case PLUGIN: {
                return ProcessAction(state, action, { game });
            }
            default: {
                return state;
            }
        }
    };
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Base class that bots can extend.
 */
class Bot {
    constructor({ enumerate, seed, }) {
        this.enumerateFn = enumerate;
        this.seed = seed;
        this.iterationCounter = 0;
        this._opts = {};
    }
    addOpt({ key, range, initial, }) {
        this._opts[key] = {
            range,
            value: initial,
        };
    }
    getOpt(key) {
        return this._opts[key].value;
    }
    setOpt(key, value) {
        if (key in this._opts) {
            this._opts[key].value = value;
        }
    }
    opts() {
        return this._opts;
    }
    enumerate(G, ctx, playerID) {
        const actions = this.enumerateFn(G, ctx, playerID);
        return actions.map(a => {
            if ('payload' in a) {
                return a;
            }
            if ('move' in a) {
                return makeMove(a.move, a.args, playerID);
            }
            if ('event' in a) {
                return gameEvent(a.event, a.args, playerID);
            }
        });
    }
    random(arg) {
        let number;
        if (this.seed !== undefined) {
            let r = null;
            if (this.prngstate) {
                r = new alea('', { state: this.prngstate });
            }
            else {
                r = new alea(this.seed, { state: true });
            }
            number = r();
            this.prngstate = r.state();
        }
        else {
            number = Math.random();
        }
        if (arg) {
            if (Array.isArray(arg)) {
                const id = Math.floor(number * arg.length);
                return arg[id];
            }
            else {
                return Math.floor(number * arg);
            }
        }
        return number;
    }
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * The number of iterations to run before yielding to
 * the JS event loop (in async mode).
 */
const CHUNK_SIZE = 25;
/**
 * Bot that uses Monte-Carlo Tree Search to find promising moves.
 */
class MCTSBot extends Bot {
    constructor({ enumerate, seed, objectives, game, iterations, playoutDepth, iterationCallback, }) {
        super({ enumerate, seed });
        if (objectives === undefined) {
            objectives = () => ({});
        }
        this.objectives = objectives;
        this.iterationCallback = iterationCallback || (() => { });
        this.reducer = CreateGameReducer({ game });
        this.iterations = iterations;
        this.playoutDepth = playoutDepth;
        this.addOpt({
            key: 'async',
            initial: false,
        });
        this.addOpt({
            key: 'iterations',
            initial: typeof iterations === 'number' ? iterations : 1000,
            range: { min: 1, max: 2000 },
        });
        this.addOpt({
            key: 'playoutDepth',
            initial: typeof playoutDepth === 'number' ? playoutDepth : 50,
            range: { min: 1, max: 100 },
        });
    }
    createNode({ state, parentAction, parent, playerID, }) {
        const { G, ctx } = state;
        let actions = [];
        let objectives = [];
        if (playerID !== undefined) {
            actions = this.enumerate(G, ctx, playerID);
            objectives = this.objectives(G, ctx, playerID);
        }
        else if (ctx.activePlayers) {
            for (let playerID in ctx.activePlayers) {
                actions = actions.concat(this.enumerate(G, ctx, playerID));
                objectives = objectives.concat(this.objectives(G, ctx, playerID));
            }
        }
        else {
            actions = actions.concat(this.enumerate(G, ctx, ctx.currentPlayer));
            objectives = objectives.concat(this.objectives(G, ctx, ctx.currentPlayer));
        }
        return {
            state,
            parent,
            parentAction,
            actions,
            objectives,
            children: [],
            visits: 0,
            value: 0,
        };
    }
    select(node) {
        // This node has unvisited children.
        if (node.actions.length > 0) {
            return node;
        }
        // This is a terminal node.
        if (node.children.length == 0) {
            return node;
        }
        let selectedChild = null;
        let best = 0.0;
        for (const child of node.children) {
            const childVisits = child.visits + Number.EPSILON;
            const uct = child.value / childVisits +
                Math.sqrt((2 * Math.log(node.visits)) / childVisits);
            if (selectedChild == null || uct > best) {
                best = uct;
                selectedChild = child;
            }
        }
        return this.select(selectedChild);
    }
    expand(node) {
        const actions = node.actions;
        if (actions.length == 0 || node.state.ctx.gameover !== undefined) {
            return node;
        }
        const id = this.random(actions.length);
        const action = actions[id];
        node.actions.splice(id, 1);
        const childState = this.reducer(node.state, action);
        const childNode = this.createNode({
            state: childState,
            parentAction: action,
            parent: node,
        });
        node.children.push(childNode);
        return childNode;
    }
    playout({ state }) {
        let playoutDepth = this.getOpt('playoutDepth');
        if (typeof this.playoutDepth === 'function') {
            playoutDepth = this.playoutDepth(state.G, state.ctx);
        }
        for (let i = 0; i < playoutDepth && state.ctx.gameover === undefined; i++) {
            const { G, ctx } = state;
            let playerID = ctx.currentPlayer;
            if (ctx.activePlayers) {
                playerID = Object.keys(ctx.activePlayers)[0];
            }
            const moves = this.enumerate(G, ctx, playerID);
            // Check if any objectives are met.
            const objectives = this.objectives(G, ctx, playerID);
            const score = Object.keys(objectives).reduce((score, key) => {
                const objective = objectives[key];
                if (objective.checker(G, ctx)) {
                    return score + objective.weight;
                }
                return score;
            }, 0.0);
            // If so, stop and return the score.
            if (score > 0) {
                return { score };
            }
            if (!moves || moves.length == 0) {
                return undefined;
            }
            const id = this.random(moves.length);
            const childState = this.reducer(state, moves[id]);
            state = childState;
        }
        return state.ctx.gameover;
    }
    backpropagate(node, result = {}) {
        node.visits++;
        if (result.score !== undefined) {
            node.value += result.score;
        }
        if (result.draw === true) {
            node.value += 0.5;
        }
        if (node.parentAction &&
            result.winner === node.parentAction.payload.playerID) {
            node.value++;
        }
        if (node.parent) {
            this.backpropagate(node.parent, result);
        }
    }
    play(state, playerID) {
        const root = this.createNode({ state, playerID });
        let numIterations = this.getOpt('iterations');
        if (typeof this.iterations === 'function') {
            numIterations = this.iterations(state.G, state.ctx);
        }
        const getResult = () => {
            let selectedChild = null;
            for (const child of root.children) {
                if (selectedChild == null || child.visits > selectedChild.visits) {
                    selectedChild = child;
                }
            }
            const action = selectedChild && selectedChild.parentAction;
            const metadata = root;
            return { action, metadata };
        };
        return new Promise(resolve => {
            const iteration = () => {
                for (let i = 0; i < CHUNK_SIZE && this.iterationCounter < numIterations; i++) {
                    const leaf = this.select(root);
                    const child = this.expand(leaf);
                    const result = this.playout(child);
                    this.backpropagate(child, result);
                    this.iterationCounter++;
                }
                this.iterationCallback({
                    iterationCounter: this.iterationCounter,
                    numIterations,
                    metadata: root,
                });
            };
            this.iterationCounter = 0;
            if (this.getOpt('async')) {
                const asyncIteration = () => {
                    if (this.iterationCounter < numIterations) {
                        iteration();
                        setTimeout(asyncIteration, 0);
                    }
                    else {
                        resolve(getResult());
                    }
                };
                asyncIteration();
            }
            else {
                while (this.iterationCounter < numIterations) {
                    iteration();
                }
                resolve(getResult());
            }
        });
    }
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Bot that picks a move at random.
 */
class RandomBot extends Bot {
    play({ G, ctx }, playerID) {
        const moves = this.enumerate(G, ctx, playerID);
        return Promise.resolve({ action: this.random(moves) });
    }
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Make a single move on the client with a bot.
 *
 * @param {...object} client - The game client.
 * @param {...object} bot - The bot.
 */
async function Step(client, bot) {
    const state = client.store.getState();
    let playerID = state.ctx.currentPlayer;
    if (state.ctx.activePlayers) {
        playerID = Object.keys(state.ctx.activePlayers)[0];
    }
    const { action, metadata } = await bot.play(state, playerID);
    if (action) {
        const a = {
            ...action,
            payload: {
                ...action.payload,
                metadata,
            },
        };
        client.store.dispatch(a);
        return a;
    }
}
/**
 * Simulates the game till the end or a max depth.
 *
 * @param {...object} game - The game object.
 * @param {...object} bots - An array of bots.
 * @param {...object} state - The game state to start from.
 */
async function Simulate({ game, bots, state, depth, }) {
    if (depth === undefined)
        depth = 10000;
    const reducer = CreateGameReducer({ game });
    let metadata = null;
    let iter = 0;
    while (state.ctx.gameover === undefined && iter < depth) {
        let playerID = state.ctx.currentPlayer;
        if (state.ctx.activePlayers) {
            playerID = Object.keys(state.ctx.activePlayers)[0];
        }
        const bot = bots instanceof Bot ? bots : bots[playerID];
        const t = await bot.play(state, playerID);
        if (!t.action) {
            break;
        }
        metadata = t.metadata;
        state = reducer(state, t.action);
        iter++;
    }
    return { state, metadata };
}

/* src/client/debug/ai/AI.svelte generated by Svelte v3.12.1 */

function add_css$i() {
	var style = element("style");
	style.id = 'svelte-hsd9fq-style';
	style.textContent = "li.svelte-hsd9fq{list-style:none;margin:none;margin-bottom:5px}h3.svelte-hsd9fq{text-transform:uppercase}label.svelte-hsd9fq{font-weight:bold;color:#999}input[type='checkbox'].svelte-hsd9fq{vertical-align:middle}";
	append(document.head, style);
}

function get_each_context$7(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.bot = list[i];
	return child_ctx;
}

// (193:4) {:else}
function create_else_block$2(ctx) {
	var p0, t_1, p1;

	return {
		c() {
			p0 = element("p");
			p0.textContent = "No bots available.";
			t_1 = space();
			p1 = element("p");
			p1.innerHTML = `
			        Follow the instructions
			        <a href="https://boardgame.io/documentation/#/tutorial?id=bots" target="_blank">
			          here</a>
			        to set up bots.
			      `;
		},

		m(target, anchor) {
			insert(target, p0, anchor);
			insert(target, t_1, anchor);
			insert(target, p1, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(p0);
				detach(t_1);
				detach(p1);
			}
		}
	};
}

// (191:4) {#if client.multiplayer}
function create_if_block_5(ctx) {
	var p;

	return {
		c() {
			p = element("p");
			p.textContent = "The bot debugger is only available in singleplayer mode.";
		},

		m(target, anchor) {
			insert(target, p, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (145:2) {#if client.game.ai && !client.multiplayer}
function create_if_block$9(ctx) {
	var section0, h30, t1, li0, t2, li1, t3, li2, t4, section1, h31, t6, select, t7, show_if = Object.keys(ctx.bot.opts()).length, t8, if_block1_anchor, current, dispose;

	var hotkey0 = new Hotkey({
		props: {
		value: "1",
		onPress: ctx.Reset,
		label: "reset"
	}
	});

	var hotkey1 = new Hotkey({
		props: {
		value: "2",
		onPress: ctx.Step,
		label: "play"
	}
	});

	var hotkey2 = new Hotkey({
		props: {
		value: "3",
		onPress: ctx.Simulate,
		label: "simulate"
	}
	});

	let each_value = Object.keys(ctx.bots);

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
	}

	var if_block0 = (show_if) && create_if_block_4(ctx);

	var if_block1 = (ctx.botAction || ctx.iterationCounter) && create_if_block_1$4(ctx);

	return {
		c() {
			section0 = element("section");
			h30 = element("h3");
			h30.textContent = "Controls";
			t1 = space();
			li0 = element("li");
			hotkey0.$$.fragment.c();
			t2 = space();
			li1 = element("li");
			hotkey1.$$.fragment.c();
			t3 = space();
			li2 = element("li");
			hotkey2.$$.fragment.c();
			t4 = space();
			section1 = element("section");
			h31 = element("h3");
			h31.textContent = "Bot";
			t6 = space();
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t7 = space();
			if (if_block0) if_block0.c();
			t8 = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
			attr(h30, "class", "svelte-hsd9fq");
			attr(li0, "class", "svelte-hsd9fq");
			attr(li1, "class", "svelte-hsd9fq");
			attr(li2, "class", "svelte-hsd9fq");
			attr(h31, "class", "svelte-hsd9fq");
			if (ctx.selectedBot === void 0) add_render_callback(() => ctx.select_change_handler.call(select));

			dispose = [
				listen(select, "change", ctx.select_change_handler),
				listen(select, "change", ctx.ChangeBot)
			];
		},

		m(target, anchor) {
			insert(target, section0, anchor);
			append(section0, h30);
			append(section0, t1);
			append(section0, li0);
			mount_component(hotkey0, li0, null);
			append(section0, t2);
			append(section0, li1);
			mount_component(hotkey1, li1, null);
			append(section0, t3);
			append(section0, li2);
			mount_component(hotkey2, li2, null);
			insert(target, t4, anchor);
			insert(target, section1, anchor);
			append(section1, h31);
			append(section1, t6);
			append(section1, select);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			select_option(select, ctx.selectedBot);

			insert(target, t7, anchor);
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t8, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			if (changed.bots) {
				each_value = Object.keys(ctx.bots);

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$7(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$7(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}

			if (changed.selectedBot) select_option(select, ctx.selectedBot);

			if (changed.bot) show_if = Object.keys(ctx.bot.opts()).length;

			if (show_if) {
				if (if_block0) {
					if_block0.p(changed, ctx);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_4(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t8.parentNode, t8);
				}
			} else if (if_block0) {
				group_outros();
				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});
				check_outros();
			}

			if (ctx.botAction || ctx.iterationCounter) {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_1$4(ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},

		i(local) {
			if (current) return;
			transition_in(hotkey0.$$.fragment, local);

			transition_in(hotkey1.$$.fragment, local);

			transition_in(hotkey2.$$.fragment, local);

			transition_in(if_block0);
			current = true;
		},

		o(local) {
			transition_out(hotkey0.$$.fragment, local);
			transition_out(hotkey1.$$.fragment, local);
			transition_out(hotkey2.$$.fragment, local);
			transition_out(if_block0);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section0);
			}

			destroy_component(hotkey0);

			destroy_component(hotkey1);

			destroy_component(hotkey2);

			if (detaching) {
				detach(t4);
				detach(section1);
			}

			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach(t7);
			}

			if (if_block0) if_block0.d(detaching);

			if (detaching) {
				detach(t8);
			}

			if (if_block1) if_block1.d(detaching);

			if (detaching) {
				detach(if_block1_anchor);
			}

			run_all(dispose);
		}
	};
}

// (162:8) {#each Object.keys(bots) as bot}
function create_each_block$7(ctx) {
	var option, t_value = ctx.bot + "", t;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = ctx.bot;
			option.value = option.__value;
		},

		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},

		p: noop,

		d(detaching) {
			if (detaching) {
				detach(option);
			}
		}
	};
}

// (168:4) {#if Object.keys(bot.opts()).length}
function create_if_block_4(ctx) {
	var section, h3, t1, label, t3, input, t4, current, dispose;

	var options = new Options({ props: { bot: ctx.bot } });

	return {
		c() {
			section = element("section");
			h3 = element("h3");
			h3.textContent = "Options";
			t1 = space();
			label = element("label");
			label.textContent = "debug";
			t3 = space();
			input = element("input");
			t4 = space();
			options.$$.fragment.c();
			attr(h3, "class", "svelte-hsd9fq");
			attr(label, "class", "svelte-hsd9fq");
			attr(input, "type", "checkbox");
			attr(input, "class", "svelte-hsd9fq");

			dispose = [
				listen(input, "change", ctx.input_change_handler),
				listen(input, "change", ctx.OnDebug)
			];
		},

		m(target, anchor) {
			insert(target, section, anchor);
			append(section, h3);
			append(section, t1);
			append(section, label);
			append(section, t3);
			append(section, input);

			input.checked = ctx.debug;

			append(section, t4);
			mount_component(options, section, null);
			current = true;
		},

		p(changed, ctx) {
			if (changed.debug) input.checked = ctx.debug;

			var options_changes = {};
			if (changed.bot) options_changes.bot = ctx.bot;
			options.$set(options_changes);
		},

		i(local) {
			if (current) return;
			transition_in(options.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(options.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			destroy_component(options);

			run_all(dispose);
		}
	};
}

// (177:4) {#if botAction || iterationCounter}
function create_if_block_1$4(ctx) {
	var section, h3, t1, t2;

	var if_block0 = (ctx.progress && ctx.progress < 1.0) && create_if_block_3(ctx);

	var if_block1 = (ctx.botAction) && create_if_block_2$2(ctx);

	return {
		c() {
			section = element("section");
			h3 = element("h3");
			h3.textContent = "Result";
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			attr(h3, "class", "svelte-hsd9fq");
		},

		m(target, anchor) {
			insert(target, section, anchor);
			append(section, h3);
			append(section, t1);
			if (if_block0) if_block0.m(section, null);
			append(section, t2);
			if (if_block1) if_block1.m(section, null);
		},

		p(changed, ctx) {
			if (ctx.progress && ctx.progress < 1.0) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_3(ctx);
					if_block0.c();
					if_block0.m(section, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.botAction) {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_2$2(ctx);
					if_block1.c();
					if_block1.m(section, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

// (180:6) {#if progress && progress < 1.0}
function create_if_block_3(ctx) {
	var progress_1;

	return {
		c() {
			progress_1 = element("progress");
			progress_1.value = ctx.progress;
		},

		m(target, anchor) {
			insert(target, progress_1, anchor);
		},

		p(changed, ctx) {
			if (changed.progress) {
				progress_1.value = ctx.progress;
			}
		},

		d(detaching) {
			if (detaching) {
				detach(progress_1);
			}
		}
	};
}

// (184:6) {#if botAction}
function create_if_block_2$2(ctx) {
	var li0, t0, t1, t2, li1, t3, t4_value = JSON.stringify(ctx.botActionArgs) + "", t4;

	return {
		c() {
			li0 = element("li");
			t0 = text("Action: ");
			t1 = text(ctx.botAction);
			t2 = space();
			li1 = element("li");
			t3 = text("Args: ");
			t4 = text(t4_value);
			attr(li0, "class", "svelte-hsd9fq");
			attr(li1, "class", "svelte-hsd9fq");
		},

		m(target, anchor) {
			insert(target, li0, anchor);
			append(li0, t0);
			append(li0, t1);
			insert(target, t2, anchor);
			insert(target, li1, anchor);
			append(li1, t3);
			append(li1, t4);
		},

		p(changed, ctx) {
			if (changed.botAction) {
				set_data(t1, ctx.botAction);
			}

			if ((changed.botActionArgs) && t4_value !== (t4_value = JSON.stringify(ctx.botActionArgs) + "")) {
				set_data(t4, t4_value);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(li0);
				detach(t2);
				detach(li1);
			}
		}
	};
}

function create_fragment$k(ctx) {
	var section, current_block_type_index, if_block, current, dispose;

	var if_block_creators = [
		create_if_block$9,
		create_if_block_5,
		create_else_block$2
	];

	var if_blocks = [];

	function select_block_type(changed, ctx) {
		if (ctx.client.game.ai && !ctx.client.multiplayer) return 0;
		if (ctx.client.multiplayer) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(null, ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			section = element("section");
			if_block.c();
			dispose = listen(window, "keydown", ctx.OnKeyDown);
		},

		m(target, anchor) {
			insert(target, section, anchor);
			if_blocks[current_block_type_index].m(section, null);
			current = true;
		},

		p(changed, ctx) {
			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(changed, ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});
				check_outros();

				if_block = if_blocks[current_block_type_index];
				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}
				transition_in(if_block, 1);
				if_block.m(section, null);
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			if_blocks[current_block_type_index].d();
			dispose();
		}
	};
}

function instance$k($$self, $$props, $$invalidate) {
	let { client } = $$props;

  const { secondaryPane } = getContext('secondaryPane');

  const bots = {
    'MCTS': MCTSBot,
    'Random': RandomBot,
  };

  let debug = false;
  let progress = null;
  let iterationCounter = 0;
  let metadata = null;
  const iterationCallback = ({ iterationCounter: c, numIterations, metadata: m }) => {
    $$invalidate('iterationCounter', iterationCounter = c);
    $$invalidate('progress', progress = c / numIterations);
    metadata = m;

    if (debug && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    }
  };

  function OnDebug() {
    if (debug && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    } else {
      secondaryPane.set(null);
    }
  }

  let bot;
  if (client.game.ai) {
    $$invalidate('bot', bot = new MCTSBot({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback,
    }));
    bot.setOpt('async', true);
  }

  let selectedBot;
  let botAction;
  let botActionArgs;
  function ChangeBot() {
    const botConstructor = bots[selectedBot];
    $$invalidate('bot', bot = new botConstructor({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback,
    }));
    bot.setOpt('async', true);
    $$invalidate('botAction', botAction = null);
    metadata = null;
    secondaryPane.set(null);
    $$invalidate('iterationCounter', iterationCounter = 0);
  }

  async function Step$1() {
    $$invalidate('botAction', botAction = null);
    metadata = null;
    $$invalidate('iterationCounter', iterationCounter = 0);

    const t = await Step(client, bot);

    if (t) {
      $$invalidate('botAction', botAction = t.payload.type);
      $$invalidate('botActionArgs', botActionArgs = t.payload.args);
    }
  }

  function Simulate(iterations = 10000, sleepTimeout = 100) {
    $$invalidate('botAction', botAction = null);
    metadata = null;
    $$invalidate('iterationCounter', iterationCounter = 0);
    const step = async () => {
      for (let i = 0; i < iterations; i++) {
        const action = await Step(client, bot);
        if (!action) break;
        await new Promise(resolve => setTimeout(resolve, sleepTimeout));
      }
    };

    return step();
  }

  function Exit() {
    client.overrideGameState(null);
    secondaryPane.set(null);
    $$invalidate('debug', debug = false);
  }

  function Reset() {
    client.reset();
    $$invalidate('botAction', botAction = null);
    metadata = null;
    $$invalidate('iterationCounter', iterationCounter = 0);
    Exit();
  }

  function OnKeyDown(e) {
    // ESC.
    if (e.keyCode == 27) {
      Exit();
    }
  }

  onDestroy(Exit);

	function select_change_handler() {
		selectedBot = select_value(this);
		$$invalidate('selectedBot', selectedBot);
		$$invalidate('bots', bots);
	}

	function input_change_handler() {
		debug = this.checked;
		$$invalidate('debug', debug);
	}

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return {
		client,
		bots,
		debug,
		progress,
		iterationCounter,
		OnDebug,
		bot,
		selectedBot,
		botAction,
		botActionArgs,
		ChangeBot,
		Step: Step$1,
		Simulate,
		Reset,
		OnKeyDown,
		select_change_handler,
		input_change_handler
	};
}

class AI extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-hsd9fq-style")) add_css$i();
		init(this, options, instance$k, create_fragment$k, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/Debug.svelte generated by Svelte v3.12.1 */

function add_css$j() {
	var style = element("style");
	style.id = 'svelte-1h5kecx-style';
	style.textContent = ".debug-panel.svelte-1h5kecx{position:fixed;color:#555;font-family:monospace;display:flex;flex-direction:row;text-align:left;right:0;top:0;height:100%;font-size:14px;box-sizing:border-box;opacity:0.9}.pane.svelte-1h5kecx{flex-grow:2;overflow-x:hidden;overflow-y:scroll;background:#fefefe;padding:20px;border-left:1px solid #ccc;box-shadow:-1px 0 5px rgba(0, 0, 0, 0.2);box-sizing:border-box;width:280px}.secondary-pane.svelte-1h5kecx{background:#fefefe;overflow-y:scroll}.debug-panel.svelte-1h5kecx button, select{cursor:pointer;outline:none;background:#eee;border:1px solid #bbb;color:#555;padding:3px;border-radius:3px}.debug-panel.svelte-1h5kecx button{padding-left:10px;padding-right:10px}.debug-panel.svelte-1h5kecx button:hover{background:#ddd}.debug-panel.svelte-1h5kecx button:active{background:#888;color:#fff}.debug-panel.svelte-1h5kecx section{margin-bottom:20px}";
	append(document.head, style);
}

// (112:0) {#if visible}
function create_if_block$a(ctx) {
	var div1, t0, div0, t1, div1_transition, current;

	var menu = new Menu({
		props: {
		panes: ctx.panes,
		pane: ctx.pane
	}
	});
	menu.$on("change", ctx.MenuChange);

	var switch_value = ctx.panes[ctx.pane].component;

	function switch_props(ctx) {
		return { props: { client: ctx.client } };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	var if_block = (ctx.$secondaryPane) && create_if_block_1$5(ctx);

	return {
		c() {
			div1 = element("div");
			menu.$$.fragment.c();
			t0 = space();
			div0 = element("div");
			if (switch_instance) switch_instance.$$.fragment.c();
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "pane svelte-1h5kecx");
			attr(div1, "class", "debug-panel svelte-1h5kecx");
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			mount_component(menu, div1, null);
			append(div1, t0);
			append(div1, div0);

			if (switch_instance) {
				mount_component(switch_instance, div0, null);
			}

			append(div1, t1);
			if (if_block) if_block.m(div1, null);
			current = true;
		},

		p(changed, ctx) {
			var menu_changes = {};
			if (changed.pane) menu_changes.pane = ctx.pane;
			menu.$set(menu_changes);

			var switch_instance_changes = {};
			if (changed.client) switch_instance_changes.client = ctx.client;

			if (switch_value !== (switch_value = ctx.panes[ctx.pane].component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div0, null);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}

			if (ctx.$secondaryPane) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_1$5(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div1, null);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(menu.$$.fragment, local);

			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

			transition_in(if_block);

			add_render_callback(() => {
				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 400 }, true);
				div1_transition.run(1);
			});

			current = true;
		},

		o(local) {
			transition_out(menu.$$.fragment, local);
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			transition_out(if_block);

			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 400 }, false);
			div1_transition.run(0);

			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			destroy_component(menu);

			if (switch_instance) destroy_component(switch_instance);
			if (if_block) if_block.d();

			if (detaching) {
				if (div1_transition) div1_transition.end();
			}
		}
	};
}

// (118:4) {#if $secondaryPane}
function create_if_block_1$5(ctx) {
	var div, current;

	var switch_value = ctx.$secondaryPane.component;

	function switch_props(ctx) {
		return { props: { metadata: ctx.$secondaryPane.metadata } };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) switch_instance.$$.fragment.c();
			attr(div, "class", "secondary-pane svelte-1h5kecx");
		},

		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;
		},

		p(changed, ctx) {
			var switch_instance_changes = {};
			if (changed.$secondaryPane) switch_instance_changes.metadata = ctx.$secondaryPane.metadata;

			if (switch_value !== (switch_value = ctx.$secondaryPane.component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},

		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

			current = true;
		},

		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if (switch_instance) destroy_component(switch_instance);
		}
	};
}

function create_fragment$l(ctx) {
	var if_block_anchor, current, dispose;

	var if_block = (ctx.visible) && create_if_block$a(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
			dispose = listen(window, "keypress", ctx.Keypress);
		},

		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$a(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (if_block) if_block.d(detaching);

			if (detaching) {
				detach(if_block_anchor);
			}

			dispose();
		}
	};
}

function instance$l($$self, $$props, $$invalidate) {
	let $secondaryPane;

	let { client } = $$props;

  const panes = {
    main: { label: 'Main', shortcut: 'm', component: Main },
    log: { label: 'Log', shortcut: 'l', component: Log },
    info: { label: 'Info', shortcut: 'i', component: Info },
    ai: { label: 'AI', shortcut: 'a', component: AI },
  };

  const disableHotkeys = writable(false);
  const secondaryPane = writable(null); component_subscribe($$self, secondaryPane, $$value => { $secondaryPane = $$value; $$invalidate('$secondaryPane', $secondaryPane); });

  setContext('hotkeys', { disableHotkeys });
  setContext('secondaryPane', { secondaryPane });

  let pane = 'main';
  function MenuChange(e) {
    $$invalidate('pane', pane = e.detail);
  }

  let visible = true;
  function Keypress(e) {
    // Toggle debugger visibilty
    if (e.key == '.') {
      $$invalidate('visible', visible = !visible);
      return;
    }
    // Set displayed pane
    if (!visible) return;
    Object.entries(panes).forEach(([key, { shortcut }]) => {
      if (e.key == shortcut) {
        $$invalidate('pane', pane = key);
      }
    });
  }

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return {
		client,
		panes,
		secondaryPane,
		pane,
		MenuChange,
		visible,
		Keypress,
		$secondaryPane
	};
}

class Debug extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1h5kecx-style")) add_css$j();
		init(this, options, instance$l, create_fragment$l, safe_not_equal, ["client"]);
	}
}

/*
 * Copyright 2020 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Creates the initial game state.
 */
function InitializeGame({ game, numPlayers, setupData, }) {
    game = ProcessGameConfig(game);
    if (!numPlayers) {
        numPlayers = 2;
    }
    let ctx = game.flow.ctx(numPlayers);
    let state = {
        // User managed state.
        G: {},
        // Framework managed state.
        ctx,
        // Plugin related state.
        plugins: {},
    };
    // Run plugins over initial state.
    state = Setup(state, { game });
    state = Enhance(state, { game, playerID: undefined });
    const enhancedCtx = EnhanceCtx(state);
    state.G = game.setup(enhancedCtx, setupData);
    let initial = {
        ...state,
        // List of {G, ctx} pairs that can be undone.
        _undo: [],
        // List of {G, ctx} pairs that can be redone.
        _redo: [],
        // A monotonically non-decreasing ID to ensure that
        // state updates are only allowed from clients that
        // are at the same version that the server.
        _stateID: 0,
    };
    initial = game.flow.init(initial);
    initial = Flush(initial, { game });
    return initial;
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * createDispatchers
 *
 * Create action dispatcher wrappers with bound playerID and credentials
 */
function createDispatchers(storeActionType, innerActionNames, store, playerID, credentials, multiplayer) {
    return innerActionNames.reduce((dispatchers, name) => {
        dispatchers[name] = function (...args) {
            let assumedPlayerID = playerID;
            // In singleplayer mode, if the client does not have a playerID
            // associated with it, we attach the currentPlayer as playerID.
            if (!multiplayer && (playerID === null || playerID === undefined)) {
                const state = store.getState();
                assumedPlayerID = state.ctx.currentPlayer;
            }
            store.dispatch(ActionCreators[storeActionType](name, args, assumedPlayerID, credentials));
        };
        return dispatchers;
    }, {});
}
// Creates a set of dispatchers to make moves.
const createMoveDispatchers = createDispatchers.bind(null, 'makeMove');
// Creates a set of dispatchers to dispatch game flow events.
const createEventDispatchers = createDispatchers.bind(null, 'gameEvent');
// Creates a set of dispatchers to dispatch actions to plugins.
const createPluginDispatchers = createDispatchers.bind(null, 'plugin');
/**
 * Implementation of Client (see below).
 */
class _ClientImpl {
    constructor({ game, debug, numPlayers, multiplayer, gameID, playerID, credentials, enhancer, }) {
        this.game = ProcessGameConfig(game);
        this.playerID = playerID;
        this.gameID = gameID;
        this.credentials = credentials;
        this.multiplayer = multiplayer;
        this.debug = debug;
        this.gameStateOverride = null;
        this.subscribers = {};
        this._running = false;
        this.reducer = CreateGameReducer({
            game: this.game,
            isClient: multiplayer !== undefined,
        });
        this.initialState = null;
        if (!multiplayer) {
            this.initialState = InitializeGame({ game: this.game, numPlayers });
        }
        this.reset = () => {
            this.store.dispatch(reset(this.initialState));
        };
        this.undo = () => {
            this.store.dispatch(undo(this.playerID, this.credentials));
        };
        this.redo = () => {
            this.store.dispatch(redo(this.playerID, this.credentials));
        };
        this.store = null;
        this.log = [];
        /**
         * Middleware that manages the log object.
         * Reducers generate deltalogs, which are log events
         * that are the result of application of a single action.
         * The master may also send back a deltalog or the entire
         * log depending on the type of request.
         * The middleware below takes care of all these cases while
         * managing the log object.
         */
        const LogMiddleware = (store) => (next) => (action) => {
            const result = next(action);
            const state = store.getState();
            switch (action.type) {
                case MAKE_MOVE:
                case GAME_EVENT: {
                    const deltalog = state.deltalog;
                    this.log = [...this.log, ...deltalog];
                    break;
                }
                case RESET: {
                    this.log = [];
                    break;
                }
                case UPDATE: {
                    let id = -1;
                    if (this.log.length > 0) {
                        id = this.log[this.log.length - 1]._stateID;
                    }
                    let deltalog = action.deltalog || [];
                    // Filter out actions that are already present
                    // in the current log. This may occur when the
                    // client adds an entry to the log followed by
                    // the update from the master here.
                    deltalog = deltalog.filter(l => l._stateID > id);
                    this.log = [...this.log, ...deltalog];
                    break;
                }
                case SYNC: {
                    this.initialState = action.initialState;
                    this.log = action.log || [];
                    break;
                }
            }
            return result;
        };
        /**
         * Middleware that intercepts actions and sends them to the master,
         * which keeps the authoritative version of the state.
         */
        const TransportMiddleware = (store) => (next) => (action) => {
            const baseState = store.getState();
            const result = next(action);
            if (!('clientOnly' in action)) {
                this.transport.onAction(baseState, action);
            }
            return result;
        };
        /**
         * Middleware that intercepts actions and invokes the subscription callback.
         */
        const SubscriptionMiddleware = () => (next) => (action) => {
            const result = next(action);
            this.notifySubscribers();
            return result;
        };
        if (enhancer !== undefined) {
            enhancer = redux.compose(redux.applyMiddleware(SubscriptionMiddleware, TransportMiddleware, LogMiddleware), enhancer);
        }
        else {
            enhancer = redux.applyMiddleware(SubscriptionMiddleware, TransportMiddleware, LogMiddleware);
        }
        this.store = redux.createStore(this.reducer, this.initialState, enhancer);
        this.transport = {
            isConnected: true,
            onAction: () => { },
            subscribe: () => { },
            subscribeGameMetadata: () => { },
            connect: () => { },
            disconnect: () => { },
            updateGameID: () => { },
            updatePlayerID: () => { },
        };
        if (multiplayer) {
            // typeof multiplayer is 'function'
            this.transport = multiplayer({
                gameKey: game,
                game: this.game,
                store: this.store,
                gameID,
                playerID,
                gameName: this.game.name,
                numPlayers,
            });
        }
        this.createDispatchers();
        this.transport.subscribeGameMetadata(metadata => {
            this.gameMetadata = metadata;
        });
        this._debugPanel = null;
    }
    notifySubscribers() {
        Object.values(this.subscribers).forEach(fn => fn(this.getState()));
    }
    overrideGameState(state) {
        this.gameStateOverride = state;
        this.notifySubscribers();
    }
    start() {
        this.transport.connect();
        this._running = true;
        let debugImpl = null;
        if (process.env.NODE_ENV !== 'production') {
            debugImpl = Debug;
        }
        if (this.debug && this.debug !== true && this.debug.impl) {
            debugImpl = this.debug.impl;
        }
        if (debugImpl !== null &&
            this.debug !== false &&
            this._debugPanel == null &&
            typeof document !== 'undefined') {
            let target = document.body;
            if (this.debug &&
                this.debug !== true &&
                this.debug.target !== undefined) {
                target = this.debug.target;
            }
            if (target) {
                this._debugPanel = new debugImpl({
                    target,
                    props: {
                        client: this,
                    },
                });
            }
        }
    }
    stop() {
        this.transport.disconnect();
        this._running = false;
        if (this._debugPanel != null) {
            this._debugPanel.$destroy();
            this._debugPanel = null;
        }
    }
    subscribe(fn) {
        const id = Object.keys(this.subscribers).length;
        this.subscribers[id] = fn;
        this.transport.subscribe(() => this.notifySubscribers());
        if (this._running || !this.multiplayer) {
            fn(this.getState());
        }
        // Return a handle that allows the caller to unsubscribe.
        return () => {
            delete this.subscribers[id];
        };
    }
    getInitialState() {
        return this.initialState;
    }
    getState() {
        let state = this.store.getState();
        if (this.gameStateOverride !== null) {
            state = this.gameStateOverride;
        }
        // This is the state before a sync with the game master.
        if (state === null) {
            return state;
        }
        // isActive.
        let isActive = true;
        const isPlayerActive = this.game.flow.isPlayerActive(state.G, state.ctx, this.playerID);
        if (this.multiplayer && !isPlayerActive) {
            isActive = false;
        }
        if (!this.multiplayer &&
            this.playerID !== null &&
            this.playerID !== undefined &&
            !isPlayerActive) {
            isActive = false;
        }
        if (state.ctx.gameover !== undefined) {
            isActive = false;
        }
        // Secrets are normally stripped on the server,
        // but we also strip them here so that game developers
        // can see their effects while prototyping.
        const G = this.game.playerView(state.G, state.ctx, this.playerID);
        // Combine into return value.
        return {
            ...state,
            G,
            log: this.log,
            isActive,
            isConnected: this.transport.isConnected,
        };
    }
    createDispatchers() {
        this.moves = createMoveDispatchers(this.game.moveNames, this.store, this.playerID, this.credentials, this.multiplayer);
        this.events = createEventDispatchers(this.game.flow.enabledEventNames, this.store, this.playerID, this.credentials, this.multiplayer);
        this.plugins = createPluginDispatchers(this.game.pluginNames, this.store, this.playerID, this.credentials, this.multiplayer);
    }
    updatePlayerID(playerID) {
        this.playerID = playerID;
        this.createDispatchers();
        this.transport.updatePlayerID(playerID);
        this.notifySubscribers();
    }
    updateGameID(gameID) {
        this.gameID = gameID;
        this.createDispatchers();
        this.transport.updateGameID(gameID);
        this.notifySubscribers();
    }
    updateCredentials(credentials) {
        this.credentials = credentials;
        this.createDispatchers();
        this.notifySubscribers();
    }
}
/**
 * Client
 *
 * boardgame.io JS client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to a falsy value or a transportFactory, e.g., SocketIO()
 * @param {...object} gameID - The gameID that you want to connect to.
 * @param {...object} playerID - The playerID associated with this client.
 * @param {...string} credentials - The authentication credentials associated with this client.
 *
 * Returns:
 *   A JS object that provides an API to interact with the
 *   game by dispatching moves and events.
 */
function Client(opts) {
    return new _ClientImpl(opts);
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Client
 *
 * boardgame.io React client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} board - The React component for the game.
 * @param {...object} loading - (optional) The React component for the loading state.
 * @param {...object} multiplayer - Set to a falsy value or a transportFactory, e.g., SocketIO()
 * @param {...object} debug - Enables the Debug UI.
 * @param {...object} enhancer - Optional enhancer to send to the Redux store
 *
 * Returns:
 *   A React component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE, GAME_EVENT, RESET,
 *   UNDO and REDO.
 */
function Client$1(opts) {
    var _a;
    let { game, numPlayers, loading, board, multiplayer, enhancer, debug } = opts;
    // Component that is displayed before the client has synced
    // with the game master.
    if (loading === undefined) {
        const Loading = () => React.createElement("div", { className: "bgio-loading" }, "connecting...");
        loading = Loading;
    }
    /*
     * WrappedBoard
     *
     * The main React component that wraps the passed in
     * board component and adds the API to its props.
     */
    return _a = class WrappedBoard extends React.Component {
            constructor(props) {
                super(props);
                if (debug === undefined) {
                    debug = props.debug;
                }
                this.client = Client({
                    game,
                    debug,
                    numPlayers,
                    multiplayer,
                    gameID: props.gameID,
                    playerID: props.playerID,
                    credentials: props.credentials,
                    enhancer,
                });
            }
            componentDidMount() {
                this.unsubscribe = this.client.subscribe(() => this.forceUpdate());
                this.client.start();
            }
            componentWillUnmount() {
                this.client.stop();
                this.unsubscribe();
            }
            componentDidUpdate(prevProps) {
                if (this.props.gameID != prevProps.gameID) {
                    this.client.updateGameID(this.props.gameID);
                }
                if (this.props.playerID != prevProps.playerID) {
                    this.client.updatePlayerID(this.props.playerID);
                }
                if (this.props.credentials != prevProps.credentials) {
                    this.client.updateCredentials(this.props.credentials);
                }
            }
            render() {
                const state = this.client.getState();
                if (state === null) {
                    return React.createElement(loading);
                }
                let _board = null;
                if (board) {
                    _board = React.createElement(board, {
                        ...state,
                        ...this.props,
                        isMultiplayer: !!multiplayer,
                        moves: this.client.moves,
                        events: this.client.events,
                        gameID: this.client.gameID,
                        playerID: this.client.playerID,
                        reset: this.client.reset,
                        undo: this.client.undo,
                        redo: this.client.redo,
                        log: this.client.log,
                        gameMetadata: this.client.gameMetadata,
                    });
                }
                return React.createElement("div", { className: "bgio-client" }, _board);
            }
        },
        _a.propTypes = {
            // The ID of a game to connect to.
            // Only relevant in multiplayer.
            gameID: PropTypes.string,
            // The ID of the player associated with this client.
            // Only relevant in multiplayer.
            playerID: PropTypes.string,
            // This client's authentication credentials.
            // Only relevant in multiplayer.
            credentials: PropTypes.string,
            // Enable / disable the Debug UI.
            debug: PropTypes.any,
        },
        _a.defaultProps = {
            gameID: 'default',
            playerID: null,
            credentials: null,
            debug: true,
        },
        _a;
}

/**
 * Client
 *
 * boardgame.io React Native client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} board - The React component for the game.
 * @param {...object} loading - (optional) The React component for the loading state.
 * @param {...object} multiplayer - Set to a falsy value or a transportFactory, e.g., SocketIO()
 * @param {...object} enhancer - Optional enhancer to send to the Redux store
 *
 * Returns:
 *   A React Native component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE.
 */

function Client$2(opts) {
  var _class, _temp;

  var game = opts.game,
      numPlayers = opts.numPlayers,
      board = opts.board,
      multiplayer = opts.multiplayer,
      enhancer = opts.enhancer;
  /*
   * WrappedBoard
   *
   * The main React component that wraps the passed in
   * board component and adds the API to its props.
   */

  return _temp = _class =
  /*#__PURE__*/
  function (_React$Component) {
    _inherits(WrappedBoard, _React$Component);

    function WrappedBoard(props) {
      var _this;

      _classCallCheck(this, WrappedBoard);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WrappedBoard).call(this, props));
      _this.client = Client({
        game: game,
        numPlayers: numPlayers,
        multiplayer: multiplayer,
        gameID: props.gameID,
        playerID: props.playerID,
        credentials: props.credentials,
        debug: false,
        enhancer: enhancer
      });
      return _this;
    }

    _createClass(WrappedBoard, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        this.unsubscribe = this.client.subscribe(function () {
          return _this2.forceUpdate();
        });
        this.client.start();
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.client.stop();
        this.unsubscribe();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (prevProps.gameID != this.props.gameID) {
          this.client.updateGameID(this.props.gameID);
        }

        if (prevProps.playerID != this.props.playerID) {
          this.client.updatePlayerID(this.props.playerID);
        }

        if (prevProps.credentials != this.props.credentials) {
          this.client.updateCredentials(this.props.credentials);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _board = null;
        var state = this.client.getState();

        var _this$props = this.props,
            gameID = _this$props.gameID,
            playerID = _this$props.playerID,
            rest = _objectWithoutProperties(_this$props, ["gameID", "playerID"]);

        if (board) {
          _board = React.createElement(board, _objectSpread2({}, state, {}, rest, {
            gameID: gameID,
            playerID: playerID,
            isMultiplayer: !!multiplayer,
            moves: this.client.moves,
            events: this.client.events,
            step: this.client.step,
            reset: this.client.reset,
            undo: this.client.undo,
            redo: this.client.redo,
            gameMetadata: this.client.gameMetadata
          }));
        }

        return _board;
      }
    }]);

    return WrappedBoard;
  }(React.Component), _defineProperty(_class, "propTypes", {
    // The ID of a game to connect to.
    // Only relevant in multiplayer.
    gameID: PropTypes.string,
    // The ID of the player associated with this client.
    // Only relevant in multiplayer.
    playerID: PropTypes.string,
    // This client's authentication credentials.
    // Only relevant in multiplayer.
    credentials: PropTypes.string
  }), _defineProperty(_class, "defaultProps", {
    gameID: 'default',
    playerID: null,
    credentials: null
  }), _temp;
}

var Type;
(function (Type) {
    Type[Type["SYNC"] = 0] = "SYNC";
    Type[Type["ASYNC"] = 1] = "ASYNC";
})(Type || (Type = {}));
class Sync {
    type() {
        return Type.SYNC;
    }
    /**
     * Connect.
     */
    connect() {
        return;
    }
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * InMemory data storage.
 */
class InMemory extends Sync {
    /**
     * Creates a new InMemory storage.
     */
    constructor() {
        super();
        this.state = new Map();
        this.initial = new Map();
        this.metadata = new Map();
        this.log = new Map();
    }
    /**
     * Create a new game.
     */
    createGame(gameID, opts) {
        this.initial.set(gameID, opts.initialState);
        this.setState(gameID, opts.initialState);
        this.setMetadata(gameID, opts.metadata);
    }
    /**
     * Write the game metadata to the in-memory object.
     */
    setMetadata(gameID, metadata) {
        this.metadata.set(gameID, metadata);
    }
    /**
     * Write the game state to the in-memory object.
     */
    setState(gameID, state, deltalog) {
        if (deltalog && deltalog.length > 0) {
            const log = this.log.get(gameID) || [];
            this.log.set(gameID, log.concat(deltalog));
        }
        this.state.set(gameID, state);
    }
    /**
     * Fetches state for a particular gameID.
     */
    fetch(gameID, opts) {
        let result = {};
        if (opts.state) {
            result.state = this.state.get(gameID);
        }
        if (opts.metadata) {
            result.metadata = this.metadata.get(gameID);
        }
        if (opts.log) {
            result.log = this.log.get(gameID) || [];
        }
        if (opts.initialState) {
            result.initialState = this.initial.get(gameID);
        }
        return result;
    }
    /**
     * Remove the game state from the in-memory object.
     */
    wipe(gameID) {
        this.state.delete(gameID);
        this.metadata.delete(gameID);
    }
    /**
     * Return all keys.
     */
    listGames(opts) {
        if (opts && opts.gameName !== undefined) {
            let gameIDs = [];
            this.metadata.forEach((metadata, gameID) => {
                if (metadata.gameName === opts.gameName) {
                    gameIDs.push(gameID);
                }
            });
            return gameIDs;
        }
        return [...this.metadata.keys()];
    }
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
const getPlayerMetadata = (gameMetadata, playerID) => {
    if (gameMetadata && gameMetadata.players) {
        return gameMetadata.players[playerID];
    }
};
function IsSynchronous(storageAPI) {
    return storageAPI.type() === Type.SYNC;
}
/**
 * Redact the log.
 *
 * @param {Array} log - The game log (or deltalog).
 * @param {String} playerID - The playerID that this log is
 *                            to be sent to.
 */
function redactLog(log, playerID) {
    if (log === undefined) {
        return log;
    }
    return log.map(logEvent => {
        // filter for all other players and spectators.
        if (playerID !== null && +playerID === +logEvent.action.payload.playerID) {
            return logEvent;
        }
        if (logEvent.redact !== true) {
            return logEvent;
        }
        const payload = {
            ...logEvent.action.payload,
            args: null,
        };
        const filteredEvent = {
            ...logEvent,
            action: { ...logEvent.action, payload },
        };
        /* eslint-disable-next-line no-unused-vars */
        const { redact, ...remaining } = filteredEvent;
        return remaining;
    });
}
/**
 * Verifies that the game has metadata and is using credentials.
 */
const doesGameRequireAuthentication = (gameMetadata) => {
    if (!gameMetadata)
        return false;
    const { players } = gameMetadata;
    const hasCredentials = Object.keys(players).some(key => {
        return !!(players[key] && players[key].credentials);
    });
    return hasCredentials;
};
/**
 * Verifies that the move came from a player with the correct credentials.
 */
const isActionFromAuthenticPlayer = (actionCredentials, playerMetadata) => {
    if (!actionCredentials)
        return false;
    if (!playerMetadata)
        return false;
    return actionCredentials === playerMetadata.credentials;
};
/**
 * Remove player credentials from action payload
 */
const stripCredentialsFromAction = (action) => {
    // eslint-disable-next-line no-unused-vars
    const { credentials, ...payload } = action.payload;
    return { ...action, payload };
};
/**
 * Master
 *
 * Class that runs the game and maintains the authoritative state.
 * It uses the transportAPI to communicate with clients and the
 * storageAPI to communicate with the database.
 */
class Master {
    constructor(game, storageAPI, transportAPI, auth) {
        this.game = ProcessGameConfig(game);
        this.storageAPI = storageAPI;
        this.transportAPI = transportAPI;
        this.auth = null;
        this.subscribeCallback = () => { };
        this.shouldAuth = () => false;
        if (auth === true) {
            this.auth = isActionFromAuthenticPlayer;
            this.shouldAuth = doesGameRequireAuthentication;
        }
        else if (typeof auth === 'function') {
            this.auth = auth;
            this.shouldAuth = () => true;
        }
    }
    subscribe(fn) {
        this.subscribeCallback = fn;
    }
    /**
     * Called on each move / event made by the client.
     * Computes the new value of the game state and returns it
     * along with a deltalog.
     */
    async onUpdate(credAction, stateID, gameID, playerID) {
        let isActionAuthentic;
        let metadata;
        const credentials = credAction.payload.credentials;
        if (IsSynchronous(this.storageAPI)) {
            ({ metadata } = this.storageAPI.fetch(gameID, { metadata: true }));
            const playerMetadata = getPlayerMetadata(metadata, playerID);
            isActionAuthentic = this.shouldAuth(metadata)
                ? this.auth(credentials, playerMetadata)
                : true;
        }
        else {
            ({ metadata } = await this.storageAPI.fetch(gameID, {
                metadata: true,
            }));
            const playerMetadata = getPlayerMetadata(metadata, playerID);
            isActionAuthentic = this.shouldAuth(metadata)
                ? await this.auth(credentials, playerMetadata)
                : true;
        }
        if (!isActionAuthentic) {
            return { error: 'unauthorized action' };
        }
        let action = stripCredentialsFromAction(credAction);
        const key = gameID;
        let state;
        let result;
        if (IsSynchronous(this.storageAPI)) {
            result = this.storageAPI.fetch(key, { state: true });
        }
        else {
            result = await this.storageAPI.fetch(key, { state: true });
        }
        state = result.state;
        if (state === undefined) {
            error(`game not found, gameID=[${key}]`);
            return { error: 'game not found' };
        }
        if (state.ctx.gameover !== undefined) {
            error(`game over - gameID=[${key}]`);
            return;
        }
        const reducer = CreateGameReducer({
            game: this.game,
        });
        const store = redux.createStore(reducer, state);
        // Only allow UNDO / REDO if there is exactly one player
        // that can make moves right now and the person doing the
        // action is that player.
        if (action.type == UNDO || action.type == REDO) {
            if (state.ctx.currentPlayer !== playerID ||
                state.ctx.activePlayers !== null) {
                error(`playerID=[${playerID}] cannot undo / redo right now`);
                return;
            }
        }
        // Check whether the player is active.
        if (!this.game.flow.isPlayerActive(state.G, state.ctx, playerID)) {
            error(`player not active - playerID=[${playerID}]`);
            return;
        }
        // Check whether the player is allowed to make the move.
        if (action.type == MAKE_MOVE &&
            !this.game.flow.getMove(state.ctx, action.payload.type, playerID)) {
            error(`move not processed - canPlayerMakeMove=false, playerID=[${playerID}]`);
            return;
        }
        if (state._stateID !== stateID) {
            error(`invalid stateID, was=[${stateID}], expected=[${state._stateID}]`);
            return;
        }
        // Update server's version of the store.
        store.dispatch(action);
        state = store.getState();
        this.subscribeCallback({
            state,
            action,
            gameID,
        });
        this.transportAPI.sendAll((playerID) => {
            const filteredState = {
                ...state,
                G: this.game.playerView(state.G, state.ctx, playerID),
                deltalog: undefined,
                _undo: [],
                _redo: [],
            };
            const log = redactLog(state.deltalog, playerID);
            return {
                type: 'update',
                args: [gameID, filteredState, log],
            };
        });
        const { deltalog, ...stateWithoutDeltalog } = state;
        let newMetadata;
        if (metadata &&
            !('gameover' in metadata) &&
            state.ctx.gameover !== undefined) {
            newMetadata = {
                ...metadata,
                gameover: state.ctx.gameover,
            };
        }
        if (IsSynchronous(this.storageAPI)) {
            this.storageAPI.setState(key, stateWithoutDeltalog, deltalog);
            if (newMetadata)
                this.storageAPI.setMetadata(key, newMetadata);
        }
        else {
            const writes = [
                this.storageAPI.setState(key, stateWithoutDeltalog, deltalog),
            ];
            if (newMetadata) {
                writes.push(this.storageAPI.setMetadata(key, newMetadata));
            }
            await Promise.all(writes);
        }
    }
    /**
     * Called when the client connects / reconnects.
     * Returns the latest game state and the entire log.
     */
    async onSync(gameID, playerID, numPlayers) {
        const key = gameID;
        let state;
        let initialState;
        let log;
        let gameMetadata;
        let filteredMetadata;
        let result;
        if (IsSynchronous(this.storageAPI)) {
            result = this.storageAPI.fetch(key, {
                state: true,
                metadata: true,
                log: true,
                initialState: true,
            });
        }
        else {
            result = await this.storageAPI.fetch(key, {
                state: true,
                metadata: true,
                log: true,
                initialState: true,
            });
        }
        state = result.state;
        initialState = result.initialState;
        log = result.log;
        gameMetadata = result.metadata;
        if (gameMetadata) {
            filteredMetadata = Object.values(gameMetadata.players).map(player => {
                const { credentials, ...filteredData } = player;
                return filteredData;
            });
        }
        // If the game doesn't exist, then create one on demand.
        // TODO: Move this out of the sync call.
        if (state === undefined) {
            initialState = state = InitializeGame({ game: this.game, numPlayers });
            this.subscribeCallback({
                state,
                gameID,
            });
            if (IsSynchronous(this.storageAPI)) {
                this.storageAPI.setState(key, state);
            }
            else {
                await this.storageAPI.setState(key, state);
            }
        }
        const filteredState = {
            ...state,
            G: this.game.playerView(state.G, state.ctx, playerID),
            deltalog: undefined,
            _undo: [],
            _redo: [],
        };
        log = redactLog(log, playerID);
        const syncInfo = {
            state: filteredState,
            log,
            filteredMetadata,
            initialState,
        };
        this.transportAPI.send({
            playerID,
            type: 'sync',
            args: [gameID, syncInfo],
        });
        return;
    }
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
class Transport {
    constructor({ store, gameName, playerID, gameID, numPlayers, }) {
        this.store = store;
        this.gameName = gameName || 'default';
        this.playerID = playerID || null;
        this.gameID = gameID || 'default';
        this.numPlayers = numPlayers || 2;
    }
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Returns null if it is not a bot's turn.
 * Otherwise, returns a playerID of a bot that may play now.
 */
function GetBotPlayer(state, bots) {
    if (state.ctx.gameover !== undefined) {
        return null;
    }
    if (state.ctx.activePlayers) {
        for (const key of Object.keys(bots)) {
            if (key in state.ctx.activePlayers) {
                return key;
            }
        }
    }
    else if (state.ctx.currentPlayer in bots) {
        return state.ctx.currentPlayer;
    }
    return null;
}
/**
 * Creates a local version of the master that the client
 * can interact with.
 */
class LocalMaster extends Master {
    constructor({ game, bots }) {
        const clientCallbacks = {};
        const initializedBots = {};
        if (game && game.ai && bots) {
            for (const playerID in bots) {
                const bot = bots[playerID];
                initializedBots[playerID] = new bot({
                    game,
                    enumerate: game.ai.enumerate,
                    seed: game.seed,
                });
            }
        }
        const send = ({ playerID, type, args }) => {
            const callback = clientCallbacks[playerID];
            if (callback !== undefined) {
                callback.apply(null, [type, ...args]);
            }
        };
        const transportAPI = {
            send,
            sendAll: makePlayerData => {
                for (const playerID in clientCallbacks) {
                    const data = makePlayerData(playerID);
                    send({ playerID, ...data });
                }
            },
        };
        super(game, new InMemory(), transportAPI, false);
        this.connect = (gameID, playerID, callback) => {
            clientCallbacks[playerID] = callback;
        };
        this.subscribe(({ state, gameID }) => {
            if (!bots) {
                return;
            }
            const botPlayer = GetBotPlayer(state, initializedBots);
            if (botPlayer !== null) {
                setTimeout(async () => {
                    const botAction = await initializedBots[botPlayer].play(state, botPlayer);
                    await this.onUpdate(botAction.action, state._stateID, gameID, botAction.action.payload.playerID);
                }, 100);
            }
        });
    }
}
/**
 * Local
 *
 * Transport interface that embeds a GameMaster within it
 * that you can connect multiple clients to.
 */
class LocalTransport extends Transport {
    /**
     * Creates a new Mutiplayer instance.
     * @param {string} gameID - The game ID to connect to.
     * @param {string} playerID - The player ID associated with this client.
     * @param {string} gameName - The game type (the `name` field in `Game`).
     * @param {string} numPlayers - The number of players.
     */
    constructor({ master, store, gameID, playerID, gameName, numPlayers, }) {
        super({ store, gameName, playerID, gameID, numPlayers });
        this.master = master;
        this.isConnected = true;
    }
    /**
     * Called when another player makes a move and the
     * master broadcasts the update to other clients (including
     * this one).
     */
    async onUpdate(gameID, state, deltalog) {
        const currentState = this.store.getState();
        if (gameID == this.gameID && state._stateID >= currentState._stateID) {
            const action = update$1(state, deltalog);
            this.store.dispatch(action);
        }
    }
    /**
     * Called when the client first connects to the master
     * and requests the current game state.
     */
    onSync(gameID, syncInfo) {
        if (gameID == this.gameID) {
            const action = sync(syncInfo);
            this.store.dispatch(action);
        }
    }
    /**
     * Called when an action that has to be relayed to the
     * game master is made.
     */
    onAction(state, action) {
        this.master.onUpdate(action, state._stateID, this.gameID, this.playerID);
    }
    /**
     * Connect to the master.
     */
    connect() {
        this.master.connect(this.gameID, this.playerID, (type, ...args) => {
            if (type == 'sync') {
                this.onSync.apply(this, args);
            }
            if (type == 'update') {
                this.onUpdate.apply(this, args);
            }
        });
        this.master.onSync(this.gameID, this.playerID, this.numPlayers);
    }
    /**
     * Disconnect from the master.
     */
    disconnect() { }
    /**
     * Subscribe to connection state changes.
     */
    subscribe() { }
    subscribeGameMetadata() { }
    /**
     * Updates the game id.
     * @param {string} id - The new game id.
     */
    updateGameID(id) {
        this.gameID = id;
        const action = reset(null);
        this.store.dispatch(action);
        this.connect();
    }
    /**
     * Updates the player associated with this client.
     * @param {string} id - The new player id.
     */
    updatePlayerID(id) {
        this.playerID = id;
        const action = reset(null);
        this.store.dispatch(action);
        this.connect();
    }
}
const localMasters = new Map();
function Local(opts) {
    return (transportOpts) => {
        let master;
        if (localMasters.has(transportOpts.gameKey) && !opts) {
            master = localMasters.get(transportOpts.gameKey);
        }
        else {
            master = new LocalMaster({
                game: transportOpts.game,
                bots: opts && opts.bots,
            });
            localMasters.set(transportOpts.gameKey, master);
        }
        return new LocalTransport({ master, ...transportOpts });
    };
}

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * SocketIO
 *
 * Transport interface that interacts with the Master via socket.io.
 */
class SocketIOTransport extends Transport {
    /**
     * Creates a new Mutiplayer instance.
     * @param {object} socket - Override for unit tests.
     * @param {object} socketOpts - Options to pass to socket.io.
     * @param {string} gameID - The game ID to connect to.
     * @param {string} playerID - The player ID associated with this client.
     * @param {string} gameName - The game type (the `name` field in `Game`).
     * @param {string} numPlayers - The number of players.
     * @param {string} server - The game server in the form of 'hostname:port'. Defaults to the server serving the client if not provided.
     */
    constructor({ socket, socketOpts, store, gameID, playerID, gameName, numPlayers, server, } = {}) {
        super({ store, gameName, playerID, gameID, numPlayers });
        this.server = server;
        this.socket = socket;
        this.socketOpts = socketOpts;
        this.isConnected = false;
        this.callback = () => { };
        this.gameMetadataCallback = () => { };
    }
    /**
     * Called when an action that has to be relayed to the
     * game master is made.
     */
    onAction(state, action) {
        this.socket.emit('update', action, state._stateID, this.gameID, this.playerID);
    }
    /**
     * Connect to the server.
     */
    connect() {
        if (!this.socket) {
            if (this.server) {
                let server = this.server;
                if (server.search(/^https?:\/\//) == -1) {
                    server = 'http://' + this.server;
                }
                if (server.substr(-1) != '/') {
                    // add trailing slash if not already present
                    server = server + '/';
                }
                this.socket = io(server + this.gameName, this.socketOpts);
            }
            else {
                this.socket = io('/' + this.gameName, this.socketOpts);
            }
        }
        // Called when another player makes a move and the
        // master broadcasts the update to other clients (including
        // this one).
        this.socket.on('update', (gameID, state, deltalog) => {
            const currentState = this.store.getState();
            if (gameID == this.gameID && state._stateID >= currentState._stateID) {
                const action = update$1(state, deltalog);
                this.store.dispatch(action);
            }
        });
        // Called when the client first connects to the master
        // and requests the current game state.
        this.socket.on('sync', (gameID, syncInfo) => {
            if (gameID == this.gameID) {
                const action = sync(syncInfo);
                this.gameMetadataCallback(syncInfo.filteredMetadata);
                this.store.dispatch(action);
            }
        });
        // Keep track of connection status.
        this.socket.on('connect', () => {
            // Initial sync to get game state.
            this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);
            this.isConnected = true;
            this.callback();
        });
        this.socket.on('disconnect', () => {
            this.isConnected = false;
            this.callback();
        });
    }
    /**
     * Disconnect from the server.
     */
    disconnect() {
        this.socket.close();
        this.socket = null;
        this.isConnected = false;
        this.callback();
    }
    /**
     * Subscribe to connection state changes.
     */
    subscribe(fn) {
        this.callback = fn;
    }
    subscribeGameMetadata(fn) {
        this.gameMetadataCallback = fn;
    }
    /**
     * Updates the game id.
     * @param {string} id - The new game id.
     */
    updateGameID(id) {
        this.gameID = id;
        const action = reset(null);
        this.store.dispatch(action);
        if (this.socket) {
            this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);
        }
    }
    /**
     * Updates the player associated with this client.
     * @param {string} id - The new player id.
     */
    updatePlayerID(id) {
        this.playerID = id;
        const action = reset(null);
        this.store.dispatch(action);
        if (this.socket) {
            this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);
        }
    }
}
function SocketIO({ server, socketOpts } = {}) {
    return (transportOpts) => new SocketIOTransport({
        server,
        socketOpts,
        ...transportOpts,
    });
}

exports.Client = Client;
exports.Local = Local;
exports.MCTSBot = MCTSBot;
exports.RandomBot = RandomBot;
exports.ReactClient = Client$1;
exports.ReactNativeClient = Client$2;
exports.Simulate = Simulate;
exports.SocketIO = SocketIO;
exports.Step = Step;
exports.TurnOrder = TurnOrder;
