# Foodie discovery and ordering demo

The user chose discovery plus ordering demo and instructed us to continue. Build an expressive, polished, responsive consumer experience, not a live delivery service.

## Approach
Use the existing Sites Vinext/React starter. An editorial marketplace combines a memorable hero with immediately useful cuisine browsing. A dashboard would weaken food photography; a pure marketing page would not deliver ordering. Chosen direction: one motif, based on Foodie's double-o as plates. Jost typography, ivory ground, plum ink, mint hero and pink accents; palette adapted from the dealt mint/pink proportions to the food subject.

## Experience
Header: Foodie mark, discovery navigation, delivery location, favourites and basket. Hero: Good food. Great mood., browse action, large bowl photograph with subtle entrance and floating dish labels. Menu: six sample dishes, cuisine and vegetarian filters, text search, sorting, accessible details with ingredients and allergens, quantities and add-to-basket. Favourites toggle and persist. Basket supports adjustment and removal, calculated delivery fee, and demo checkout form. Success shows a clearly simulated order summary. Local storage only; no real payment, dispatch, account, or location lookup.

## Motion and accessibility
CSS transform/opacity animations, 180–250ms controls, longer one-time hero entrance, no scroll hijacking, prefers-reduced-motion support and pause-motion toggle. Dialog primitives handle focus trapping, Escape and restoration. Visible labels, keyboard focus, 44px targets, mobile bottom navigation and safe-area padding. Verify at mobile, tablet and desktop widths.

## Assets and research
MotionSites Sky Cookie was inspected visually: floating food object, oversized type and strong field colour. Premium prompt locked; no extraction. Recent.design reviewed as inspiration directory. Brandguidelines.net unavailable. Deck.gallery public catalog documentation reviewed; slide assets are not reusable artwork. Create original hero artwork and use sample food photography. All dishes, prices and restaurants are demonstration data, not claims about trading businesses.

## Acceptance
Search/filter empty state and reset work. Basket math uses integer pence; quantity zero removes items; malformed stored data is discarded. Checkout validates required fields, makes no external requests and clears basket only after confirmation. No console errors, horizontal overflow or broken primary controls. Publish privately through Sites if deployment is available.
