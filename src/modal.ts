import { App, Modal } from "obsidian";

/**
 * Simple modal that prompts for a new note name.
 */
export class NewNameModal extends Modal {
  private result: string;
  private readonly onSubmit: (name: string) => void;

  constructor(app: App, defaultName: string, onSubmit: (name: string) => void) {
    super(app);
    this.result = defaultName;
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;

    contentEl.createEl("h3", { text: "New packing list" });
    contentEl.createEl("p", {
      text: "Enter a name for the new packing list note:",
      cls: "setting-item-description",
    });

    const input = contentEl.createEl("input", {
      type: "text",
      value: this.result,
    });
    input.style.width = "100%";
    input.style.marginBottom = "1em";
    input.focus();
    input.select();

    input.addEventListener("input", () => {
      this.result = input.value;
    });

    input.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.submit();
      }
    });

    const btnContainer = contentEl.createDiv({
      cls: "modal-button-container",
    });

    const submitBtn = btnContainer.createEl("button", {
      text: "Create",
      cls: "mod-cta",
    });
    submitBtn.addEventListener("click", () => this.submit());

    const cancelBtn = btnContainer.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.close());
  }

  private submit(): void {
    this.close();
    this.onSubmit(this.result.trim());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
