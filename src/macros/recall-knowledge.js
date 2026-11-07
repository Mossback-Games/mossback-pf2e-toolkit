/**
 * @name Recall Knowledge
 * @img icons/svg/book.svg
 * @description Rolls Recall Knowledge against your targeted creature. Offers only the skills that can identify it, with your modifiers, and rolls against its identification DC so target-based bonuses (marks, Hunt Prey-style effects) apply. A secret check: the GM sees the result.
 * @foundry 14
 * @pf2e current as of November 2026
 * @requires none
 * @author Mossback Games
 */

// Uses your selected token, or your assigned character if no token is selected.
// With nothing targeted, all seven Recall Knowledge skills are offered.

const MACRO = "Recall Knowledge";

if (game.system.id !== "pf2e") {
  ui.notifications.warn(`${MACRO}: this macro needs the Pathfinder 2E system.`);
  return;
}

const action = game.pf2e?.actions?.get("recall-knowledge");
if (!action) {
  ui.notifications.error(`${MACRO}: the PF2E system's Recall Knowledge action wasn't found.`);
  return;
}

const actor = canvas.tokens.controlled[0]?.actor ?? game.user.character;
if (!actor?.skills) {
  ui.notifications.warn(`${MACRO}: select your token, or assign a character to your user.`);
  return;
}

const targets = Array.from(game.user.targets);
if (targets.length > 1) {
  ui.notifications.warn(`${MACRO}: target only one creature.`);
  return;
}
const targetToken = targets[0] ?? null;
const target = targetToken?.actor ?? null;

const ALL_SKILLS = ["arcana", "crafting", "medicine", "nature", "occultism", "religion", "society"];
const idSkills = target?.identificationDCs?.skills ?? [];
const skills = (idSkills.length > 0 ? idSkills : ALL_SKILLS).filter((s) => actor.skills[s]);
if (skills.length === 0) {
  ui.notifications.warn(`${MACRO}: no usable skills found for this creature.`);
  return;
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const sign = (n) => (n >= 0 ? `+${n}` : `${n}`);
const intro = target
  ? `<p>Recall Knowledge about <strong>${esc(target.name)}</strong>. Skills that can identify it:</p>`
  : `<p>No creature targeted. Choose a skill:</p>`;

try {
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: MACRO },
    content: intro,
    buttons: skills.map((slug, i) => ({
      action: slug,
      label: `${actor.skills[slug].label} (${sign(actor.skills[slug].mod)})`,
      default: i === 0,
    })),
    rejectClose: false,
  });
  if (!choice) return;

  // The system's Recall Knowledge DC is a bare number, so the system doesn't build
  // target roll options for it. Supply them the same way the system does for
  // Strikes: the target's own options (size, traits, conditions) prefixed with
  // "target:", plus any marks your character has placed on that token. This lets
  // bonuses that depend on the target, such as a mark on your quarry, switch on.
  const rollOptions = [];
  if (target && targetToken) {
    rollOptions.push(...target.getSelfRollOptions("target"));
    const marks = actor.synthetics?.tokenMarks?.get(targetToken.document.uuid) ?? [];
    rollOptions.push(...marks.map((mark) => `target:mark:${mark}`));
  }

  await action.use({ statistic: choice, actors: [actor], target: targetToken ?? undefined, rollOptions });
} catch (err) {
  console.error(`${MACRO} |`, err);
  ui.notifications.error(`${MACRO}: something went wrong. See the console (F12) for details.`);
}
