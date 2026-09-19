/* Application bootstrap: URL state → page. The one list of sections lives in
 * js/sections.js, the place page and the 404 view in js/place.js, and the only
 * writer of #app is js/dom.js. This file owns nothing but the dispatch. */
(function () {
  "use strict";
  var R = window.GloryRouter;
  var S = window.GlorySections;
  var P = window.GloryPlacePage;
  var H = window.GloryHtml;

  function handleRoute(id) {
    var section = S.find(id);
    H.markCurrent("#/" + id);
    if (section) { section.render(); return; }
    if (id === "about") { window.location.href = "about.html"; return; }
    var place = R.findPlaceBySlug(id);
    if (place) { P.render(place); } else { P.notFound(); }
  }

  R.start(handleRoute);
})();
