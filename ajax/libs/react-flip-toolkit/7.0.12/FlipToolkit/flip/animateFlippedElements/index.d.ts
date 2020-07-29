import { AnimateFlippedElementsArgs } from './types';
import { BoundingClientRect } from '../getFlippedElementPositions/types';
export declare const convertMatrix3dArrayTo2dArray: (matrix: number[]) => number[];
export declare const convertMatrix2dArrayToString: (matrix: number[]) => string;
export declare const invertTransformsForChildren: ({ invertedChildren, matrix, body }: {
    matrix: number[];
    body: HTMLBodyElement;
    invertedChildren: [HTMLElement, Pick<import("../../types").SerializableFlippedProps, "children" | "portalKey" | "opacity" | "translate" | "scale" | "transformOrigin" | "spring" | "stagger" | "inverseFlipId" | "delayUntil">][];
}) => void;
export declare const createApplyStylesFunc: ({ element, invertedChildren, body }: {
    element: HTMLElement;
    invertedChildren: [HTMLElement, Pick<import("../../types").SerializableFlippedProps, "children" | "portalKey" | "opacity" | "translate" | "scale" | "transformOrigin" | "spring" | "stagger" | "inverseFlipId" | "delayUntil">][];
    body: HTMLBodyElement;
}) => ({ matrix, opacity, forceMinVals }: {
    matrix: number[];
    opacity?: number | undefined;
    forceMinVals?: boolean | undefined;
}) => void;
export declare const rectInViewport: ({ top, bottom, left, right }: BoundingClientRect) => boolean;
declare const _default: ({ flippedIds, flipCallbacks, inProgressAnimations, flippedElementPositionsBeforeUpdate, flippedElementPositionsAfterUpdate, applyTransformOrigin, spring, getElement, debug, staggerConfig, decisionData, onComplete, containerEl }: AnimateFlippedElementsArgs) => () => void;
export default _default;
