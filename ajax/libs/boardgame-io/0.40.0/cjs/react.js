'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('./Debug-02ceb617.js');
require('redux');
var turnOrder = require('./turn-order-7481bb3a.js');
require('immer');
require('./reducer-f0b0f23d.js');
require('flatted');
var ai = require('./ai-cf4f037d.js');
require('./initialize-62a2cac2.js');
var client = require('./client-cd42af51.js');
var client$1 = require('./client-6504cb9e.js');
var React = _interopDefault(require('react'));
var PropTypes = _interopDefault(require('prop-types'));
var Cookies = _interopDefault(require('react-cookies'));
require('./base-bdd9c13b.js');
var socketio = require('./socketio-35d83e23.js');
require('./master-d82e57b5.js');
require('socket.io-client');

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
function Client(opts) {
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
                this.client = client.Client({
                    game,
                    debug,
                    numPlayers,
                    multiplayer,
                    matchID: props.matchID,
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
                if (this.props.matchID != prevProps.matchID) {
                    this.client.updateMatchID(this.props.matchID);
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
                        matchID: this.client.matchID,
                        playerID: this.client.playerID,
                        reset: this.client.reset,
                        undo: this.client.undo,
                        redo: this.client.redo,
                        log: this.client.log,
                        matchData: this.client.matchData,
                    });
                }
                return React.createElement("div", { className: "bgio-client" }, _board);
            }
        },
        _a.propTypes = {
            // The ID of a game to connect to.
            // Only relevant in multiplayer.
            matchID: PropTypes.string,
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
            matchID: 'default',
            playerID: null,
            credentials: null,
            debug: true,
        },
        _a;
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
class _LobbyConnectionImpl {
    constructor({ server, gameComponents, playerName, playerCredentials, }) {
        this.client = new client$1.LobbyClient({ server });
        this.gameComponents = gameComponents;
        this.playerName = playerName || 'Visitor';
        this.playerCredentials = playerCredentials;
        this.matches = [];
    }
    async refresh() {
        try {
            this.matches = [];
            const games = await this.client.listGames();
            for (const game of games) {
                if (!this._getGameComponents(game))
                    continue;
                const { matches } = await this.client.listMatches(game);
                this.matches = this.matches.concat(matches);
            }
        }
        catch (error) {
            throw new Error('failed to retrieve list of matches (' + error + ')');
        }
    }
    _getMatchInstance(matchID) {
        for (let inst of this.matches) {
            if (inst['matchID'] === matchID)
                return inst;
        }
    }
    _getGameComponents(gameName) {
        for (let comp of this.gameComponents) {
            if (comp.game.name === gameName)
                return comp;
        }
    }
    _findPlayer(playerName) {
        for (let inst of this.matches) {
            if (inst.players.some(player => player.name === playerName))
                return inst;
        }
    }
    async join(gameName, matchID, playerID) {
        try {
            let inst = this._findPlayer(this.playerName);
            if (inst) {
                throw new Error('player has already joined ' + inst.matchID);
            }
            inst = this._getMatchInstance(matchID);
            if (!inst) {
                throw new Error('game instance ' + matchID + ' not found');
            }
            const json = await this.client.joinMatch(gameName, matchID, {
                playerID,
                playerName: this.playerName,
            });
            inst.players[Number.parseInt(playerID)].name = this.playerName;
            this.playerCredentials = json.playerCredentials;
        }
        catch (error) {
            throw new Error('failed to join match ' + matchID + ' (' + error + ')');
        }
    }
    async leave(gameName, matchID) {
        try {
            let inst = this._getMatchInstance(matchID);
            if (!inst)
                throw new Error('match instance not found');
            for (const player of inst.players) {
                if (player.name === this.playerName) {
                    await this.client.leaveMatch(gameName, matchID, {
                        playerID: player.id.toString(),
                        credentials: this.playerCredentials,
                    });
                    delete player.name;
                    delete this.playerCredentials;
                    return;
                }
            }
            throw new Error('player not found in match');
        }
        catch (error) {
            throw new Error('failed to leave match ' + matchID + ' (' + error + ')');
        }
    }
    async disconnect() {
        let inst = this._findPlayer(this.playerName);
        if (inst) {
            await this.leave(inst.gameName, inst.matchID);
        }
        this.matches = [];
        this.playerName = 'Visitor';
    }
    async create(gameName, numPlayers) {
        try {
            const comp = this._getGameComponents(gameName);
            if (!comp)
                throw new Error('game not found');
            if (numPlayers < comp.game.minPlayers ||
                numPlayers > comp.game.maxPlayers)
                throw new Error('invalid number of players ' + numPlayers);
            await this.client.createMatch(gameName, { numPlayers });
        }
        catch (error) {
            throw new Error('failed to create match for ' + gameName + ' (' + error + ')');
        }
    }
}
/**
 * LobbyConnection
 *
 * Lobby model.
 *
 * @param {string}   server - '<host>:<port>' of the server.
 * @param {Array}    gameComponents - A map of Board and Game objects for the supported games.
 * @param {string}   playerName - The name of the player.
 * @param {string}   playerCredentials - The credentials currently used by the player, if any.
 *
 * Returns:
 *   A JS object that synchronizes the list of running game instances with the server and provides an API to create/join/start instances.
 */
