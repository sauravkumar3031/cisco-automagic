import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { jsClick } from "../misc";
import { ActivityBase } from "./base";

export class OpenTextInputActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (await section.locator("opentextinput-view").count()) > 0;
    }

    private get activityArea() {
        return this.section.locator("opentextinput-view");
    }

    async doActivity() {
        console.log("Doing OpenTextInput activity...");

        const textarea = this.activityArea.locator("textarea.opentextinput__item-textbox");
        await textarea.focus();
        await textarea.fill("Done.");
        await sleep(500);

        const submitBtn = this.activityArea.locator(".btn__container button[aria-label*='submit']");
        await jsClick(submitBtn);
        console.log("Completed OpenTextInput activity.");
    }
}
