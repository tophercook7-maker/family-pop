# Family Pop 🫧

The board game all about your family. Built for Mom (FUN family project — hours are not business hours).

Play: https://tophercook7-maker.github.io/family-pop/ — on iPhone: Safari → Share → Add to Home Screen.

Mom's answers (10-04) drive the design: name Family Pop · move = Pick Your Bubble (small=easy 2 / medium 4 / big=hard+timer 6) ·
categories Way Back When, Favorites, Who's in the Picture?, Then & Now · join = like-family, Mom approves first (phase 2) ·
squares = mix (family places, everyone's homes, town spots) · fines = Forgot to call your mom (pays Mom!), dishes, thank you, last piece of pie ·
rewards = winner's picture becomes a square, trophies, bragging rights · her piece = 🧁 · sign-up trivia = birthday, nickname, favorite food, something nobody knows.

v1 (this folder, docs/index.html): one-phone pass-and-play, 2–8 players, computer players (Granny Bot / Uncle Ace / Shark), Pop Bucks, Free Pass, Pie Pot, Time Out,
Family Book (add memories + photos → questions), Bragging rights board. Data lives on the device (localStorage).
Next: phase 2 = shared family space online (accounts, Mom approves joins, chat, feed, share to Facebook), phone-to-phone play, all games inside.

## v2 (2026-10-04): the family space
- Server: Cloudflare Worker + Durable Object per family — `server/` → https://family-pop.henryai.workers.dev (deploy: `cd server && npx wrangler deploy`)
- Invite link (?join=FID.CODE) · new people wait for a YES from an approver (Mom) · one-time code to add another phone
- Home feed (posts, photos, likes, comments, 📤 Share out to Facebook/groups/texts via the phone share menu, 💡 make a question)
- Chat: Everyone + private 1-on-1, live; chat lines become "Who said this?" trivia (opt-in per person)
- Family Bank: everyone's Pop Bucks + Free Passes, Give (announced in the feed), Shop (Free Pass 300, picture square 600, pieces 150), bragging rights
- Board game: on everyone's phones (turns sync live, computer turns run on whoever is playing) or pass this phone; ⚡ Challenge square (Bubble Tap / Name Scramble); winner gets a picture square
- Games shelf: Word Popper (score → Pop Bucks, 300/day), PIC POP (25/puzzle + combos + 100 every 10, 600/day), Whispering Woods, The Last Signal, The Hollow Gate (free for family) — story games 60/day
