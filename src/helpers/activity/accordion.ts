import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { jsClick } from "~/helpers/misc";
import { random } from "~/utils";

export class AccordionActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (
            (await section.locator("div.component.accordion button.accordion__item-btn").count()) >
            0
        );
    }

    private get accordions() {
        return this.section.locator("div.component.accordion button.accordion__item-btn").all();
    }

    async doActivity() {
        console.log(this.startMsg);

        for (const acc of await this.accordions) {
            await jsClick(acc);
            await sleep(200);
        }

        console.log(this.completedMsg);
    }

    private get startMsg() {
        return random([
            "Lo! Accordion sections we shall unfold...",
            "By my troth! Let us reveal the secrets of the accordions...",
            "Hark! Each fold doth hide a tale untold...",
            "Onward, to the realm of hidden knowledge we go...",
        ]);
    }

    private get completedMsg() {
        return random([
            "All accordion sections revealed, secrets laid bare!",
            "Zounds! The accordions yield their hidden wisdom!",
            "Marry! The folds hath been conquered with gentle clicks...",
            "The accordions hath sung their secrets, forsooth...",
            "The quest of unfolding accordions is complete, mine friends...",
        ]);
    }
}
