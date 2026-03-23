/**
 * Core packing list reset logic.
 *
 * Separated from the Obsidian plugin wrapper so it can be
 * unit-tested independently.
 */

// ── Patterns ────────────────────────────────────────────────────────

/** Matches any markdown checkbox line: "- [x]", "- [ ]", "- [-]", etc. */
const RE_CHECKBOX = /^(\s*)- \[.\] /;

/** The *(wearing)* annotation added by ods2md */
const RE_WEARING = / \*\(wearing\)\*/g;

/** The ~~excluded~~ strikethrough added by ods2md */
const RE_EXCLUDED = / ~~excluded~~/g;

/** Summary line produced by ods2md */
const RE_SUMMARY =
	/^> \*\*\d+\*\* packed · \*\*\d+\*\* excluded · \*\*\d+\*\* pending · \*\*\d+\*\* total$/;

// ── Line processing ─────────────────────────────────────────────────

/** Reset a single line: uncheck checkbox, strip status annotations. */
export function resetLine(line: string): string {
	if (!RE_CHECKBOX.test(line)) {
		return line;
	}

	let result = line.replace(/^(\s*)- \[.\] /, "$1- [ ] ");
	result = result.replace(RE_WEARING, "");
	result = result.replace(RE_EXCLUDED, "");

	return result;
}

/** Toggle packed (checked) status on a checkbox line. Returns null if not a checkbox line. */
export function togglePacked(line: string): string | null {
	if (!RE_CHECKBOX.test(line)) return null;

	if (/^(\s*)- \[x\] /i.test(line) && !RE_WEARING.test(line)) {
		// Checked but not wearing — uncheck to pending
		return line.replace(/^(\s*)- \[.\] /, "$1- [ ] ");
	}

	// Uncheck, excluded, or wearing — strip annotations and check
	let result = line.replace(RE_WEARING, "");
	result = result.replace(RE_EXCLUDED, "");
	result = result.replace(/^(\s*)- \[.\] /, "$1- [x] ");
	return result;
}

/** Toggle *(wearing)* on a checkbox line. Returns null if not a checkbox line. */
export function toggleWearing(line: string): string | null {
	if (!RE_CHECKBOX.test(line)) return null;

	if (RE_WEARING.test(line)) {
		// Remove wearing — uncheck back to pending
		let result = line.replace(RE_WEARING, "");
		result = result.replace(/^(\s*)- \[.\] /, "$1- [ ] ");
		return result;
	}

	// Add wearing — check the box, strip excluded if present
	let result = line.replace(RE_EXCLUDED, "");
	result = result.replace(/^(\s*)- \[.\] /, "$1- [x] ");
	return result + " *(wearing)*";
}

/** Toggle ~~excluded~~ on a checkbox line. Returns null if not a checkbox line. */
export function toggleExcluded(line: string): string | null {
	if (!RE_CHECKBOX.test(line)) return null;

	if (RE_EXCLUDED.test(line)) {
		// Remove excluded — uncheck back to pending
		let result = line.replace(RE_EXCLUDED, "");
		result = result.replace(/^(\s*)- \[.\] /, "$1- [ ] ");
		return result;
	}

	// Add excluded — mark with [-], strip wearing if present
	let result = line.replace(RE_WEARING, "");
	result = result.replace(/^(\s*)- \[.\] /, "$1- [-] ");
	return result + " ~~excluded~~";
}

/** Count items by status and build a summary line. */
export function buildSummary(lines: string[]): string {
	let packed = 0;
	let excluded = 0;
	let total = 0;

	for (const line of lines) {
		if (!RE_CHECKBOX.test(line)) continue;
		total++;
		if (RE_EXCLUDED.test(line)) {
			excluded++;
		} else if (/^(\s*)- \[x\] /i.test(line)) {
			packed++;
		}
	}

	const pending = total - packed - excluded;
	return `> **${packed}** packed · **${excluded}** excluded · **${pending}** pending · **${total}** total`;
}

// ── Document-level reset ────────────────────────────────────────────

/**
 * Reset an entire packing list document.
 *
 * - Unchecks every checkbox
 * - Strips *(wearing)* and ~~excluded~~ annotations
 * - Recalculates the summary counter
 * - Optionally replaces the H1 title
 */
export function resetContent(content: string, newTitle?: string): string {
	const lines = content.split("\n");
	const result: string[] = [];

	const PLACEHOLDER = "__SUMMARY_PLACEHOLDER__";

	for (const line of lines) {
		if (RE_SUMMARY.test(line)) {
			result.push(PLACEHOLDER);
		} else if (line.startsWith("# ") && newTitle) {
			result.push(`# ${newTitle}`);
		} else {
			result.push(resetLine(line));
		}
	}

	// Recalculate summary
	const idx = result.indexOf(PLACEHOLDER);
	if (idx !== -1) {
		result[idx] = buildSummary(result);
	}

	return result.join("\n");
}

/**
 * Suggest a default name for a new packing list based on the source name.
 * Replaces a four-digit year with the current year, or appends " (new)".
 */
export function suggestName(basename: string): string {
	const currentYear = new Date().getFullYear().toString();
	const yearMatch = basename.match(/\b(20\d{2})\b/);

	if (yearMatch) {
		return basename.replace(yearMatch[1], currentYear);
	}
	return basename + " (new)";
}
