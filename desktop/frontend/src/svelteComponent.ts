import { SvelteComponent, SvelteComponentTyped } from "svelte";

interface ViewProps {}
interface InsertProps {}

export class RouterType extends SvelteComponent {}
export class RouteType extends SvelteComponent {}
export class LinkType extends SvelteComponent {}

export class ViewType extends SvelteComponentTyped<ViewProps> {}
export class InsertType extends SvelteComponentTyped<InsertProps> {}
