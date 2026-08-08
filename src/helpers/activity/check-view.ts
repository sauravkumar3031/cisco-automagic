import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { click } from "~/helpers/misc";
import { random } from "~/utils";

export class CheckViewActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (await section.locator("check-view").count()) > 0;
    }

    private get buttonContainers() {
        return this.section.locator("check-view").all();
    }

    private async checkAnswer(container: Locator) {
        const seeSolnBtn = container.locator(".check__widget .check__button");
        if (!(await seeSolnBtn.count())) return;

        await click(seeSolnBtn);
    }

    async doActivity() {
        console.log(this.startMsg);

        for (const container of await this.buttonContainers) {
            await this.checkAnswer(container);
            await sleep(50);
        }

        console.log(this.completedMsg);
    }

    private get startMsg() {
        return random([
            "Hark! 'Tis time to check thine answers...",
            "By my troth, we shall see if wisdom prevails!",
            "Lo! Let the answers be revealed unto thee...",
            "Marry! Let us unveil the correctness of our answers...",
        ]);
    }

    private get completedMsg() {
        return random([
            "All answers revealed, truth (or nonsense) laid bare for all!",
            "Marry! The wisdom of the realm hath spoken through these answers!",
            "Zounds! Each question hath confessed, leaving naught but enlightenment!",
        ]);
    }
}
