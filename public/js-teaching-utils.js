(function (global) {
  "use strict";

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function formatValue(value) {
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "bigint") return `${value}n`;
    if (Object.is(value, -0)) return "-0";
    return String(value);
  }

  global.DevPathTeachingUtils = Object.freeze({ escapeHTML, formatValue });
})(globalThis);
