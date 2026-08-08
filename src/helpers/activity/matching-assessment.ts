import type { Locator } from "@playwright/test";
import { sleep } from "bun";
import type { ActivityHelper } from "~/helpers/activity";
import { ExamHelper } from "~/helpers/exam";
import {
    type AnswerObj,
    type BruteForceResetFn,
    type BruteForceTestFn,
    QuestionType,
} from "~/types";
import { forceClick, jsClick } from "../misc";

export class MatchingActivity_Helper {
    section: Locator;

    constructor(_: ActivityHelper | null, section: Locator) {
        this.section = section;
    }

    private get matchingQuestions() {
        return this.section.locator("matching-dropdown-view").all();
    }

    private getDropdownButton(dropdown: Locator) {
        return dropdown.locator("button.dropdown__btn");
    }
    private dropdownOptions(dropdown: Locator) {
        return dropdown.locator("ul.dropdown__list li.dropdown__item");
    }
    private get feedbackTable() {
        return this.section.locator(".table-feedback");
    }

    private async getOptionId(option: Locator) {
        const txtEl = option.locator("div.dropdown__item-inner");

        let text = await txtEl.getAttribute("value");
        if (!text) text = await txtEl.textContent();

        if (text) return text.trim().toLowerCase();

        return null;
    }

    private async selectOption(matchQuestion: Locator, answer: string) {
        if (!answer) return;

        const options = await this.dropdownOptions(matchQuestion).all();
        for (const opt of options) {
            const optId = await this.getOptionId(opt);

            if (optId === answer) {
                await jsClick(opt);
                break;
            }
        }
    }

    async answer(answerObj: AnswerObj) {
        if (answerObj.type !== QuestionType.DROPDOWN_MATCH) {
            throw new Error(`Invalid answer type for DropDownMatch_Helper: ${answerObj.type}`);
        }

        const questions = await this.matchingQuestions;

        for (const [index, dropdown] of questions.entries()) {
            const correctOptionId = answerObj.answer.get(index.toString());
            if (!correctOptionId) continue;

            await this.selectOption(dropdown, correctOptionId);
        }
    }

    private async extractAnswerFromSelectedOptions(): Promise<Map<string, string>> {
        const answers = new Map<string, string>();

        const matchItems = await this.matchingQuestions;
        for (const [index, matchQuestion] of matchItems.entries()) {
            const correctAns = await this.getDropdownButton(matchQuestion)
                .locator("div.dropdown__inner")
                .textContent();
            if (!correctAns) continue;

            answers.set(index.toString(), correctAns.trim().toLowerCase());
        }

        return answers;
    }

    private async extractAnswerFromFeedbackTable(): Promise<Map<string, string>> {
        const answersMap = new Map<string, string>();
        const correctAnswers: string[] = [];

        for (const option of await this.feedbackTable.locator("tr th").all()) {
            const text = await this.getOptionId(option);
            if (text) correctAnswers.push(text);
        }

        const matchQuestionsText: string[] = [];
        for (const matchQuestion of await this.matchingQuestions) {
            const text = (await this.getDropdownButton(matchQuestion).textContent())
                ?.trim()
                ?.toLowerCase();
            if (text) matchQuestionsText.push(text);
        }

        for (const row of await this.feedbackTable.locator("tr").all()) {
            const cells = await row.locator("td").all();
            // skips header row because it has no td cells
            if (!cells.length) continue;

            for (const [colIndex, cell] of cells.entries()) {
                const matchQuestionId = await this.getOptionId(cell);
                const correctAnswer = correctAnswers[colIndex];

                const matchQuestionIndex = matchQuestionsText.indexOf(matchQuestionId || "");
                if (!matchQuestionId || !correctAnswer || matchQuestionIndex < 0) continue;

                answersMap.set(matchQuestionIndex.toString(), correctAnswer);
            }
        }

        return answersMap;
    }

    async extractCorrectAnswer(): Promise<AnswerObj | null> {
        const questionId = await ExamHelper.getUniqueQuestionId(this.section);
        if (!questionId) return null;

        const hasFeedbackTable = (await this.feedbackTable.count()) > 0;

        const ans: AnswerObj = {
            questionId: questionId,
            type: QuestionType.DROPDOWN_MATCH,
            answer: hasFeedbackTable
                ? await this.extractAnswerFromFeedbackTable()
                : await this.extractAnswerFromSelectedOptions(),
        };

        if (ans.answer.size === 0) return null;
        return ans;
    }

    private async justAnswerIt() {
        for (const dropdown of await this.matchingQuestions) {
            await jsClick(this.getDropdownButton(dropdown));

            const firstOption = this.dropdownOptions(dropdown).first();
            await jsClick(firstOption);
        }
    }

    async guessAnswer(testFn: BruteForceTestFn, resetFn: BruteForceResetFn) {
        await this.justAnswerIt();
        if (await testFn()) return;

        const showCorrectBtn = this.section.locator("button.show-answer-on-submit");
        if (!(await showCorrectBtn.count())) return;

        await forceClick(showCorrectBtn);
        await sleep(100);

        const correctAnswer = await this.extractCorrectAnswer();
        console.log("Correct answer extracted:", correctAnswer?.answer);
        if (!correctAnswer) return;

        await resetFn();
        await this.answer(correctAnswer);

        await testFn();
    }
}
