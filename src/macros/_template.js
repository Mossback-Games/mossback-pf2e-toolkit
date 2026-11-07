/**
 * Copy this file to start a new macro. Files starting with "_" are skipped by the build.
 *
 * @name Macro Name Here
 * @img icons/svg/dice-target.svg
 * @description One or two sentences on what the macro does and who it's for.
 * @foundry 13
 * @pf2e 7.x
 * @requires none
 * @author Mossback Games
 */

(async () => {
  const MACRO = "Macro Name Here";

  // --- Guards: fail with a friendly notification, never a console error. ---
  if (game.system.id !== "pf2e") {
    return ui.notifications.warn(`${MACRO}: this macro needs the Pathfinder 2E system.`);
  }

  const tokens = canvas.tokens?.controlled ?? [];
  if (!tokens.length) {
    return ui.notifications.warn(`${MACRO}: select at least one token first.`);
  }

  const actors = tokens.map((t) => t.actor).filter((a) => a?.type === "character");
  if (!actors.length) {
    return ui.notifications.warn(`${MACRO}: none of the selected tokens are player characters.`);
  }

  // --- Main logic. ---
  try {
    for (const actor of actors) {
      // Do the thing here.
      console.log(`${MACRO} |`, actor.name);
    }
  } catch (err) {
    console.error(`${MACRO} |`, err);
    ui.notifications.error(`${MACRO}: something went wrong. See the console (F12) for details.`);
  }
})();
