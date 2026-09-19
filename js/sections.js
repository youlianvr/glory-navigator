/* Пять отделов навигатора: Нитка маршрута, Карта-схема, Описание,
 * Логистика, Справочная информация. Каждый отдел — функция render(),
 * рисующая через GloryHtml.paint. */
(function () {
  "use strict";

  var H = window.GloryHtml;

  function ordered() {
    return ROUTE.map(function (slug) {
      return window.GloryRouter.findPlaceBySlug(slug);
    });
  }

  function kindLabel(place) {
    return KINDS[place.kind] || "Памятное место";
  }

  /* Карта-кнопки на внешние карты: два формата ссылок на каждое место. */
  function mapLinks(place) {
    var lat = place.coords.lat, lon = place.coords.lon;
    return '<div class="map-links">' +
      '<a class="btn" target="_blank" rel="noopener" href="https://yandex.by/maps/?ll=' + lon + "%2C" + lat + "&z=16&pt=" + lon + "%2C" + lat + ',comma">Открыть на Яндекс.Картах</a> ' +
      '<a class="btn btn-secondary" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=' + lat + "&mlon=" + lon + "#map=16/" + lat + "/" + lon + '">Открыть в OpenStreetMap</a>' +
      "</div>";
  }

  /* ---------- Нитка маршрута ---------- */
  function renderRoute() {
    var html = '<h1>Нитка маршрута «Дорогами славы»</h1>' +
      "<p class=\"lead\">" + THEME.tagline + ". " + THEME.freedOn + ". Маршрут — линия без петель: Мосты → западная петля (Дубно, Княжеводцы, Лунно, Ковшово, Гудевичи) → восточный обход (Мальковичи, Бояры, Задворье) → Мосты. Протяжённость ≈ 120–140 км.</p>" +
      '<ol class="route-list">';
    ordered().forEach(function (place, i) {
      html += H.stopRow({
        slug: place.slug,
        index: i,
        title: place.shortName,
        meta: kindLabel(place) + " · " + place.settlement,
      });
    });
    html += "</ol>";
    H.paint(html, "Нитка маршрута — Дорогами славы");
  }

  /* ---------- Карта-схема ---------- */
  function renderMap() {
    var html = '<h1>Карта-схема</h1>' +
      "<p class=\"lead\">Схема Мостовского района: граница района, Неман, основные дороги и двенадцать мест воинской славы. Нажмите на звезду или на список под схемой, чтобы открыть страницу места.</p>" +
      window.GloryMap.render(ordered());
    H.paint(html, "Карта-схема — Дорогами славы");
  }

  /* ---------- Описание ---------- */
  function renderOpis() {
    var html = '<h1>Описание мест</h1>' +
      "<p class=\"lead\">Краткая справка по каждому месту и обоснование его привлекательности. Полные истории — на страницах мест.</p>";
    ordered().forEach(function (place, i) {
      html += H.stopCard({
        index: i,
        titleHref: { slug: place.slug, text: place.name },
        meta: kindLabel(place) + " · " + place.settlement + (place.year ? " · " + place.year : ""),
        body: "<p>" + H.escape(place.appeal) + "</p>",
      });
    });
    H.paint(html, "Описание — Дорогами славы");
  }

  /* ---------- Логистика ---------- */
  function renderLogistika() {
    var rows = ordered().map(function (place, i) {
      return [
        String(i + 1),
        '<a href="#/' + H.escape(place.slug) + '">' + H.escape(place.shortName) + "</a>",
        H.escape(place.address) + (place.exactAddr ? "" : ' <em>(координаты уточняются)</em>'),
        place.coords.lat.toFixed(5) + ", " + place.coords.lon.toFixed(5),
        mapLinks(place),
      ];
    });
    var html = '<h1>Логистика</h1>' +
      "<p class=\"lead\">Адреса и координаты всех точек маршрута. Кнопки открывают точку во внешней карте — от неё можно проложить маршрут от своего местоположения. Порядок точек — географический: западная петля, затем восточный обход, старт и финиш в Мостах (≈ 120–140 км).</p>" +
      H.table(["№", "Место", "Адрес", "Координаты", "Внешние карты"], rows);
    H.paint(html, "Логистика — Дорогами славы");
  }

  /* ---------- Справочная информация ---------- */
  function renderSpravka() {
    var html = '<h1>Справочная информация</h1>' +
      "<p class=\"lead\">Дата освобождения района, типы памятных мест и правила работы с источниками.</p>" +
      '<div class="card"><h3>' + H.escape(THEME.freedOn) + "</h3>" +
      "<p>Мостовский район освобождён от немецко-фашистских захватчиков 13 июля 1944 года в ходе Белорусской операции. Форсирование Немана частями 49-й и 3-й армий 2-го Белорусского фронта проходило 14–15 июля 1944 года.</p></div>" +
      '<div class="card"><h3>Типы памятных мест</h3><ul>' +
      Object.keys(KINDS).map(function (k) { return "<li><strong>" + H.escape(KINDS[k]) + "</strong></li>"; }).join("") +
      "</ul></div>" +
      '<div class="card"><h3>Источники</h3><ul>' +
      '<li>База Мостовской районной библиотеки — «Памятники Великой Отечественной войны (1941–1945) на территории Мостовского района» (mostylib.by)</li>' +
      '<li>«Збор помнікаў гісторыі і культуры Беларусі. Гродзенская вобласць». — Мінск, 1986</li>' +
      '<li>«Памяць: гісторыка-дакументальная хроніка Мастоўскага раёна». — Мінск, 2002</li>' +
      '<li>savehistory.by — координаты Национального кадастрового агентства</li>' +
      '<li>Мостовский райисполком (mosty.gov.by), «Зара над Нёманам» (izvezda.by, mosty-zara.by)</li>' +
      "</ul><p>Если источники расходятся, мы приводим оба числа и прямо говорим об этом на странице места.</p></div>";
    H.paint(html, "Справочная информация — Дорогами славы");
  }

  window.GlorySections = {
    list: [
      { id: "", href: "#/", label: "Нитка маршрута", render: renderRoute },
      { id: "map", href: "#/map", label: "Карта-схема", render: renderMap },
      { id: "opis", href: "#/opis", label: "Описание", render: renderOpis },
      { id: "logistika", href: "#/logistika", label: "Логистика", render: renderLogistika },
      { id: "spravka", href: "#/spravka", label: "Справочная информация", render: renderSpravka },
    ],
    find: function (id) {
      var i;
      for (i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) { return this.list[i]; }
      }
      return null;
    },
  };
})();
