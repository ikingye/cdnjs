import { ProcessGameConfig } from '../core/game';
import { SyncInfo, Game, Server, State, ActionShape, CredentialedActionShape, LogEntry, PlayerID } from '../types';
import * as StorageAPI from '../server/db/base';
export declare const getPlayerMetadata: (matchData: Server.MatchData, playerID: string) => any;
/**
 * Redact the log.
 *
 * @param {Array} log - The game log (or deltalog).
 * @param {String} playerID - The playerID that this log is
 *                            to be sent to.
 */
export declare function redactLog(log: LogEntry[], playerID: PlayerID): {
    action: {
        payload: {
            args: any;
            type: string;
            playerID: string;
        } | {
            args: any;
            type: string;
            playerID: string;
        };
        type: "MAKE_MOVE";
    } | {
        payload: {
            args: any;
            type: string;
            playerID: string;
        } | {
            args: any;
            type: string;
            playerID: string;
        };
        type: "GAME_EVENT";
    };
    _stateID: number;
    turn: number;
    phase: string;
    automatic?: boolean;
}[];
/**
 * Verifies that the match has metadata and is using credentials.
 */
export declare const doesMatchRequireAuthentication: (matchData?: Server.MatchData) => boolean;
/**
 * Verifies that the move came from a player with the correct credentials.
 */
export declare const isActionFromAuthenticPlayer: (actionCredentials: string, playerMetadata?: Server.PlayerMetadata) => boolean;
export declare type AuthFn = (actionCredentials: string, playerMetadata: Server.PlayerMetadata) => boolean | Promise<boolean>;
declare type CallbackFn = (arg: {
    state: State;
    matchID: string;
    action?: ActionShape.Any | CredentialedActionShape.Any;
}) => void;
declare type TransportData = {
    type: 'update';
    args: [string, State, LogEntry[]];
} | {
    type: 'sync';
    args: [string, SyncInfo];
};
export interface TransportAPI {
    send: (playerData: {
        playerID: PlayerID;
    } & TransportData) => void;
    sendAll: (makePlayerData: (playerID: PlayerID) => TransportData) => void;
}
/**
 * Master
 *
 * Class that runs the game and maintains the authoritative state.
 * It uses the transportAPI to communicate with clients and the
 * storageAPI to communicate with the database.
 */
export declare class Master {
    game: ReturnType<typeof ProcessGameConfig>;
    storageAPI: StorageAPI.Sync | StorageAPI.Async;
    transportAPI: TransportAPI;
    subscribeCallback: CallbackFn;
    auth: null | AuthFn;
    shouldAuth: typeof doesMatchRequireAuthentication;
    constructor(game: Game, storageAPI: StorageAPI.Sync | StorageAPI.Async, transportAPI: TransportAPI, auth?: AuthFn | boolean);
    subscribe(fn: CallbackFn): void;
    /**
     * Called on each move / event made by the client.
     * Computes the new value of the game state and returns it
     * along with a deltalog.
     */
    onUpdate(credAction: CredentialedActionShape.Any, stateID: number, matchID: string, playerID: string): Promise<{
        error: string;
    }>;
    /**
     * Called when the client connects / reconnects.
     * Returns the latest game state and the entire log.
     */
    onSync(matchID: string, playerID: string, numPlayers: number): Promise<void>;
}
export {};
