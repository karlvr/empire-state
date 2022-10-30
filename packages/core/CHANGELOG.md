# empire-state

## 1.14.0

### Minor Changes

- 26356f2: Bind Controller functions so we can pass them as functions without needing to bind
- Add slice
- 848179c: Allow all change functions to receive the new value or a function that accepts the current value and returns the new value

### Patch Changes

- 92c7727: pushNew should include undefined in its return type, as it is undefined until set

## 1.14.0-next.2

### Minor Changes

- 26356f2: Bind Controller functions so we can pass them as functions without needing to bind

## 1.14.0-next.1

### Patch Changes

- 92c7727: pushNew should include undefined in its return type, as it is undefined until set

## 1.14.0-next.0

### Minor Changes

- 848179c: Allow all change functions to receive the new value or a function that accepts the current value and returns the new value

## 1.13.0

### Minor Changes

- 7119f35: Add built-in transformer functions
- 9a72b87: Add `transform` method to `Controller`

## 1.12.0

### Patch Changes

- 7f3f035: Change COMPATIBLEKEYS type utility to only find compatible keys and create separate COMPATIBLEKEYSORTHIS to include the magic 'this', so we don't have that everywhere we want keys

  This actually changes the function signatures in quite a few places for the better, as they no longer implicitly include `'this'`.

## 1.11.0

### Minor Changes

- 3837cd9: Add splice

### Patch Changes

- c7e62e2: Add missing remove function prototype

## 1.10.0

### Minor Changes

- b245677: Support omitting "this" as first parameter for push and pushNew

### Patch Changes

- 3f80133: Fix Indexed component when not specifying prop prop

## 1.9.0

### Minor Changes

- be51af1: Change pushNew semantics to push a single new value and to then represent that value

## 1.8.0

### Minor Changes

- 94c6e8e: Add pushNew to Controller
- 9b7997f: Add remove() to remove controller value from parent

### Patch Changes

- 2e0acae: Remove extraneous push and remove method signatures and add docs

## 1.7.3

### Patch Changes

- 50f2124: Detect non-array values in map, findIndex and find and report an error

## 1.7.1

### Patch Changes

- 8c53c94: Fix onToggle typing with undefineds

## 1.7.0

### Minor Changes

- 5cf354f: Add onToggle and onChange to Controller

## 1.5.0

### Minor Changes

- dcc6337: Fix types on snapshots and nested controllers obtained using get so they include undefined if a parent value could be undefined

## 1.4.0

### Minor Changes

- 46a3a3f: Add push and remove methods to Controller

### Patch Changes

- aaf769e: Fix find and findIndex for undefined array values

## 1.0.1

### Patch Changes

- c3ee2e7: Fix duplicate sending of notifications to change listeners when using indexed properties

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
