/* Страница места: история, факты, расхождение источников, фото-слоты,
 * ссылки на внешние карты, соседи по нитке маршрута, 404. */
(function () {
  "use strict";

  var H = window.GloryHtml;

  function kindLabel(place) {
    return KINDS[place.kind] || "Памятное место";
  }

  function mapLinks(place) {
    var lat = place.coords.lat, lon = place.coords.lon;
    return '<div class="map-links">' +
      '<a class="btn" target="_blank" rel="noopener" href="https://yandex.by/maps/?ll=' + lon + "%2C" + lat + "&z=17&pt=" + lon + "%2C" + lat + ',comma">Открыть на Яндекс.Картах</a> ' +
      '<a class="btn btn-secondary" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=' + lat + "&mlon=" + lon + "#map=17/" + lat + "/" + lon + '">Открыть в OpenStreetMap</a>' +
      "</div>";
  }

  function render(place) {
    var neighbours = window.GloryRouter.routeNeighbours(place);
    var html = '<article class="place-page">' +
      '<header class="place-head">' +
      '<p class="place-kind">' + H.escape(kindLabel(place)) + " · " + H.escape(place.settlement) + (place.year ? " · " + H.escape(place.year) : "") + "</p>" +
      "<h1>" + H.escape(place.name) + "</h1>" +
      '<p class="place-address">' + H.icon() + " " + H.escape(place.address) + "</p>" +
      "</header>";

    html += '<section class="place-appeal"><p class="lead">' + H.escape(place.appeal) + "</p></section>";

    html += '<section class="place-history"><h2>История</h2>' +
      place.history.map(function (p) { return "<p>" + H.escape(p) + "</p>"; }).join("") +
      "</section>";

    html += '<section class="place-facts"><h2>Факты</h2><ul>' +
      place.facts.map(function (f) { return "<li>" + H.escape(f) + "</li>"; }).join("") +
      "</ul></section>";

    if (place.discrepancy) {
      html += '<section class="place-discrepancy"><h2>О расхождении источников</h2><p>' + H.escape(place.discrepancy) + "</p></section>";
    }

    html += '<section class="place-photo"><h2>Фотографии</h2>';
    if (place.photo) {
      html += '<figure><img src="' + H.escape(place.photo) + '" alt="' + H.escape(place.name) + '" width="' + place.photoSize[0] + '" height="' + place.photoSize[1] + '">' +
        "<figcaption>" + H.escape(place.photoCredit) + "</figcaption></figure>";
    } else {
      html += '<p class="photo-slot">Снимок этого места появится после полевой поездки авторов проекта. Чужих фотографий мы здесь не публикуем.</p>';
    }
    if (place.visitPhotos.length) {
      html += '<div class="visit-photos">' + place.visitPhotos.map(function (src) {
        return '<img src="' + H.escape(src) + '" alt="Фотоотчёт: ' + H.escape(place.shortName) + '">';
      }).join("") + "</div>";
    } else {
      html += '<p class="photo-slot">Фотоотчёт о личном посещении будет добавлен после поездки.</p>';
    }
    html += "</section>";

    html += '<section class="place-nav"><h2>Как найти</h2>' + mapLinks(place) + "</section>";

    html += '<section class="place-sources"><h2>Источники</h2><ul>' +
      place.sources.map(function (s) { return "<li>" + H.escape(s) + "</li>"; }).join("") +
      "</ul></section>";

    html += '<nav class="place-neighbours">' +
      (neighbours.prev ? '<a class="btn btn-secondary" href="#/' + neighbours.prev.slug + '">← ' + H.escape(neighbours.prev.shortName) + "</a> " : "") +
      (neighbours.next ? '<a class="btn btn-secondary" href="#/' + neighbours.next.slug + '">' + H.escape(neighbours.next.shortName) + " →</a>" : "") +
      "</nav>";

    html += "</article>";

    H.paint(html, place.shortName + " — Дорогами славы");
  }

  function notFound() {
    H.paint(
      '<h1>Такой страницы нет</h1>' +
      '<p class="lead">Адрес не совпал ни с одним местом маршрута. Откройте <a href="#/">нитку маршрута</a> или <a href="#/map">карту-схему</a>.</p>',
      "Страница не найдена — Дорогами славы"
    );
  }

  window.GloryPlacePage = { render: render, notFound: notFound };
})();
