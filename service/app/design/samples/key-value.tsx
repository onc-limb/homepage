import { KeyValue } from "@/components/ds/KeyValue"

import type { DesignSample } from "./types"

export const keyValueSample: DesignSample = {
    id: "key-value",
    title: "KeyValue",
    Sample: () => (
        <KeyValue
            items={[
                { key: "name", value: "onclimb" },
                { key: "role", value: "エンジニア" },
                { key: "stack", value: "TypeScript / Next.js" },
            ]}
        />
    ),
}
