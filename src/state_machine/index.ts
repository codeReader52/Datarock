import { IllegalInputError, InvalidStateError } from './errors';

type State = number | string;

export type StateMachineRule<Event> = {
    transition: (event: Event) => State | null;
    effect: (event: Event) => void;
};

export class StateMachine<Event> {
    /**
     * @param rule mapping of state to a transition rules for this state.
     * Upon receiving an event, the machine perform a transition to the next state then execute the side effect of the transition.
     *
     * @param currState the state that the machine will be initialised to when constructor is called (initial state)
     */
    constructor(
        private readonly rule: Record<State, StateMachineRule<Event>>,
        private currState: State
    ) {
        if (!(this.currState in this.rule)) {
            throw new IllegalInputError(
                `Initial state ${this.currState} does not exist in rule set.`
            );
        }
    }

    /**
     * Execute the state machine when receiving an event: transition to the next state then execute side effect of the transition.
     */
    public on(event: Event): void {
        const { transition, effect } = this.rule[this.currState];
        const newState = transition(event);

        if (!newState) {
            throw new InvalidStateError(
                `Event ${JSON.stringify(event)} acting on state ${this.currState} does not result into a meaningful next state.`
            );
        }

        if (!(newState in this.rule)) {
            throw new InvalidStateError(
                `Encounter unknown state: ${this.currState} when event ${JSON.stringify(event)} acts on state ${this.currState}.`
            );
        }

        this.currState = newState;
        effect(event);
    }

    /**
     * Reset the current state of the machine
     */
    public resetCurrentState(state: State) {
        this.currState = state;
    }

    public getCurrentState() {
        return this.currState;
    }
}
