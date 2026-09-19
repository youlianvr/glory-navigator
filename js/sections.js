/* Четыре отдела навигатора: Маршрут, Карта-схема,
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

  /* ---------- Маршрут: порядок остановок и о чём каждая.
   * Полная история, факты и источники живут на страницах мест. ---------- */
  function renderRoute() {
    var html = '<h1>Нитка маршрута «Дорогами славы»</h1>' +
      "<p class=\"lead\">" + THEME.freedOn + ". Двенадцать точек от монумента в Мостах до городского кладбища: сначала западная петля, затем восточный обход района.</p>" +
      '<div class="route-cards">';
    ordered().forEach(function (place, i) {
      html += H.stopCard({
        index: i,
        titleHref: { slug: place.slug, text: place.shortName },
        meta: kindLabel(place) + (place.year ? " · " + place.year : ""),
        body: "<p>" + H.escape(place.appeal) + "</p>",
      });
    });
    html += "</div>";
    H.paint(html, "Нитка маршрута: Дорогами славы");
  }

  /* ---------- Карта-схема ---------- */
  function renderMap() {
    var html = '<h1>Карта-схема</h1>' +
      "<p class=\"lead\">Схема Мостовского района: граница района, Неман, основные дороги и двенадцать мест воинской славы. Нажмите на звезду или на список под схемой, чтобы открыть страницу места.</p>" +
      window.GloryMap.render(ordered());
    H.paint(html, "Карта-схема: Дорогами славы");
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
      "<p class=\"lead\">Адреса и координаты всех точек в порядке прохождения. Кнопка открывает точку во внешней карте, от неё прокладывается маршрут.</p>" +
      H.table(["№", "Место", "Адрес", "Координаты", "Внешние карты"], rows);
    H.paint(html, "Логистика: Дорогами славы");
  }

  /* ---------- Справочная информация ---------- */
  function renderSpravka() {
    var html = '<h1>Справочная информация</h1>' +
      "<p class=\"lead\">Как читать числа на страницах мест и откуда они взяты.</p>" +
      '<div class="card"><h3>Обозначения на страницах мест</h3><ul>' +
      Object.keys(KINDS).map(function (k) { return "<li><strong>" + H.escape(KINDS[k]) + "</strong>: тип памятного знака</li>"; }).join("") +
      "<li><strong>О расхождении источников</strong>: число погибших или дата в разных книгах не совпадают; на странице места приводятся оба варианта</li>" +
      "</ul></div>" +
      '<div class="card"><h3>Откуда данные</h3><ul>' +
      '<li>База Мостовской районной библиотеки: «Памятники Великой Отечественной войны (1941–1945) на территории Мостовского района» (mostylib.by)</li>' +
      '<li>«Збор помнікаў гісторыі і культуры Беларусі. Гродзенская вобласць». Мінск, 1986</li>' +
      '<li>«Памяць: гіст.-дакум. хроніка Мастоўскага раёна». Мінск, 2002</li>' +
      '<li>savehistory.by: координаты Национального кадастрового агентства</li>' +
      '<li>Мостовский райисполком (mosty.gov.by), «Зара над Нёманам» (izvezda.by, mosty-zara.by)</li>' +
      "</ul></div>";
    H.paint(html, "Справочная информация: Дорогами славы");
  }

  window.GlorySections = {
    list: [
      { id: "", href: "#/", label: "Нитка маршрута", render: renderRoute },
      { id: "map", href: "#/map", label: "Карта-схема", render: renderMap },
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
