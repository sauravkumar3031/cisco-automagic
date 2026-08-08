import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { jsClick } from "../misc";

export class HotgridActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (await section.locator("div.component.hotgrid").count()) > 0;
    }

    private get hotgridItems() {
        return this.section.locator("div.component.hotgrid button.hotgrid__item-btn").all();
    }

    private get hotgridPopup() {
        return this.activityHelper.notifyPopup.locator(".hotgrid-popup");
    }

    async doActivity() {
        console.log("Doing hotgrid activity...");

        const hotgridBtn = (await this.hotgridItems)[0];
        if (!hotgridBtn) return console.error("Couldn't find hotgrid btn!");

        await jsClick(hotgridBtn);
        await sleep(300);

        const hotgridToolbar = this.hotgridPopup.locator(".hotgrid-popup__toolbar");
        const countText = await hotgridToolbar
            .locator(".hotgrid-popup__count")
            .getAttribute("aria-label");

        if (!countText) return console.error("Couldn't find total items count!");
        const count = Number.parseInt(countText.split(" ").pop() || "0", 10);

        const nextBtn = hotgridToolbar.locator("button.hotgrid-popup__controls.next");
        for (let i = 0; i < count; i++) {
            await jsClick(nextBtn);
            await sleep(50);
        }

        await this.activityHelper.closeNotifyPopup();

        console.log("Completed hotgrid activity...");
    }
}