function LobbyConnection(opts) {
    return new _LobbyConnectionImpl(opts);
}

var LobbyLoginForm = /*#__PURE__*/function (_React$Component) {
  turnOrder._inherits(LobbyLoginForm, _React$Component);

  var _super = turnOrder._createSuper(LobbyLoginForm);

  function LobbyLoginForm() {
    var _this;

    turnOrder._classCallCheck(this, LobbyLoginForm);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "state", {
      playerName: _this.props.playerName,
      nameErrorMsg: ''
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "onClickEnter", function () {
      if (_this.state.playerName === '') return;

      _this.props.onEnter(_this.state.playerName);
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "onKeyPress", function (event) {
      if (event.key === 'Enter') {
        _this.onClickEnter();
      }
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "onChangePlayerName", function (event) {
      var name = event.target.value.trim();

      _this.setState({
        playerName: name,
        nameErrorMsg: name.length > 0 ? '' : 'empty player name'
      });
    });

    return _this;
  }

  turnOrder._createClass(LobbyLoginForm, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
        className: "phase-title"
      }, "Choose a player name:"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: this.state.playerName,
        onChange: this.onChangePlayerName,
        onKeyPress: this.onKeyPress
      }), /*#__PURE__*/React.createElement("span", {
        className: "buttons"
      }, /*#__PURE__*/React.createElement("button", {
        className: "buttons",
        onClick: this.onClickEnter
      }, "Enter")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
        className: "error-msg"
      }, this.state.nameErrorMsg, /*#__PURE__*/React.createElement("br", null)));
    }
  }]);

  return LobbyLoginForm;
}(React.Component);

turnOrder._defineProperty(LobbyLoginForm, "propTypes", {
  playerName: PropTypes.string,
  onEnter: PropTypes.func.isRequired
});

turnOrder._defineProperty(LobbyLoginForm, "defaultProps", {
  playerName: ''
});

