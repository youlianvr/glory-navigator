/* Behavior contract for the no-build vanilla app. Run: node tests/contract.js
 *
 * Modules are read from index.html and executed in the page's own order, so the
 * test fails if the page and the app drift apart. Every check stands for a
 * requirement (the navigator's sections, nav, or a page behavior), not for an
 * internal function name. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var problems = [];
function check(ok, message) { if (!ok) { problems.push(message); } }

var indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
var aboutHtml = fs.readFileSync(path.join(root, "about.html"), "utf8");

/* --- the app's module list: exactly what index.html loads, in its order --- */
var modules = [];
indexHtml.replace(/<script src="([^"]+)"[^>]*><\/script>/g, function (all, src) {
  modules.push(src.replace(/\?.*$/, ""));
  return all;
});

/* --- minimal DOM: one #app writer, one .map-schema box, page listeners --- */
function element() {
  return {
    innerHTML: "", scrollLeft: 0, scrollWidth: 0, clientWidth: 0,
    classList: { add: function () {}, remove: function () {}, toggle: function () {} },
    addEventListener: function () {}, getAttribute: function () { return null; },
    querySelector: function () { return null; }, querySelectorAll: function () { return []; }
  };
}
var appEl = element();
var listeners = {};
global.window = {
  location: { hash: "#/", replace: function (url) { this.hash = url; } },
  addEventListener: function (type, handler) { (listeners[type] = listeners[type] || []).push(handler); },
  scrollTo: function () {}
};
global.document = {
  title: "",
  getElementById: function (id) { return id === "app" ? appEl : null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; }
};
function fire(type) { (listeners[type] || []).forEach(function (handler) { handler(); }); }

/* Direct eval at module top level: the app's own globals land in this file. */
eval(modules.map(function (file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}).join(";"));

var H = window.GloryHtml;
var R = window.GloryRouter;
var sections = window.GlorySections.list;
function section(id) { return window.GlorySections.find(id); }
function find(slug) { return R.findPlaceBySlug(slug); }

/* --- structure: one implementation, one writer of #app --- */
var jsDir = path.join(root, "js");
var writers = fs.readdirSync(jsDir).filter(function (file) {
  return /getElementById\("app"\)/.test(fs.readFileSync(path.join(jsDir, file), "utf8"));
});
check(writers.join(",") === "dom.js", "#app must be written by js/dom.js alone, got: " + writers.join(","));
check(/<script/.test(indexHtml), "index.html must load the app");
check(!/<script/.test(aboutHtml), "about.html is static and must not load app code");

/* --- four section pages in the nav --- */
var REQUIRED_LABELS = ["Нитка маршрута", "Карта-схема", "Логистика", "Справочная информация"];
check(sections.map(function (s) { return s.label; }).join("|") === REQUIRED_LABELS.join("|"),
  "the nav must carry the four section pages in the document's order");
sections.forEach(function (item) {
  check(indexHtml.indexOf('href="' + item.href + '"') !== -1, "navbar must link " + item.label + " (" + item.href + ")");
});

/* --- objects: 12 places, route order matches routeStep --- */
check(PLACES.length >= 12, "data must carry at least 12 places, got " + PLACES.length);
check(ROUTE.length === PLACES.length, "ROUTE must cover every place");
var seenSlugs = {};
PLACES.forEach(function (p) {
  check(!seenSlugs[p.slug], "slug must be unique: " + p.slug);
  seenSlugs[p.slug] = true;
  check(p.history.length >= 2, "history of " + p.slug + " needs 2+ paragraphs");
  check(p.facts.length >= 2, "facts of " + p.slug + " need 2+ items");
  check(p.sources.length >= 1, "sources of " + p.slug + " must not be empty");
  check(typeof p.appeal === "string" && p.appeal.length > 40, "appeal of " + p.slug + " must be a real sentence");
  check(Array.isArray(p.visitPhotos), "visitPhotos of " + p.slug + " must be an array");
  if (p.photo) {
    check(p.photoCredit && p.photoCredit.indexOf("http") !== -1, "photo of " + p.slug + " needs attribution with a link");
  } else {
    check(!p.photoCredit, "empty photo slot of " + p.slug + " must not carry attribution");
  }
});
ROUTE.forEach(function (slug, i) {
  check(find(slug) && find(slug).routeStep === i + 1, "routeStep must match ROUTE order for " + slug);
});

