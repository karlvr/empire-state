# empire-state

## 1.0.0

### Major Changes

- Rename package to `empire-state`

- af49af7: Rename `withInitialValue` and `withFuncs` to `controllerWithInitialValue` and `controllerWithFuncs`

  To update your code for this new version:

  - Search existing code for `withInitialValue` and `withFuncs` using a case-sensitive and match-whole-word search; check which instances are related
    to `empire-state`; replace with the new function names.

### Minor Changes

- 76fa4f8: Allow setters to take a function to provide the new value
- a5db91a: Change listener methods return this for chaining
- e46c019: Add find and findIndex to Controller

## 0.10.0

### Minor Changes

- 403cc22: Improve the behaviour of Controllers using disjunctions

## 0.9.0

### Minor Changes

- 8bb9e60: Add set convenience method to Controller
- 01715cb: We shouldn't include the overloaded function definition in the interface as it ruins the enforcement of the relationships in the preceding function prototypes

## 0.8.0

### Minor Changes

- 5b200f0: Add map function for array controllers
- 4f37f09: Add tags to change listeners so we can remove a set of change listeners without touching others
- c893ed4: Change Controller.controller to Controller.get

## 0.7.1

### Patch Changes

- f66a4de: Fix behaviour with null objects and undefined or null arrays

## 0.7.0

### Minor Changes

- 678b19d: Add map function to Controller

### Patch Changes

- 64c214b: Fix child change listener firing multiple times [#15]

## 0.6.0

### Minor Changes

- a3fb6f2: All values from a Controller are now frozen using immer, which means that any input values to a Controller are also frozen
- 3f01c65: Remove withMutable as it didn't work if we used nested controllers and immer auto-froze our source
- 8887471: removeAllChangeListeners now removes all change listeners from sub controllers as well

## 0.5.0

### Minor Changes

- 3d74be4: Make clear the mutable and immutable semantics of Controllers

  This is particularly important when thinking about React and its state changes which
  are not usually visible until the component re-renders.

- a41c58a: Renamed Snapshot.setValue(newValue) to change(newValue) as setValue implied it was a normal setter

## 0.4.2

### Patch Changes

- 6a1b867: Upgrade dependencies and switch to using pnpm to build
