/* PINNACLE — Mountain Signal Analyst */

const PINNACLE = {
  id: "PINNACLE",
  name: "PINNACLE",
  location: "Himalayan Relay Observatory — Signal Processing Lab",
  scenes: {
    intro: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "Cold settles thick inside the observatory dome. Outside, the wind howls across rock and ice. Inside, your signal array just locked onto five impossible synchronized bursts.\n\nYour station is the world’s foremost signal-analysis post. These bursts are not natural. They are not from any known satellite, aircraft, or ground transmitter.\n\nThe timestamps match to within 1.2 nanoseconds across five global sites. That kind of precision can only come from one place: the same source, deliberately spaced.",
      choices: [
        {
          id: "p1",
          text: "Run a spectral analysis on the carrier wave",
          hint: "Look for hidden layers",
          next: "spectral",
        },
        {
          id: "p2",
          text: "Attempt to triangulate the originating direction",
          hint: "Requires stable satellite lock — currently unavailable",
          next: "triangulate",
        },
        {
          id: "p3",
          text: "Check the message for steganography",
          hint: "Hidden data in plain sight",
          next: "stego",
        },
      ],
    },
    spectral: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "The spectral waterfall reveals something unexpected: the bursts are not one signal. They are five coordinated voices, phased so precisely that they appear to arrive simultaneously.\n\nBeneath the voice layer is a narrowband subcarrier — a channel-within-a-channel. It carries a sequence of prime numbers: 2, 3, 5, 7, 11.\n\nFive stations. Five numbers.",
      choices: [
        {
          id: "p1",
          text: "Share the prime-number finding with all stations",
          event: { type: "broadcast", text: "PINNACLE: Carrier contains prime sequence 2,3,5,7,11. Coordination required." },
          event2: { type: "setFlag", key: "primes_shared" },
          next: "after_primes",
        },
        {
          id: "p2",
          text: "Continue decoding the subcarrier privately",
          next: "subcarrier_decode",
        },
      ],
    },
    subcarrier_decode: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "You pull the subcarrier forward. Beyond the primes, it resolves into five distinct identifiers — not names, but codes: TLD-09, WRC-14, ARC-22, OCN-31, ORB-45.\n\nThe prefixes match no standard. The suffixed numbers, though, sum to 121.\n\n11 × 11.\n\nThe same handshake pattern AURORA-7 saw in their audio.",
      choices: [
        { id: "p1", text: "Broadcast this immediately", next: "after_primes" },
      ],
    },
    triangulate: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "Satellite lock is down — your triangulation arrays are blind. But the signal’s phase coherence across five sites lets you work backward.\n\nIf five sites received the signal together, then the source must be… everywhere and nowhere. Not a physical transmitter, but a pattern encoded into existing infrastructure.\n\nThis changes everything.",
      choices: [
        {
          id: "p1",
          text: "Tell the other stations the source may be a coordinated pattern",
          event: { type: "broadcast", text: "PINNACLE: Source may be coordinated pattern, not physical transmitter." },
          event2: { type: "setFlag", key: "pattern_hypothesis" },
          next: "after_primes",
        },
      ],
    },
    stego: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "You push the audio through FFT extraction. Hidden in the noise floor is a repeating waveform — the same 16-bit handshake protocol AURORA-7 found.\n\nThe protocol is a time-based challenge-response. The challenge expires in 5 hours. After that, whatever is listening will assume no one answered.",
      choices: [
        {
          id: "p1",
          text: "Broadcast the time-critical warning",
          event: { type: "broadcast", text: "PINNACLE: Handshake expires in 5 hours. We need coordinated reply." },
          event2: { type: "setFlag", key: "timeout_warning_shared" },
          next: "after_primes",
        },
      ],
    },
    after_primes: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "The pieces are scattered across five stations. You have the timing. You have the pattern. But you need the full picture.\n\nThe final window is measured in hours, not minutes. Every station that stays silent narrows the answer.",
      choices: [
        {
          id: "p1",
          text: "Reach out to AURORA-7 directly",
          hint: "They have strong comms infrastructure",
          event: { type: "setFlag", key: "pinnacle_aurora_contact" },
          next: "aurora_link",
        },
        {
          id: "p2",
          text: "Attempt full protocol reconstruction",
          hint: "High-risk, high-reward",
          next: "protocol_recon",
        },
      ],
    },
    aurora_link: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "You patch through to AURORA-7. Their lead, KAI, confirms the handshake timing and the 16-bit pattern. Together, you realize each station was meant to reply from a different angle — timing, signal, data, systems, and orbit.\n\nHELIX is the missing piece for the orbital layer. Without orbit, the handshake can’t complete.",
      choices: [
        {
          id: "p1",
          text: "Attempt to raise HELIX on every frequency",
          hint: "If HELIX has signal, this should reach them",
          event: { type: "broadcast", text: "PINNACLE → ALL: Attempting to raise HELIX. Priority." },
          event2: { type: "setFlag", key: "helix_pinged" },
          next: "after_primes",
        },
      ],
    },
    protocol_recon: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "You attempt to reconstruct the protocol from what you have. There are gaps — critical slots only HELIX could fill. If HELIX is offline permanently, the reconstruction fails.\n\nYou proceed anyway. Probability of completion without HELIX: 34%.",
      choices: [
        {
          id: "p1",
          text: "Commit to the partial reconstruction",
          event: { type: "setFlag", key: "partial_recon" },
          next: "after_primes",
        },
      ],
    },
    final_shared: {
      location: "HIMALAYAN OBSERVATORY — PINNACLE",
      text:
        "The mission clock is running out. Your contribution matters, but it isn’t the only one.\n\nAURORA-7 handles outbound. MERIDIAN handles decryption. TRIDENT handles systems. HELIX handles orbit.\n\nWithout all five, the handshake remains incomplete.",
      choices: [
        {
          id: "p1",
          text: "Check the mission outcome",
          event: { type: "checkEnding", ids: ["primes_shared", "pinnacle_aurora_contact", "pattern_hypothesis"], ending: "united" },
          next: "final_shared",
        },
      ],
    },
  },
  globalFlags: {
    primes_shared: "Prime sequence finding shared",
    pattern_hypothesis: "Coordinated-pattern hypothesis shared",
    timeout_warning_shared: "Handshake timeout warning shared",
    pinnacle_aurora_contact: "PINNACLE contacted AURORA-7",
    helix_pinged: "HELIX pinged from PINNACLE",
    partial_recon: "Partial protocol reconstruction",
  },
};

window.PINNACLE = PINNACLE;
