# Foodie

A responsive food discovery and ordering **demo** built with React 19 and the Sites Vinext starter.

## Run
Use Node 22.13+ and `npm run install:ci`, then `npm run dev`. Run `node --test tests/foodie.test.mjs` for basket and filtering tests. Use `npm run build` to build the Worker for Sites.

## What works
Cuisine filtering, vegetarian filtering, dish/kitchen search, price/time sorting, saved favourites, ingredient/allergen details, quantity controls, a persistent basket, neighbourhood label, demo checkout and simulated order confirmation. Responsive navigation, focus-managed dialogs, Escape dismissal and reduced motion support are included.

## Demo boundaries
All kitchens, prices and delivery estimates are sample data. Checkout does not collect payment, send orders, geocode addresses or contact restaurants. Basket and favourites use `foodie-v1` in this browser's localStorage; checkout details are in-memory only. These services need production integrations before launch.

## Design
Foodie's double-o becomes a plate motif. Jost, warm ivory, mint, pink and dark plum; original React/CSS composition informed by the visible MotionSites Sky Cookie example. Photos and fonts are local. See public/asset-credits.txt and docs/superpowers for design and implementation notes.
