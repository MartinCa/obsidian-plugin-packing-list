import { Editor, Notice, Plugin, TFile } from "obsidian";
import { buildSummary, resetContent, suggestName, toggleExcluded, togglePacked, toggleWearing } from "./reset";
import { NewNameModal } from "./modal";

const HIGHLIGHT_CLASS = "packing-list-highlight-pending";

export default class PackingListPlugin extends Plugin {
  private highlightPending = false;

  async onload(): Promise<void> {
    this.addCommand({
      id: "reset-packing-list",
      name: "Create new packing list from current note",
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (checking) return true;
        this.resetFromFile(file);
      },
    });

    this.addCommand({
      id: "toggle-packed",
      name: "Toggle packed status",
      icon: "check-square",
      checkCallback: (checking: boolean) => {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) {
          if (!checking) new Notice("No active editor");
          return false;
        }
        if (checking) return true;
        this.toggleLineStatus(editor, togglePacked);
      },
    });

    this.addCommand({
      id: "toggle-wearing",
      name: "Toggle wearing status",
      icon: "shirt",
      checkCallback: (checking: boolean) => {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) {
          if (!checking) new Notice("No active editor");
          return false;
        }
        if (checking) return true;
        this.toggleLineStatus(editor, toggleWearing);
      },
    });

    this.addCommand({
      id: "toggle-excluded",
      name: "Toggle excluded status",
      icon: "x-circle",
      checkCallback: (checking: boolean) => {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) {
          if (!checking) new Notice("No active editor");
          return false;
        }
        if (checking) return true;
        this.toggleLineStatus(editor, toggleExcluded);
      },
    });

    this.addCommand({
      id: "add-entry",
      name: "Add packing list entry",
      icon: "plus-circle",
      checkCallback: (checking: boolean) => {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) {
          if (!checking) new Notice("No active editor");
          return false;
        }
        if (checking) return true;
        this.addEntry(editor);
      },
    });

    this.addCommand({
      id: "highlight-pending",
      name: "Toggle highlight on pending items",
      icon: "highlighter",
      callback: () => {
        this.highlightPending = !this.highlightPending;
        document.body.classList.toggle(HIGHLIGHT_CLASS, this.highlightPending);
        new Notice(this.highlightPending ? "Pending items highlighted" : "Highlight removed");
      },
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile) || file.extension !== "md") return;
        menu.addItem((item) => {
          item
            .setTitle("New packing list from this")
            .setIcon("list-restart")
            .onClick(() => this.resetFromFile(file));
        });
      }),
    );
  }

  onunload(): void {
    document.body.classList.remove(HIGHLIGHT_CLASS);
  }

  private addEntry(editor: Editor): void {
    const cursor = editor.getCursor();
    const currentLine = editor.getLine(cursor.line);
    const entry = "- [ ] ";

    if (currentLine.trim() === "") {
      // Current line is empty — insert the entry here
      editor.setLine(cursor.line, entry);
      editor.setCursor({ line: cursor.line, ch: entry.length });
    } else {
      // Current line is not empty — insert a new line below
      const lineEnd = currentLine.length;
      editor.replaceRange("\n" + entry, { line: cursor.line, ch: lineEnd });
      editor.setCursor({ line: cursor.line + 1, ch: entry.length });
    }

    this.updateSummary(editor);
  }

  private toggleLineStatus(editor: Editor, toggleFn: (line: string) => string | null): void {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const toggled = toggleFn(line);

    if (toggled === null) {
      new Notice("Not a checkbox line");
      return;
    }

    editor.setLine(cursor.line, toggled);
    this.updateSummary(editor);
  }

  private updateSummary(editor: Editor): void {
    const lineCount = editor.lineCount();
    const lines: string[] = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push(editor.getLine(i));
    }

    const summaryRe = /^> \*\*\d+\*\* packed · \*\*\d+\*\* excluded · \*\*\d+\*\* pending · \*\*\d+\*\* total$/;

    for (let i = 0; i < lineCount; i++) {
      if (summaryRe.test(lines[i])) {
        editor.setLine(i, buildSummary(lines));
        break;
      }
    }
  }

  private async resetFromFile(file: TFile): Promise<void> {
    const content = await this.app.vault.read(file);
    const defaultName = suggestName(file.basename);

    new NewNameModal(this.app, defaultName, async (newName: string) => {
      if (!newName) return;

      const newContent = resetContent(content, newName);

      const folder = file.parent ? file.parent.path : "";
      const newPath = folder ? `${folder}/${newName}.md` : `${newName}.md`;

      if (this.app.vault.getAbstractFileByPath(newPath)) {
        new Notice(`A file named "${newName}.md" already exists.`);
        return;
      }

      const newFile = await this.app.vault.create(newPath, newContent);
      await this.app.workspace.getLeaf(false).openFile(newFile);
      new Notice(`Created new packing list: ${newName}`);
    }).open();
  }
}
