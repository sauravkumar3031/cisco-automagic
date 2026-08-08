import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { jsClick } from "~/helpers/misc";

export class FlipcardActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (await section.locator("div.component.flipcard").count()) > 0;
    }

    private get flipcards() {
        return this.section.locator("div.component.flipcard button.flipcard__item").all();
    }

    private async flipDaCard(card: Locator) {
        await jsClick(card);
        await sleep(300);
    }

    async doActivity() {
        console.log("Doing Flipcard Activity...");

        for (const card of await this.flipcards) {
            await this.flipDaCard(card);
        }

        console.log("Completed Flipcard Activity.");
    }
}
