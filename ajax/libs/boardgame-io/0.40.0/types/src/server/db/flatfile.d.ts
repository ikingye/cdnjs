import * as StorageAPI from './base';
import { State, Server, LogEntry } from '../../types';
/**
 * FlatFile data storage.
 */
export declare class FlatFile extends StorageAPI.Async {
    private games;
    private dir;
    private logging?;
    private ttl?;
    private fileQueues;
    constructor({ dir, logging, ttl, }: {
        dir: string;
        logging?: boolean;
        ttl?: boolean;
    });
    private chainRequest;
    private getItem;
    private setItem;
    private removeItem;
    connect(): Promise<void>;
    createGame(matchID: string, opts: StorageAPI.CreateGameOpts): Promise<void>;
    fetch<O extends StorageAPI.FetchOpts>(matchID: string, opts: O): Promise<StorageAPI.FetchResult<O>>;
    clear(): Promise<{}>;
    setState(id: string, state: State, deltalog?: LogEntry[]): Promise<any>;
    setMetadata(id: string, metadata: Server.MatchData): Promise<void>;
    wipe(id: string): Promise<void>;
    listGames(): Promise<string[]>;
}