var LobbyMatchInstance = /*#__PURE__*/function (_React$Component) {
  turnOrder._inherits(LobbyMatchInstance, _React$Component);

  var _super = turnOrder._createSuper(LobbyMatchInstance);

  function LobbyMatchInstance() {
    var _this;

    turnOrder._classCallCheck(this, LobbyMatchInstance);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createSeat", function (player) {
      return player.name || '[free]';
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createButtonJoin", function (inst, seatId) {
      return /*#__PURE__*/React.createElement("button", {
        key: 'button-join-' + inst.matchID,
        onClick: function onClick() {
          return _this.props.onClickJoin(inst.gameName, inst.matchID, '' + seatId);
        }
      }, "Join");
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createButtonLeave", function (inst) {
      return /*#__PURE__*/React.createElement("button", {
        key: 'button-leave-' + inst.matchID,
        onClick: function onClick() {
          return _this.props.onClickLeave(inst.gameName, inst.matchID);
        }
      }, "Leave");
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createButtonPlay", function (inst, seatId) {
      return /*#__PURE__*/React.createElement("button", {
        key: 'button-play-' + inst.matchID,
        onClick: function onClick() {
          return _this.props.onClickPlay(inst.gameName, {
            matchID: inst.matchID,
            playerID: '' + seatId,
            numPlayers: inst.players.length
          });
        }
      }, "Play");
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createButtonSpectate", function (inst) {
      return /*#__PURE__*/React.createElement("button", {
        key: 'button-spectate-' + inst.matchID,
        onClick: function onClick() {
          return _this.props.onClickPlay(inst.gameName, {
            matchID: inst.matchID,
            numPlayers: inst.players.length
          });
        }
      }, "Spectate");
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createInstanceButtons", function (inst) {
      var playerSeat = inst.players.find(function (player) {
        return player.name === _this.props.playerName;
      });
      var freeSeat = inst.players.find(function (player) {
        return !player.name;
      });

      if (playerSeat && freeSeat) {
        // already seated: waiting for match to start
        return _this._createButtonLeave(inst);
      }

      if (freeSeat) {
        // at least 1 seat is available
        return _this._createButtonJoin(inst, freeSeat.id);
      } // match is full


      if (playerSeat) {
        return /*#__PURE__*/React.createElement("div", null, [_this._createButtonPlay(inst, playerSeat.id), _this._createButtonLeave(inst)]);
      } // allow spectating


      return _this._createButtonSpectate(inst);
    });

    return _this;
  }

  turnOrder._createClass(LobbyMatchInstance, [{
    key: "render",
    value: function render() {
      var match = this.props.match;
      var status = 'OPEN';

      if (!match.players.find(function (player) {
        return !player.name;
      })) {
        status = 'RUNNING';
      }

      return /*#__PURE__*/React.createElement("tr", {
        key: 'line-' + match.matchID
      }, /*#__PURE__*/React.createElement("td", {
        key: 'cell-name-' + match.matchID
      }, match.gameName), /*#__PURE__*/React.createElement("td", {
        key: 'cell-status-' + match.matchID
      }, status), /*#__PURE__*/React.createElement("td", {
        key: 'cell-seats-' + match.matchID
      }, match.players.map(this._createSeat).join(', ')), /*#__PURE__*/React.createElement("td", {
        key: 'cell-buttons-' + match.matchID
      }, this._createInstanceButtons(match)));
    }
  }]);

  return LobbyMatchInstance;
}(React.Component);

turnOrder._defineProperty(LobbyMatchInstance, "propTypes", {
  match: PropTypes.shape({
    gameName: PropTypes.string.isRequired,
    matchID: PropTypes.string.isRequired,
    players: PropTypes.array.isRequired
  }),
  playerName: PropTypes.string.isRequired,
  onClickJoin: PropTypes.func.isRequired,
  onClickLeave: PropTypes.func.isRequired,
  onClickPlay: PropTypes.func.isRequired
});