/* --- each place page renders with its own identity --- */
PLACES.forEach(function (p) {
  window.GloryPlacePage.render(p);
  check(appEl.innerHTML.indexOf(p.name) !== -1, "page of " + p.slug + " must show its name");
  check(appEl.innerHTML.indexOf("Источники") !== -1, "page of " + p.slug + " must show sources");
  check(appEl.innerHTML.indexOf("yandex.by/maps") !== -1, "page of " + p.slug + " must link Yandex Maps");
  check(appEl.innerHTML.indexOf("openstreetmap.org") !== -1, "page of " + p.slug + " must link OSM");
  if (p.discrepancy) {
    check(appEl.innerHTML.indexOf("расхождении") !== -1, "page of " + p.slug + " must disclose the source discrepancy");
  }
  var lat = String(p.coords.lat), lon = String(p.coords.lon);
  check(appEl.innerHTML.indexOf(lat) !== -1 && appEl.innerHTML.indexOf(lon) !== -1,
    "map links of " + p.slug + " must carry its coordinates");
});

/* --- 404 for unknown slug, including tab title --- */
window.GloryPlacePage.notFound();
check(appEl.innerHTML.indexOf("Такой страницы нет") !== -1, "404 view must render");
check(document.title.indexOf("не найдена") !== -1, "404 must set the tab title");

/* --- dispatch of every URL state through the router --- */
var dispatched = [];
var savedRender = sections.map(function (s) { return s.render; });
sections.forEach(function (s) {
  s.render = function () { dispatched.push(s.id); };
});
["#", "#/", "#/map", "#/logistika", "#/spravka"].forEach(function (hash) {
  global.window.location.hash = hash;
  fire("hashchange");
});
check(dispatched.join(",") === ",map,logistika,spravka",
  "router must dispatch every section route, got: " + dispatched.join(","));
/* place route dispatch */
var routedPlace = null;
window.GloryPlacePage.render = function (p) { routedPlace = p; };
global.window.location.hash = "#/knyazhevodtsy";
fire("hashchange");
check(routedPlace && routedPlace.slug === "knyazhevodtsy", "router must dispatch a place slug to the place page");
/* unknown slug → 404 */
var notFoundFired = false;
window.GloryPlacePage.notFound = function () { notFoundFired = true; };
global.window.location.hash = "#/no-such-place";
fire("hashchange");
check(notFoundFired, "router must fall back to 404 for unknown slugs");

/* --- ring wraparound: neighbours of first/last stops --- */
var first = find(ROUTE[0]);
var last = find(ROUTE[ROUTE.length - 1]);
check(R.routeNeighbours(first).prev.slug === last.slug, "route must wrap: prev of stop 1 is the last stop");
check(R.routeNeighbours(last).next.slug === first.slug, "route must wrap: next of the last stop is stop 1");

/* --- map schema: route line, 12 markers, legend, index --- */
sections.forEach(function (s, i) { s.render = savedRender[i]; });
section("map").render();
check(appEl.innerHTML.split("map-marker").length - 1 >= PLACES.length, "schema must draw a marker per place");
check(appEl.innerHTML.indexOf("map-route") !== -1, "schema must draw the route line");
check(appEl.innerHTML.indexOf("map-legend") !== -1, "schema must carry the legend");
check(appEl.innerHTML.indexOf("map-index") !== -1, "schema must carry the index list");
check((appEl.innerHTML.match(/marker-star/g) || []).length >= PLACES.length, "every marker must use the star icon");

/* --- hash parsing --- */
global.window.location.hash = "#/logistika?x=1";
check(R.parseRoute() === "logistika", "router must strip query strings");
global.window.location.hash = "#/logistika/";
check(R.parseRoute() === "logistika", "router must strip trailing slashes");

if (problems.length) {
  console.error("CONTRACT FAILED:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("contract.js: OK — " + PLACES.length + " places, " + sections.length + " sections, 404, wraparound, map schema");
