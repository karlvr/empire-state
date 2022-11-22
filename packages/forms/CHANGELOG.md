# empire-state-forms

## 1.15.0

### Minor Changes

- b3dd692: Change Number component to support floating point and create Integer component to only support integers

## 1.14.0

### Patch Changes

- Updated dependencies [92c7727]
- Updated dependencies [26356f2]
- Updated dependencies
- Updated dependencies [848179c]
  - empire-state@1.14.0
  - empire-state-react@1.14.0

## 1.14.0-next.2

### Patch Changes

- Updated dependencies [26356f2]
  - empire-state@1.14.0-next.2
  - empire-state-react@1.14.0-next.2

## 1.14.0-next.1

### Patch Changes

- Updated dependencies [92c7727]
  - empire-state@1.14.0-next.1
  - empire-state-react@1.14.0-next.1

## 1.14.0-next.0

### Patch Changes

- Updated dependencies [848179c]
  - empire-state@1.14.0-next.0
  - empire-state-react@1.14.0-next.0

## 1.13.0

### Patch Changes

- Updated dependencies [7119f35]
- Updated dependencies [9a72b87]
  - empire-state@1.13.0
  - empire-state-react@1.13.0

## 1.12.0

### Patch Changes

- 9c5dfd8: Update use of useControllerLength now that it has stricter types
- 7f3f035: Change COMPATIBLEKEYS type utility to only find compatible keys and create separate COMPATIBLEKEYSORTHIS to include the magic 'this', so we don't have that everywhere we want keys

  This actually changes the function signatures in quite a few places for the better, as they no longer implicitly include `'this'`.

- Updated dependencies [86d62b8]
- Updated dependencies [7f3f035]
  - empire-state-react@1.12.0
  - empire-state@1.12.0

## 1.11.0

### Minor Changes

- 4382475: Change Indexed to use useControllerLength and new Controller push and splice functions

### Patch Changes

- Updated dependencies [c7e62e2]
- Updated dependencies [3837cd9]
  - empire-state@1.11.0
  - empire-state-react@1.11.0

## 1.10.0

### Patch Changes

- 3f80133: Fix Indexed component when not specifying prop prop
- 6ca1ccc: Output empty string instead of undefined if a Select option has an undefined value and no text
- Updated dependencies [b245677]
- Updated dependencies [3f80133]
- Updated dependencies [9406503]
  - empire-state@1.10.0
  - empire-state-react@1.10.0

## 1.9.0

### Minor Changes

- c672e21: Bump version to match empire-state

## 1.3.6

### Patch Changes

- Updated dependencies [be51af1]
  - empire-state@1.9.0
  - empire-state-react@1.9.0

## 1.3.5

### Patch Changes

- Updated dependencies [94c6e8e]
- Updated dependencies [2e0acae]
- Updated dependencies [9b7997f]
  - empire-state@1.8.0
  - empire-state-react@1.8.0

## 1.3.4

### Patch Changes

- Updated dependencies [50f2124]
  - empire-state@1.7.3
  - empire-state-react@1.7.3

## 1.3.3

### Patch Changes

- a92f7cc: Fix default export

## 1.3.2

### Patch Changes

- Updated dependencies [da2ccaa]
  - empire-state-react@1.7.2

## 1.3.1

### Patch Changes

- Updated dependencies [8c53c94]
  - empire-state@1.7.1
  - empire-state-react@1.7.1

## 1.3.0

### Minor Changes

- d12f1bc: Introduce useStatelessController as a more obvious replacement for useSnapshotController

### Patch Changes

- Updated dependencies [5cf354f]
- Updated dependencies [d12f1bc]
  - empire-state@1.7.0
  - empire-state-react@1.7.0

## 1.2.7

### Patch Changes

- Updated dependencies [1756521]
  - empire-state-react@1.6.0

## 1.2.6

### Patch Changes

- Updated dependencies [a8af4d0]
  - empire-state-react@1.5.1

## 1.2.5

### Patch Changes

- Updated dependencies [dcc6337]
  - empire-state@1.5.0
  - empire-state-react@1.5.0

## 1.2.4

### Patch Changes

- Updated dependencies [aaf769e]
- Updated dependencies [46a3a3f]
  - empire-state@1.4.0
  - empire-state-react@1.4.0

## 1.2.3

### Patch Changes

- Updated dependencies [993708b]
  - empire-state-react@1.3.2

## 1.2.2

### Patch Changes

- Updated dependencies [6789105]
  - empire-state-react@1.3.1

## 1.2.1

### Patch Changes

- Updated dependencies [6e4ec62]
  - empire-state-react@1.3.0

## 1.2.0

### Minor Changes

- 3196fa2: Rename useSnapshot to useControllerValue

### Patch Changes

- Updated dependencies [3196fa2]
  - empire-state-react@1.2.0

## 1.1.0

### Minor Changes

- ab09667: Rename useNewController to useControllerWithInitialState

### Patch Changes

- Updated dependencies [ab09667]
- Updated dependencies [d868af9]
- Updated dependencies [9825294]
  - empire-state-react@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies [c3ee2e7]
  - empire-state@1.0.1
  - empire-state-react@1.0.1

## 1.0.1

### Patch Changes

- 078a9be: Export all components in default export rather than only in Formalities const

## 1.0.0

### Major Changes

- 843c85c: Rename to `empire-state-forms`

- 4a083f6: Allow the "prop" prop to be optional, meaning "this", to support the new `controller.get('property')` form in `empire-state`

- ffe0f13: `react-immutable-state-controller` renamed to `empire-state-react`

- b1ef40d: Update to release version of react-immutable-state-controller

## 0.9.1

### Patch Changes

- 8634cd8: Fix immutable-state-controller and react-immutable-state-controller dependencies

## 0.9.0

### Minor Changes

- b90065c: Upgrade to the latest react-immutable-state-controller with different usage and slightly different semantics (realitically a major upgrade, but treated as a minor upgrade as formalities is pre 1.0)
