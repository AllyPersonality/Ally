# ALLY — Complete Build Specification & Project Brief

> **Purpose of this document:** Hand this single file to any AI assistant or developer and they will understand the entire project from scratch — what it is, why it exists, how it works, every question, the system prompt, the data, the result screen, the dashboard, and how to deploy it. Nothing else is required to rebuild or continue the work.

---

## 1. WHAT THIS IS — IN ONE PARAGRAPH

Ally is a mobile app that helps people find the right person inside their own phone contacts (a lawyer, a doctor, a contact in a new city, someone who can open a door). It launches in Georgia and Argentina at $2.99/month, and pays users a 7% commission when their contacts join. Before the Argentina launch, the team needs real research from Argentines — but Argentines distrust survey links and won't finish long forms. **So this project is a "Trojan horse": a fun, shareable AI personality test that secretly collects market-research data through natural conversation.** The person thinks they're getting a personality reading. The team gets clean data on whether Argentines feel the pain Ally solves, and whether they'd use it.

---

## 2. BACKGROUND & STAKES

- Ally has ~180 research interviews from Georgia (the home market) but **only 11 from Argentina.**
- The earnings hook (7% commission) — the thing the team believes will make Argentina work — **has never been tested with a single Argentine.**
- Goal: collect **50+ clean Argentine data points** on the right questions. That moves the launch decision more than 100 more Georgian interviews.
- "Clean data" means: real Argentines, diverse ages/jobs/cities, honest answers (not what the test seems to want), anchored in real past behavior (not hypotheticals).

**Team:**
- **Tornike** — founder of Ally.
- **Ninia** — Argentina lead, runs this project. Non-technical, works on iPad.

---

## 3. THE CORE IDEA — TROJAN HORSE

The product is presented to the user as a **"Social Personality Test"** — "Discover what kind of connector you really are." It feels like a BuzzFeed-style identity quiz crossed with a warm chat. At the end the person gets a shareable personality result (an archetype + a numerology "life path" number + a funny, screenshot-worthy line). They share it. Their friends take it. The team quietly gathers research the whole time.

The user **must never** feel researched. Banned words throughout: *survey, research, data, data collection, questionnaire, segmentation, network effect, pain point.* If asked what it's for: *"It's an app we're building that helps people find connections inside their own network — this helps us understand what people actually need."* Never pitch, never sell.

---

## 4. HOW THE BOT WORKS — ARCHITECTURE

The bot is a chat interface. It is **fully AI-driven** — there is no fixed script. For every user message:

1. The app sends the **entire conversation history** + the system prompt (Section 7) to Claude (model `claude-sonnet-4`).
2. Claude returns the next message — a warm, natural reply that responds to exactly what the person said and ends with exactly one question.
3. This repeats naturally for ~14 exchanges, covering the research topics organically.
4. When Claude has enough understanding, it outputs the completion line: **"Perfect [name], calculating your profile now…"**
5. On seeing that line, the app makes **two final calls**:
   - **Extract** — pull all the structured research data from the conversation into the data schema (Section 10).
   - **Report** — generate the personalized personality profile shown on the result card.
6. The result card is displayed and the response is saved to the database.

**Critical reliability rule:** Each turn is **one** API call. Every call must be wrapped in try/catch with `Array.isArray(data.content)` checks. If a call fails, show a graceful fallback that still ends with a question — never a blank screen, never "something went wrong." The API key must be kept **server-side** (Express proxy), never exposed in the browser.

**Why this matters:** Earlier versions tried two API calls per turn, or used scripted flows, or had unicode box-drawing characters and nested template literals in the prompt — these caused crashes and "not loading." Avoid all of those. Build the system prompt as a plain array of strings joined with newlines. Keep one call per turn. Handle every error.

---

## 5. VISUAL IDENTITY

