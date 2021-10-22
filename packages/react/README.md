# React Immutable State Controller

A small library to manage immutable state in React without a lot of boilerplate, but with a lot of type-safety.

A difficulty with React's `useState` (or component state in pre-hooks world) is that changes to state are not visible to code until the component re-renders. A difficulty because it can lead to mistakes due to misunderstandings—it's odd that `value` isn't immediately changed after you've called `setValue`—and a strength because _immutability_ makes code safer and is fundamental to React.

Another difficulty with React's `useState` is that your entire component subtree re-renders when the state changes. This is annoying if you have a component managing a large state object and delegating the modification of parts of that state to child components.

`react-immutable-state-controller` lets you work with parts of the state, with re-renders limited to components that use the part of the state that has changed. It is based upon [`immutable-state-controller`](../immutable-state-controller), which you may wish to read about to understand more about `Controller`s and `Snapshot`s.

* A `Controller` controls access to the state. The `useController(initialValue)` hook works much like React's `useState`, but instead returns a `Controller` with a `value` property to access the current state, and a `setValue` function to change that state. Changes to the `Controller`'s state are immediately visible using the `Controller`'s `value` property, but they DO NOT trigger a re-render in React.
* A `Snapshot` provides an immutable snapshot of the state, or a part of the state. When that state (or part thereof) changes, the component re-renders. Snapshots follow React's semantics of immutable state. The `Controller`'s `snapshot(...)` functions create `Snapshot`s. Each `Snapshot` has a `value` that is immutable, and a `change(newValue)` function that triggers a change to the value. That change will be immediately visible in the `Controller`, not visible in the `Snapshot`, and will trigger a re-render which will obtain a new `Snapshot` containing the new state.

## Installation

```shell
npm install react-immutable-state-controller
```
