---
name: playtest
description: Play This Day for up to 20 minutes as one tester persona, then write a report of what the tester achieved and every obstacle, error, bottleneck and surprise they met. Use when the user says playtest, or asks for a human-like test of the game.
---

# Playtest This Day as a persona

This Day is a survival game with one survivor on an island. You play as one **playtester**: a person
with a name, a play style and no knowledge of the code. You hunt for **friction**: anything that
stops, slows, confuses or surprises a player. The run ends in a report in `docs/playtests/`.

The intro says: find water, find food, keep warm when the sun goes down. The game has no goal panel.
The player's only guide is that text, the hint line at the bottom, the menus and the message log.

## Rules for the whole run

- **Wall time is 20 minutes at most.** Run `date +%s` at the start and write the number down.
  Check the time after every few moves. At 17 minutes, stop playing and write the report.
- **Ask the user when you find a major problem.** A major problem is a crash, an error in the
  console, a broken save, or a point where the survivor cannot go on, such as being stuck for good.
  Dying is not a major problem by itself: it is a finding. Write the problem in the report first.
  Then stop playing and ask the user, with `AskUserQuestion`, whether to stop and write the report
  now or play on. The time you wait for the answer does not count toward the 20 minutes. A subagent
  cannot ask: it marks the finding MAJOR in the report and plays on.
- **Play with a player's knowledge only.** Learn the game from what it shows you: the intro, the
  hint line, menus, the Make list, the pack and the message log. Leave `src/` unread until the
  report step. When you are stuck, stay stuck for a while and try what a player would try. How long
  you stayed stuck is a finding.
- **Read and act through `window.playtest`.** Call it with `javascript_tool`. Start with
  `playtest.help()`. Read the page as text with `get_page_text` or `read_page` for anything the
  commands do not show, such as menu text, card text or the death card. Take no screenshots.
- **Look the way a player looks.** `playtest.look(radius)` lists what a player would see on the
  screen around the survivor. A tester may not read the world map or the seed's layout from code.
- **Move time with `playtest.advance(minutes)`.** Pause first with `playtest.speed('pause')`, so
  time moves only when you advance it. One call moves at most 120 game minutes. Read `state()`
  after each call, the way a player glances at the bars. One game day is 1440 minutes, or 12 real
  minutes at normal speed. Sleeping runs 8 times faster.
- **Own your tab and your save.** Other testers may run at the same time. Open your own tab with
  `tabs_create` and pass its `tabId` on every browser call. Open the game as
  `<address>/?seed=<seed>&slot=<persona>`. The `slot` keeps your save apart from other tabs.
- **Native dialogs freeze the page.** Before an action that could open one, run
  `window.confirm = () => true; window.prompt = () => 'playtest'`.
- **Write each finding down as soon as you meet it**, in the report file. Nothing is lost if the
  run ends early.

## Steps

1. **Pick the persona.** Use the one the user named. Otherwise list `docs/playtests/` and pick the
   persona from [personas.md](personas.md) whose last report is oldest, or who has none.
   Read that persona's entry. You play their way for the whole run.
2. **Start a fresh island.** Start the server as `CLAUDE.md` describes. Pick a seed with
   `echo $RANDOM$RANDOM`, unless the persona or the user gives one. Open
   `<address>/?seed=<seed>&slot=<persona>`. The step is done when the intro card shows. Click
   "Open your eyes" with `document.getElementById('begin').click()`, then run
   `playtest.speed('pause')` and check `playtest.state()` shows clock 07:00.
3. **Create the report file** `docs/playtests/<date>-<persona>.md` from the template below, with
   the seed, the commit (`git log -1 --format='%h %s'`) and the start time filled in.
4. **Play.** Repeat this loop until the persona's goal is met, the survivor dies and the persona
   has nothing more to learn, 17 minutes have passed, or the user tells you to stop:
   1. Read `playtest.state()` and `playtest.look()`. Decide what the persona does next, and why.
   2. Act: `act(target, actionId)` after reading `menu(target)`, or `walk(x, y)`. The `{kind:'player'}`
      target holds eating, sleeping and making. Read the page text for the Make list and pack.
   3. Advance time, then read what changed, including the message log.
   4. Every 5 loops, run `read_console_messages` with `onlyErrors: true`.
   5. Log each piece of friction in the report: what you did, what you expected and what
      happened, with the game clock.
   Actions you can offer a player come from menus. Click-only things, such as the on-screen
   hint, the menu position and what a click on the ground does, need a real click with
   `computer` or a read of the page. Use `computer` clicks for these only.
5. **Collect the evidence.** Run `read_console_messages` once more. Add every error and warning
   the report does not hold yet. If the survivor died, copy the death card text.
6. **Check your findings.** Now you may read `src/`. For each finding, decide whether it is a
   bug, a design choice the game fails to explain, or your own mistake as a player. Say which
   in the report. A player's mistake that the game let happen without a hint still counts as
   friction.
7. **Finish the report** and tell the user the top three findings, with a link to the file.
   Ask whether to add any of them to the Inbox in `ideas/backlog.md`.

The step is done when every section of the report is filled in, or says "None found".

## Report template

Write the report for the developer who will fix things. Use plain words.

```markdown
# Playtest: <persona> on island <seed>

- Commit: <hash and subject>
- Played: <wall minutes> minutes, to day <n> <clock> (<game minutes> game minutes)
- Goal for this run: <the persona's goal>

## What the tester achieved

<What the survivor managed, in order, with the game clock of each: first drink, first food,
first fire, first tool, shelter. Then the end state: alive or the cause of death, stats, pack,
structures, skills.>

## Findings

| # | Kind | Game clock | What happened | What the tester expected | Bug, unclear design or player mistake |
| --- | --- | --- | --- | --- | --- |

Kinds: obstacle (the tester got stuck), error (console error or crash), bottleneck (a need, a
good or an action held everything up), surprise (the game did something unexpected).

## How to see each finding again

<For each finding: the seed, then the commands or clicks, in order, that lead to it.>

## Errors in the console

<Each error or warning, with how often it appeared. Or "None found".>
```
