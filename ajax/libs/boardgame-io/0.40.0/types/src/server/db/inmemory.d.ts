import { State, Server, LogEntry } from '../../types';
import * as StorageAPI from './base';
/**
 * InMemory data storage.
 */
export declare class InMemory extends StorageAPI.Sync {
    private state;
    private initial;
    private metadata;
    private log;
    /**
     * Creates a new InMemory storage.
     */
    constructor();
    /**
     * Create a new game.
     */
    createGame(matchID: string, opts: StorageAPI.CreateGameOpts): void;
    /**
     * Write the game metadata to the in-memory object.
     */
    setMetadata(matchID: string, metadata: Server.MatchData): void;
    /**
     * Write the game state to the in-memory object.
     */
    setState(matchID: string, state: State, deltalog?: LogEntry[]): void;
    /**
     * Fetches state for a particular matchID.
     */
    fetch<O extends StorageAPI.FetchOpts>(matchID: string, opts: O): StorageAPI.FetchResult<O>;
    /**
     * Remove the game state from the in-memory object.
     */
    wipe(matchID: string): void;
    /**
     * Return all keys.
     */
    listGames(opts?: StorageAPI.ListGamesOpts): string[];
}
