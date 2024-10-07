import { SvelteComponent, SvelteComponentTyped } from "svelte";

interface RootProps {}
interface InsertProps {}
interface ArticlesProps {}

export class RouterType extends SvelteComponent {}
export class RouteType extends SvelteComponent {}
export class LinkType extends SvelteComponent {}

export class RootType extends SvelteComponentTyped<RootProps> {}
export class InsertType extends SvelteComponentTyped<InsertProps> {}
export class ArticlesType extends SvelteComponentTyped<ArticlesProps> {}
