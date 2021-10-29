# react-immutable-state-controller

## 0.9.1

### Patch Changes

- ce58adf: Export SnapshotHookResult

## 0.9.0

### Patch Changes

- Updated dependencies [8bb9e60]
- Updated dependencies [01715cb]
  - immutable-state-controller@0.9.0

## 0.8.0

### Minor Changes

- f7083bc: Change useSnapshot to return an array
- c893ed4: Change Controller.controller to Controller.get

### Patch Changes

- b640d3e: Fix fault where change listeners for snapshots were removed when the component containing the controller re-rendered
- Updated dependencies [5b200f0]
- Updated dependencies [4f37f09]
- Updated dependencies [c893ed4]
  - immutable-state-controller@0.8.0

## 0.7.1

### Patch Changes

- Updated dependencies [f66a4de]
  - immutable-state-controller@0.7.1

## 0.7.0

### Patch Changes

- Updated dependencies [678b19d]
- Updated dependencies [64c214b]
  - immutable-state-controller@0.7.0

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
