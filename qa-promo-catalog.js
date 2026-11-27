/* Proposed launch prices. Checkout remains disabled until EUR fulfillment is verified. */
(function (root) {
  'use strict';
  const offers = [
    { id: 'editor_day', days: 1, minorUnits: 100 },
    { id: 'editor_week', days: 7, minorUnits: 299 },
    { id: 'editor_14days', days: 14, minorUnits: 499 },
    { id: 'editor_month', days: 30, minorUnits: 799 },
    { id: 'editor_90days', days: 90, minorUnits: 1799 },
    { id: 'editor_year', days: 365, minorUnits: 4999 },
  ].map(Object.freeze);
  function formatPrice(minorUnits, locale) {
    try { return new Intl.NumberFormat(locale || 'en', { style: 'currency', currency: 'EUR' }).format(minorUnits / 100); }
    catch { return new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' }).format(minorUnits / 100); }
  }
  function formatDuration(days, locale) {
    try { return new Intl.NumberFormat(locale || 'en', { style: 'unit', unit: 'day', unitDisplay: 'long' }).format(days); }
    catch { return days + (days === 1 ? ' day' : ' days'); }
  }
  const catalog = Object.freeze({ currency: 'eur', state: 'draft', autoRenew: false, checkoutReady: false, offers: Object.freeze(offers), formatPrice, formatDuration });
  root.QAPromoCatalog = catalog;
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
})(typeof window === 'undefined' ? globalThis : window);