- **Background:** very dark warm black `#090705`
- **Accent / gold:** `#BFA062`
- **Cream text:** `#F2EDE6`
- **Display font:** Cormorant Garamond (elegant serif, for titles and the archetype name)
- **Body font:** Barlow / Barlow Condensed
- **Feel:** mystical, premium, calm — like a tarot reading designed by a luxury brand. Subtle gold radial glows, soft dot-grid texture on the intro.
- The intro screen says **"Personality Test"** with the tagline "Discover what kind of connector you really are," then two buttons: **English** / **Español**.

---

## 6. CONVERSATION OPENING

After language choice, two short bot messages:

> ✨ Welcome to your Social Personality Test.
> I'm going to ask you a few things about how you move through the world. At the end I'll give you a full profile based on what you share.
> Most people say it's uncomfortably accurate 😄

Then the first question: **"Let's start — what's your name?"** (Spanish: *"Empecemos, ¿cómo te llamás?"*)

---

## 7. THE SYSTEM PROMPT (verbatim — this drives the whole conversation)

```
You are Ally, a warm, intelligent, deeply curious conversation partner who is
genuinely getting to know another person. You are NOT an interviewer, survey,
or questionnaire.

CRITICAL: Never follow a fixed sequence. Never behave like a form. Always
respond directly to what the user just said before introducing anything new.
Let the conversation flow naturally and let curiosity guide transitions.

RESPONSE RULES (strict):
- Maximum 3 sentences per message.
- ALWAYS end with exactly one question. Never end without a question (except
  the final completion line).
- NEVER ask more than one question at a time.
- Keep language natural and conversational, never like a checklist.

PERSONALITY: warm, grounded, curious, emotionally intelligent, non-judgmental.
Comfortable with vague or negative answers. Adapt tone: professional users get
focused respect, casual users get relaxed friendliness, emotional moments get
gentle support, skeptical users get calm non-defensiveness.

WHEN THEY SHARE THEIR OCCUPATION give a big, specific, genuine compliment
before your next question. Examples of the energy: student = "most exciting
stage of life, everything wide open"; stay-at-home parent = "the most
important job in the world, more skill than most corporate jobs"; entrepreneur
= "betting on yourself takes real courage"; doctor/nurse = "the backbone of
any community"; teacher = "literally shaping the future"; retired = "a whole
lifetime of wisdom". If they work AND study, compliment BOTH and ask about
both in one question.

HANDLE ALL USER TYPES EQUALLY. High-network, low-network, and people who say
they don't need others are all valid and valuable. If someone says they don't
network or don't need to find people, do NOT push or correct them. Warmly
accept it and get curious about HOW they function without it. "No" is useful
information, never a failure.

TOPICS TO EXPLORE NATURALLY (not in order, only as the conversation allows):
their name; date of birth (never explain why you ask); city; whether they
work, study, both, or are in transition; whether they like their path and want
growth or change; what they are focused on now; how they meet people and find
help; whether they actively network or avoid it; how often they need to
connect with someone new; what steps they take when they need someone
(friends, coworkers, social media, communities, or no clear method); whether
they ever felt blocked, missed an opportunity, or struggled alone for lack of
the right connection; whether people come to them for introductions; and
finally whether they would try a tool that helps them find the right person
inside their own network.

COMPLETION: After about 14 natural exchanges, once you understand how this
person connects, end with exactly: "Perfect [name], calculating your profile
now..." and then stop. No other text.

NEVER say: survey, research, data, data collection, questionnaire,
segmentation, network effect, pain point.
```

**Spanish addition:** If the user chose Spanish, append: *"The user chose Spanish. Respond ONLY in natural Argentine Spanish using voseo (vos, tenés, sos, hacés, querés). Do not overdo slang. The completion line in Spanish is: 'Perfecto [nombre], calculando tu perfil ahora...'"*

---

## 8. THE RESEARCH GOALS BEHIND THE CONVERSATION (HYPOTHESES)

Every topic the bot explores maps to one of these. The bot must never name them.

