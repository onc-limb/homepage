// Shared by Planks and FloorMap so layers clip their contents the same way.
export const CLIPPED_SURFACE = "absolute flex h-full w-full overflow-hidden"

// Shared by KeyValue, the Prose blockquote and the contact success box so
// bordered panels keep the same surface, border and padding.
export const BOXED_SURFACE = "border border-ds-border bg-ds-surface p-ds-3"

// Shared by FloorMap and LodgeExterior so framed surfaces carry the same map edge.
export const MAP_EDGE = "border-2 border-ds-fg"

// Shared by FloorGuide and LodgeExterior so triangle silhouettes clip the same way.
export const TRIANGLE_CLIP = "[clip-path:polygon(50%_0,100%_100%,0_100%)]"
