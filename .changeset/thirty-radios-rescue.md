---
"empire-state": patch
"empire-state-forms": patch
---

Change COMPATIBLEKEYS type utility to only find compatible keys and create separate COMPATIBLEKEYSORTHIS to include the magic 'this', so we don't have that everywhere we want keys

This actually changes the function signatures in quite a few places for the better, as they no longer implicitly include `'this'`.
