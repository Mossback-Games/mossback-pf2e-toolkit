/**
 * @name Selected Tokens Report
 * @img icons/svg/book.svg
 * @description Whispers the GM a quick summary (HP, AC, level) of every selected token. Doubles as a working example of the macro template.
 * @foundry 13
 * @pf2e 7.x
 * @requires none
 * @author Mossback Games
 */

(async () => {
  const MACRO = "Selected Tokens Report";

  if (game.system.id !== "pf2e") {
    return ui.notifications.warn(`${MACRO}: this macro needs the Pathfinder 2E system.`);
  }

  const actors = (canvas.tokens?.controlled ?? []).map((t) => t.actor).filter(Boolean);
  if (!actors.length) {
    return ui.notifications.warn(`${MACRO}: select at least one token first.`);
  }

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  try {
    const rows = actors
      .map((a) => {
        const hp = a.system.attributes?.hp;
        const ac = a.system.attributes?.ac?.value ?? "—";
        const level = a.level ?? "—";
        const hpText = hp ? `${hp.value}/${hp.max}` : "—";
        return `<tr><td>${esc(a.name)}</td><td>${level}</td><td>${hpText}</td><td>${ac}</td></tr>`;
      })
      .join("");

    await ChatMessage.create({
      content: `<table><thead><tr><th>Name</th><th>Lvl</th><th>HP</th><th>AC</th></tr></thead><tbody>${rows}</tbody></table>`,
      whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
      speaker: { alias: MACRO },
    });
  } catch (err) {
    console.error(`${MACRO} |`, err);
    ui.notifications.error(`${MACRO}: something went wrong. See the console (F12) for details.`);
  }
})();
