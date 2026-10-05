/* ANSWERING THE DARK — config.js
   Runtime config, loaded before the game scripts. The share-code relay URL
   lives here so multiplayer works across devices (phones, desktops, anywhere).
   Set to the deployed relay's public wss:// URL. If left null, the game falls
   back to same-device (BroadcastChannel) multiplayer, and solo always works. */
"use strict";
window.MC = window.MC || {};

// Public share-code relay (see server/relay_deno.ts, deployed free to Deno Deploy).
// Until the relay is deployed, this can stay null (solo + same-device still work).
MC.RELAY_URL = "wss://answering-the-dark-relay.tophercook7.deno.net";

// Auto-play demo mode (used once to record the App Review video). Keep false.
MC.DEMO = false;
