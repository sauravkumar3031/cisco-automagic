import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { click } from "~/helpers/misc";
import { random } from "~/utils";

export class ContentLinksActivity extends ActivityBase {
    static get activityContainers() {
        return [
            "div.component.pagetracer",
            ".component.packettracer__inner",
            ".component.packettracer",
        ];
    }

    static async isInside(section: Locator) {
        return (
            (await section.locator(ContentLinksActivity.activityContainers.join(", ")).count()) > 0
        );
    }

    private get contentLinks() {
        return this.section.locator(
            ContentLinksActivity.activityContainers
                .map((parent) => `${parent} .component__widget`)
                .join(", "),
        );
    }

    private async clickContentLink(widget: Locator) {
        if (await widget.isHidden()) return;

        const mainBtn = widget.locator("button.btn__action");
        if (await mainBtn.count()) {
            await click(mainBtn, 500);
        } else {
            const alt = widget.locator("a.btn__action");
            await click(alt, 500);
        }

        await sleep(200);
        await this.activityHelper.closeLabPopup();
        await sleep(200);
    }

    async doActivity() {
        console.log(this.startMsg);

        for (const widget of await this.contentLinks.all()) {
            try {
                await this.clickContentLink(widget);
            } catch (error) {
                console.error(error);
            }
        }

        console.log(this.completedMsg);
    }

    private get startMsg() {
        return random([
            "Clicketh we now upon these mystical content links...",
            "Zounds! Let us explore links as knights seek treasure!",
            "By my troth, these hyperlinks shall yield their secrets...",
            "Hark! The path of knowledge lies within these links...",
            "Onward, to click and discover we go...",
            "Lo! The adventure of link-clicking awaits...",
        ]);
    }

    private get completedMsg() {
        return random([
            "All links have been clicked (or ignored most nobly)!",
            "Huzzah! The links hath been conquered!",
            "Marry! No hyperlink doth remain unturned...",
            "Gramercy! The final link hath been clicked unto the realm...",
            "The hyperlinks hath yielded their secrets, forsooth...",
            "The quest of link-clicking is complete, mine friends...",
        ]);
    }
}
