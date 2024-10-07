<script lang="ts">
  import { Router, Route, Link } from "svelte-routing";
  import type {
    RouterType,
    RouteType,
    LinkType,
    ArticlesType,
    RootType,
  } from "./svelteComponent";
  import Articles from "./articles/Articles.svelte";
  import Root from "./Root.svelte";

  const RouterComponent = Router as typeof RouterType;
  const RouteComponent = Route as typeof RouteType;
  const LinkComponent = Link as typeof LinkType;
  const RootComponent = Root as typeof RootType;
  const ArticlesComponent = Articles as typeof ArticlesType;
</script>

<RouterComponent>
  <nav>
    <LinkComponent to="/">TOP</LinkComponent>
    <LinkComponent to="/articles">Articles</LinkComponent>
  </nav>
  <RouteComponent path="/" component={RootComponent} />
  <RouteComponent path="/articles" component={ArticlesComponent} />
</RouterComponent>
