import { codeBlockSample } from "./code-block"
import { colorsSample } from "./colors"
import { dataTableSample } from "./data-table"
import { doorButtonSample } from "./door-button"
import { floorGuideSample } from "./floor-guide"
import { floorMapSample } from "./floor-map"
import { guidePcSample } from "./guide-pc"
import { hashHeadingSample } from "./hash-heading"
import { keyValueSample } from "./key-value"
import { lodgeExteriorSample } from "./lodge-exterior"
import { logListSample } from "./log-list"
import { pageFrameSample } from "./page-frame"
import { pagerDoorsSample } from "./pager-doors"
import { proseSample } from "./prose"
import { sectionSample } from "./section"
import { spacingSample } from "./spacing"
import { textLinkSample } from "./text-link"
import { typeSample } from "./type"
import type { DesignSample } from "./types"

/**
 * Samples shown on /design, in display order. To add a sample, create a file
 * in this folder and add one line here.
 */
export const DESIGN_SAMPLES: readonly DesignSample[] = [
    colorsSample,
    typeSample,
    spacingSample,
    pageFrameSample,
    sectionSample,
    hashHeadingSample,
    keyValueSample,
    dataTableSample,
    codeBlockSample,
    proseSample,
    textLinkSample,
    logListSample,
    doorButtonSample,
    pagerDoorsSample,
    floorMapSample,
    floorGuideSample,
    guidePcSample,
    lodgeExteriorSample,
]
