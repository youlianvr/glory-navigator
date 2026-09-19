/* Единый условный знак навигатора — пятиконечная звезда (SVG).
 * Одна и та же иконка на схеме, в легенде, в списках и карточках:
 * как church-icon.js в проекте храмов. */
(function () {
  "use strict";

  /* Путь звезды в координатах 24x24, центр (12,12), R=10/r=3.8. */
  var STAR = "M12 2 L14.35 8.2 L21 8.7 L16 13 L17.6 19.5 L12 16 L6.4 19.5 L8 13 L3 8.7 L9.65 8.2 Z";

  function svg(className, attrs) {
    var a = attrs || {};
    var transform = "";
    if (a.x !== undefined && a.y !== undefined) {
      transform = ' transform="translate(' + a.x + "," + a.y + ')"';
    }
    var size = a.size || 24;
    return '<svg class="' + className + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"' + transform + '>' +
      '<path d="' + STAR + '" fill="currentColor" stroke="rgba(0,0,0,.25)" stroke-width="0.5"/>' +
      "</svg>";
  }

  window.GloryIcon = { svg: svg };
})();
