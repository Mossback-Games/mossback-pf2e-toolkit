# Mossback's PF2E Toolkit

A free toolkit of macros and automation for Pathfinder 2E (Remaster) in Foundry VTT, packaged as an installable module with a macro compendium. By Mossback Games.

## Install

In Foundry's **Add-on Modules** tab, choose **Install Module** and paste this manifest URL:

```
https://github.com/Mossback-Games/mossback-pf2e-toolkit/releases/latest/download/module.json
```

Enable the module in your world. The macros appear in the **Mossback Macros** compendium under the Mossback Games folder. Drag any macro to your hotbar to use it.

## Macros

| Macro | What it does |
|---|---|
| Recall Knowledge | Rolls Recall Knowledge against your target, offering only the skills that can identify it. Target-based bonuses, like a mark on your quarry, apply automatically. Secret check. |
| Selected Tokens Report | Whispers the GM the HP, AC, and level of every selected token. |
| Add Background Lores | Adds the Lore skills from the selected characters' backgrounds, for characters that had a background before you installed the toolkit. |

## Automation

Turned on when the module is enabled. Each one can be switched off in **Configure Settings → Module Settings → Mossback's PF2E Toolkit**.

| Feature | What it does |
|---|---|
| Background Lores | The PF2e system lists a background's Lore skill (like a Hunter's Tanning Lore) but doesn't add it to the character. This adds it, trained, when the background is added, and removes it again when the background is removed (unless its proficiency was raised). Backgrounds that let you choose a Lore are left to you. For characters that already had a background, use the **Add Background Lores** macro. |

## Compatibility

Each macro's header lists the Foundry and PF2E system versions it was tested on. Macros may break when Foundry or the PF2E system updates; check the header before reporting an issue.

## Support

These macros are shared as-is. Bug reports are welcome on the [issue tracker](https://github.com/Mossback-Games/mossback-pf2e-toolkit/issues), but fixes aren't guaranteed.

## Development

Requires Node 22+.

```
npm install
npm run check    # validate macro headers
node --check automation/*.mjs   # syntax-check the automation scripts
npm run build    # compile src/macros into packs/macros
```

**Adding a macro:** copy `src/macros/_template.js` to a new file, fill in the header, and write the macro. The file name sets the macro's permanent ID, so pick it carefully; renaming the file later creates a new macro and breaks existing hotbar links.

**Adding automation:** put each feature in its own file in `automation/`, register its settings and hooks there, and import it from `automation/main.mjs`. Features should be on by default with a world setting to turn them off. Test plans live in `docs/testing/`.

**Testing locally:** build, then copy or link this folder into your Foundry user data's `Data/modules/mossback-pf2e-toolkit` folder. Close the world before rebuilding, since Foundry locks the compendium while it's open.

**Releasing:** update `CHANGELOG.md`, then publish a GitHub release with a tag like `v0.1.0`. The release workflow builds the compendium, stamps the version, and attaches `module.json` and `module.zip`.

## License

Code is MIT licensed. See [LICENSE](LICENSE).

This module is not published, endorsed, or specifically approved by Paizo. Pathfinder is a trademark of Paizo Inc.
