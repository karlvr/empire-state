# immutable-state-controller

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