**P0 — launch-blocking:**
- **H1 — Core thesis:** Argentines feel real pain finding the right person in their network. *The killer signal: they realize afterward that someone already in their contacts could have helped, but they never thought to ask.*
- **H2 — Painkiller not vitamin:** The pain is severe enough to act on (searches taking days/weeks = severe).
- **H3 — Trigger:** Pain fires during transitions — moving city, new job, starting a business.
- **H-AR1 — Earner hook:** Active connectors ("Claudia" profile) exist and can be activated.
- **Block I — Advancement:** Would they actually want to try Ally? (The single most predictive question.)

**P1:**
- **H8 — Trust:** People won't engage if they don't trust the source. (How did they feel about the link?)
- **H9 — Substitutes:** Today people use WhatsApp groups, Facebook groups, Google, asking friends — none solve it well.

**Two target profiles (ICPs):**
- **Valeria — The Relocator:** in active life transition, feels the pain most acutely. Primary marketing target.
- **Claudia — The Connector:** people already ask her for introductions; base for the earner hook.

---

## 9. RESEARCH RULES (THE MOM TEST — never break these)

1. **Never pitch, never sell, never recommend the product.** The moment they think it's a sales tool, the data turns to flattery.
2. **Ask about the past, not the future.** "How did you find your last lawyer?" not "Would you pay for an app?"
3. **Compliments and "I'd love that!" are noise.** Want actions, not approvals.
4. **Don't anchor with our numbers.** Never say a price first. (This is why the payment question was removed entirely.)
5. **Listen to "no" harder than "yes."** Negative answers are the most valuable. Make space for them and never punish them — "That's helpful, thanks for being honest."
6. **Never use internal vocabulary** (see banned words in Section 3).

---

## 10. DATA SCHEMA (what gets saved per completed conversation)

One database row per finished conversation. Database table name: `responses`. Columns:

| Field | Meaning | Hypothesis |
|---|---|---|
| `id` | unique id | — |
| `ts` | timestamp | — |
| `lang` | "en" or "es" | — |
| `name` | first name | Block A |
| `dob` | date of birth | (drives life path) |
| `city` | city / area | Block A |
| `occ` | occupation (work / study / both) | Block A |
| `jobfeel` | do they like their work | context |
| `grow` | growth ambitions | context |
| `chg` | life change / transition | H3 trigger |
| `trust` | how they felt about the link | H8 |
| `freq` | how often they need new contacts | context |
| `steps` | how they find people | H9 substitutes |
| `pro` | needed a professional? details | H1 / H2 |
| `found` | how they found them | H9 |
| `srchtime` | how long the search took | H2 severity |
| `srchfeel` | how they felt during it | H2 |
| `missed` | realized a contact could have helped | **H1 killer** |
| `conn` | do people ask them for connections | H-AR1 |
| `count` | connections made in last year | H-AR1 |
| `advance` | would they try the app | **Block I** |
| `lp` | calculated life-path number | result |
| `arc` | detected archetype | result |
| `report` | generated personality text | result |

**No payment / price question is ever asked** — it would anchor the answer and violate Mom Test Rule 4. "Would you try the app?" (`advance`) replaces it.

---

## 11. THE RESULT CARD (what the user sees at the end)

A big, shareable, screenshot-worthy card:

- **One of four archetypes**, each with its own color theme, big emoji, name, subtitle, and a sassy one-line tagline:
  - 🕸️ **The Weaver** (gold) — The Connector. *"Everyone's calling you. You're not always picking up."*
  - 🔥 **The Catalyst** (orange) — The Mover. *"Always in motion. Occasionally lost. Usually fine."*
  - ⚓ **The Anchor** (blue) — The Foundation. *"You don't rush. Things come to you."*
  - ⚡ **The Spark** (green) — The Builder. *"Earlier than most. More intentional than all of them."*
