/**
 * Background Lores
 *
 * The PF2e system lists a background's Lore skill (for example, a Hunter's
 * Tanning Lore) but doesn't add it to the character, so players have to add it
 * by hand. This adds it automatically.
 *
 * - Adding a background to a character creates each Lore the background lists,
 *   trained, unless the character already has a Lore by that name.
 * - Removing the background deletes the Lores this created, if they're still
 *   only trained. A Lore the player raised, or added themselves, is kept.
 * - Backgrounds that let you choose a Lore list none, so nothing is added; the
 *   player adds their choice as usual.
 *
 * Setting: Configure Settings > Mossback's PF2E Toolkit > Add background Lores.
 * API: game.modules.get("mossback-pf2e-toolkit").api.addBackgroundLores(actor)
 *
 * Tested on Foundry VTT 14 (build 370) with PF2e 8.7.0.
 */

const MODULE_ID = "mossback-pf2e-toolkit";
const SETTING = "backgroundLores";
const FLAG = "backgroundLore"; // on created Lore items: the background's item id

const enabled = () => game.settings.get(MODULE_ID, SETTING);
const sluggify = (text) => game.pf2e?.system?.sluggify?.(text) ?? text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The Lore names a background lists, ignoring blanks and anything that isn't a Lore. */
function loresOf(background) {
  const lores = background?.system?.trainedSkills?.lore ?? [];
  return lores.map((l) => String(l ?? "").trim()).filter((l) => /\bLore$/i.test(l));
}

/**
 * Add the Lores of an actor's background that it doesn't already have.
 * Returns the names of the Lores added.
 */
export async function addBackgroundLores(actor, background = actor?.background ?? actor?.itemTypes?.background?.[0]) {
  if (actor?.type !== "character" || !background) return [];
  const owned = new Set(actor.itemTypes.lore.map((l) => sluggify(l.name)));
  const missing = loresOf(background).filter((name) => !owned.has(sluggify(name)));
  if (!missing.length) return [];
  await actor.createEmbeddedDocuments(
    "Item",
    missing.map((name) => ({
      name,
      type: "lore",
      img: "systems/pf2e/icons/default-icons/lore.svg",
      system: { proficient: { value: 1 } },
      flags: { [MODULE_ID]: { [FLAG]: background.id } },
    })),
  );
  return missing;
}

/** Delete the Lores added for a background, if they're still only trained. */
async function removeBackgroundLores(actor, background) {
  const created = actor.itemTypes.lore.filter((l) => l.getFlag(MODULE_ID, FLAG) === background.id);
  const removable = created.filter((l) => (l.system?.proficient?.value ?? 0) <= 1);
  const kept = created.filter((l) => !removable.includes(l));
  if (removable.length) await actor.deleteEmbeddedDocuments("Item", removable.map((l) => l.id));
  if (kept.length) {
    ui.notifications.info(
      `Background Lores: kept ${kept.map((l) => l.name).join(", ")} on ${actor.name}, since its proficiency was raised.`,
    );
  }
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, SETTING, {
    name: "Add background Lores",
    hint: "When a background is added to a character, add the Lore skills it lists, trained. Removing the background removes them again, unless their proficiency was raised.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
});

Hooks.once("ready", () => {
  const module = game.modules.get(MODULE_ID);
  if (module) module.api = { ...(module.api ?? {}), addBackgroundLores };
});

// Only the client that made the change acts, so a change is never applied twice.
Hooks.on("createItem", async (item, _options, userId) => {
  if (userId !== game.user.id || item.type !== "background" || !enabled()) return;
  try {
    await addBackgroundLores(item.actor, item);
  } catch (err) {
    console.error(`${MODULE_ID} | Background Lores`, err);
  }
});

Hooks.on("deleteItem", async (item, _options, userId) => {
  if (userId !== game.user.id || item.type !== "background" || item.actor?.type !== "character" || !enabled()) return;
  try {
    await removeBackgroundLores(item.actor, item);
  } catch (err) {
    console.error(`${MODULE_ID} | Background Lores`, err);
  }
});
