import 'svelte';
import { StoreEnhancer } from 'redux';
import { ProcessGameConfig } from '../core/game';
import Debug from './debug/Debug.svelte';
import { Transport, TransportOpts } from './transport/transport';
import { ActivePlayersArg, FilteredMetadata, Game, PlayerID, State, Store } from '../types';
interface DebugOpt {
    target?: HTMLElement;
    impl?: typeof Debug;
}
export declare const createMoveDispatchers: any;
export declare const createEventDispatchers: any;
export declare const createPluginDispatchers: any;
export interface ClientOpts<G extends any = any> {
    game: Game<G>;
    debug?: DebugOpt | boolean;
    numPlayers?: number;
    multiplayer?: (opts: TransportOpts) => Transport;
    gameID?: string;
    playerID?: PlayerID;
    credentials?: string;
    enhancer?: StoreEnhancer;
}
/**
 * Implementation of Client (see below).
 */
export declare class _ClientImpl<G extends any = any> {
    private debug?;
    private _debugPanel?;
    private gameStateOverride?;
    private initialState;
    private multiplayer;
    private reducer;
    private _running;
    private subscribers;
    private transport;
    game: ReturnType<typeof ProcessGameConfig>;
    store: Store;
    log: State['deltalog'];
    gameID: string;
    playerID: PlayerID | null;
    credentials: string;
    gameMetadata?: FilteredMetadata;
    moves: Record<string, (...args: any[]) => void>;
    events: {
        endGame?: (gameover?: any) => void;
        endPhase?: () => void;
        endTurn?: (arg?: {
            next: PlayerID;
        }) => void;
        setPhase?: (newPhase: string) => void;
        endStage?: () => void;
        setStage?: (newStage: string) => void;
        setActivePlayers?: (arg: ActivePlayersArg) => void;
    };
    plugins: Record<string, (...args: any[]) => void>;
    reset: () => void;
    undo: () => void;
    redo: () => void;
    constructor({ game, debug, numPlayers, multiplayer, gameID, playerID, credentials, enhancer, }: ClientOpts);
    private notifySubscribers;
    overrideGameState(state: any): void;
    start(): void;
    stop(): void;
    subscribe(fn: (state: State<G>) => void): () => void;
    getInitialState(): State<G, import("../types").Ctx>;
    getState(): {
        G: any;
        log: import("../types").LogEntry[];
        isActive: boolean;
        isConnected: boolean;
        ctx: import("../types").Ctx;
        deltalog?: import("../types").LogEntry[];
        plugins: {
            [pluginName: string]: import("../types").PluginState;
        };
        _undo: {
            G: any;
            ctx: import("../types").Ctx;
            moveType?: string;
        }[];
        _redo: {
            G: any;
            ctx: import("../types").Ctx;
            moveType?: string;
        }[];
        _stateID: number;
    };
    private createDispatchers;
    updatePlayerID(playerID: PlayerID | null): void;
    updateGameID(gameID: string): void;
    updateCredentials(credentials: string): void;
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
export declare function Client<G extends any = any>(opts: ClientOpts<G>): _ClientImpl<G>;
export {};
