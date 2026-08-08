import type { Locator, Page } from "@playwright/test";
import type { BotUtilities } from "~/helpers/bot-utils";
import { click, jsClick } from "~/helpers/misc";
import type { CiscoBot } from "~/main";
import type { AnswerObj } from "~/types";

import { AccordionActivity } from "./accordion";
import { CheckViewActivity } from "./check-view";
import { ContentLinksActivity } from "./content-links";
import { ContentTabsActivity } from "./content-tabs";
import { FlipcardActivity } from "./flip-card";
import { HotgridActivity } from "./hotgrid";
import { MultiQuestionAssessment_Activity } from "./mcq-assessment";
import { NarrativeActivity } from "./narrative";
import { SingleQuestionSectionQuiz_Activity } from "./section-quiz";
import { VideoPlayerActivity } from "./video-player";

export const ASSESSMENT_ANSWERS = new Map<string, AnswerObj>();

export class ActivityHelper {
    page: Page;
    section: Locator;
    utils: BotUtilities;

    constructor(parent: CiscoBot, section: Locator) {
        this.page = parent.page;
        this.section = section;
        this.utils = parent.utils;
    }

    get notifyPopup() {
        return this.utils.getModuleFrame().locator("[role='dialog'].notify__popup");
    }

    get notifyPopupCloseBtn() {
        return this.notifyPopup.locator("button[aria-label='Close popup']");
    }
    async closeNotifyPopup() {
        if (!(await this.notifyPopupCloseBtn.count())) return;
        await jsClick(this.notifyPopupCloseBtn, 1000);
    }

    get labPopupCloseBtn() {
        return this.utils.getModuleFrame().locator(".close-btn-popup button.close-btn");
    }
    async closeLabPopup() {
        if (!(await this.labPopupCloseBtn.count())) return;
        await click(this.labPopupCloseBtn, 1000);
    }

    async doActivities() {
        const ActivityTypes = [
            MultiQuestionAssessment_Activity,
            SingleQuestionSectionQuiz_Activity,
            VideoPlayerActivity,
            ContentLinksActivity,
            AccordionActivity,
            ContentTabsActivity,
            CheckViewActivity,
            NarrativeActivity,
            FlipcardActivity,
            HotgridActivity,
        ];

        for (const ActivityType of ActivityTypes) {
            if (await ActivityType.isInside(this.section)) {
                await new ActivityType(this, this.section).doActivity();
            }
        }
    }
}