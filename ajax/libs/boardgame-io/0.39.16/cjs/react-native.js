'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('./Debug-0ac3084e.js');
require('redux');
var turnOrder = require('./turn-order-d6c2e620.js');
require('immer');
require('./reducer-76d3a4df.js');
require('flatted');
require('./ai-1fb7bf89.js');
require('./initialize-18a8be06.js');
var client = require('./client-35f9483f.js');
var React = _interopDefault(require('react'));
var PropTypes = _interopDefault(require('prop-types'));

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

function Client(opts) {
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
    turnOrder._inherits(WrappedBoard, _React$Component);

    function WrappedBoard(props) {
      var _this;

      turnOrder._classCallCheck(this, WrappedBoard);

      _this = turnOrder._possibleConstructorReturn(this, turnOrder._getPrototypeOf(WrappedBoard).call(this, props));
      _this.client = client.Client({
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

    turnOrder._createClass(WrappedBoard, [{
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
            rest = turnOrder._objectWithoutProperties(_this$props, ["gameID", "playerID"]);

        if (board) {
          _board = React.createElement(board, turnOrder._objectSpread2({}, state, {}, rest, {
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
  }(React.Component), turnOrder._defineProperty(_class, "propTypes", {
    // The ID of a game to connect to.
    // Only relevant in multiplayer.
    gameID: PropTypes.string,
    // The ID of the player associated with this client.
    // Only relevant in multiplayer.
    playerID: PropTypes.string,
    // This client's authentication credentials.
    // Only relevant in multiplayer.
    credentials: PropTypes.string
  }), turnOrder._defineProperty(_class, "defaultProps", {
    gameID: 'default',
    playerID: null,
    credentials: null
  }), _temp;
}

exports.Client = Client;
