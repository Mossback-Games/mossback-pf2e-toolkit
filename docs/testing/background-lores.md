# Test plan — Background Lores

*Foundry VTT 14 (build 370), PF2e 8.7.0.*

## Setup

1. On this branch, run `npm run build`. Link or copy the repo folder into `Data/modules/mossback-pf2e-toolkit`. **Fully restart Foundry**, since the module now has a script.
2. Enable **Mossback's PF2E Toolkit** in a test world that **doesn't** have Sagafell enabled (Sagafell grants its own backgrounds' Lores, which would hide problems here).
3. Create a new level 1 character, **Lore Test**.

## Checks

### A. Adding a background

- **A1.** Drag **Hunter** (PF2e Backgrounds compendium) onto Lore Test. **Tanning Lore** appears on the Proficiencies tab, **trained**.
- **A2.** Delete Hunter. Tanning Lore is removed.
- **A3.** Drag **Fortune Teller** onto the sheet: **Fortune-Telling Lore**, trained.

### B. Keeping what the player owns

- **B1.** Delete Fortune Teller. By hand, add a Lore named **Tanning Lore** (Proficiencies tab, add Lore). Drag in **Hunter** again: there's still only **one** Tanning Lore.
- **B2.** Delete Hunter: your hand-made Tanning Lore **stays**.
- **B3.** Delete that Lore. Drag in Hunter, then raise **Tanning Lore** to **expert**. Delete Hunter: Tanning Lore **stays**, and a notice says it was kept because its proficiency was raised.

### C. Backgrounds with a choice of Lore

- **C1.** Drag in **Noble** (its Lore is your choice): no Lore is added, and there are no errors.

### D. The setting

- **D1.** In **Configure Settings → Module Settings → Mossback's PF2E Toolkit**, turn off **Add background Lores**. Swap to a different background with a Lore (e.g. Gladiator): nothing is added. Turn it back on.

### E. The macro (existing characters)

- **E1.** With the setting **off**, give a character **Hunter** (no Lore added). Turn the setting **on**. Select the token and run **Add Background Lores** from the **Mossback Macros** compendium: a notice says it added Tanning Lore, and it's trained on the sheet.
- **E2.** Run it again: "nothing to add."
- **E3.** Run it with nothing selected and no assigned character: a warning asks you to select a character.

### F. Multiplayer

- **F1.** As a player who owns Lore Test, swap its background: the Lore is added once (not once per connected user).

### G. Cleanup

- **G1.** Console (filter `mossback`): no errors.

## Report back

- Pass/fail for A1–G1, and any console errors copied exactly.

## Results

**Run 1 — 2026-11-08** · Foundry VTT 14 (build 370), PF2e 8.7.0. **All checks pass (A1–G1).**
