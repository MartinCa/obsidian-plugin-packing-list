# Packing List — Obsidian Plugin

Manage packing lists in Obsidian. Create new lists from existing ones with all checkboxes reset to unchecked, status annotations like *(wearing)* and ~~excluded~~ removed, and mandatory markers preserved.

Designed to work with packing lists in this format:

```markdown
# 2025 UTMB Wild 110

> **42** packed · **3** excluded · **2** pending · **47** total

## Running Gear

- [x] Running vest ADV Skin 12 — **mandatory**
- [x] Wallet *(wearing)*
- [-] Sunglasses ~~excluded~~
- [ ] Poles
```

## What it does

- Resets all checkboxes (`- [x]`, `- [-]`) to unchecked (`- [ ]`)
- Removes `*(wearing)*` annotations
- Removes `~~excluded~~` annotations
- Recalculates the summary counter (everything set to pending)
- Preserves **mandatory**, mandatory (hot), mandatory (cold) markers
- Preserves section headings, notes, and all other content
- Updates the title heading to match the new note name
- Auto-suggests the current year if the original name contains a year

## Installation

1. Download the [latest release](https://github.com/YOUR_USERNAME/packing-list/releases/latest) zip or copy the three plugin files: `main.js`, `manifest.json`, `styles.css`
2. In your vault, create the folder:
   ```
   YOUR_VAULT/.obsidian/plugins/packing-list/
   ```
3. Place the three files inside that folder
4. Open Obsidian → Settings → Community plugins
5. Turn off **Restricted mode** if you haven't already
6. Click **Reload plugins**, then enable **Packing List**

## Usage

### From the command palette

1. Open a packing list note
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Search for **Create new packing list from current note**
4. Enter a name for the new list and press Enter

### From the file explorer

1. Right-click any `.md` file in the sidebar
2. Click **New packing list from this**
3. Enter a name and press Enter

The new note is created in the same folder as the original and opens automatically.

## Companion script

This plugin pairs with `ods2md.py`, a Python script that converts ODS spreadsheet packing lists to the markdown format this plugin expects. See the script for column conventions (status, name, mandatory, notes) and section handling.
