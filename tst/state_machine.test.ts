import { StateMachine } from '../src/state_machine';
import { InvalidStateError } from '../src/state_machine/errors';

describe('State Machine', () => {
    test('Should handle events transition and execute effects correctly', () => {
        const effect1 = jest.fn();
        const effect2 = jest.fn();
        const effect3 = jest.fn();
        const machine = new StateMachine<number>(
            {
                state1: {
                    transition: (e) => (e % 2 === 0 ? 'state2' : 'state3'),
                    effect: effect1
                },
                state2: {
                    transition: () => 'state1',
                    effect: effect2
                },
                state3: {
                    transition: () => 'state2',
                    effect: effect3
                }
            },
            'state1'
        );

        // Transition to state 3
        machine.on(3);
        expect(machine.getCurrentState()).toBe('state3');
        expect(effect1).toHaveBeenCalledTimes(1);
        expect(effect2).toHaveBeenCalledTimes(0);
        expect(effect3).toHaveBeenCalledTimes(0);

        // Transition to state 2 from state 3
        machine.on(2);
        expect(machine.getCurrentState()).toBe('state2');
        expect(effect1).toHaveBeenCalledTimes(1);
        expect(effect2).toHaveBeenCalledTimes(0);
        expect(effect3).toHaveBeenCalledTimes(1);

        // Back to state 1
        machine.on(1);
        expect(machine.getCurrentState()).toBe('state1');
        expect(effect1).toHaveBeenCalledTimes(1);
        expect(effect2).toHaveBeenCalledTimes(1);
        expect(effect3).toHaveBeenCalledTimes(1);

        // Transition to state 2 from state 1
        machine.on(4);
        expect(machine.getCurrentState()).toBe('state2');
        expect(effect1).toHaveBeenCalledTimes(2);
        expect(effect2).toHaveBeenCalledTimes(1);
        expect(effect3).toHaveBeenCalledTimes(1);
    });

    test('Should throw error on invalid state transition', () => {
        const machine = new StateMachine<number>(
            {
                state1: {
                    transition: (e) =>
                        e % 2 === 0 ? 'irrelevant state' : null,
                    effect: () => {}
                }
            },
            'state1'
        );

        expect(() => machine.on(3)).toThrow(InvalidStateError);
        expect(() => machine.on(4)).toThrow(InvalidStateError);
    });
});
