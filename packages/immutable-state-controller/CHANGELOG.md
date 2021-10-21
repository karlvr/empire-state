# immutable-state-controller

## 0.5.0

### Minor Changes

- 3d74be4: Make clear the mutable and immutable semantics of Controllers

  This is particularly important when thinking about React and its state changes which
  are not usually visible until the component re-renders.

- a41c58a: Renamed Snapshot.setValue(newValue) to change(newValue) as setValue implied it was a normal setter

## 0.4.2

### Patch Changes

- 6a1b867: Upgrade dependencies and switch to using pnpm to build
