# react-immutable-state-controller

## 0.6.0

### Minor Changes

- 99679ca: Overhaul hooks to improve re-render semantics
- 3f01c65: Remove withMutable as it didn't work if we used nested controllers and immer auto-froze our source

### Patch Changes

- Updated dependencies [a3fb6f2]
- Updated dependencies [3f01c65]
- Updated dependencies [8887471]
  - immutable-state-controller@0.6.0

## 0.5.1

### Patch Changes

- db11f0a: Add types property to package.json

## 0.5.0

### Minor Changes

- cce8836: Remove confusing `useController(value, onChange)` form
- 3d74be4: Make clear the mutable and immutable semantics of Controllers

  This is particularly important when thinking about React and its state changes which
  are not usually visible until the component re-renders.

- a41c58a: Renamed Snapshot.setValue(newValue) to change(newValue) as setValue implied it was a normal setter

### Patch Changes

- Updated dependencies [3d74be4]
- Updated dependencies [a41c58a]
  - immutable-state-controller@0.5.0

## 0.4.2

### Patch Changes

- Updated dependencies [6a1b867]
  - immutable-state-controller@0.4.2
