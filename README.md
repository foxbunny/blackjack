# Blackjack 10101

Browser-based Blackjack 10101 game.

## Starting the development server

To start the program, run: `node start`

By default the server starts on port 3000.

## Running tests

To execute all tests from the command line run: `npm test`

To start the Playwright test UI run: `npm test:ui`

## Making changes

To make changes to this code base, first identify whether the change fits 
into one of the following categories:

- Refactoring
- Behavior change

If the change does not affect the behavior of the program, simply make the 
change. 

If the change affects the behavior, you must first modify the test
suite found in the `tests` directory, and ensure the test fails, indicating
that the new behavior is not implemented. Then make the change in the
program code to pass the test.

The code base uses *tabs* for indentation. This is intended to minimize the 
number of characters used for indentation and reduce the payload.

# TODO

- [ ] Streamline the handling of card rendering by introducing a concept 
  of a generic face-down card (for future use such as double-down face-down).
- [ ] Allow multiple players.
- [ ] Fix wonky animation while cards are being pushed aside for the new card.
- [ ] Animate filliping of the hole card.