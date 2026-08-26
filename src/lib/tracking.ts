/**
 * Utilities for loading and trigger conversion tracking codes (Meta Pixel, Google Analytics)
 * to measure advertisement leads/conversions.
 */

// Initialize tracking scripts based on configured IDs in LocalStorage
export function initTracking() {
  const metaPixelId = localStorage.getItem('hans_meta_pixel_id') || '';
  const googleAnalyticsId = localStorage.getItem('hans_google_analytics_id') || '';

  // 1. Initialize Meta Pixel (fbevents.js)
  if (metaPixelId && !window.fbq) {
    try {
      /* eslint-disable */
      // @ts-ignore
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      
      // @ts-ignore
      fbq('init', metaPixelId);
      // @ts-ignore
      fbq('track', 'PageView');
      console.log(`[Tracking] Meta Pixel (${metaPixelId}) initialized.`);
    } catch (err) {
      console.error('[Tracking] Failed to initialize Meta Pixel:', err);
    }
  }

  // 2. Initialize Google Analytics (gtag.js)
  if (googleAnalyticsId && !window.gtag) {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', googleAnalyticsId);
      console.log(`[Tracking] Google Analytics (${googleAnalyticsId}) initialized.`);
    } catch (err) {
      console.error('[Tracking] Failed to initialize Google Analytics:', err);
    }
  }
}

// Fire "Lead" conversion event when someone submits a consultation inquiry
export function trackLeadConversion(details: {
  style: string;
  placement: string;
  size: number;
}) {
  const metaPixelId = localStorage.getItem('hans_meta_pixel_id') || '';
  const googleAnalyticsId = localStorage.getItem('hans_google_analytics_id') || '';

  // Fire Meta Pixel Lead event
  if (metaPixelId && window.fbq) {
    try {
      // @ts-ignore
      fbq('track', 'Lead', {
        content_name: 'Tattoo Inquiry Form',
        content_category: 'Leads',
        value: 1.0,
        currency: 'EUR',
        predicted_style: details.style,
        placement_zone: details.placement,
        size_cm: details.size
      });
      console.log('[Tracking] Meta Pixel "Lead" event tracked.');
    } catch (err) {
      console.error('[Tracking] Meta Pixel event failed:', err);
    }
  }

  // Fire Google Analytics generate_lead event
  if (googleAnalyticsId && window.gtag) {
    try {
      window.gtag('event', 'generate_lead', {
        event_category: 'engagement',
        event_label: 'Tattoo Inquiry Submission',
        value: 1.0,
        currency: 'EUR',
        tattoo_style: details.style,
        placement_zone: details.placement,
        size_cm: details.size
      });
      console.log('[Tracking] Google Analytics "generate_lead" event tracked.');
    } catch (err) {
      console.error('[Tracking] Google Analytics event failed:', err);
    }
  }
}

// Inject global window types for tracking scripts
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    gtag?: any;
    dataLayer?: any;
  }
}
