import { DoorButton } from "@/components/ds/DoorButton"
import { findGroup } from "@/lib/building/floors"

import type { DesignSample } from "./types"

export const doorButtonSample: DesignSample = {
    id: "door-button",
    title: "DoorButton",
    Sample: () => (
        <div className="flex flex-col gap-ds-4">
            <div className="flex flex-wrap items-start gap-ds-3">
                <DoorButton href="/2f/skills">Skills</DoorButton>
                <DoorButton href={findGroup("contact").url} primary>
                    Contact
                </DoorButton>
                <DoorButton pressed>すべて</DoorButton>
            </div>
            <div className="flex flex-wrap items-start gap-ds-4">
                <DoorButton size="large" href="/2f/skills" count="8 件">
                    Skills
                </DoorButton>
                <DoorButton size="large" href={findGroup("contact").url} count="1 件" primary>
                    Contact
                </DoorButton>
                <DoorButton size="large" pressed count="12 件">
                    すべて
                </DoorButton>
            </div>
        </div>
    ),
}
