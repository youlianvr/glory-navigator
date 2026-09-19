/* Hash router and route helpers. Owns URL state, not page markup. */
(function () {
  "use strict";

  function parseRoute() {
    var hash = window.location.hash || "#/";
    return hash.replace(/^#\//, "").split("?")[0].replace(/\/+$/, "");
  }

  function findPlaceBySlug(slug) {
    var i;
    for (i = 0; i < PLACES.length; i++) {
      if (PLACES[i].slug === slug) { return PLACES[i]; }
    }
    return null;
  }

  function routeNeighbours(place) {
    var idx = ROUTE.indexOf(place.slug);
    if (idx === -1) { return { prev: null, next: null }; }
    var last = ROUTE.length - 1;
    return {
      prev: findPlaceBySlug(ROUTE[idx > 0 ? idx - 1 : last]),
      next: findPlaceBySlug(ROUTE[idx < last ? idx + 1 : 0])
    };
  }

  function start(onRoute) {
    function handleRoute() {
      onRoute(parseRoute());
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", handleRoute);
    window.addEventListener("DOMContentLoaded", handleRoute);
  }

  window.GloryRouter = {
    parseRoute: parseRoute,
    findPlaceBySlug: findPlaceBySlug,
    routeNeighbours: routeNeighbours,
    start: start
  };
})();
