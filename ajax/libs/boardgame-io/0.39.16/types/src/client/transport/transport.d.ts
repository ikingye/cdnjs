import { ProcessGameConfig } from '../../core/game';
import { Game, PlayerID, CredentialedActionShape, State, Store, SyncInfo } from '../../types';
export declare type MetadataCallback = (metadata: SyncInfo['filteredMetadata']) => void;
export interface TransportOpts {
    store?: Store;
    gameName?: string;
    gameKey?: Game;
    game?: ReturnType<typeof ProcessGameConfig>;
    playerID?: PlayerID;
    gameID?: string;
    numPlayers?: number;
}
export declare abstract class Transport {
    protected store: Store;
    protected gameName: string;
    protected playerID: PlayerID | null;
    protected gameID: string;
    protected numPlayers: number;
    isConnected: boolean;
    constructor({ store, gameName, playerID, gameID, numPlayers, }: TransportOpts);
    abstract onAction(state: State, action: CredentialedActionShape.Any): void;
    abstract connect(): void;
    abstract disconnect(): void;
    abstract subscribe(fn: () => void): void;
    abstract subscribeGameMetadata(fn: MetadataCallback): void;
    abstract updateGameID(id: string): void;
    abstract updatePlayerID(id: PlayerID): void;
}
