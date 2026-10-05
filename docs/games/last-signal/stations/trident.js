/* TRIDENT — Oceanic Systems Engineer */

const TRIDENT = {
  id: "TRIDENT",
  name: "TRIDENT",
  location: "Mid-Atlantic Platform — Systems Core",
  scenes: {
    intro: {
      location: "ATLANTIC OCEAN — TRIDENT",
      text:
        "The platform sways gently in heavy swells. TRIDENT’s systems are built for underwater telemetry, but right now they’re handling the same five-station burst as everyone else.\n\nYour station controls physical systems: hydraulics, sonar arrays, subsea cables, and power regulation. If the signal requires physical action, TRIDENT has the strongest hands.",
      choices: [
        {
          id: "t1",
          text: "Run diagnostics on the signal’s power signatures",
          next: "power_diag",
        },
        {
          id: "t2",
          text: "Check undersea cable network for anomalies",
          hint: "The cables connect the sites",
          next: "cable_scan",
        },
      ],
    },
    power_diag: {
      location: "ATLANTIC OCEAN — TRIDENT",
      text:
        "The signal carries a faint power modulation — not audio, not data, but a control pulse. Someone is talking to hardware, not people.\n\nIf the other stations have compatible receivers, that pulse could unlock something physical.",
      choices: [
        {
          id: "t1",
          text: "Share the power-modulation finding",
          event: { type: "broadcast", text: "TRIDENT: Signal contains control pulse. Compatible with hardware receivers." },
          event2: { type: "setFlag", key: "pulse_shared" },
          next: "after_pulse",
        },
        { id: "t2", text: "Keep it for now", next: "after_pulse" },
      ],
    },
    cable_scan: {
      location: "ATLANTIC OCEAN — TRIDENT",
      text:
        "The undersea cables show unusual readings: high-latency echoes at junctions near site coordinates. The network is carrying the signal — not wirelessly, but through the physical internet backbone.\n\nThis means the signal is not just in the air. It’s already inside the world’s cables.",
      choices: [
        {
          id: "t1",
          text: "Broadcast cable anomaly data",
          event: { type: "broadcast", text: "TRIDENT: Signal present in undersea cables. This is coordinated infrastructure." },
          event2: { type: "setFlag", key: "cable_finding_shared" },
          next: "after_pulse",
        },
      ],
    },
    after_pulse: {
      location: "ATLANTIC OCEAN — TRIDENT",
      text:
        "TRIDENT has physical capability the others lack. If a site needs something activated, you’re the one who can reach it. The question is whether you’ll be asked in time.",
      choices: [
        {
          id: "t1",
          text: "Check mission outcome",
          event: { type: "checkEnding", ids: ["pulse_shared", "cable_finding_shared"], ending: "united" },
          next: "after_pulse",
        },
      ],
    },
  },
  globalFlags: {
    pulse_shared: "Control pulse finding shared",
    cable_finding_shared: "Cable anomaly finding shared",
  },
};

window.TRIDENT = TRIDENT;