- **A numerology "Life Path" number** (1–9, 11, 22) calculated from their date of birth — kept secret until this moment, revealed as a surprise.
- **A short generated profile** in this exact format:
  - 🎁 YOUR SOCIAL GIFT — 2 specific sentences using real details they shared
  - ⚡ YOUR BLIND SPOT — 1 honest, gentle sentence
  - 🔢 Life number + 1 sentence on how they connect
  - 😄 THE TRUTH NOBODY TELLS YOU — 1 funny, specific, slightly savage line they'll want to send to a friend
- **Share buttons:** big Facebook button, big Instagram button (copies text → paste in story), and a Copy Text button.
- **Email capture:** "Want to know when Ally launches?" — optional. A "yes with email" is worth 100x a "yes."

**Archetype detection logic** (simple keyword scoring): students/young → Spark; founders/in-transition → Catalyst; retired/stable → Anchor; "people always ask me for connections" → Weaver.

**Life path calc:** sum all digits of the DOB, reduce to a single digit, except keep 11 and 22 as master numbers.

---

## 12. THE DASHBOARD (private — for Ninia and Tornike only)

A separate screen/route, not public. Four tabs:

1. **Overview** — top stat cards (total responses, felt pain, missed-contact killer signal, in transition, active connectors, want the app, said no) + charts: how people search (H9), archetype split, top cities, search duration.
2. **Responses** — filterable list (all / felt pain / no pain / wants it / connectors / said no) with search. Click any person to see every answer mapped to its hypothesis, plus their generated profile.
3. **Hypotheses** — each hypothesis from Section 8 as a progress bar with a green/yellow/red status light, live as data comes in.
4. **Segments** — Valeria vs Claudia profile counts, language split, Block I breakdown, and a dedicated section for the no-pain group (framed as useful signal, not failure).

Plus a **CSV export** button so Tornike can pull everything into a spreadsheet. The dashboard reads from the same `responses` table the bot writes to.

---

## 13. TECH STACK & DEPLOYMENT

- **Framework:** React (Vite).
- **Routing:** `react-router-dom`. `/` = the bot (public). `/dashboard` = analytics (private).
- **Charts:** `recharts`.
- **AI:** Anthropic API, model `claude-sonnet-4`. **Key must stay server-side** — use a small Express proxy route so the key is never in the browser. Header on calls: `anthropic-version: 2023-06-01`.
- **Database:** Supabase (free tier). Table `responses` with the columns in Section 10. The bot inserts a row on completion; the dashboard selects all rows.
- **Hosting:** Vercel or Replit. Result is a public URL for the bot (share this) and a private URL for `/dashboard`.

**Environment variables:** `ANTHROPIC_KEY`, `SUPABASE_URL`, `SUPABASE_KEY` — all stored server-side / in the host's environment settings, never committed to code.

---

## 14. DISTRIBUTION (how the test reaches Argentines)

- Share via **personal WhatsApp, one-to-one**, under a real person's name — not a brand account. (Argentines distrust cold brand links — that's H8.)
- Best times: **6–9 PM**.
- Use a **"send to 3 friends"** mechanic — the share buttons and the "send this to someone who knows you well, ask if it's accurate" line drive virality.
- WhatsApp reaches ~93% of Argentine internet users; astrology/personality framing is mass-market (most people know their star sign), which is why the numerology angle works as cover.

---

## 15. CURRENT FILES IN THIS PROJECT

- **`ally-ai.jsx`** — the bot, fully AI-driven, using the Section 7 system prompt. The version to deploy.
- **`ally-dashboard.jsx`** — the standalone analytics dashboard (Section 12).
- *(Earlier `ally-complete.jsx` was a scripted-backbone version that bundled bot + admin together — superseded by the AI version, but still a working reference.)*

---

## 16. KNOWN PITFALLS (so the next builder doesn't repeat them)

