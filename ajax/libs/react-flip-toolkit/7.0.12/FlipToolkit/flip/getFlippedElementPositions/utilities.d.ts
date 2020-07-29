import { BoundingClientRect } from './types';
export declare const addTupleToObject: (acc: {}, curr: [any, any]) => object;
export declare const getAllElements: (element?: HTMLElement | undefined, portalKey?: string | undefined) => HTMLElement[];
export declare const getRects: (flippedElements: HTMLElement[]) => [HTMLElement, BoundingClientRect][];
