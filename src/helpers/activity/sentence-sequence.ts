import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { jsClick } from "../misc";
import { ActivityBase } from "./base";

export class SentenceSequenceActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (await section.locator("div.component.stacker").count()) > 0;
    }

    private get sequenceWidget() {
        return this.section.locator("div.component.stacker");
    }

    private get sequenceItems() {
        return this.sequenceWidget.locator("ul li.sentenceSequence").all();
    }

    private get resetBtn() {
        return this.sequenceWidget.locator("buttons-view button[aria-label*='reset']");
    }

    private get submitBtn() {
        return this.sequenceWidget.locator("buttons-view button[aria-label*='submit']");
    }

    private async getItemId(item: Locator) {
        return await item.getAttribute("data-itemid");
    }

    private async updatePosition(item: Locator, position: number) {
        const changePosBtn = item.locator(".stacker__item-state button");
        if ((await changePosBtn.getAttribute("aria-expanded")) !== "true") {
            await jsClick(changePosBtn);
        }

        const dropDownStrip = item.locator(".stacker__item-state .dropdownstrip");
        const targetOption = dropDownStrip.locator(`button[data-target='${position}']`);

        await jsClick(targetOption);
    }

    private async getCorrectPositions(useIndex = false) {
        // data-itemid -> position (range: [1, itemsLen])
        const correctPositions = new Map<string, number>();

        const items = await this.sequenceItems;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;

            const itemId = await this.getItemId(item);
            if (!itemId) continue;

            const itemIdInt = useIndex ? i + 1 : Number.parseInt(itemId ?? "_", 10);
            correctPositions.set(itemId, itemIdInt);
        }

        return correctPositions;
    }

    async doActivity() {
        console.log("Doing Sentence Ordering Activity...");

        if (await this.resetBtn.count()) {
            await jsClick(this.resetBtn);
        }

        const answer = await this.getCorrectPositions();
        const items = await this.sequenceItems;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;

            const id = await this.getItemId(item);
            if (!id) break;

            const correctPos = answer.get(id);
            if (!correctPos) break;

            console.log(`From ${i + 1} -> To ${correctPos}`);
            await this.updatePosition(item, correctPos);
            // updating the sequence has a fucking long transition during which the buttons are disabled
            await sleep(2500);
        }

        await jsClick(this.submitBtn);

        console.log("Completed Sentence Ordering Activity.");
    }
}
