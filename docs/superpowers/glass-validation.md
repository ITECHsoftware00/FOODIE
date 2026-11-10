# Glass redesign validation

2026-11-10: Adapted the user-supplied Facet glass reference to the existing Foodie brand and ordering demo. Glass, bevels, gradients and restrained sheen intentionally follow the user's reference despite generic design-skill defaults.

Verified: TypeScript, four basket/filter tests, production build, production WebGL load and shatter/back interaction. Browser checks at 1440, 768, 390 and 360 pixels found no document overflow. Complete mobile dish/detail/quantity/bag/checkout/confirmation journey returned two dishes and GBP 27.49. Reduced-motion story controls, Escape, Back focus restoration, and story-to-menu focus passed.

Review corrected entrance fill mode masking plate hover and focus returning to the hero after the story's menu CTA.

Visual review: smoked black backdrop, five bevelled shards, readable white display typography, muted green accent, retained food photographs, consistent dark catalogue and dialogs. Desktop and phone screenshots inspected; tablet full page inspected. Visual estimate: hierarchy 8/10, consistency 8/10, motion 8/10. The hero adapts rather than exactly reproduces Facet: DOM content travels as grouped layers rather than text being sliced onto each mesh; geometry is reused rather than rebuilt at 45 Hz.

Limit: automated taste inspector failed with CDP Page.enable timeout; responsive and interaction checks used Playwright instead. No claim of inspector certification or real-device GPU profiling. Three.js is lazy-loaded; its bundle triggers a build size advisory. Rendering sleeps offscreen and when motion is paused/reduced, and resources are disposed on unmount.

Demo only: no payments, restaurant fulfilment or real delivery. Existing local asset credits remain in public/asset-credits.txt.
