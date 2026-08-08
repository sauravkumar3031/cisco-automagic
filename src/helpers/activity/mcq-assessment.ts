import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ASSESSMENT_ANSWERS } from "~/helpers/activity";
import { ActivityBase } from "~/helpers/activity/base";
import { ExamHelper } from "~/helpers/exam";
import { click } from "~/helpers/misc";
import { random } from "~/utils";

export class MultiQuestionAssessment_Activity extends ActivityBase {
    static async isInside(section: Locator) {
        return !!(await section.getAttribute("class"))?.includes("assessmentsinglesubmit");
    }

    private get assessmentContainer() {
        // .article.assessmentsinglesubmit
        return this.section;
    }
    private get activitySubmitButton() {
        return this.assessmentContainer.locator(
            ".btn__container button.btn__action[aria-label='Submit']",
        );
    }
    private get confirmActivitySubmitCheckbox() {
        return this.assessmentContainer.locator(
            ".btn__container button.submit__anyway-checkbox-container",
        );
    }

    private async submitAssessment() {
        if (await this.assessmentResetButton.count()) {
            return;
        }

        await click(this.activitySubmitButton);
        await sleep(100);

        if (await this.activitySubmitButton.count()) {
            await click(this.confirmActivitySubmitCheckbox);
            await click(this.activitySubmitButton);
        }

        await sleep(100);
        await this.activityHelper.closeNotifyPopup();
    }

    private get assessmentResetButton() {
        return this.assessmentContainer.locator(
            ".btn__container button.btn__action[aria-label='Reset']",
        );
    }
    private async resetAssessment() {
        await this.assessmentResetButton.click();
    }
    private async isAlreadySubmitted() {
        return (await this.assessmentResetButton.count()) > 0;
    }

    private async reviewAssessment() {
        await sleep(100);
        const reviewBtn = this.assessmentContainer.locator("button.review-assessment");
        if (!(await reviewBtn.count())) return;

        await click(reviewBtn);
    }

    private get assessmentQuestions() {
        return this.section.locator("div.block__container div.component.is-question").all();
    }

    private async gatherAnswers() {
        console.log("Gathering answers for assessment...");
        await this.submitAssessment();
        await this.reviewAssessment();

        for (const question of await this.assessmentQuestions) {
            const answer = await ExamHelper.extractAnswer(question);
            console.log(answer);
            if (answer) ASSESSMENT_ANSWERS.set(answer.questionId, answer);
        }

        await sleep(100);
        await this.resetAssessment();
    }

    private async doQuestions() {
        for (const question of await this.assessmentQuestions) {
            const questionId = await ExamHelper.getUniqueQuestionId(question);
            if (!questionId) continue;

            const answer = ASSESSMENT_ANSWERS.get(questionId);
            if (!answer) continue;

            console.log("[MultiQA]", questionId, answer);

            await ExamHelper.answerQuestion(question, answer);
            await sleep(100);
        }

        await this.submitAssessment();
    }

    private async doAssessment() {
        await this.gatherAnswers();
        await this.doQuestions();
    }

    async doActivity() {
        if (await this.isAlreadySubmitted()) {
            await this.resetAssessment();
        }

        console.log(this.startMsg);
        await this.doAssessment();
        console.log(this.completedMsg);
    }

    private get startMsg() {
        return random([
            "Lo! We embark upon the assessment adventure...",
            "By my troth! The trials of questions we now face...",
            "Hark! Time to wrestle with riddles and scrolls most fiendish...",
            "Onward, to the realm of questions and answers we go...",
        ]);
    }

    private get completedMsg() {
        return random([
            "Huzzah! Assessment completed, forsooth...",
            "Marry! The questions hath been conquered!",
            "Gramercy! The final answer hath been delivered unto the realm...",
        ]);
    }
}
