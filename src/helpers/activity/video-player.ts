import type { FrameLocator, Locator } from "@playwright/test";
import { sleep } from "bun";
import { ActivityBase } from "~/helpers/activity/base";
import { jsClick } from "~/helpers/misc";
import { random } from "~/utils";

export class VideoPlayerActivity extends ActivityBase {
    static async isInside(section: Locator) {
        return (await section.locator("div.brightcove__inner iframe").count()) > 0;
    }

    get videoIFrames() {
        return this.section.locator("div.brightcove__inner iframe");
    }

    private async isVideoPlaying(videoFrame: FrameLocator) {
        return (await videoFrame.locator("div.vjs-playing").count()) > 0;
    }

    private async waitForVideoToPlay(videoFrame: FrameLocator) {
        let tries = 50;
        while (tries-- > 0) {
            if (await this.isVideoPlaying(videoFrame)) {
                return true;
            }
            await sleep(300);
        }
    }

    private async skipToEnd(videoFrame: FrameLocator) {
        const progressBar = videoFrame.locator("div.vjs-progress-holder.vjs-slider");
        const progressBarDimensions = await progressBar.boundingBox();
        if (!progressBarDimensions) return;

        await progressBar.click({
            position: {
                x: progressBarDimensions.width - 2,
                y: progressBarDimensions.height / 2,
            },
            force: true,
        });
        await this.waitForVideoToPlay(videoFrame);
    }

    private async playVideo(videoFrame: FrameLocator) {
        const playBtn = videoFrame.locator("button.vjs-big-play-button");
        if (await playBtn.count()) {
            await jsClick(playBtn);
        }
        await this.waitForVideoToPlay(videoFrame);
    }

    private async watchVideo(frame: FrameLocator) {
        await this.playVideo(frame);
        await this.skipToEnd(frame);

        const playingState = frame.locator("div.vjs-playing");
        const endedState = frame.locator("div.vjs-ended");
        const pausedState = frame.locator("div.vjs-paused");

        let tries = 40;

        while (tries-- > 0) {
            if (await endedState.count()) break;

            if (await pausedState.count()) {
                await this.playVideo(frame);
                continue;
            }

            if (await playingState.count()) {
                await sleep(250);
                continue;
            }

            await sleep(300);
        }
    }

    async doActivity() {
        console.log(this.startMsg);

        for (const videoContainer of await this.videoIFrames.all()) {
            if (await videoContainer.isHidden()) continue;
            await this.watchVideo(videoContainer.contentFrame());
        }

        console.log(this.completedMsg);
    }

    private get startMsg() {
        return random([
            "Hark! Time to watch moving pictures and pretend we understand them...",
            "Lo! Let us feast our eyes upon the magic of the screen!",
            "By my troth, the cinema awaits! Watch we must...",
        ]);
    }

    private get completedMsg() {
        return random([
            "The moving pictures hath ended, mine eyes are weary!",
            "Gramercy! The video playeth no more!",
            "Zounds! All scenes have been viewed and the tale concludes...",
        ]);
    }
}
