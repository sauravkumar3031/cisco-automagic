import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { ExamHelper } from "~/helpers/exam";
import { forceClick } from "~/helpers/misc";

export class SingleQuestionSectionQuiz_Activity extends ActivityBase {
    static async isInside(section: Locator) {
        const questionBox = section.locator(".component.is-question");
        const hasQuestions = (await questionBox.count()) > 0;
        const hasSubmitBtn =
            (await questionBox.locator(".btn__container button").getByText("submit").count()) > 0;

        return hasQuestions && hasSubmitBtn;
    }

    private get questions() {
        return this.section.locator(".component.is-question").all();
    }
    static getSubmitButton(question: Locator) {
        return question.locator("button").getByText("submit");
    }
    static getResetButton(question: Locator) {
        return question.locator("button").getByText("reset");
    }

    static async isCorrect(question: Locator) {
        return (await question.locator("div.component__widget.is-complete").count()) > 0;
    }

    private async answerQuestion(question: Locator) {
        // just in case
        const resetBtn = SingleQuestionSectionQuiz_Activity.getResetButton(question);
        if (await resetBtn.count()) {
            await forceClick(resetBtn, 1000);
        }

        const testFn = async () => {
            await sleep(50);
            await forceClick(SingleQuestionSectionQuiz_Activity.getSubmitButton(question));
            await this.activityHelper.closeNotifyPopup();
            return SingleQuestionSectionQuiz_Activity.isCorrect(question);
        };

        const resetFn = async () => {
            const resetBtn = SingleQuestionSectionQuiz_Activity.getResetButton(question);
            await sleep(50);
            if (!(await resetBtn.count())) return;

            await forceClick(resetBtn, 1000);
        };

        const questionHelper = await ExamHelper.constructQuestionHelper(question);
        if (!questionHelper) return;

        await questionHelper.guessAnswer(testFn, resetFn);
    }

    async doActivity() {
        console.log("Doing Single Question Section Quiz...");

        for (const question of await this.questions) {
            if (await SingleQuestionSectionQuiz_Activity.isCorrect(question)) {
                continue;
            }
            await this.answerQuestion(question);
            await sleep(100);
        }

        console.log("Completed Single Question Section Quiz.");
    }
}
