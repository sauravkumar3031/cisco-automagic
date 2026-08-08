import type { Locator } from "@playwright/test";
import type { ActivityHelper } from "~/helpers/activity";

export class ActivityBase {
    activityHelper: ActivityHelper;
    section: Locator;

    constructor(helper: ActivityHelper, section: Locator) {
        this.activityHelper = helper;
        this.section = section;
    }
}
