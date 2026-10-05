// Auto-generated from story_nodes/*.json — The Whispering Woods
window.STORY = {
 "woods_entry": {
  "id": "woods_entry",
  "text_chunk": "The bus drops you at the end of Gran's gravel road just as the sun starts to sink. Her note is still folded in your pocket: 'The woods behind the house have been whispering your name all week. Go see what they want. Take the lantern.'\n\nThe old iron lantern hangs on the porch hook, glowing faintly even though nobody lit it. Beyond the garden gate, the Whispering Woods sway — and for just a second, the rustling leaves really do sound like your name.",
  "media_hook": {
   "image_path": "woods_entry.png",
   "video_path": "woods_entry.mp4"
  },
  "options": [
   {
    "display_text": "Take the lantern and walk straight into the woods.",
    "next_id": "mossy_path",
    "effects": {
     "add_items": [
      "glowing lantern"
     ]
    }
   },
   {
    "display_text": "Leave the lantern — you want your hands free — and slip through the gate.",
    "next_id": "dark_path"
   },
   {
    "display_text": "Check Gran's garden shed first. She always hides useful things there.",
    "next_id": "garden_shed"
   }
  ]
 },
 "garden_shed": {
  "id": "garden_shed",
  "text_chunk": "The shed smells like cedar and summer. On the workbench, laid out like she knew you'd look, you find a tin of honey biscuits, a ball of red yarn, and the lantern's little brass key labeled 'for the brightest setting.'\n\nThrough the shed's dusty window, something small and silvery darts between the trees, pauses, and looks right at you.",
  "media_hook": {
   "image_path": "garden_shed.png"
  },
  "options": [
   {
    "display_text": "Pocket the biscuits and yarn, grab the lantern, and follow the silvery thing.",
    "next_id": "mossy_path",
    "effects": {
     "add_items": [
      "glowing lantern",
      "honey biscuits",
      "red yarn",
      "brass key"
     ],
     "reputation_change": 1
    }
   },
   {
    "display_text": "Take only the biscuits — snacks first, mysteries second.",
    "next_id": "mossy_path",
    "effects": {
     "add_items": [
      "honey biscuits"
     ]
    }
   }
  ]
 },
 "mossy_path": {
  "id": "mossy_path",
  "text_chunk": "The mossy path glows faintly green wherever your feet land, like the woods are lighting stepping stones just for you. Ahead, the path splits at an enormous oak with a door-shaped knot in its trunk.\n\nSitting in front of the knot is a round gray hedgehog wearing a acorn-cap hat. He is very politely pretending not to cry.",
  "media_hook": {
   "image_path": "mossy_path.png"
  },
  "options": [
   {
    "display_text": "Kneel down and ask the hedgehog what's wrong.",
    "next_id": "hedgehog_friend",
    "effects": {
     "reputation_change": 2
    }
   },
   {
    "display_text": "Tip an imaginary hat back and walk past — the whispering came from deeper in.",
    "next_id": "firefly_clearing"
   },
   {
    "display_text": "Offer him a honey biscuit.",
    "next_id": "hedgehog_biscuit",
    "requires_item": "honey biscuits",
    "effects": {
     "reputation_change": 3,
     "remove_items": [
      "honey biscuits"
     ]
    }
   }
  ]
 },
 "dark_path": {
  "id": "dark_path",
  "text_chunk": "Without the lantern, the woods close in fast. It isn't scary, exactly — more like walking through a room where everyone stopped talking when you entered. You feel your way from trunk to trunk until you see them: hundreds of fireflies, hanging in the air like a paused snowfall, all blinking the same rhythm.\n\nBlink-blink... pause. Blink-blink... pause. It's almost like a question.",
  "media_hook": {
   "image_path": "dark_path.png"
  },
  "options": [
   {
    "display_text": "Blink your eyes back at them in the same rhythm.",
    "next_id": "firefly_clearing",
    "effects": {
     "reputation_change": 2
    }
   },
   {
    "display_text": "Walk carefully through the middle of them.",
    "next_id": "firefly_scatter"
   }
  ]
 },
 "hedgehog_friend": {
  "id": "hedgehog_friend",
  "text_chunk": "\"Oh! You can see me,\" the hedgehog sniffles, straightening his acorn cap. \"I'm Bramble, doorkeeper of the Oak Door. I've lost the door's song. Without the song it won't open, and the Moonbloom inside blooms TONIGHT, and everyone is waiting, and it's all my fault.\"\n\nHe pats the door-shaped knot in the oak sadly. From somewhere behind it, you hear faint, hopeful humming.",
  "media_hook": {
   "image_path": "hedgehog_bramble.png"
  },
  "options": [
   {
    "display_text": "\"Songs aren't lost, they're just misplaced. Let's retrace your steps.\"",
    "next_id": "song_search",
    "effects": {
     "reputation_change": 1
    }
   },
   {
    "display_text": "Hum a made-up tune to the door and see what happens.",
    "next_id": "wrong_song"
   },
   {
    "display_text": "Ask the fireflies deeper in the woods — they seem to know rhythms.",
    "next_id": "firefly_clearing",
    "effects": {
     "add_items": [
      "Bramble's trust"
     ]
    }
   }
  ]
 },
 "hedgehog_biscuit": {
  "id": "hedgehog_biscuit",
  "text_chunk": "Bramble the hedgehog takes the honey biscuit with both tiny paws like it's made of gold. \"Gran's biscuits,\" he whispers. \"She used to share them when SHE walked these woods. You must be hers.\"\n\nHe stands up very straight. \"For a kindness like this, I'll tell you a secret: the Oak Door has lost its song, but the fireflies in the clearing keep every rhythm the woods have ever hummed. Tell them Bramble sent you.\"",
  "media_hook": {
   "image_path": "hedgehog_biscuit.png"
  },
  "options": [
   {
    "display_text": "Head to the firefly clearing with Bramble's secret.",
    "next_id": "firefly_clearing",
    "effects": {
     "add_items": [
      "Bramble's trust"
     ]
    }
   },
   {
    "display_text": "Ask Bramble to come along — doorkeepers shouldn't wait alone.",
    "next_id": "bramble_company",
    "effects": {
     "reputation_change": 2
    }
   }
  ]
 },
 "wrong_song": {
  "id": "wrong_song",
  "text_chunk": "You hum the first tune that comes to you. The Oak Door listens — you can feel it listening — then produces a sound exactly like a polite cough.\n\n\"Close,\" says Bramble diplomatically. \"That opened the acorn cupboard.\" A small hatch above you creaks open and one perfect golden acorn drops into your hand, warm as a coal.",
  "media_hook": {
   "image_path": "golden_acorn.png"
  },
  "options": [
   {
    "display_text": "Pocket the golden acorn and go ask the fireflies about the real song.",
    "next_id": "firefly_clearing",
    "effects": {
     "add_items": [
      "golden acorn"
     ]
    }
   },
   {
    "display_text": "Give the acorn to Bramble — he's the doorkeeper, after all.",
    "next_id": "bramble_company",
    "effects": {
     "reputation_change": 3
    }
   }
  ]
 },
 "song_search": {
  "id": "song_search",
  "text_chunk": "You and Bramble retrace his whole day: the mushroom market, the beetle post office, the puddle he definitely did not splash in on purpose. At the puddle's edge you spot it — a tiny silver thread of melody, snagged on a reed and shivering like a soap bubble about to pop.\n\n\"MY SONG!\" Bramble gasps. \"But how do we carry it? Touch it and it'll burst!\"",
  "media_hook": {
   "image_path": "song_search.png"
  },
  "options": [
   {
    "display_text": "Wind it gently onto the ball of red yarn.",
    "next_id": "door_opens",
    "requires_item": "red yarn",
    "effects": {
     "reputation_change": 2,
     "add_items": [
      "the door's song"
     ]
    }
   },
   {
    "display_text": "Cup your hands around it without touching, and walk very, very slowly.",
    "next_id": "slow_carry"
   },
   {
    "display_text": "Ask the fireflies to memorize it before it pops.",
    "next_id": "firefly_clearing",
    "effects": {
     "add_items": [
      "Bramble's trust"
     ]
    }
   }
  ]
 },
 "slow_carry": {
  "id": "slow_carry",
  "text_chunk": "You cup your hands around the shivering melody and walk back to the oak slower than you've ever walked anywhere. Twice it wobbles. Once it hiccups. Bramble walks backward in front of you the entire way whispering \"steady... steady...\"\n\nBy the time you reach the Oak Door your arms ache — but the song is safe, humming between your palms like a warm marble.",
  "media_hook": {
   "image_path": "slow_carry.png"
  },
  "options": [
   {
    "display_text": "Release the song into the door's keyhole knot.",
    "next_id": "door_opens",
    "effects": {
     "reputation_change": 2,
     "add_items": [
      "the door's song"
     ]
    }
   }
  ]
 },
 "firefly_scatter": {
  "id": "firefly_scatter",
  "text_chunk": "You walk through the middle of the fireflies and they scatter like startled glitter — then, curious, they regroup and follow YOU. You arrive at the great clearing wearing a slow-swirling cloak of living lights.\n\nIn the clearing's center stands the enormous oak, and beside its door-shaped knot, a small hedgehog in an acorn cap stares up at you in awe. \"The fireflies never follow anyone,\" he breathes. \"You must be here about the song.\"",
  "media_hook": {
   "video_path": "firefly_scatter.mp4"
  },
  "options": [
   {
    "display_text": "\"What song? Tell me everything.\"",
    "next_id": "hedgehog_friend"
   },
   {
    "display_text": "Ask your firefly cloak to hum every rhythm they remember.",
    "next_id": "firefly_song"
   }
  ]
 },
 "firefly_clearing": {
  "id": "firefly_clearing",
  "text_chunk": "The firefly clearing is like standing inside a gentle constellation. Thousands of tiny lights drift between the ferns, and when the wind moves, they all sway together — the woods' own heartbeat, kept in light.\n\nThe fireflies spiral down and hover in front of you expectantly, blinking their two-blink question.",
  "media_hook": {
   "video_path": "firefly_clearing.mp4"
  },
  "options": [
   {
    "display_text": "\"Bramble sent me. The Oak Door lost its song.\"",
    "next_id": "firefly_song",
    "requires_item": "Bramble's trust"
   },
   {
    "display_text": "Blink back, then hum the little tune Gran always hums doing dishes.",
    "next_id": "grans_song",
    "effects": {
     "reputation_change": 2
    }
   },
   {
    "display_text": "Hold up the glowing lantern so they can see you better.",
    "next_id": "firefly_song",
    "requires_item": "glowing lantern"
   }
  ]
 },
 "firefly_song": {
  "id": "firefly_song",
  "text_chunk": "The fireflies swirl into a spinning column, and suddenly the whole clearing is SINGING — not with sound exactly, but with light pulsing in a pattern your bones understand. The lost song! They kept a copy all along.\n\nThey pour toward the great oak like a river of sparks and swirl around its door-shaped knot.",
  "media_hook": {
   "video_path": "firefly_song.mp4"
  },
  "options": [
   {
    "display_text": "Run after them to the Oak Door.",
    "next_id": "door_opens",
    "effects": {
     "add_items": [
      "the door's song"
     ]
    }
   }
  ]
 },
 "grans_song": {
  "id": "grans_song",
  "text_chunk": "You hum Gran's dish-washing tune — the one she swears she made up. The fireflies freeze mid-air. Every single light turns toward you.\n\nThen they blaze up joyfully, because THAT'S THE SONG. The song the Oak Door has been missing for thirty years isn't lost at all. Gran carried it out of the woods when she was small, and hummed it into you your whole life. The whispering was the woods asking for it back.",
  "media_hook": {
   "video_path": "grans_song.mp4"
  },
  "options": [
   {
    "display_text": "Walk to the Oak Door and sing it home.",
    "next_id": "door_opens_grans",
    "effects": {
     "reputation_change": 3,
     "add_items": [
      "Gran's song"
     ]
    }
   }
  ]
 },
 "bramble_company": {
  "id": "bramble_company",
  "text_chunk": "Bramble beams and trots beside you, telling you about every mushroom you pass ('edible... edible... that one's a liar'). With a friend along, the woods feel less like a stranger's house and more like a party you were always invited to.\n\nAt the firefly clearing, the lights spiral down to greet him like old friends — and then turn to you, blinking their two-blink question.",
  "media_hook": {
   "image_path": "bramble_company.png"
  },
  "options": [
   {
    "display_text": "\"We're looking for the Oak Door's lost song.\"",
    "next_id": "firefly_song"
   },
   {
    "display_text": "Hum the tune Gran always hums doing dishes.",
    "next_id": "grans_song",
    "effects": {
     "reputation_change": 1
    }
   }
  ]
 },
 "door_opens": {
  "id": "door_opens",
  "text_chunk": "The song sinks into the door-shaped knot, and the great oak takes a breath. Bark folds back like theater curtains, and golden light spills across the clearing.\n\nInside, a spiral of glowing steps winds down around a single flower bud the size of a lantern — the Moonbloom — surrounded by hedgehogs, rabbits, owls, and one extremely relieved beetle postmaster, all waiting. As the moon clears the treetops, the bud unfolds petal by petal, filling the hollow with silver light.\n\nBramble tugs your sleeve. \"It blooms once a year,\" he whispers, \"and it grants one wholehearted wish to whoever helped open the door.\"",
  "media_hook": {
   "video_path": "moonbloom.mp4"
  },
  "options": [
   {
    "display_text": "Wish for the woods and Gran's house to always look after each other.",
    "next_id": "ending_guardian",
    "effects": {
     "reputation_change": 2
    }
   },
   {
    "display_text": "Wish to come back — every summer, forever.",
    "next_id": "ending_summers"
   },
   {
    "display_text": "Give the wish to Bramble.",
    "next_id": "ending_bramble",
    "effects": {
     "reputation_change": 3
    }
   }
  ]
 },
 "door_opens_grans": {
  "id": "door_opens_grans",
  "text_chunk": "You stand before the Oak Door and sing Gran's song, and the door doesn't just open — it flings itself wide like it's been waiting thirty years to do exactly that. Golden light floods out. Somewhere deep inside, dozens of small voices cheer.\n\nInside, around the great glowing Moonbloom bud, the creatures of the woods are gathered — and on the wall of the hollow hangs a small faded photograph of a girl with Gran's exact stubborn grin, holding a honey biscuit.\n\nThe Moonbloom opens in the moonlight, and its silver glow settles on you like a blanket. It will grant one wholehearted wish.",
  "media_hook": {
   "video_path": "moonbloom_grans.mp4"
  },
  "options": [
   {
    "display_text": "Wish for Gran to see the woods again, one more time.",
    "next_id": "ending_gran"
   },
   {
    "display_text": "Wish to come back — every summer, forever.",
    "next_id": "ending_summers"
   }
  ]
 },
 "ending_guardian": {
  "id": "ending_guardian",
  "text_chunk": "The Moonbloom's light flows out of the hollow, across the clearing, down the mossy path, and wraps around Gran's little house like two hands finally clasping. The woods and the house have kept each other ever since — storms bend around the roof, the garden never quite freezes, and the whispering in the leaves sounds, forever after, like someone saying thank you.\n\nWhen you get back, Gran is on the porch with two mugs of cocoa. \"Took you long enough,\" she says, smiling at the leaves. \"They've been asking for you for years.\"",
  "media_hook": {
   "image_path": "ending_guardian.png"
  },
  "options": [
   {
    "display_text": "🌙  Weeks pass... and the woods aren't quite finished with you. Continue to Chapter Two →",
    "next_id": "ch2_entry",
    "effects": {
     "add_items": [
      "guardian's blessing"
     ]
    }
   }
  ]
 },
 "ending_summers": {
  "id": "ending_summers",
  "text_chunk": "The Moonbloom pulses once, sealing the promise. Every summer after — no matter how far you move, no matter how complicated life gets — the roads somehow always bend back to Gran's gravel drive, and the Oak Door always knows your knock.\n\nYears from now, you'll bring someone small with you, hand them the glowing lantern, and watch the woods whisper THEIR name for the first time.",
  "media_hook": {
   "image_path": "ending_summers.png"
  },
  "options": [
   {
    "display_text": "🌙  And so the next summer comes... but this one brings an early frost. Continue to Chapter Two →",
    "next_id": "ch2_entry",
    "effects": {
     "add_items": [
      "summer promise"
     ]
    }
   }
  ]
 },
 "ending_bramble": {
  "id": "ending_bramble",
  "text_chunk": "\"Me?\" Bramble squeaks. He holds the Moonbloom's light in his paws for a long moment... then releases it upward. \"I wish for the song to never be lost again — I wish for it to live in EVERYONE.\"\n\nThe light bursts into a thousand silver threads that settle into every creature in the hollow — and into you. To this day, whenever you hum absent-mindedly, doors have a funny way of opening: stuck jars, shy smiles, hard days. Gran notices immediately. \"Ah,\" she says. \"You met Bramble.\"",
  "media_hook": {
   "image_path": "ending_bramble.png"
  },
  "options": [
   {
    "display_text": "🌙  The song lives in everyone now — and soon the woods will need it. Continue to Chapter Two →",
    "next_id": "ch2_entry",
    "effects": {
     "add_items": [
      "Bramble's gift"
     ]
    }
   }
  ]
 },
 "ending_gran": {
  "id": "ending_gran",
  "text_chunk": "The silver light rushes out of the woods ahead of you. When you burst through the garden gate, Gran is already standing at the tree line in her slippers, hand over her mouth, watching the woods glow the way they did when she was seven.\n\nBramble walks her in personally, on his best behavior, acorn cap in paw. The animals remember her. The door remembers her song. And from that night on, the whispering woods whisper two names.\n\nOn the walk home she squeezes your hand. \"Same time next summer,\" she says. It isn't a question.",
  "media_hook": {
   "image_path": "ending_gran.png"
  },
  "options": [
   {
    "display_text": "🌙  Gran and the woods are reunited — just in time for what comes next. Continue to Chapter Two →",
    "next_id": "ch2_entry",
    "effects": {
     "add_items": [
      "Gran's homecoming"
     ]
    }
   }
  ]
 },
 "ch2_entry": {
  "id": "ch2_entry",
  "text_chunk": "Some weeks later, the woods change their tune. You wake at Gran's to a window laced with frost ferns — in the middle of summer. The garden beans are wearing little caps of ice, and outside the whispering has gone thin and shivery, like the woods are talking with their teeth chattering.\n\nA snow-white moth taps the glass. It's carrying, very carefully, a tiny acorn-cap hat you'd know anywhere. Bramble's hat. And pinned inside it, a note in shaky handwriting: 'Come quick. The woods are falling asleep too early, and they might not wake up.'",
  "media_hook": {
   "image_path": "ch2_entry.png",
   "video_path": "ch2_entry.mp4"
  },
  "options": [
   {
    "display_text": "Wake Gran and tell her everything.",
    "next_id": "ch2_gran_warns",
    "effects": {
     "reputation_change": 1
    }
   },
   {
    "display_text": "Pull on your boots and grab the lantern — no time to lose.",
    "next_id": "ch2_pack_up"
   },
   {
    "display_text": "Ask the white moth to lead the way.",
    "next_id": "ch2_moth_guide"
   }
  ]
 },
 "ch2_gran_warns": {
  "id": "ch2_gran_warns",
  "text_chunk": "Gran doesn't look surprised — she looks like someone remembering a very old story. She wraps her softest wool scarf twice around your neck, fills a thermos with hot cocoa, and tucks a fresh tin of honey biscuits into your coat.\n\n\"When I was small,\" she says quietly, \"the woods slept every winter and woke every spring, right on time. If the cold's come early and won't let go, something at the Heart Spring is frightened. And frightened things,\" she taps your nose, \"don't need scolding. They need company. Go on. Take the warm with you.\"",
  "media_hook": {
   "image_path": "ch2_gran_warns.png"
  },
  "options": [
   {
    "display_text": "Hug her tight and set out into the frosted woods.",
    "next_id": "ch2_set_out",
    "effects": {
     "add_items": [
      "warm scarf",
      "cocoa thermos",
      "honey biscuits"
     ],
     "reputation_change": 2
    }
   }
  ]
 },
 "ch2_pack_up": {
  "id": "ch2_pack_up",
  "text_chunk": "You grab the old iron lantern from its hook — still faintly glowing, loyal as ever — and stuff your pockets with whatever's on the counter: half a tin of honey biscuits and a stub of candle. The screen door bangs behind you and the cold hits like a wall of quiet.\n\nEvery leaf wears a rind of ice. Your breath hangs in the air, and for the first time, the Whispering Woods aren't whispering at all.",
  "media_hook": {
   "image_path": "ch2_pack_up.png"
  },
  "options": [
   {
    "display_text": "Head for the Oak Door — Bramble will be there.",
    "next_id": "ch2_set_out",
    "effects": {
     "add_items": [
      "glowing lantern",
      "honey biscuits"
     ]
    }
   }
  ]
 },
 "ch2_moth_guide": {
  "id": "ch2_moth_guide",
  "text_chunk": "The white moth loops once and drifts into the trees, its wings leaving a faint trail of thawed air — a ribbon of summer you can walk down. You follow it past frozen ferns and a fountain caught mid-splash, turned to glass.\n\nThe moth leads you straight to Bramble, who is hopping in place to keep warm beside the great Oak, three scarves of his own knotted around him. \"You came!\" he cries, and hugs your ankle.",
  "media_hook": {
   "image_path": "ch2_moth_guide.png"
  },
  "options": [
   {
    "display_text": "\"Of course I came. Now tell me what's happening.\"",
    "next_id": "ch2_bramble_news",
    "effects": {
     "reputation_change": 1
    }
   }
  ]
 },
 "ch2_set_out": {
  "id": "ch2_set_out",
  "text_chunk": "The mossy path that once glowed green now crunches with frost under your boots. At the great Oak, Bramble waits, wrapped in every scarf he owns, so bundled you can only see his worried eyes.\n\n\"It started a week ago,\" he chatters. \"The Heart Spring — the deep well at the center of the woods where all the whispers come from — it's freezing over. When the last of it freezes, the woods will sleep, and this time they won't wake in spring. We have to get there. But the way is cold, and lonelier than it used to be.\"",
  "media_hook": {
   "image_path": "ch2_set_out.png"
  },
  "options": [
   {
    "display_text": "\"Then we'll warm the way as we go. Lead on, Bramble.\"",
    "next_id": "ch2_frozen_stream",
    "effects": {
     "add_items": [
      "Bramble at your side"
     ],
     "reputation_change": 1
    }
   },
   {
    "display_text": "Ask Bramble WHY the Heart Spring is freezing.",
    "next_id": "ch2_bramble_news"
   }
  ]
 },
 "ch2_bramble_news": {
  "id": "ch2_bramble_news",
  "text_chunk": "Bramble lowers his voice. \"The owls say there's someone new at the Heart Spring. A little one made of frost, all alone, who came from the far cold months ago and never left. Every day the Spring freezes a bit more around them.\"\n\nHe fidgets with his hat. \"Nobody's mean to them. But nobody knows how to help, either. So everyone just... stayed away. And the more alone the frost-child feels, the colder it gets. I think that's the whole trouble, honestly. I think they're just very, very lonely.\"",
  "media_hook": {
   "image_path": "ch2_bramble_news.png"
  },
  "options": [
   {
    "display_text": "\"Then we're not going there to fight. We're going to make a friend. Come on.\"",
    "next_id": "ch2_frozen_stream",
    "effects": {
     "reputation_change": 3,
     "add_items": [
      "Bramble at your side"
     ]
    }
   },
   {
    "display_text": "\"Loneliness I understand. Let's hurry — before it freezes all the way.\"",
    "next_id": "ch2_frozen_stream",
    "effects": {
     "reputation_change": 2,
     "add_items": [
      "Bramble at your side"
     ]
    }
   }
  ]
 },
 "ch2_frozen_stream": {
  "id": "ch2_frozen_stream",
  "text_chunk": "The path drops to the singing stream — except it isn't singing today. It's a ribbon of black ice, too slick to walk and too wide to jump. On the far bank, three round shapes watch you: a family of otters, huddled and shivering, their slide frozen solid.\n\n\"C-can't cross,\" the biggest otter calls, teeth clicking. \"And can't fish. Spring's stuck, friend, and so are we.\"",
  "media_hook": {
   "image_path": "ch2_frozen_stream.png"
  },
  "options": [
   {
    "display_text": "Share your cocoa and biscuits with the otters first.",
    "next_id": "ch2_otters_help",
    "requires_item": "honey biscuits",
    "effects": {
     "reputation_change": 3,
     "remove_items": [
      "honey biscuits"
     ]
    }
   },
   {
    "display_text": "Offer to help the otters, even with nothing to give.",
    "next_id": "ch2_otters_kind",
    "effects": {
     "reputation_change": 2
    }
   },
   {
    "display_text": "Test the ice carefully and try to cross on your own.",
    "next_id": "ch2_cross_ice"
   }
  ]
 },
 "ch2_otters_help": {
  "id": "ch2_otters_help",
  "text_chunk": "The otters crowd around the warm thermos, and the biscuits vanish in a blur of happy chomping. Warmth puts the wiggle back in them at once. \"Family!\" the big otter — Papa Ripple — declares. \"You warmed us, so we'll carry you.\"\n\nThe otters flop onto their bellies and make a living bridge of themselves across the ice, backs lined up like slippery stepping stones. \"Quick, quick, before we giggle!\"",
  "media_hook": {
   "image_path": "ch2_otters_help.png"
  },
  "options": [
   {
    "display_text": "Cross on the otter bridge, thanking each one by name.",
    "next_id": "ch2_owl_tree",
    "effects": {
     "reputation_change": 2,
     "add_items": [
      "the Ripples' friendship"
     ]
    }
   }
  ]
 },
 "ch2_otters_kind": {
  "id": "ch2_otters_kind",
  "text_chunk": "You have nothing to give, so you give what you can: you kneel, cup the smallest otter's cold paws in your hands, and blow warm breath on them until she stops shivering. You do it for each of them in turn while Bramble tells them a joke about a beetle and a boot.\n\nBy the end they're laughing, and laughing is its own kind of warm. \"You didn't have to,\" Papa Ripple sniffs. \"So we didn't have to either — but we WANT to. Hop on.\" They make a bridge of their backs across the ice.",
  "media_hook": {
   "image_path": "ch2_otters_kind.png"
  },
  "options": [
   {
    "display_text": "Cross on the otter bridge, thanking each one by name.",
    "next_id": "ch2_owl_tree",
    "effects": {
     "reputation_change": 3,
     "add_items": [
      "the Ripples' friendship"
     ]
    }
   }
  ]
 },
 "ch2_cross_ice": {
  "id": "ch2_cross_ice",
  "text_chunk": "You edge onto the black ice, arms out like a tightrope walker. It holds — mostly. Halfway across your boot slips and you sit down hard with an undignified WHUMP, then scoot the rest of the way on the seat of your pants while the otters cheer politely.\n\nYou reach the far bank cold and a little bruised, but safe. Stuck to your mitten is a single feather of pure frost, light as a breath. It hums the tiniest sad note.",
  "media_hook": {
   "image_path": "ch2_cross_ice.png"
  },
  "options": [
   {
    "display_text": "Tuck the frost feather away and press on into the deep woods.",
    "next_id": "ch2_owl_tree",
    "effects": {
     "add_items": [
      "frost feather"
     ]
    }
   }
  ]
 },
 "ch2_owl_tree": {
  "id": "ch2_owl_tree",
  "text_chunk": "In the heart of a hollow beech sits Miss Willowhoot, an owl so old her feathers have gone the silver of birch bark. One eye opens as you approach. \"Ah. The child the woods whisper about. And just in time — it's gone very quiet out there, hasn't it.\"\n\nShe ruffles thoughtfully. \"The frost-child at the Spring is hushing the whole wood. Not out of spite, mind. Out of fear. They think if the woods stay asleep, no one will ever leave them again. But a wood that never wakes is just a long goodbye. You'll need the right way in — and I know three.\"",
  "media_hook": {
   "image_path": "ch2_owl_tree.png"
  },
  "options": [
   {
    "display_text": "\"Teach me a song that could reach them.\"",
    "next_id": "ch2_lullaby_learn",
    "effects": {
     "reputation_change": 1
    }
   },
   {
    "display_text": "\"Is there something I can bring them? A gift?\"",
    "next_id": "ch2_seed_path",
    "effects": {
     "reputation_change": 1
    }
   },
   {
    "display_text": "\"How do I even get to the Heart Spring?\"",
    "next_id": "ch2_badger_gate"
   }
  ]
 },
 "ch2_lullaby_learn": {
  "id": "ch2_lullaby_learn",
  "text_chunk": "\"The Spring Lullaby,\" Willowhoot says. \"The oldest tune in the woods. It doesn't stop winter — it makes winter safe. It's the promise sleep needs so it isn't afraid to end.\" She hums it, low and round, and you feel it settle into your chest like a warm stone.\n\nTo your surprise, you already half-know it — it's woven through the very tune Gran hums doing dishes. You hum it back until Willowhoot nods, satisfied. \"Good. Now the frost-child can be sung TO sleep gently, instead of freezing everyone INTO it.\"",
  "media_hook": {
   "video_path": "ch2_lullaby_learn.mp4"
  },
  "options": [
   {
    "display_text": "Thank Willowhoot and head for the way to the Heart Spring.",
    "next_id": "ch2_badger_gate",
    "effects": {
     "add_items": [
      "Spring Lullaby"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch2_seed_path": {
  "id": "ch2_seed_path",
  "text_chunk": "\"When the Moonbloom finished blooming,\" Willowhoot says, \"it left one seed behind, tucked in the Oak Door's hollow. A Moonbloom seed carries a whole summer folded up inside it.\" Bramble squeaks — he'd been keeping it safe in his hat this whole time and pops it into your palm, warm as a June afternoon.\n\n\"Plant it at the Heart Spring,\" the owl says, \"and it will remind the water how to be warm. But a seed is only a promise. Someone still has to stay and mean it.\"",
  "media_hook": {
   "image_path": "ch2_seed_path.png"
  },
  "options": [
   {
    "display_text": "Cradle the warm seed and go find the way to the Spring.",
    "next_id": "ch2_badger_gate",
    "effects": {
     "add_items": [
      "Moonbloom seed"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch2_badger_gate": {
  "id": "ch2_badger_gate",
  "text_chunk": "The only way down to the Heart Spring runs through a root-tunnel guarded by Old Bructus, a badger the size of a wheelbarrow with a grumble for a greeting. He fills the doorway, arms crossed, one paw held oddly stiff.\n\n\"Nobody goes to the Spring,\" he rumbles. \"Been keeping folk out a week now. Cold's bad enough without a parade tromping through.\" He winces — that stiff paw is clearly hurting him.",
  "media_hook": {
   "image_path": "ch2_badger_gate.png"
  },
  "options": [
   {
    "display_text": "Offer Old Bructus a honey biscuit and a hot cup of cocoa.",
    "next_id": "ch2_badger_biscuit",
    "requires_item": "honey biscuits",
    "effects": {
     "reputation_change": 2,
     "remove_items": [
      "honey biscuits"
     ]
    }
   },
   {
    "display_text": "Notice his sore paw and gently offer to help.",
    "next_id": "ch2_badger_paw",
    "effects": {
     "reputation_change": 3
    }
   },
   {
    "display_text": "Explain, calmly and honestly, why you must reach the Spring.",
    "next_id": "ch2_badger_truth"
   }
  ]
 },
 "ch2_badger_biscuit": {
  "id": "ch2_badger_biscuit",
  "text_chunk": "Bructus stares at the biscuit like he's forgotten kindness was a thing that happened. He takes it in two claws, eats it in one bite, and his whole scowl melts by degrees. \"...Gran's recipe,\" he mumbles. \"Haven't had one o' these since I was a cub.\"\n\nHe steps aside from the tunnel with a gruff cough. \"Go on, then. And here — \" he presses a knob of warm amber into your hand, \"lantern-resin. Burns bright and warm even in the deep cold. The little frost-one down there... go easy on 'em. They're smaller than they act.\"",
  "media_hook": {
   "image_path": "ch2_badger_biscuit.png"
  },
  "options": [
   {
    "display_text": "Thank him and climb down toward the Heart Spring.",
    "next_id": "ch2_heart_spring",
    "effects": {
     "add_items": [
      "warm lantern-resin"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch2_badger_paw": {
  "id": "ch2_badger_paw",
  "text_chunk": "You crouch and look at his paw. A long thorn of ice is wedged between his claws — the frost got him days ago and he's been too proud to say. You warm it in your mittens until the ice softens, then ease the sliver free. Bructus lets out a breath he's been holding for a week.\n\n\"...Huh,\" he says, blinking. \"Nobody's ever asked to help old Bructus. They just go 'round.\" He stands aside from the tunnel, gentler now. \"The Spring's yours. And listen — that frost-child. Be kind. Whole trouble started 'cause everyone went 'round THEM, too.\"",
  "media_hook": {
   "image_path": "ch2_badger_paw.png"
  },
  "options": [
   {
    "display_text": "Promise you will, and climb down toward the Heart Spring.",
    "next_id": "ch2_heart_spring",
    "effects": {
     "add_items": [
      "Bructus's blessing"
     ],
     "reputation_change": 2
    }
   }
  ]
 },
 "ch2_badger_truth": {
  "id": "ch2_badger_truth",
  "text_chunk": "You don't argue or beg. You just tell him the truth, plainly: that a lonely child is freezing the woods without meaning to, that everyone's been staying away, and that staying away is exactly what's making it worse. \"I'm not going down there to make them leave,\" you finish. \"I'm going down to sit with them.\"\n\nBructus is quiet a long moment. Then he unblocks the tunnel. \"That's the first sensible thing anyone's said all week,\" he grunts. \"Go. Mind the last step, it's iced.\"",
  "media_hook": {
   "image_path": "ch2_badger_truth.png"
  },
  "options": [
   {
    "display_text": "Climb down carefully toward the Heart Spring.",
    "next_id": "ch2_heart_spring",
    "effects": {
     "reputation_change": 1
    }
   }
  ]
 },
 "ch2_heart_spring": {
  "id": "ch2_heart_spring",
  "text_chunk": "The tunnel opens into a vast, hushed hollow, and there it is: the Heart Spring, the deep bright well where every whisper in the woods is born. Or it was. Now it's a shrinking pool of open water in a widening sheet of ice, and the whispers have dwindled to almost nothing.\n\nCurled at the water's edge, knees to chest, is a small child the pale blue-white of first snow, with frost for freckles and breath like tiny flurries. When they see you they flinch and pull tighter, and the ice creeps another inch across the Spring. \"Go away,\" they whisper. \"Everybody does. You might as well do it now.\"",
  "media_hook": {
   "image_path": "ch2_heart_spring.png",
   "video_path": "ch2_heart_spring.mp4"
  },
  "options": [
   {
    "display_text": "Don't go away. Sit down beside them in the cold and stay.",
    "next_id": "ch2_meet_nivin",
    "effects": {
     "reputation_change": 3
    }
   }
  ]
 },
 "ch2_meet_nivin": {
  "id": "ch2_meet_nivin",
  "text_chunk": "You sit. The cold bites, but you stay. Slowly the frost-child peeks up. \"My name's Nivin,\" they admit at last. \"I came down from the long cold months ago. I only wanted to see the woods everyone whispered about. But I'm made of winter, and everywhere I sit, it frosts. So everyone left. So I froze the Spring, so the woods would sleep and stay — because things that are asleep can't walk away from you.\"\n\nA single icy tear rolls down and pings on the stone. \"I didn't want to hurt anything. I just didn't want to be alone anymore.\"",
  "media_hook": {
   "image_path": "ch2_meet_nivin.png"
  },
  "options": [
   {
    "display_text": "Sing Nivin the Spring Lullaby, so winter can be safe instead of scared.",
    "next_id": "ch2_end_lullaby",
    "requires_item": "Spring Lullaby"
   },
   {
    "display_text": "Plant the Moonbloom seed at the water's edge, together.",
    "next_id": "ch2_end_seed",
    "requires_item": "Moonbloom seed"
   },
   {
    "display_text": "Wrap Gran's warm scarf around Nivin and invite them home.",
    "next_id": "ch2_end_hearth",
    "requires_item": "warm scarf"
   },
   {
    "display_text": "Take Nivin's cold hand and promise: you'll be their friend, frost and all.",
    "next_id": "ch2_end_friend",
    "effects": {
     "reputation_change": 2
    }
   }
  ]
 },
 "ch2_end_lullaby": {
  "id": "ch2_end_lullaby",
  "text_chunk": "You sing the oldest tune in the woods — the one Gran hummed into you without either of you knowing why. Nivin's eyes go wide; they've never heard a song that made sleeping sound safe instead of lonely. \"It's a promise,\" you explain. \"Winter's allowed, as long as spring gets to come after.\"\n\nNivin sings it with you, and the Heart Spring stops freezing. It doesn't thaw all at once — it settles, like a child finally calm enough to nap. The woods sleep that night for the first proper winter in years, wrapped in a lullaby, certain of waking. And when spring comes — early, eager — Nivin is still there at the Spring, humming the second half of the song, keeping time until everyone stirs. The woods have a winter-keeper now, and winter has stopped being something to fear.",
  "media_hook": {
   "image_path": "ch2_ending_lullaby.png",
   "video_path": "ch2_ending_lullaby.mp4"
  },
  "options": [
   {
    "display_text": "🍂  The seasons turn, and autumn comes to the woods… →",
    "next_id": "ch3_entry",
    "effects": {
     "add_items": [
      "the Spring Lullaby"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch2_end_seed": {
  "id": "ch2_end_seed",
  "text_chunk": "You press the Moonbloom seed into the frozen mud at the water's edge, and Nivin — carefully, afraid to hurt it — cups their cold hands around it too. \"Warm things and cold things,\" you say. \"They can share a garden.\"\n\nThe seed remembers a whole summer at once. Green races up in a spiral, and a Moonbloom unfurls right over the Spring, glowing gold against the frost. The ice draws back to a gentle rim — not gone, just polite. Nivin gasps at the warmth they didn't melt. From that day they tend the Spring together with the woods, the one place where frost-flowers and summer-blooms grow side by side, and Nivin never has to choose between being themself and being loved.",
  "media_hook": {
   "image_path": "ch2_ending_seed.png",
   "video_path": "ch2_ending_seed.mp4"
  },
  "options": [
   {
    "display_text": "🍂  The seasons turn, and autumn comes to the woods… →",
    "next_id": "ch3_entry",
    "effects": {
     "add_items": [
      "a frost-and-Moonbloom blossom"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch2_end_hearth": {
  "id": "ch2_end_hearth",
  "text_chunk": "You unwind Gran's softest scarf and loop it around Nivin's shoulders. \"You don't have to stay down here in the dark to keep anyone,\" you tell them. \"Come home. There's cocoa, and a fire, and a Gran who's been saving a story just for you.\"\n\nNivin comes. They can't sit too close to the hearth, of course — they frost the windows a little, and their side of the sofa stays deliciously cool in summer — but Gran just laughs and knits them a blanket of cool blue wool. With Nivin no longer frightened and no longer alone, the Heart Spring unclenches on its own, and the woods wake gentle and grateful. Some evenings, when the leaves whisper, they're saying two new names — and one of them tastes like snow.",
  "media_hook": {
   "image_path": "ch2_ending_hearth.png",
   "video_path": "ch2_ending_hearth.mp4"
  },
  "options": [
   {
    "display_text": "🍂  The seasons turn, and autumn comes to the woods… →",
    "next_id": "ch3_entry",
    "effects": {
     "add_items": [
      "Nivin's hearth-scarf"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch2_end_friend": {
  "id": "ch2_end_friend",
  "text_chunk": "You take Nivin's hand. It's shockingly cold, and you don't let go. \"I'm not asleep, and I'm not leaving,\" you say. \"You don't have to freeze the whole world to keep one friend. You just have to let one friend stay. So I'm staying.\"\n\nNivin cries — real, warm-hearted, icicle tears — and for the first time the crying makes something THAW. The Heart Spring loosens; the whispers come rushing back all at once, so glad to speak they nearly shout. Nivin doesn't stop being made of winter. They just stop being alone in it. Every year when the first frost feathers Gran's windows, you know it's Nivin saying hello — and every year you go out to the woods to meet your winter friend, who kept the whole forest company so long that now the whole forest keeps them.",
  "media_hook": {
   "image_path": "ch2_ending_friend.png",
   "video_path": "ch2_ending_friend.mp4"
  },
  "options": [
   {
    "display_text": "🍂  The seasons turn, and autumn comes to the woods… →",
    "next_id": "ch3_entry",
    "effects": {
     "add_items": [
      "Nivin's winter friendship"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch3_entry": {
  "id": "ch3_entry",
  "text_chunk": "Autumn comes to the Whispering Woods all at once, like the trees agreed on it overnight. The morning you arrive at Gran's, the whole forest is gold and rust and there are paper lanterns strung between the branches, bobbing in the cool air.\n\n\"Tonight's the Harvest Home,\" Gran says, tucking your scarf in. \"Once a year, before the woods go to sleep for winter, everyone gathers to say thank you — for the summer, for each other, for waking up again come spring. Go on. They've been waiting for you.\"",
  "media_hook": {
   "image_path": "ch3_entry.png",
   "video_path": "ch3_entry.mp4"
  },
  "options": [
   {
    "display_text": "Help string the last of the paper lanterns.",
    "next_id": "ch3_gran_words",
    "effects": {
     "reputation_change": 1
    }
   },
   {
    "display_text": "Go find Bramble and the others in the crowd.",
    "next_id": "ch3_gran_words"
   }
  ]
 },
 "ch3_gran_words": {
  "id": "ch3_gran_words",
  "text_chunk": "The clearing is warm with lantern-light and the smell of spiced apples. Bramble is bustling about in a tiny waistcoat; the Ripple otters are stacking acorn-cakes; even Old Bructus the badger is here, gruff and pleased, wearing a crown of red leaves someone made him.\n\nGran finds you a seat. \"The feast ends at true midnight,\" she says quietly, \"when the woods finally close their eyes. Whatever's still out and lost when they sleep... stays lost, dear, until spring wakes it. So we finish before then. Always before then.\"",
  "media_hook": {
   "image_path": "ch3_gran_words.png"
  },
  "options": [
   {
    "display_text": "Settle in and watch the first stars come out.",
    "next_id": "ch3_star_falls"
   }
  ]
 },
 "ch3_star_falls": {
  "id": "ch3_star_falls",
  "text_chunk": "The stars come out slow and shy, one at a time, until the sky is thick with them and every creature tips their head back to look.\n\nThen one of the stars... moves. It wobbles, brightens, and falls — a streak of gold pouring down through the dark, faster and faster, until it lands in the brambles at the clearing's edge with a sound like a dropped handful of bells.\n\nThe whole Harvest Home goes silent.",
  "media_hook": {
   "image_path": "ch3_starfall.png",
   "video_path": "ch3_starfall.mp4"
  },
  "options": [
   {
    "display_text": "Run to where it fell — no one else is moving.",
    "next_id": "ch3_meet_star",
    "effects": {
     "reputation_change": 1
    }
   },
   {
    "display_text": "Grab Bramble's paw and go together.",
    "next_id": "ch3_meet_star",
    "effects": {
     "add_items": [
      "Bramble at your side"
     ]
    }
   }
  ]
 },
 "ch3_meet_star": {
  "id": "ch3_meet_star",
  "text_chunk": "In the brambles, curled small and shivering, is a child made all of soft gold starlight. Their glow flickers like a candle in a draft — bright, then thin, then bright again.\n\n\"I'm Lumi,\" they whisper. \"I leaned too far out to see your lanterns. They were so warm. I've never seen warm from up there.\" Their light dims, and they hug their knees. \"I don't know the way back up. And when a fallen star's light goes all the way out... it doesn't come back on.\"",
  "media_hook": {
   "image_path": "ch3_meet_lumi.png"
  },
  "options": [
   {
    "display_text": "Take Lumi's hand: \"I'll get you home before midnight. I promise.\"",
    "next_id": "ch3_hub",
    "effects": {
     "reputation_change": 2,
     "add_items": [
      "Lumi's trust"
     ]
    }
   }
  ]
 },
 "ch3_hub": {
  "id": "ch3_hub",
  "text_chunk": "You carry Lumi back into the lantern-light, cupped careful in both hands. The whole woods crowd close, worried and kind — but nobody knows how to send a star home, and the moon says midnight is coming.\n\nThink. Who might know? Who could help? And is everyone here who ought to be?",
  "media_hook": {
   "image_path": "ch3_hub.png"
  },
  "options": [
   {
    "display_text": "Ask wise Miss Willowhoot how a star gets home.",
    "next_id": "ch3_owl"
   },
   {
    "display_text": "Rally the whole woods to build a way up.",
    "next_id": "ch3_rally"
   },
   {
    "display_text": "Wait — someone's missing from the feast. Go find them.",
    "next_id": "ch3_find_pip"
   },
   {
    "display_text": "A cold shimmer at the tree line... go and see.",
    "next_id": "ch3_nivin"
   },
   {
    "display_text": "It's nearly midnight — carry Lumi to the great oak now.",
    "next_id": "ch3_climax"
   }
  ]
 },
 "ch3_owl": {
  "id": "ch3_owl",
  "text_chunk": "Miss Willowhoot blinks her slow silver eyes from the hollow of the beech. \"A fallen star,\" she murmurs. \"I wondered why the sky looked one light short.\"\n\n\"A star climbs home on the tallest branch of the great oak,\" she says, \"at the stroke of true midnight, when the sky leans down closest. But the topmost branch is bare now — it needs one last golden leaf to catch the light and hold it, like a stepping stone. And the last leaf, child, is always the very hardest one to give away.\" She presses a map, drawn in delicate frost, into your palm.",
  "media_hook": {
   "image_path": "ch3_owl.png"
  },
  "options": [
   {
    "display_text": "Thank her and hurry back to Lumi.",
    "next_id": "ch3_hub",
    "effects": {
     "add_items": [
      "the owl's star-map"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch3_rally": {
  "id": "ch3_rally",
  "text_chunk": "You climb onto a stump and call out: \"Lumi needs to get all the way up — and I can't lift them alone. Will you help?\"\n\nThe answer is the whole Harvest Home at once. The Ripple otters make a chain of themselves; Old Bructus braces the bottom with his broad back; Bramble directs from the top of his acorn-cap hat. Barrel by barrel, vine by vine, the woods build a swaying ladder toward the stars — not because they have to, but because that's what the Harvest Home is for.",
  "media_hook": {
   "image_path": "ch3_rally.png"
  },
  "options": [
   {
    "display_text": "Thank everyone and get back to Lumi.",
    "next_id": "ch3_hub",
    "effects": {
     "add_items": [
      "the woods' friendship"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch3_find_pip": {
  "id": "ch3_find_pip",
  "text_chunk": "You slip behind the feast and find, under a drift of fallen leaves, a small red squirrel — a little one named Pip, hiding, cheeks wet.\n\n\"Everything's falling,\" Pip hiccups. \"The leaves are falling and the star fell and now the woods are going to close their eyes and what if — what if it's all just goodbye? What if nothing wakes up?\" They pull a leaf over their head like a blanket.",
  "media_hook": {
   "image_path": "ch3_find_pip.png"
  },
  "options": [
   {
    "display_text": "Sit down in the leaves and just listen for a while.",
    "next_id": "ch3_pip_leaf",
    "effects": {
     "reputation_change": 2
    }
   }
  ]
 },
 "ch3_pip_leaf": {
  "id": "ch3_pip_leaf",
  "text_chunk": "You sit with Pip until the crying slows, and then you tell them the thing Gran told you: the woods don't die when they sleep. Every leaf that lets go is a little promise — see you in the spring. Falling is just how green things come back.\n\nPip thinks about that a long moment. Then they dig under themselves and hold out their most precious thing: a single perfect golden leaf, the very last from the tallest branch, saved all autumn long. \"Give it to the star,\" Pip says, brave now. \"So something comes back.\"",
  "media_hook": {
   "image_path": "ch3_pip_leaf.png"
  },
  "options": [
   {
    "display_text": "Hug Pip tight and take them back to the feast with you.",
    "next_id": "ch3_hub",
    "effects": {
     "add_items": [
      "the last golden leaf"
     ],
     "reputation_change": 2
    }
   }
  ]
 },
 "ch3_nivin": {
  "id": "ch3_nivin",
  "text_chunk": "At the frost-touched edge of the clearing waits a familiar shimmer of cold — Nivin, the winter friend, come early from the far cold months just to see the Harvest Home.\n\n\"A fallen star,\" Nivin breathes, eyes wide. \"Stars kept me company through all those long, lonely months, when nothing else would sit near me. Let me help this one.\" They lean close to the great oak and breathe, and a spiral staircase of glittering frost-steps climbs its trunk toward the sky.",
  "media_hook": {
   "image_path": "ch3_nivin.png"
  },
  "options": [
   {
    "display_text": "Squeeze Nivin's cold hand and head back to the oak.",
    "next_id": "ch3_hub",
    "effects": {
     "add_items": [
      "Nivin's frost-steps"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch3_climax": {
  "id": "ch3_climax",
  "text_chunk": "The moon touches the top of the sky. True midnight, almost. You carry Lumi to the foot of the great oak, and their light has burned down to the littlest flicker, a candle guttering in cupped hands.\n\nThe whole woods gather in the dark below, holding their breath. Everything you did tonight is here with you now. It's time to send Lumi home — and there's more than one way to do it.",
  "media_hook": {
   "image_path": "ch3_climax.png"
  },
  "options": [
   {
    "display_text": "Climb the star-map path and set the golden leaf to catch the light.",
    "next_id": "ch3_end_home",
    "requires_item": "the owl's star-map"
   },
   {
    "display_text": "Ask Lumi to stay and shine over the Harvest Home instead.",
    "next_id": "ch3_end_harvest",
    "requires_item": "the woods' friendship"
   },
   {
    "display_text": "Hold up the last golden leaf — show Lumi that falling isn't goodbye.",
    "next_id": "ch3_end_leaf",
    "requires_item": "the last golden leaf"
   },
   {
    "display_text": "Give Lumi your own glowing lantern to carry home forever.",
    "next_id": "ch3_end_lantern"
   }
  ]
 },
 "ch3_end_home": {
  "id": "ch3_end_home",
  "text_chunk": "You climb the frost-map's shining path with Lumi cupped to your chest, and at the very top you fix Pip's last golden leaf to the bare branch. It catches Lumi's light like a lantern catching a flame — and the whole sky leans down close, the way a grown-up leans over a crib.\n\nLumi steps up onto a ladder made of their own gold light, whole and blazing bright again. \"I'll be the one right over your chimney,\" they call down, laughing. And they are: every clear night now, one low warm star sits close over Gran's roof, keeping watch until morning.",
  "media_hook": {
   "image_path": "ch3_ending_home.png",
   "video_path": "ch3_ending_home.mp4"
  },
  "options": [
   {
    "display_text": "❄️  Winter comes, and passes… and one morning the thaw begins. →",
    "next_id": "ch4_entry",
    "effects": {
     "add_items": [
      "the memory of the star going home"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch3_end_harvest": {
  "id": "ch3_end_harvest",
  "text_chunk": "Lumi looks at the lanterns, and the long tables, and every upturned face waiting on them with such plain kindness — and something in their flickering light goes steady and calm.\n\n\"Maybe,\" they say slowly, \"home can be more than one place.\" They rise, but only to the crown of the great oak, and settle there, glowing gold over the whole Harvest Home. The woods have their own evening star now — the guest who came down for warmth and decided to stay and be the warmth. Every autumn feast after, they shine the brightest.",
  "media_hook": {
   "image_path": "ch3_ending_harvest.png",
   "video_path": "ch3_ending_harvest.mp4"
  },
  "options": [
   {
    "display_text": "❄️  Winter comes, and passes… and one morning the thaw begins. →",
    "next_id": "ch4_entry",
    "effects": {
     "add_items": [
      "the Harvest Home's welcome"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch3_end_leaf": {
  "id": "ch3_end_leaf",
  "text_chunk": "You hold Pip's golden leaf up into the dark where everyone can see it. \"Falling isn't the end,\" you tell Lumi — and Pip, and the whole hushed wood. \"It's just how things come back.\"\n\nLumi's frightened light goes soft and sure. They float up gentle as a let-go breath, and as they climb, the last leaves of autumn come loose all together and fall like a slow gold snow — and not one creature is afraid of them anymore. From that night on, the first star of every winter is Lumi, hanging low over the sleeping woods, promising the spring.",
  "media_hook": {
   "image_path": "ch3_ending_leaf.png",
   "video_path": "ch3_ending_leaf.mp4"
  },
  "options": [
   {
    "display_text": "❄️  Winter comes, and passes… and one morning the thaw begins. →",
    "next_id": "ch4_entry",
    "effects": {
     "add_items": [
      "Pip's last golden leaf"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch3_end_lantern": {
  "id": "ch3_end_lantern",
  "text_chunk": "You unhook Gran's old iron lantern — the one that's lit every step of every path you've ever walked in these woods — and you press it gently into Lumi's small hands. \"So you never lose your way again,\" you tell them.\n\nLumi hugs it to their chest, and rises: a little star carrying a little light, up and up into the dark. Now there are two glows in the night that always seem to find their way toward each other. You walk home without the lantern, through the whole black woods, and you are not the least bit afraid — because you know exactly where your light went, and why.",
  "media_hook": {
   "image_path": "ch3_ending_lantern.png",
   "video_path": "ch3_ending_lantern.mp4"
  },
  "options": [
   {
    "display_text": "❄️  Winter comes, and passes… and one morning the thaw begins. →",
    "next_id": "ch4_entry",
    "effects": {
     "add_items": [
      "the star's borrowed lantern-light"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch4_entry": {
  "id": "ch4_entry",
  "text_chunk": "You wake at Gran's to a sound you haven't heard in months: dripping. The long winter is letting go. Outside, the snow is going soft and grey, and the first bare patch of earth has appeared by the porch step, dark and steaming in the morning sun.\n\nGran hands you a mug of cocoa and looks out at the woods, which are still and quiet and white. \"They're slow to wake this year,\" she says softly. \"Winter went deep. The woods have half-forgotten how to be spring. Maybe they just need someone to remind them.\"",
  "media_hook": {
   "image_path": "ch4_entry.png",
   "video_path": "ch4_entry.mp4"
  },
  "options": [
   {
    "display_text": "Pull on your boots and go wake the woods.",
    "next_id": "ch4_thaw",
    "effects": {
     "reputation_change": 1,
     "add_items": [
      "glowing lantern"
     ]
    }
   }
  ]
 },
 "ch4_thaw": {
  "id": "ch4_thaw",
  "text_chunk": "The path into the woods is half-thawed, mud and old snow, and everywhere there's the small busy sound of ice giving up. At the great oak, a very sleepy Bramble is trying to sweep melting slush off the Oak Door with a twig broom, yawning between every stroke.\n\n\"Oh — hello,\" he says, blinking. \"Everyone's still half-asleep. The bulbs won't sprout, the stream's still shy, and the Heart Spring hasn't sung its first spring note yet. Nobody remembers who's supposed to start.\"",
  "media_hook": {
   "image_path": "ch4_thaw.png"
  },
  "options": [
   {
    "display_text": "\"Then let's wake them up — gently. Where do we start?\"",
    "next_id": "ch4_hub",
    "effects": {
     "reputation_change": 1
    }
   }
  ]
 },
 "ch4_hub": {
  "id": "ch4_hub",
  "text_chunk": "Bramble counts on his little paws. \"Three things haven't woken. The Heart Spring hasn't sung — it needs the first Spring Song. The Moonbloom meadow hasn't greened — the seeds need planting. And there's a new little one, born in the deep of winter, who's never once seen spring and is frightened of all the changing.\"\n\nHe looks up at you hopefully. \"And Nivin's still here — the winter friend. But if spring truly comes... winter has to go. I don't think anyone's told them yet.\"",
  "media_hook": {
   "image_path": "ch4_hub.png"
  },
  "options": [
   {
    "display_text": "Go to the Heart Spring and find its first Spring Song.",
    "next_id": "ch4_spring"
   },
   {
    "display_text": "Plant the Moonbloom seeds in the sleeping meadow.",
    "next_id": "ch4_meadow"
   },
   {
    "display_text": "Find the frightened little one born in winter.",
    "next_id": "ch4_fawn"
   },
   {
    "display_text": "Go and sit with Nivin before spring changes everything.",
    "next_id": "ch4_nivin"
   },
   {
    "display_text": "It's time — go to the meadow's heart and wake the spring.",
    "next_id": "ch4_climax"
   }
  ]
 },
 "ch4_spring": {
  "id": "ch4_spring",
  "text_chunk": "At the Heart Spring, the deep bright well sits perfectly still, holding its breath under a last thin lid of ice. It's waiting for a sound it can't quite remember.\n\nYou hum the Spring Lullaby — the one Nivin and the whole wood learned to sing — and the ice on the water shivers, cracks, and clears. But the Spring needs more than the sleeping song now; it needs the waking half, the part that says morning. You feel it just at the edge of your memory, warm as sun on your eyelids.",
  "media_hook": {
   "image_path": "ch4_spring.png"
  },
  "options": [
   {
    "display_text": "Let the tune turn from lullaby to sunrise, and carry it back.",
    "next_id": "ch4_hub",
    "effects": {
     "add_items": [
      "the Waking Song"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch4_meadow": {
  "id": "ch4_meadow",
  "text_chunk": "The Moonbloom meadow is a wide field of grey, flattened grass, still half under snow. But when you kneel, you find them — the seeds Pip saved and scattered, curled just beneath the surface, waiting.\n\nPip is already there, bouncing with impatience. \"I've been guarding them ALL winter,\" the little squirrel announces. \"Warm things and cold things can share a garden — you taught me that. So I saved every seed. Help me tuck them in so they know it's safe to grow?\"",
  "media_hook": {
   "image_path": "ch4_meadow.png"
  },
  "options": [
   {
    "display_text": "Kneel with Pip and plant every seed, gently, one by one.",
    "next_id": "ch4_hub",
    "effects": {
     "add_items": [
      "a meadow of planted seeds"
     ],
     "reputation_change": 2
    }
   }
  ]
 },
 "ch4_fawn": {
  "id": "ch4_fawn",
  "text_chunk": "In a hollow between two roots you find the new little one: a tiny, wobbly-legged fawn with dew still on her spotted back, pressed into the last patch of snow because it's the only world she has ever known.\n\n\"Everything's melting,\" she whispers, wide-eyed. \"The white is going away and green things are pushing UP out of the ground and it's all so LOUD and new. I want it to stop. I want it to stay the way it was.\"",
  "media_hook": {
   "image_path": "ch4_fawn.png"
  },
  "options": [
   {
    "display_text": "Sit in the snow beside her and watch the first green things together.",
    "next_id": "ch4_fawn_walk",
    "effects": {
     "reputation_change": 2
    }
   }
  ]
 },
 "ch4_fawn_walk": {
  "id": "ch4_fawn_walk",
  "text_chunk": "You don't rush her. You sit in the cold until she's ready, and then you take one slow step, and another, showing her spring the way you'd show a smaller child a big wave at the beach — a little at a time.\n\nA crocus. A puddle full of sky. A beetle stretching after its long sleep. By the third new thing she's forgotten to be afraid, and by the tenth she's leading YOU, pronking through the melt. \"Her name's Fen,\" Bramble whispers, wiping his eyes. She has decided spring is, in fact, the best thing that has ever happened.",
  "media_hook": {
   "image_path": "ch4_fawn_walk.png"
  },
  "options": [
   {
    "display_text": "Let Fen lead the way back — she's ready now.",
    "next_id": "ch4_hub",
    "effects": {
     "add_items": [
      "Fen's trust"
     ],
     "reputation_change": 2
    }
   }
  ]
 },
 "ch4_nivin": {
  "id": "ch4_nivin",
  "text_chunk": "You find Nivin at the shrinking edge of the last snowbank, looking at the bare brown earth spreading toward them like a slow tide. They already know.\n\n\"Winter has to go for spring to come,\" Nivin says quietly, before you can. \"That's the promise, isn't it? The one in the lullaby.\" A small, brave, frost-flake smile. \"I'm not sad. Well — a little sad. But you don't have to keep the whole world frozen to keep one friend. You taught me that too.\"",
  "media_hook": {
   "image_path": "ch4_nivin.png"
  },
  "options": [
   {
    "display_text": "Promise Nivin you'll be waiting at the first frost next winter.",
    "next_id": "ch4_hub",
    "effects": {
     "add_items": [
      "a promise to Nivin"
     ],
     "reputation_change": 1
    }
   }
  ]
 },
 "ch4_climax": {
  "id": "ch4_climax",
  "text_chunk": "You gather everyone at the heart of the sleeping meadow: Bramble, Pip, little Fen, and Nivin shimmering at the cold edge, with Lumi the morning star pale and patient in the brightening sky. The whole wood waits, drowsy, on the very edge of waking.\n\nIt's time to remind the woods how to be spring. There's more than one way to wake a world — and every one of them is a kind of beginning.",
  "media_hook": {
   "image_path": "ch4_climax.png"
  },
  "options": [
   {
    "display_text": "Sing the Waking Song and call the Heart Spring back to life.",
    "next_id": "ch4_end_song",
    "requires_item": "the Waking Song"
   },
   {
    "display_text": "Wake the planted meadow so the Moonblooms rise all at once.",
    "next_id": "ch4_end_meadow",
    "requires_item": "a meadow of planted seeds"
   },
   {
    "display_text": "Let Fen take the first steps of spring for the whole wood to follow.",
    "next_id": "ch4_end_fawn",
    "requires_item": "Fen's trust"
   },
   {
    "display_text": "Walk Nivin gently into a good goodbye, and let the thaw begin.",
    "next_id": "ch4_end_nivin"
   }
  ]
 },
 "ch4_end_song": {
  "id": "ch4_end_song",
  "text_chunk": "You sing the Waking Song out over the still water — the sunrise half of the old lullaby, the part that means good morning. The Heart Spring hears itself remembered. It stirs, it brightens, and then it SINGS, a note so glad the whole wood sits up at once.\n\nThe whispers come rushing back all through the trees, every leaf-bud unclenching, and spring pours out from the center of the woods like light from a struck bell. You didn't make spring. You just reminded it of its own name — and now it will never quite forget you did.",
  "media_hook": {
   "image_path": "ch4_ending_song.png",
   "video_path": "ch4_ending_song.mp4"
  },
  "is_ending": true,
  "ending_title": "The First Spring Song",
  "options": []
 },
 "ch4_end_meadow": {
  "id": "ch4_end_meadow",
  "text_chunk": "You press your hands flat to the planted earth, and Pip does the same, and Fen, and even a curl of Nivin's cold that says goodbye as it warms. \"Wake up,\" you whisper. \"It's safe now.\"\n\nGreen races up out of the ground in a rushing tide, and the whole Moonbloom meadow unfolds at once — a thousand silver-and-gold blossoms opening to the morning, the winter's kept promise finally kept. The woods didn't just wake; they bloomed. Every spring after, this meadow blooms first, and remembers the child who tucked it in.",
  "media_hook": {
   "image_path": "ch4_ending_meadow.png",
   "video_path": "ch4_ending_meadow.mp4"
  },
  "is_ending": true,
  "ending_title": "The Meadow Reborn",
  "options": []
 },
 "ch4_end_fawn": {
  "id": "ch4_end_fawn",
  "text_chunk": "You kneel and tell Fen a secret: the whole woods have forgotten how to start spring, and someone brand-new — someone who's seeing all of it for the very first time — is exactly who should show them.\n\nSo little Fen takes the first step. And the second. And the sleepy wood watches this tiny new creature discover a crocus, a puddle, the sun, and remembers: oh, right, THAT'S how it feels. Spring wakes not with a grand song but with one small brave beginning, and the newest of the woods leads the oldest home into the green.",
  "media_hook": {
   "image_path": "ch4_ending_fawn.png",
   "video_path": "ch4_ending_fawn.mp4"
  },
  "is_ending": true,
  "ending_title": "The Fawn's First Spring",
  "options": []
 },
 "ch4_end_nivin": {
  "id": "ch4_end_nivin",
  "text_chunk": "You take Nivin's cold hand one last time this year and walk them, slow and unafraid, to the very edge of the melting snow. \"Thank you for keeping the woods company,\" you tell them. \"Go rest. I'll be right here at the first frost — I promise.\"\n\nNivin smiles, and softens, and scatters gently into the last of the cold like breath on a winter window — not gone, just gone ahead. And where they stood, the ground thaws and greens, and spring rushes in behind them. Every year the first frost feathers Gran's window, you go out to meet your winter friend again. Goodbye isn't forever. It never was.",
  "media_hook": {
   "image_path": "ch4_ending_nivin.png",
   "video_path": "ch4_ending_nivin.mp4"
  },
  "is_ending": true,
  "ending_title": "Until Next Winter",
  "options": []
 }
};
window.START = "woods_entry";
