/**
 * 旧 URL と新しい URL の対応表。
 * next.config.mjs は .mjs なので lib/building/floors.ts (TypeScript) を import できず、
 * 行き先はここに直接書く。FLOORS の値（findGroup("contact").url = /1f/contact、
 * findFloor("rf").url = /rf）と同じであることを lib/__tests__/redirects.test.ts で縛る。
 */

/** @type {{ source: string; destination: string; permanent: true }[]} */
export const PERMANENT_REDIRECTS = [
    { source: "/contact", destination: "/1f/contact", permanent: true },
    { source: "/social", destination: "/rf", permanent: true },
]
