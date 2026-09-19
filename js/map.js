/* Схема района: сборка SVG из геометрии (js/map-geometry.js) и точек
 * маршрута. Ничего не считает сама: геометрия и проекция — в
 * map-geometry.js, разметка строк — в dom.js. Рисует: контур района,
 * Неман, дороги, нитку маршрута, звезды-маркеры с подписями и легенду. */
(function () {
  "use strict";

  var G = window.GloryMapGeometry;

  function markerPoints(orderedPlaces) {
    return G.routePoints(orderedPlaces);
  }

  /* Полная SVG-схема: district outline + river + roads + route line + markers. */
  function render(orderedPlaces) {
    var pts = markerPoints(orderedPlaces);
    var parts = [];

    parts.push('<div class="map-schema" role="img" aria-label="Схема Мостовского района с местами воинской славы">');
    parts.push('<svg viewBox="0 0 ' + G.W + " " + G.H + '" xmlns="http://www.w3.org/2000/svg">');

    /* Район */
    parts.push('<path class="map-district" d="' + G.pathString(G.DISTRICT, true) + '"/>');

    /* Дороги */
    [G.M6, G.R41, G.R44].forEach(function (road) {
      road.forEach(function (chain) {
        parts.push('<path class="map-road" d="' + G.pathString(chain, false) + '"/>');
      });
    });

    /* Река */
    G.RIVER.forEach(function (chain) {
      parts.push('<path class="map-river" d="' + G.pathString(chain, false) + '"/>');
    });

    /* Нитка маршрута: полилиния по точкам остановок */
    var line = pts.map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ");
    parts.push('<polyline class="map-route" points="' + line + '"/>');

    /* Маркеры: звезда + номер + подпись */
    pts.forEach(function (p) {
      parts.push('<g class="map-marker" data-slug="' + p.slug + '" transform="translate(' + p.x.toFixed(1) + "," + p.y.toFixed(1) + ')">' +
        '<a href="#/' + p.slug + '" aria-label="' + p.label + '">' +
        '<circle class="marker-hit" r="16"/>' +
        '<text class="marker-step" x="0" y="-14" text-anchor="middle">' + p.step + "</text>" +
        '<path class="marker-star" d="M0 -9 L2.6 -2.9 L9 -2.6 L4.2 1.7 L5.7 8 L0 4.4 L-5.7 8 L-4.2 1.7 L-9 -2.6 L-2.6 -2.9 Z"/>' +
        '<text class="marker-label" x="0" y="24" text-anchor="middle">' + p.label + "</text>" +
        "</a></g>");
    });

    parts.push("</svg>");

    /* Легенда */
    parts.push('<ul class="map-legend">' +
      '<li><span class="legend-route"></span> нитка маршрута</li>' +
      '<li><span class="legend-river"></span> р. Неман</li>' +
      '<li><span class="legend-road"></span> дороги М6, Р41, Р44</li>' +
      '<li><span class="legend-star"></span> место воинской славы</li>' +
      "</ul>");

    /* Список-оглавление под схемой */
    parts.push('<ol class="map-index">');
    orderedPlaces.forEach(function (place, i) {
      parts.push('<li><a href="#/' + place.slug + '">' + (i + 1) + ". " + place.shortName + "</a></li>");
    });
    parts.push("</ol>");

    parts.push("</div>");
    return parts.join("");
  }

  window.GloryMap = { render: render, markerPoints: markerPoints };
})();
