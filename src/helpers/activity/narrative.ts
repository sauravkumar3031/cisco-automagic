import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { click, scrollIntoView } from "~/helpers/misc";

export class NarrativeActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (await section.locator("div.component.narrative").count()) > 0;
    }

    private get narratives() {
        return this.section.locator("div.component.narrative").all();
    }
    private nextButton(narrative: Locator) {
        return narrative.locator("button[aria-label='Next']");
    }

    async completeNarrative(narrative: Locator) {
        const nextBtn = this.nextButton(narrative);
        await scrollIntoView(narrative);

        while (true) {
            const nextBtnClasslist = await nextBtn.getAttribute("class");
            if (!nextBtnClasslist || nextBtnClasslist.includes("disabled")) return;
            await click(nextBtn);
            await sleep(50);
        }
    }

    async doActivity() {
        console.log("Doing Narrative Activity...");

        const narratives = await this.narratives;

        for (const narrative of narratives) {
            await this.completeNarrative(narrative);
        }

        console.log("Completed Narrative Activity.");
    }
}
