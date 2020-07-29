import { StaggerConfigValue } from '../../../types';
import { FlipData } from '../types';
export declare const createSuspendedSpring: (flipData: FlipData) => import("../../../forked-rebound/types").Spring;
export declare const createSpring: (flipped: FlipData) => import("../../../forked-rebound/types").Spring;
export declare const normalizeSpeed: (speedConfig: number | undefined) => number;
export declare const createStaggeredSprings: (flippedArray: FlipData[], staggerConfig?: StaggerConfigValue) => void;
