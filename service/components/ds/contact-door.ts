import { findGroup } from "@/lib/building/floors"

// Shared by Home and GuidePc so the Contact door's label and destination are
// defined in one place.
export const CONTACT_DOOR = {
    label: "Contact",
    href: findGroup("contact").href,
} as const
