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

/** Build a fresh summary line by counting checkbox lines. */
function buildSummary(lines: string[]): string {
	let total = 0;
	for (const line of lines) {
		if (RE_CHECKBOX.test(line)) {
			total++;
		}
	}
	return `> **0** packed · **0** excluded · **${total}** pending · **${total}** total`;
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
