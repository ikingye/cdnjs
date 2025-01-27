import { Store, MutationPayload } from "vuex";
interface Storage {
    getItem: (key: string) => any;
    setItem: (key: string, value: any) => void;
    removeItem: (key: string) => void;
}
interface Options {
    key?: string;
    paths?: string[];
    reducer?: (state: any, paths: string[]) => object;
    subscriber?: (store: typeof Store) => (handler: (mutation: any, state: any) => void) => void;
    storage?: Storage;
    getState?: (key: string, storage: Storage) => any;
    setState?: (key: string, state: typeof Store, storage: Storage) => void;
    filter?: (mutation: MutationPayload) => boolean;
    arrayMerger?: (state: any, saved: any) => any;
    rehydrated?: (store: typeof Store) => void;
    fetchBeforeUse?: boolean;
    overwrite?: boolean;
    assertStorage?: (storage: Storage) => void | Error;
}
export default function (options: Options | null, storage: Storage | null, key: string | null): (store: any) => void;
export {};