var LobbyCreateMatchForm = /*#__PURE__*/function (_React$Component) {
  turnOrder._inherits(LobbyCreateMatchForm, _React$Component);

  var _super = turnOrder._createSuper(LobbyCreateMatchForm);

  function LobbyCreateMatchForm(props) {
    var _this;

    turnOrder._classCallCheck(this, LobbyCreateMatchForm);

    _this = _super.call(this, props);
    /* fix min and max number of players */

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "state", {
      selectedGame: 0,
      numPlayers: 2
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createGameNameOption", function (game, idx) {
      return /*#__PURE__*/React.createElement("option", {
        key: 'name-option-' + idx,
        value: idx
      }, game.game.name);
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createNumPlayersOption", function (idx) {
      return /*#__PURE__*/React.createElement("option", {
        key: 'num-option-' + idx,
        value: idx
      }, idx);
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createNumPlayersRange", function (game) {
      return turnOrder._toConsumableArray(new Array(game.maxPlayers + 1).keys()).slice(game.minPlayers);
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "onChangeNumPlayers", function (event) {
      _this.setState({
        numPlayers: Number.parseInt(event.target.value)
      });
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "onChangeSelectedGame", function (event) {
      var idx = Number.parseInt(event.target.value);

      _this.setState({
        selectedGame: idx,
        numPlayers: _this.props.games[idx].game.minPlayers
      });
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "onClickCreate", function () {
      _this.props.createMatch(_this.props.games[_this.state.selectedGame].game.name, _this.state.numPlayers);
    });

    var _iterator = turnOrder._createForOfIteratorHelper(props.games),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var game = _step.value;
        var matchDetails = game.game;

        if (!matchDetails.minPlayers) {
          matchDetails.minPlayers = 1;
        }

        if (!matchDetails.maxPlayers) {
          matchDetails.maxPlayers = 4;
        }

        console.assert(matchDetails.maxPlayers >= matchDetails.minPlayers);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    _this.state = {
      selectedGame: 0,
      numPlayers: props.games[0].game.minPlayers
    };
    return _this;
  }

  turnOrder._createClass(LobbyCreateMatchForm, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("select", {
        value: this.state.selectedGame,
        onChange: function onChange(evt) {
          return _this2.onChangeSelectedGame(evt);
        }
      }, this.props.games.map(this._createGameNameOption)), /*#__PURE__*/React.createElement("span", null, "Players:"), /*#__PURE__*/React.createElement("select", {
        value: this.state.numPlayers,
        onChange: this.onChangeNumPlayers
      }, this._createNumPlayersRange(this.props.games[this.state.selectedGame].game).map(this._createNumPlayersOption)), /*#__PURE__*/React.createElement("span", {
        className: "buttons"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: this.onClickCreate
      }, "Create")));
    }
  }]);

  return LobbyCreateMatchForm;
}(React.Component);

turnOrder._defineProperty(LobbyCreateMatchForm, "propTypes", {
  games: PropTypes.array.isRequired,
  createMatch: PropTypes.func.isRequired
});

var LobbyPhases = {
  ENTER: 'enter',
  PLAY: 'play',
  LIST: 'list'
};
/**
 * Lobby
 *
 * React lobby component.
 *
 * @param {Array}  gameComponents - An array of Board and Game objects for the supported games.
 * @param {string} lobbyServer - Address of the lobby server (for example 'localhost:8000').
 *                               If not set, defaults to the server that served the page.
 * @param {string} gameServer - Address of the game server (for example 'localhost:8001').
 *                              If not set, defaults to the server that served the page.
 * @param {function} clientFactory - Function that is used to create the game clients.
 * @param {number} refreshInterval - Interval between server updates (default: 2000ms).
 * @param {bool}   debug - Enable debug information (default: false).
 *
 * Returns:
 *   A React component that provides a UI to create, list, join, leave, play or
 *   spectate matches (game instances).
 */

