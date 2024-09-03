<script lang="ts">
  import { Router, Route, Link } from "svelte-routing";
  import View from "./View.svelte";
  import Insert from "./Insert.svelte";
  import {
    RouterType,
    RouteType,
    LinkType,
    ViewType,
    InsertType,
  } from "./svelteComponent";

  const RouterComponent = Router as typeof RouterType;
  const RouteComponent = Route as typeof RouteType;
  const LinkComponent = Link as typeof LinkType;
  const ViewComponent = View as typeof ViewType;
  const InsertComponent = Insert as typeof InsertType;
</script>

<RouterComponent>
  <nav>
    <LinkComponent to="/">View</LinkComponent>
    <LinkComponent to="/insert">Insert</LinkComponent>
  </nav>

  <RouteComponent path="/" component={ViewComponent} />
  <RouteComponent path="/insert" component={InsertComponent} />
</RouterComponent>
