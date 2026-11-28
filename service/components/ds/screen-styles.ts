// The navigation and theme text switch at `lg` (ADR-0001: shared breakpoints).
export const NARROW_SCREEN_ONLY = "lg:hidden"
export const WIDE_SCREEN_ONLY_INLINE = "hidden lg:inline"
export const WIDE_SCREEN_ONLY_FLEX = "hidden lg:flex"

// The map and the guide PC (info center and floor pages): one column, the PC right after the map;
// two columns [map | PC] from xl (ADR-0001).
export const MAP_AND_GUIDE_COLUMNS = "grid grid-cols-1 gap-ds-4 xl:grid-cols-ds-map-guide xl:items-start"