var Lobby = /*#__PURE__*/function (_React$Component) {
  turnOrder._inherits(Lobby, _React$Component);

  var _super = turnOrder._createSuper(Lobby);

  function Lobby(_props) {
    var _this;

    turnOrder._classCallCheck(this, Lobby);

    _this = _super.call(this, _props);

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "state", {
      phase: LobbyPhases.ENTER,
      playerName: 'Visitor',
      runningMatch: null,
      errorMsg: '',
      credentialStore: {}
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createConnection", function (props) {
      var name = _this.state.playerName;
      _this.connection = LobbyConnection({
        server: props.lobbyServer,
        gameComponents: props.gameComponents,
        playerName: name,
        playerCredentials: _this.state.credentialStore[name]
      });
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_updateCredentials", function (playerName, credentials) {
      _this.setState(function (prevState) {
        // clone store or componentDidUpdate will not be triggered
        var store = Object.assign({}, prevState.credentialStore);
        store[[playerName]] = credentials;
        return {
          credentialStore: store
        };
      });
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_updateConnection", async function () {
      await _this.connection.refresh();

      _this.forceUpdate();
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_enterLobby", function (playerName) {
      _this.setState({
        playerName: playerName,
        phase: LobbyPhases.LIST
      });
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_exitLobby", async function () {
      await _this.connection.disconnect();

      _this.setState({
        phase: LobbyPhases.ENTER,
        errorMsg: ''
      });
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_createMatch", async function (gameName, numPlayers) {
      try {
        await _this.connection.create(gameName, numPlayers);
        await _this.connection.refresh(); // rerender

        _this.setState({});
      } catch (error) {
        _this.setState({
          errorMsg: error.message
        });
      }
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_joinMatch", async function (gameName, matchID, playerID) {
      try {
        await _this.connection.join(gameName, matchID, playerID);
        await _this.connection.refresh();

        _this._updateCredentials(_this.connection.playerName, _this.connection.playerCredentials);
      } catch (error) {
        _this.setState({
          errorMsg: error.message
        });
      }
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_leaveMatch", async function (gameName, matchID) {
      try {
        await _this.connection.leave(gameName, matchID);
        await _this.connection.refresh();

        _this._updateCredentials(_this.connection.playerName, _this.connection.playerCredentials);
      } catch (error) {
        _this.setState({
          errorMsg: error.message
        });
      }
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_startMatch", function (gameName, matchOpts) {
      var gameCode = _this.connection._getGameComponents(gameName);

      if (!gameCode) {
        _this.setState({
          errorMsg: 'game ' + gameName + ' not supported'
        });

        return;
      }

      var multiplayer = undefined;

      if (matchOpts.numPlayers > 1) {
        if (_this.props.gameServer) {
          multiplayer = socketio.SocketIO({
            server: _this.props.gameServer
          });
        } else {
          multiplayer = socketio.SocketIO();
        }
      }

      if (matchOpts.numPlayers == 1) {
        var maxPlayers = gameCode.game.maxPlayers;
        var bots = {};

        for (var i = 1; i < maxPlayers; i++) {
          bots[i + ''] = ai.MCTSBot;
        }

        multiplayer = socketio.Local({
          bots: bots
        });
      }

      var app = _this.props.clientFactory({
        game: gameCode.game,
        board: gameCode.board,
        debug: _this.props.debug,
        multiplayer: multiplayer
      });

      var match = {
        app: app,
        matchID: matchOpts.matchID,
        playerID: matchOpts.numPlayers > 1 ? matchOpts.playerID : '0',
        credentials: _this.connection.playerCredentials
      };

      _this.setState({
        phase: LobbyPhases.PLAY,
        runningMatch: match
      });
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_exitMatch", function () {
      _this.setState({
        phase: LobbyPhases.LIST,
        runningMatch: null
      });
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "_getPhaseVisibility", function (phase) {
      return _this.state.phase !== phase ? 'hidden' : 'phase';
    });

    turnOrder._defineProperty(turnOrder._assertThisInitialized(_this), "renderMatches", function (matches, playerName) {
      return matches.map(function (match) {
        var matchID = match.matchID,
            gameName = match.gameName,
            players = match.players;
        return /*#__PURE__*/React.createElement(LobbyMatchInstance, {
          key: 'instance-' + matchID,
          match: {
            matchID: matchID,
            gameName: gameName,
            players: Object.values(players)
          },
          playerName: playerName,
          onClickJoin: _this._joinMatch,
          onClickLeave: _this._leaveMatch,
          onClickPlay: _this._startMatch
        });
      });
    });

    _this._createConnection(_this.props);

    setInterval(_this._updateConnection, _this.props.refreshInterval);
    return _this;
  }

  turnOrder._createClass(Lobby, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var cookie = Cookies.load('lobbyState') || {};

      if (cookie.phase && cookie.phase === LobbyPhases.PLAY) {
        cookie.phase = LobbyPhases.LIST;
      }

      this.setState({
        phase: cookie.phase || LobbyPhases.ENTER,
        playerName: cookie.playerName || 'Visitor',
        credentialStore: cookie.credentialStore || {}
      });
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      var name = this.state.playerName;
      var creds = this.state.credentialStore[name];

      if (prevState.phase !== this.state.phase || prevState.credentialStore[name] !== creds || prevState.playerName !== name) {
        this._createConnection(this.props);

        this._updateConnection();

        var cookie = {
          phase: this.state.phase,
          playerName: name,
          credentialStore: this.state.credentialStore
        };
        Cookies.save('lobbyState', cookie, {
          path: '/'
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          gameComponents = _this$props.gameComponents,
          renderer = _this$props.renderer;
      var _this$state = this.state,
          errorMsg = _this$state.errorMsg,
          playerName = _this$state.playerName,
          phase = _this$state.phase,
          runningMatch = _this$state.runningMatch;

      if (renderer) {
        return renderer({
          errorMsg: errorMsg,
          gameComponents: gameComponents,
          matches: this.connection.matches,
          phase: phase,
          playerName: playerName,
          runningMatch: runningMatch,
          handleEnterLobby: this._enterLobby,
          handleExitLobby: this._exitLobby,
          handleCreateMatch: this._createMatch,
          handleJoinMatch: this._joinMatch,
          handleLeaveMatch: this._leaveMatch,
          handleExitMatch: this._exitMatch,
          handleRefreshMatches: this._updateConnection,
          handleStartMatch: this._startMatch
        });
      }

      return /*#__PURE__*/React.createElement("div", {
        id: "lobby-view",
        style: {
          padding: 50
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: this._getPhaseVisibility(LobbyPhases.ENTER)
      }, /*#__PURE__*/React.createElement(LobbyLoginForm, {
        key: playerName,
        playerName: playerName,
        onEnter: this._enterLobby
      })), /*#__PURE__*/React.createElement("div", {
        className: this._getPhaseVisibility(LobbyPhases.LIST)
      }, /*#__PURE__*/React.createElement("p", null, "Welcome, ", playerName), /*#__PURE__*/React.createElement("div", {
        className: "phase-title",
        id: "match-creation"
      }, /*#__PURE__*/React.createElement("span", null, "Create a match:"), /*#__PURE__*/React.createElement(LobbyCreateMatchForm, {
        games: gameComponents,
        createMatch: this._createMatch
      })), /*#__PURE__*/React.createElement("p", {
        className: "phase-title"
      }, "Join a match:"), /*#__PURE__*/React.createElement("div", {
        id: "instances"
      }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("tbody", null, this.renderMatches(this.connection.matches, playerName))), /*#__PURE__*/React.createElement("span", {
        className: "error-msg"
      }, errorMsg, /*#__PURE__*/React.createElement("br", null))), /*#__PURE__*/React.createElement("p", {
        className: "phase-title"
      }, "Matches that become empty are automatically deleted.")), /*#__PURE__*/React.createElement("div", {
        className: this._getPhaseVisibility(LobbyPhases.PLAY)
      }, runningMatch && /*#__PURE__*/React.createElement(runningMatch.app, {
        matchID: runningMatch.matchID,
        playerID: runningMatch.playerID,
        credentials: runningMatch.credentials
      }), /*#__PURE__*/React.createElement("div", {
        className: "buttons",
        id: "match-exit"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: this._exitMatch
      }, "Exit match"))), /*#__PURE__*/React.createElement("div", {
        className: "buttons",
        id: "lobby-exit"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: this._exitLobby
      }, "Exit lobby")));
    }
  }]);

  return Lobby;
}(React.Component);

turnOrder._defineProperty(Lobby, "propTypes", {
  gameComponents: PropTypes.array.isRequired,
  lobbyServer: PropTypes.string,
  gameServer: PropTypes.string,
  debug: PropTypes.bool,
  clientFactory: PropTypes.func,
  refreshInterval: PropTypes.number
});

turnOrder._defineProperty(Lobby, "defaultProps", {
  debug: false,
  clientFactory: Client,
  refreshInterval: 2000
});

exports.Client = Client;
exports.Lobby = Lobby;
