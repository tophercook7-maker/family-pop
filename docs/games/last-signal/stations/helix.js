/* HELIX — Orbital Mission Coordinator */

const HELIX = {
  id: "HELIX",
  name: "HELIX",
  location: "Low Earth Orbit — Relay Station 7",
  scenes: {
    intro: {
      location: "LOW EARTH ORBIT — HELIX",
      text:
        "The station hums with the quiet of microgravity. Out the viewport, Earth turns slowly — and turns, and turns.\n\nHELIX handles orbital relay and timing synchronization for every ground station. The five-signal burst didn’t just reach the ground. It reached here first. You received it 1.2 nanoseconds before anyone else. You were the source of the pattern.",
      choices: [
        {
          id: "h1",
          text: "Review mission logs from time of signal receipt",
          next: "logs",
        },
        {
          id: "h2",
          text: "Broadcast your status to the network",
          hint: "They think you’re dark",
          event: { type: "broadcast", text: "HELIX: Online. Signal relayed from this station. Awaiting instructions." },
          event2: { type: "setFlag", key: "helix_announced" },
          next: "after_announcement",
        },
      ],
    },
    logs: {
      location: "LOW EARTH ORBIT — HELIX",
      text:
        "The logs are bizarre. One hour before the signal, a maintenance bot in sector 4 reported an unknown waveform detected in the hull plating. An hour after, all outbound channels were disabled remotely — not by mission control, but by a command from inside your own system.\n\nSomeone, or something, was here before you.",
      choices: [
        { id: "h1", text: "Broadcast the log findings", next: "after_announcement" },
      ],
    },
    after_announcement: {
      location: "LOW EARTH ORBIT — HELIX",
      text:
        "HELIX is the coordination layer. Every ground station depends on your timing. Now that you’re online, the full network can function — if it’s meant to function at all.",
      choices: [
        {
          id: "h1",
          text: "Check mission outcome",
          event: { type: "checkEnding", ids: ["helix_announced"], ending: "united" },
          next: "after_announcement",
        },
      ],
    },
  },
  globalFlags: {
    helix_announced: "HELIX announced presence to network",
  },
};

window.HELIX = HELIX;
