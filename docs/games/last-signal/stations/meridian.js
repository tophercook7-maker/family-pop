/* MERIDIAN — Desert Data Decryption */

const MERIDIAN = {
  id: "MERIDIAN",
  name: "MERIDIAN",
  location: "Sahara Geophysics Outpost — Data Vault",
  scenes: {
    intro: {
      location: "SAHARA DESERT — MERIDIAN",
      text:
        "The vault is cool despite the 47°C heat outside. Inside, banks of decryptors pulse with the same five-signal burst your neighbors saw.\n\nMERIDIAN’s job is the hard math. You have the strongest decryption hardware on the continent. The signal is not random — it has structure. You can feel it.",
      choices: [
        {
          id: "m1",
          text: "Attempt full decryption",
          hint: "This could take a while without help",
          next: "decrypt_attempt",
        },
        {
          id: "m2",
          text: "Ping other stations for raw copies",
          event: { type: "broadcast", text: "MERIDIAN: Requesting raw signal copies for cross-correlation." },
          next: "request_raw",
        },
      ],
    },
    decrypt_attempt: {
      location: "SAHARA DESERT — MERIDIAN",
      text:
        "After 90 minutes of runtime, the decryptor returns a structured payload: three pages of coordinates, five dates, and a single phrase repeated in 17 languages.\n\n'COME BEFORE IT’S TOO LATE. THE WINDOW OPENS AT CONVERGENCE. BRING WHAT YOU HAVE KEPT SAFE.'",
      choices: [
        {
          id: "m1",
          text: "Translate and broadcast the full message",
          event: { type: "broadcast", text: "MERIDIAN: Full translation complete. Broadcasting to all stations." },
          event2: { type: "setFlag", key: "message_translated" },
          next: "after_translation",
        },
        {
          id: "m2",
          text: "Hold the translation until you verify",
          hint: "Knowledge is power. Or liability.",
          next: "after_translation",
        },
      ],
    },
    request_raw: {
      location: "SAHARA DESERT — MERIDIAN",
      text:
        "AURORA-7 and PINNACLE send raw copies within minutes. MERIDIAN’s decryptors confirm: the five bursts are byte-identical. Time offset: 1.2 nanoseconds.\n\nSomeone engineered this with precision that shouldn’t exist.",
      choices: [
        { id: "m1", text: "Attempt decryption with fresh data", next: "decrypt_attempt" },
      ],
    },
    language_trap: {
      location: "SAHARA DESERT — MERIDIAN",
      text:
        "You notice the 17-language translation includes one fabricated dialect: a dialect that doesn’t exist on any official language registry.\n\nInclusion of a fake language suggests the message was originally written for five recipients who would notice the anomaly — and understand it as a breadcrumb.",
      choices: [
        {
          id: "m1",
          text: "Broadcast the fake-language finding",
          event: { type: "broadcast", text: "MERIDIAN: Found fabricated dialect in translation. This message was customized." },
          event2: { type: "setFlag", key: "lang_anomaly_shared" },
          next: "after_translation",
        },
        { id: "m2", text: "Keep it as leverage", next: "after_translation" },
      ],
    },
    after_translation: {
      location: "SAHARA DESERT — MERIDIAN",
      text:
        "You’ve done your part. Now the timing window is closing. Depending on what the other stations have gathered, the final act may be a collaboration… or a tragedy of silence.",
      choices: [
        {
          id: "m1",
          text: "Check mission outcome",
          event: { type: "checkEnding", ids: ["message_translated"], ending: "united" },
          next: "after_translation",
        },
      ],
    },
  },
  globalFlags: {
    message_translated: "Full message translation shared",
    lang_anomaly_shared: "Fabricated dialect anomaly shared",
  },
};

window.MERIDIAN = MERIDIAN;
