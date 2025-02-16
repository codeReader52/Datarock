import { StateMachine, StateMachineRule } from './state_machine';

enum GameState {
    FirstBowl = 'First Bowl Of Frame',
    SecondBowl = 'Second Bowl Of Frame',
    FirstBowlAfterSpare = 'First Bowl Of Frame Following A Spare (Double Points)',
    FirstBowlAfterStrike = 'First Bowl Of Frame Following A Strike (Double Points)',
    FirstBowlAfter2Strikes = 'First Bowl Of Frame Following 2 Strikes (Tripple Points)',
    SecondBowlAfterStrike = 'Second Bowl Of Frame Following A Strike (Double Points)',
    Finished = 'Game Finished'
}

export class BowlingGame {
    private score: number;
    private partialFrameScore: number;
    private completedFrameCount: number;

    private readonly stateMachine: StateMachine<number>;
    private readonly maxPins;
    private readonly maxFrames;

    /**
     * Bowling game object that manages bowling score
     */
    constructor(maxPinsPerFrame: number = 10, maxFramesPerGame: number = 10) {
        this.score = 0;
        this.partialFrameScore = 0;
        this.completedFrameCount = 0;

        this.maxPins = maxPinsPerFrame;
        this.maxFrames = maxFramesPerGame;

        this.stateMachine = new StateMachine<number>(
            {
                [GameState.FirstBowl]: this.buildFirstBowlStateRule(),
                [GameState.SecondBowl]: this.buildSecondBowlStateRule(),
                [GameState.FirstBowlAfterSpare]:
                    this.buildFirstBowlAfterSpareStateRule(),
                [GameState.FirstBowlAfterStrike]:
                    this.buildFirstBowlAfterStrikeStateRule(),
                [GameState.FirstBowlAfter2Strikes]:
                    this.buildFirstBowlAfter2StrikesStateRule(),
                [GameState.SecondBowlAfterStrike]:
                    this.buildSecondBowlAfterStrikeStateRule(),
                [GameState.Finished]: {
                    transition: () => GameState.Finished,
                    effect: () => {}
                }
            },
            GameState.FirstBowl
        );
    }

    private withFinishOnMaxFrameTransition(
        transitionRule: (score: number) => GameState | null
    ) {
        return (score: number) => {
            if (this.completedFrameCount === this.maxFrames)
                return GameState.Finished;

            return transitionRule(score);
        };
    }

    /**
     * Decorate the effect of reaching maximum frame in the game, the game should end now!
     */
    private withAutoTransitionToFinalStateEffect(
        effect: (score: number) => void
    ) {
        return (score: number) => {
            effect(score);
            if (this.completedFrameCount === this.maxFrames) {
                this.stateMachine.resetCurrentState(GameState.Finished);
            }
        };
    }

    /**
     * Decorate the effect of each first bowl of the frame. If the bowl doesn't
     * knock down all the pins, then store the partial frame score. If the bowl cleas all pin, finisht the frame (increase frame count)
     */
    private withFirstBowlEffect(effect: (score: number) => void) {
        return (score: number) => {
            effect(score);
            if (score < this.maxPins) {
                this.partialFrameScore = score;
            } else {
                this.completedFrameCount += 1;
            }
        };
    }

    /**
     * Decorate the effect of any second bowl of a frame: increase the frame count (since a frame has at most 2 bowls) and clear
     * any partial frame score from the first bowl.
     */
    private withSecondBowlEffect(effect: (score: number) => void) {
        return (score: number) => {
            effect(score);
            this.partialFrameScore = 0;
            this.completedFrameCount += 1;
        };
    }

    private buildFirstBowlStateRule(): StateMachineRule<number> {
        return {
            transition: this.withFinishOnMaxFrameTransition((score) =>
                score < this.maxPins
                    ? GameState.SecondBowl
                    : score === this.maxPins
                      ? GameState.FirstBowlAfterStrike
                      : null
            ),

            effect: this.withAutoTransitionToFinalStateEffect(
                this.withFirstBowlEffect((score) => (this.score += score))
            )
        };
    }

    private buildSecondBowlStateRule(): StateMachineRule<number> {
        return {
            transition: this.withFinishOnMaxFrameTransition((score) =>
                this.partialFrameScore + score < this.maxPins
                    ? GameState.FirstBowl
                    : this.partialFrameScore + score === this.maxPins
                      ? GameState.FirstBowlAfterSpare
                      : null
            ),
            effect: this.withAutoTransitionToFinalStateEffect(
                this.withSecondBowlEffect((score) => (this.score += score))
            )
        };
    }

    private buildFirstBowlAfterSpareStateRule(): StateMachineRule<number> {
        return {
            transition: this.withFinishOnMaxFrameTransition((score) =>
                score < this.maxPins
                    ? GameState.SecondBowl
                    : score === this.maxPins
                      ? GameState.FirstBowlAfterStrike
                      : null
            ),
            effect: this.withAutoTransitionToFinalStateEffect(
                this.withFirstBowlEffect((score) => (this.score += score * 2))
            )
        };
    }

    private buildFirstBowlAfterStrikeStateRule(): StateMachineRule<number> {
        return {
            transition: this.withFinishOnMaxFrameTransition((score) =>
                score < this.maxPins
                    ? GameState.SecondBowlAfterStrike
                    : score === this.maxPins
                      ? GameState.FirstBowlAfter2Strikes
                      : null
            ),
            effect: this.withAutoTransitionToFinalStateEffect(
                this.withFirstBowlEffect((score) => (this.score += score * 2))
            )
        };
    }

    private buildFirstBowlAfter2StrikesStateRule(): StateMachineRule<number> {
        return {
            transition: this.withFinishOnMaxFrameTransition((score) =>
                score < this.maxPins
                    ? GameState.SecondBowlAfterStrike
                    : score === this.maxPins
                      ? GameState.FirstBowlAfter2Strikes
                      : null
            ),
            effect: this.withAutoTransitionToFinalStateEffect(
                this.withFirstBowlEffect((score) => (this.score += score * 3))
            )
        };
    }

    private buildSecondBowlAfterStrikeStateRule(): StateMachineRule<number> {
        return {
            transition: this.withFinishOnMaxFrameTransition((score) =>
                score + this.partialFrameScore < this.maxPins
                    ? GameState.FirstBowl
                    : score + this.partialFrameScore === this.maxPins
                      ? GameState.FirstBowlAfterSpare
                      : null
            ),
            effect: this.withAutoTransitionToFinalStateEffect(
                this.withSecondBowlEffect((score) => (this.score += score * 2))
            )
        };
    }

    public getScore() {
        return this.score;
    }

    public getCompletedFrameCount() {
        return this.completedFrameCount;
    }

    public roll(noPins: number) {
        this.stateMachine.on(noPins);
    }
}
