import { colorsSample } from "./colors"
import { spacingSample } from "./spacing"
import { typeSample } from "./type"
import type { DesignSample } from "./types"

/**
 * Samples shown on /design, in display order. To add a sample, create a file
 * in this folder and add one line here.
 */
export const DESIGN_SAMPLES: readonly DesignSample[] = [colorsSample, typeSample, spacingSample]
