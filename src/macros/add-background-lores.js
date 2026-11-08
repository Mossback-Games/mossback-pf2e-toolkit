/**
 * Adds the Lore skills from each selected character's background, for characters
 * that got their background before the toolkit was installed.
 *
 * @name Add Background Lores
 * @img icons/svg/book.svg
 * @description Adds the Lore skills listed by the selected characters' backgrounds (trained), skipping any they already have. New backgrounds get their Lores automatically; this is for existing characters.
 * @foundry 14
 * @pf2e 8.7
 * @requires the toolkit's automation (enabled with the module)
 * @author Mossback Games
 */

(async () => {
  const MACRO = "Add Background Lores";

  if (game.system.id !== "pf2e") {
    return ui.notifications.warn(`${MACRO}: this macro needs the Pathfinder 2E system.`);
  }
  const api = game.modules.get("mossback-pf2e-toolkit")?.api;
  if (!api?.addBackgroundLores) {
    return ui.notifications.warn(`${MACRO}: enable Mossback's PF2E Toolkit in this world first.`);
  }

  // Selected tokens, or your assigned character if nothing is selected.
  const actors = (canvas.tokens?.controlled ?? []).map((t) => t.actor);
  if (!actors.length && game.user.character) actors.push(game.user.character);
  const characters = [...new Set(actors)].filter((a) => a?.type === "character" && a.isOwner);
  if (!characters.length) {
    return ui.notifications.warn(`${MACRO}: select a character you own (or assign yourself one) first.`);
  }

  try {
    const lines = [];
    for (const actor of characters) {
      if (!actor.background) {
        lines.push(`${actor.name}: no background.`);
        continue;
      }
      const added = await api.addBackgroundLores(actor);
      lines.push(added.length ? `${actor.name}: added ${added.join(", ")}.` : `${actor.name}: nothing to add.`);
    }
    ui.notifications.info(`${MACRO}: ${lines.join(" ")}`);
  } catch (err) {
    console.error(`${MACRO} |`, err);
    ui.notifications.error(`${MACRO}: something went wrong. See the console (F12) for details.`);
  }
})();
