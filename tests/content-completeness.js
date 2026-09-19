/* Content completeness contract. Run: node tests/content-completeness.js
 *
 * Checks every place for identity, honest photo slots, source discipline and
 * the disclosure of source discrepancies — the content rules of MASTER-PLAN
 * D6–D8. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var problems = [];
function check(ok, message) { if (!ok) { problems.push(message); } }

function element() {
  return {
    innerHTML: "",
    classList: { add: function () {}, remove: function () {} },
    addEventListener: function () {},
    getAttribute: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; }
  };
}
global.window = {
  location: { hash: "#/" },
  addEventListener: function () {},
  scrollTo: function () {}
};
global.document = {
  title: "",
  getElementById: function (id) { return id === "app" ? element() : null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; }
};

var indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
var modules = [];
indexHtml.replace(/<script src="([^"]+)"[^>]*><\/script>/g, function (all, src) {
  modules.push(src.replace(/\?.*$/, ""));
  return all;
});
check(modules.length >= 8, "index.html must load the app modules");

/* Direct eval at module top level: the app's own globals land in this file. */
eval(modules.slice(0, 4).map(function (file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}).join(";"));

check(PLACES.length >= 12, "at least 12 places expected, got " + PLACES.length);

var mostylibCount = 0;
PLACES.forEach(function (p) {
  var tag = p.slug;
  check(p.name && p.name.length > 3, tag + ": name");
  check(p.shortName && p.shortName.length > 3, tag + ": shortName");
  check(KINDS[p.kind], tag + ": kind in KINDS");
  check(p.coords && typeof p.coords.lat === "number" && typeof p.coords.lon === "number", tag + ": coords");
  check(p.address && p.address.length > 5, tag + ": address");
  check(p.appeal && p.appeal.length > 60, tag + ": appeal is a full sentence");
  check(p.history.length >= 2, tag + ": 2+ history paragraphs");
  p.history.forEach(function (para, i) {
    check(para.length > 80, tag + ": history paragraph " + (i + 1) + " is substantive");
  });
  check(p.facts.length >= 2, tag + ": 2+ facts");
  check(p.sources.length >= 2 || p.sources.length === 1, tag + ": sources present");
  var joined = p.sources.join(" ").toLowerCase();
  if (joined.indexOf("mostylib") !== -1 || joined.indexOf("библиотек") !== -1 ||
      joined.indexOf("збор помнікаў") !== -1 || joined.indexOf("памяць") !== -1 ||
      joined.indexOf("память") !== -1) {
    mostylibCount++;
  }
  if (p.photo) {
    check(typeof p.photoCredit === "string" && p.photoCredit.indexOf("http") !== -1, tag + ": photo attribution with link");
  } else {
    check(!p.photoCredit, tag + ": no attribution without photo");
    check(Array.isArray(p.visitPhotos) && p.visitPhotos.length === 0, tag + ": empty visitPhotos before the trip");
  }
});

/* Source discipline: the district library database anchors the district's
 * memorial data; it must appear in at least half of the places. */
check(mostylibCount >= PLACES.length / 2,
  "the district library database must anchor at least half of the places, got " + mostylibCount);

/* The Knyazhevodtsy tragedy must disclose its 600-vs-970 discrepancy. */
var kn = PLACES.filter(function (p) { return p.slug === "knyazhevodtsy"; })[0];
check(kn && kn.discrepancy && kn.discrepancy.indexOf("970") !== -1 && kn.discrepancy.indexOf("600") !== -1,
  "knyazhevodtsy must disclose the 600 vs 970 discrepancy");

/* The Mosty monument must name Zhukov. */
var mm = PLACES.filter(function (p) { return p.slug === "mosty-monument"; })[0];
check(mm && mm.history.join(" ").indexOf("Жуков") !== -1, "mosty-monument must tell Zhukov's story");

/* Nëman crossing places must carry their hero lists. */
var kov = PLACES.filter(function (p) { return p.slug === "kovshovo"; })[0];
check(kov && kov.history.join(" ").indexOf("Героя") !== -1, "kovshovo must name the seven heroes");
var ln = PLACES.filter(function (p) { return p.slug === "lunno-neman"; })[0];
check(ln && ln.history.join(" ").indexOf("Шеремет") !== -1, "lunno-neman must name Sheremet");

if (problems.length) {
  console.error("CONTENT FAILED:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("content-completeness.js: OK — " + PLACES.length + " places, sources anchored in " + mostylibCount);
