import { BowlingGame } from '../src/bowling_game';
import { InvalidStateError } from '../src/state_machine/errors';

describe('Bowling Game', () => {
    describe('Score counting', () => {
        test('Should count score correctly for: A normal bowl', () => {
            const game = new BowlingGame();
            game.roll(5);
            expect(game.getScore()).toBe(5);
        });

        test('Should count score correctly for: A Spare then a normal bowl', () => {
            const game = new BowlingGame();
            game.roll(7);
            game.roll(3);
            game.roll(4);
            expect(game.getScore()).toBe(18);
        });

        test('Should count score correctly for: A Strike then a normal frame', () => {
            const game = new BowlingGame();
            game.roll(10);
            game.roll(3);
            game.roll(6);
            game.roll(3);
            expect(game.getScore()).toBe(31);
        });

        test('Should count score correctly for: A Spare then a Strike then a normal frame', () => {
            const game = new BowlingGame();
            game.roll(7);
            game.roll(3);
            game.roll(10);
            game.roll(2);
            game.roll(3);
            expect(game.getScore()).toBe(40);
        });

        test('Should count score correctly for: A Strike then a Strike then a Strike then a normal frame then a normal frame', () => {
            const game = new BowlingGame();
            game.roll(10);
            game.roll(10);
            game.roll(10);

            game.roll(5);
            game.roll(2);
            game.roll(4);
            game.roll(3);

            /**
             * First frame:  10 + 10 + 10
             * Second frame: 10 + 10 + 5
             * Third frame:  10 + 5 + 2
             * Fourth frame: 5 + 2
             * Fifth frame:  4 + 3
             */
            expect(game.getScore()).toBe(86);
        });

        test('Should count score correctly for: A Strike then a Spare then a normal frame', () => {
            const game = new BowlingGame();
            game.roll(10);
            game.roll(3);
            game.roll(7);
            game.roll(4);
            game.roll(3);

            /**
             * First frame:  10 + 3 + 7
             * Second frame: 3 + 7 + 4
             * Third frame:  4 + 3
             */
            expect(game.getScore()).toBe(41);
        });
    });

    describe('Frames counting', () => {
        test('If there is a Strike, the frame is finished in 1 bowl', () => {
            const game = new BowlingGame();
            game.roll(1);
            game.roll(2);
            expect(game.getCompletedFrameCount()).toBe(1);

            game.roll(10);
            expect(game.getCompletedFrameCount()).toBe(2);

            game.roll(3);
            game.roll(4);
            expect(game.getCompletedFrameCount()).toBe(3);
        });

        test('If maximum frame is reached, it will ignore all incoming bowls', () => {
            const game = new BowlingGame(10, 3);

            game.roll(1);
            game.roll(2);

            game.roll(3);
            game.roll(4);

            game.roll(5);
            game.roll(4);

            expect(game.getScore()).toBe(19);

            game.roll(3);
            expect(game.getScore()).toBe(19);
        });
    });

    describe('Handling invalid events', () => {
        test('If a bowl is more than 10 score, it should throw an invalid state error', () => {
            const game = new BowlingGame();
            expect(() => game.roll(11)).toThrow(InvalidStateError);
        });

        test('If a frame adds to be more than 10, it should throw an invalid state state error', () => {
            const game = new BowlingGame();
            game.roll(1);
            expect(game.getScore()).toBe(1);
            expect(() => game.roll(10)).toThrow(InvalidStateError);
        });
    });
});
