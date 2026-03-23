import { Notice, Plugin, TFile } from "obsidian";
import { resetContent, suggestName } from "./reset";
import { NewNameModal } from "./modal";

export default class PackingListPlugin extends Plugin {
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

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== "md") return;
				menu.addItem((item) => {
					item.setTitle("New packing list from this")
						.setIcon("list-restart")
						.onClick(() => this.resetFromFile(file));
				});
			})
		);
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
