/// <reference types="node" />
import { ServerOptions as SocketOptions } from 'socket.io';
import { ServerOptions as HttpsOptions } from 'https';
import { TransportAPI as MasterTransport, AuthFn } from '../../master/master';
/**
 * API that's exposed by SocketIO for the Master to send
 * information to the clients.
 */
export declare function TransportAPI(matchID: string, socket: any, clientInfo: Map<any, any>, roomInfo: Map<any, any>): MasterTransport;
export interface SocketOpts {
    auth?: boolean | AuthFn;
    https?: HttpsOptions;
    socketOpts?: SocketOptions;
    socketAdapter?: any;
}
/**
 * Transport interface that uses socket.io
 */
export declare class SocketIO {
    protected clientInfo: Map<any, any>;
    protected roomInfo: Map<any, any>;
    private auth;
    private https;
    private socketAdapter;
    private socketOpts;
    constructor({ auth, https, socketAdapter, socketOpts, }?: SocketOpts);
    init(app: any, games: any): void;
}
