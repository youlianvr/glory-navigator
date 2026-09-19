# Verification contract

The project is a no-build vanilla app. The contracts check behavior, not visual polish.

## Focused contract

```bash
node tests/contract.js
```

Reads the module list from `index.html` and executes those scripts in the page's own
order, so a page that loads the wrong files fails the test. Covers: one implementation
(`js/dom.js` is the only writer of `#app`), the five section pages in the nav, the
12-place data boundary (unique slugs, route order = `routeStep`), full place-page
rendering (name, sources, both external map links with coordinates, discrepancy
disclosure), the 404 state including the tab title, dispatch of every URL state
through the router, ring wraparound, hash parsing, and the map schema (route line,
one star marker per place, legend, index list).

## Content contract

```bash
node tests/content-completeness.js
```

Checks every place for identity, substantive history paragraphs and facts, source
discipline (the district library database anchors at least half of the places),
honest photo slots (attribution only with a photo, empty `visitPhotos` before the
trip), the Knyazhevodtsy 600-vs-970 discrepancy disclosure, Zhukov's story at the
Mosty monument, and the hero lists at both Nëman crossing places.
