# React Immutable State Controller

A small library to manage mutable and immutable state in React without a lot of boilerplate, but with a lot of type-safety.

A difficulty with React's `useState` (or component state pre-hooks) is that changes to state are not visible to code until the component re-renders. A difficulty because it can lead to mistakes due to misunderstandings—it's odd that `value` isn't changed when you've called `setValue`—and a strength because _immutability_ makes code safer and is fundamental to React.

`react-immutable-state-controller` lets you work with immutable state _and_ mutable state, hopefully giving you the best of both worlds. It is based upon [`immutable-state-controller`](../immutable-state-controller), which you may wish to read more about to understand more about `Controller`s and `Snapshot`s.

* A `Controller` represents mutable state. The `useController(initialValue)` hook works much like React's `useState`, but instead returns a `Controller` with a `value` property to access the current state, and a `setValue` function to change that state. Even though `useController` uses `useState` under the hood, changes to the `Controller`'s state are immediately visible using the `Controller`'s `value` property.
* A `Snapshot` represents immutable state. The `Controller`'s `snapshot(...)` functions create `Snapshot`s of your state. Each `Snapshot` has a `value` that is immutable, and a `change(newValue)` function that changes the value. That change will be immediately visible in the `Controller`, but _never_ visible in the `Snapshot`.

## Installation

```shell
npm install react-immutable-state-controller
```
