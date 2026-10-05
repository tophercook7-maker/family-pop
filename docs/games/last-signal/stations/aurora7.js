/* AURORA-7 — Arctic Communications Specialist */

const AURORA7 = {
  id: "AURORA-7",
  name: "AURORA-7",
  location: "Svalbard Global Seed Vault — Satellite Uplink Facility",
  scenes: {
    intro: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "You are station AURORA-7 in the arctic. Right now, five stations around the world just received the same impossible signal.\\n\\nYou can: read the story, pick choices, and talk to your other stations in the Inter-Station Channel below.\\n\\nTip: open another tab as a different station to test cooperation. Your ending depends on what the group shares before time runs out.",
      choices: [
        {
          id: "c1",
          text: "Play the full signal audio",
          hint: "Requires audio subsystem clearance",
          next: "audio_play",
        },
        {
          id: "c2",
          text: "Run the coordinates through the nav systems",
          hint: "Cross-reference with station charts",
          next: "coordinates",
        },
        {
          id: "c3",
          text: "Ping the other stations with a status request",
          hint: "Use inter-station channel",
          event: { type: "broadcast", text: "AURORA-7: Signal received. Requesting status from all stations." },
          next: "first_ping",
        },
      ],
    },
    audio_play: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "You route the signal through the speakers. The burst is three seconds of white noise, then a voice — synthetic, genderless, speaking in perfect unison:\n\n'Come before it's too late. The window opens at the convergence. Bring what you have kept safe.'\n\nThen silence. The speakers die. All external channels are still dark.",
      choices: [
        { id: "c1", text: "Log it and move to coordinate analysis", next: "coordinates" },
        { id: "c2", text: "Attempt to rewind and isolate the audio amplitude", hint: "Technical challenge", next: "audio_rewind" },
      ],
    },
    audio_rewind: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "You strip the waveform layer by layer. Buried in the noise is a secondary signal — a repeating 16-bit pattern that matches nothing in any known comms standard.\n\nIt’s a handshake protocol. Something expected a reply. You didn’t send one.",
      choices: [
        {
          id: "c1",
          text: "Transmit the handshake back exactly as received",
          hint: "Risk: unknown recipient",
          event: { type: "setFlag", key: "aurora_handshake_sent" },
          next: "handshake_sent",
        },
        { id: "c2", text: "Archive it and move on", next: "coordinates" },
      ],
    },
    handshake_sent: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "The transmission takes 18 seconds. Nothing happens for a full minute. Then every screen in the facility shows a single new packet — not from any known satellite, not from any ground station.\n\nIt contains: one image, one number, one word. The word is 'PASS'.",
      choices: [
        {
          id: "c1",
          text: "Decode the image",
          next: "decode_image",
        },
        {
          id: "c2",
          text: "Broadcast the word PASS to all stations",
          hint: "Channels still mostly dead, but comms protocol may still carry it",
          event: { type: "broadcast", text: "AURORA-7: Received PASS. Sharing with all stations." },
          event2: { type: "setFlag", key: "pass_shared" },
          next: "after_pass",
        },
      ],
    },
    decode_image: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "The image is grainy and high-contrast: an aerial view of five numbered sites around the world. Each is circled in red. Site 3 — your site — has a second layer visible only in infrared, revealing a buried structure beneath the ice.",
      choices: [
        {
          id: "c1",
          text: "Overlay coordinates with the facility schematics",
          hint: "This will confirm or deny what you suspected",
          next: "overlay_schematics",
        },
        {
          id: "c2",
          text: "Send the image to the other stations immediately",
          hint: "They need to see this too",
          event: { type: "broadcast", text: "AURORA-7: Image received. Sending overlay of all five sites." },
          event2: { type: "setFlag", key: "map_shared" },
          next: "after_pass",
        },
      ],
    },
    overlay_schematics: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "The overlay aligns perfectly. Site 1 is a glacier facility. Site 2, a mountain peak. Site 4, an ocean trench. Site 5, a desert sinkhole. Site 3 — your buried structure — is the only one not on any public map.\n\nThe pattern is clear: someone built five identical structures 30 years ago and left them silent until tonight.",
      choices: [
        {
          id: "c1",
          text: "Broadcast your finding to all stations",
          event: { type: "broadcast", text: "AURORA-7: Confirmed. All five sites match a 30-year-old silent construction pattern." },
          event2: { type: "setFlag", key: "pattern_confirmed" },
          next: "after_pass",
        },
        { id: "c2", text: "Keep the schematics private", hint: "Knowledge is leverage", next: "after_pass" },
      ],
    },
    coordinates: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "The coordinates resolve to five locations worldwide. Three are uninhabited. Two host research stations — yours, and an alpine observatory in the Himalayas.\n\nThe date embedded in the signal is tomorrow. Not a warning. A delivery window.",
      choices: [
        { id: "c1", text: "Play the full audio", next: "audio_play" },
        {
          id: "c2",
          text: "Open a secure line to PINNACLE directly",
          hint: "PINNACLE handles signal analysis",
          event: { type: "setFlag", key: "pinnacle_contacted" },
          next: "pinnacle_link",
        },
      ],
    },
    pinnacle_link: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "The line to PINNACLE opens through a backup relay — slow, but stable. Their station leader, MIRA, confirms they received the same signal.\n\nThe coincidences are piling up fast.",
      choices: [
        {
          id: "c1",
          text: "Share the coordinates and date with PINNACLE",
          event: { type: "setFlag", key: "aurora_pinnacle_shared" },
          next: "after_pass",
        },
        {
          id: "c2",
          text: "Share only the date",
          event: { type: "setFlag", key: "aurora_pinnacle_partial" },
          next: "after_pass",
        },
      ],
    },
    first_ping: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "Five seconds after your status request, three stations respond. PINNACLE, MERIDIAN, and TRIDENT. HELIX is silent — either damaged or intentionally dark.\n\nAll three report identical signals. Same date. Same five words.",
      choices: [
        { id: "c1", text: "Share the signal analysis", hint: "Open your findings to the group", next: "coordinates" },
        {
          id: "c2",
          text: "Request each station send their raw signal copy",
          event: { type: "setFlag", key: "raw_requested" },
          next: "request_raw",
        },
      ],
    },
    request_raw: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "MERIDIAN confirms within 30 seconds: the raw signatures are byte-identical. Distance cannot create that precision. The signal was either broadcast from a central point with near-perfect timing, or… placed.\n\nPlanted. Before any of you were born.",
      choices: [
        { id: "c1", text: "Compare notes on the buried structure theory", next: "overlay_schematics" },
        { id: "c2", text: "Focus on the date", next: "coordinates" },
      ],
    },
    midnight_check: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "At midnight local, the aurora intensifies — not natural. The sky fractures with green and violet bands that pulse in time with the signal’s hidden 16-bit pattern.\n\nThis isn’t atmospheric. It’s engineered light. Something in orbit is painting your sky.",
      choices: [
        {
          id: "c1",
          text: "Try to photograph the aurora pattern",
          hint: "If HELIX is watching from orbit, they might see what you can’t",
          next: "after_pass",
        },
        { id: "c2", text: "Ignore it and focus on comms recovery", next: "after_pass" },
      ],
    },
    after_pass: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "Operations continue. The deadline looms. You have a clearer picture than most stations — the map, the pattern, maybe even the handshake protocol.\n\nThe final hours will require everything you’ve gathered.",
      choices: [
        {
          id: "c1",
          text: "Enter final preparations",
          hint: "This concludes AURORA-7’s campaign",
          event: { type: "setFlag", key: "aurora_ready" },
          next: "final_shared",
        },
      ],
    },
    final_shared: {
      location: "SVALBARD ARCTIC — AURORA-7",
      text:
        "You’ve done your part. Now the mission depends on whether the other stations have done theirs.\n\nStay on channel. Watch the clock. If convergence means what you think, time is almost up.",
      choices: [
        {
          id: "c1",
          text: "Check the mission outcome",
          event: { type: "checkEnding", ids: ["pattern_confirmed", "pass_shared", "aurora_ready"], ending: "united" },
          next: "final_shared",
        },
        {
          id: "c2",
          text: "Stand by for final transmission",
          next: "final_shared",
        },
      ],
    },
  },
  globalFlags: {
    pattern_confirmed: "Five-site construction pattern confirmed",
    pass_shared: "PASS keyword distributed",
    aurora_ready: "AURORA-7 mission complete",
    aurora_pinnacle_shared: "AURORA-7 shared coordinates with PINNACLE",
    aurora_pinnacle_partial: "AURORA-7 shared only date with PINNACLE",
    map_shared: "Site map distributed",
    aurora_handshake_sent: "AURORA-7 sent handshake reply",
    raw_requested: "Raw signal comparison requested",
  },
};

window.AURORA7 = AURORA7;
