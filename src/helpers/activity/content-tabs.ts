import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { random } from "~/utils";

export class ContentTabsActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (await section.locator("div.component__widget.tab__widget").count()) > 0;
    }

    private getTabWidgets() {
        return this.section.locator("div.component__widget.tab__widget").all();
    }
    private getTabButtons(widget: Locator) {
        return widget.locator("button.tabs__nav-item-btn").all();
    }

    private async visitTabSections(widget: Locator) {
        const tabButtons = await this.getTabButtons(widget);

        for (const tabBtn of tabButtons) {
            await tabBtn.click();
            await sleep(40);
        }
    }

    async doActivity() {
        console.log(this.startMsg);

        for (const widget of await this.getTabWidgets()) {
            await this.visitTabSections(widget);
        }

        console.log(this.completedMsg);
    }

    private get startMsg() {
        return random([
            "Now, on to the tabbed realms we voyage...",
            "Zounds! Each tab a new adventure awaits!",
            "By my troth, click we through these tabbed mysteries...",
            "Lo! The tabbed journey begins...",
        ]);
    }

    private get completedMsg() {
        return random([
            "All tabs visited, mysteries unraveled!",
            "Huzzah! No tab remains unexplored!",
            "Gramercy! The tabbed domains hath been conquered...",
            "The quest of tab-clicking is complete, mine friends...",
        ]);
    }
}
