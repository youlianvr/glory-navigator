/* DOM-инструменты отделов: оболочка страницы, экранирование, карточка
 * остановки, строка списка, таблица. Единственное место, где строки данных
 * превращаются в разметку и где пишется содержимое #app. */
(function () {
  "use strict";

  function escape(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Отрисовка страницы: содержимое + заголовок вкладки. Единственный вход
   * в #app — все отделы и страницы мест рисуются через него. */
  function paint(html, title) {
    var app = document.getElementById("app");
    if (!app) { return null; }
    app.innerHTML = html;
    if (title) { document.title = title; }
    return app;
  }

  /* Иконка-звезда — единый условный знак (js/glory-icon.js). */
  function icon(modifier, attrs) {
    if (!window.GloryIcon) { return ""; }
    return window.GloryIcon.svg("glory-star " + (modifier || "stop-icon"), attrs);
  }

  function stepNumber(index) {
    return '<span class="route-step">' + (index + 1) + "</span>";
  }

  /* Карточка объекта в отделах: шапка с номером и звездой плюс тело. */
  function stopCard(options) {
    var heading = options.titleHref
      ? '<h3><a href="#/' + escape(options.titleHref.slug) + '">' + escape(options.titleHref.text) + "</a></h3>"
      : "<h3>" + escape(options.title) + "</h3>";
    return '<article class="card stop-card"><header class="stop-head">' +
      stepNumber(options.index) + icon() + heading +
      '<p class="stop-meta">' + escape(options.meta) + "</p></header>" +
      (options.body || "") + "</article>";
  }

  /* Таблица с горизонтальной прокруткой. */
  function table(headers, rows) {
    var head = "<tr>" + headers.map(function (cell) { return "<th>" + escape(cell) + "</th>"; }).join("") + "</tr>";
    var body = rows.map(function (cells) {
      return "<tr>" + cells.map(function (cell) { return "<td>" + cell + "</td>"; }).join("") + "</tr>";
    }).join("");
    return '<div class="table-scroll"><table class="data-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }

  /* Текущий раздел в шапке. */
  function markCurrent(href) {
    Array.prototype.forEach.call(document.querySelectorAll(".navbar-links a"), function (link) {
      if (link.getAttribute("href") === href) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.GloryHtml = {
    escape: escape,
    markCurrent: markCurrent,
    paint: paint,
    icon: icon,
    stopCard: stopCard,
    table: table
  };
})();
