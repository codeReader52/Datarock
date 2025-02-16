### Problem

I chose the bowling scoring problem (without the optional 10th frame scoring).

### Modeling

The bowling problem is modelled as a state machine. The image of the state machine is in `states.png`.
![file](https://github.com/codeReader52/Datarock/blob/main/states.png)
The solution is a simple hard-coded implementation of this state machine.

### Implementation

There are only 2 files: of special interest: `src/state_machine/index.ts` implements a generic state machine and `src/bowling_game.ts` build the scoring system which consist of a specific implementation of a state machine with injected concrete rules. The later is the bulk of the library. The unittest file `tst/bowling_game.test.ts` shows the main public signature of the class.