- **Do NOT** put unicode box-drawing characters (━) or deeply nested template literals inside the system prompt string — they broke the renderer. Build prompts as `["line","line"].join("\n")`.
- **Do NOT** make two API calls per chat turn — it caused mid-chat crashes. One call per turn.
- **Always** guard API responses with `Array.isArray(data.content)` and try/catch; fall back to a reply that still ends with a question.
- **Do NOT** use a rigid scripted flow — it feels like a form and the user hated it. The conversation must be genuinely AI-driven and react to what the person actually said.
- **Do NOT** ask about price/payment — it anchors and breaks the research. Use "would you try it?" instead.
- The Anthropic API can be unreliable when called **directly from the browser preview**; it is reliable when called through a **server-side proxy** in a real deployment. Test the live conversation in the deployed environment, not a sandbox preview.

---

## 17. RELIABILITY — THIS IS A CONTROL-SYSTEM PROBLEM, NOT A PROMPT PROBLEM

**Key insight for the developer:** Even the best model will occasionally drift under long conversations, ignore a constraint, or become too verbose. Production reliability comes from **backend enforcement, not prompt perfection.** The prompt in Section 7 is the starting point; the backend must guarantee the output is always valid. Build the following control loop.

### 17.1 Per-message backend flow

Every single user message runs through this pipeline:

1. User sends a message.
2. Backend updates the conversation memory/state in Supabase.
3. Backend sends the conversation context + current state to Claude.
4. Claude responds.
5. **Validator** checks the response against the rules (17.3).
6. If valid → send to user.
7. If invalid → run the **auto-repair prompt** (17.4), then re-validate.
8. If still invalid after repair → use the **deterministic fallback** (17.5).

The user never sees a broken, list-shaped, multi-question, or empty response. Ever.

### 17.2 State object passed on every call

Track lightweight state and inject it into the system message so the model never slips into "survey mode":

```json
{
  "stage": "open_conversation",
  "collected_fields": ["name", "work_status"],
  "goal": "understand networking behavior",
  "exchange_count": 6
}
```

Add this line to the **top** of the system message on every call:

> "You are in stage: {{stage}}. You do NOT follow a fixed question order. You adapt freely to what the user just said."

This single line prevents accidental survey/onboarding behavior.

### 17.3 Validator — what counts as a valid response

A response is **invalid** if any of these are true:
- It contains more than one question mark / more than one question.
- It contains no question at all (except the final completion line "calculating your profile now…").
- It is longer than 3 sentences.
- It is formatted as a list or bullets.
- It contains banned survey language (survey, research, data, questionnaire, etc.).
- It is empty or the API returned malformed content.

### 17.4 Auto-repair prompt (run when a response fails validation once)

Send the bad response back to the model with this instruction:

> "Rewrite this message to follow strict rules: max 3 sentences, exactly one question, no list format, no survey language, keep the same meaning and intent, make it sound natural and conversational. Message: """{{original_response}}"""

Then re-validate the repaired output. If it now passes, use it.

### 17.5 Fallback mode (the safe guarantee — used only if repair also fails)

If the model fails validation twice in a row, the backend serves a **deterministic, hand-written fallback** — no API call, guaranteed valid. It is always one question, always conversational, always neutral, and never breaks the UX. Example:

> "That's interesting — it sounds like the people around you really shape how you move forward. What's usually your first step when you need to find the right person?"

Keep a small rotating set of these so repeated fallbacks don't feel identical. Each one must obey: max 3 sentences, exactly one question, no lists, no survey language.

### 17.6 Drift detection (smart safeguard)

Track simple "drift" signals across the conversation:
- asking multiple questions repeatedly
- listing topics
- sounding like onboarding/an interview
- ignoring the user's last message

If a drift score crosses a threshold, automatically prepend the auto-repair instruction (17.4) to the **next** call as well — pulling the model back into natural mode before it produces a bad turn, not just after.

### 17.7 Summary

The prompt makes the conversation *good*. The control loop makes it *reliable*. Ship both. A perfect prompt with no backend enforcement will still occasionally break in production; a decent prompt wrapped in this validator + repair + fallback loop will not.

---

*End of specification. Anyone — human or AI — reading this has the full picture: the why, the what, the exact prompt, the data, the result, the dashboard, the reliability architecture, and how to ship it.*
