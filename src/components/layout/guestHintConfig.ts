// Shared between the home-page guest explainer (GuestHintModal) and the green
// link hints (GuestLinkHint), so the hints can wait until the client has read
// and dismissed the explanation.

/** Session flag: set once the guest explainer has been dismissed. */
export const GUEST_HINT_SESSION_KEY = 'ww-guest-hint-explained';

/** Window event: the explainer is on screen — pause the green hints. */
export const GUEST_HINT_HOLD_EVENT = 'guest-hint-hold';

/** Window event: the explainer is gone — (re)start the green hints. */
export const GUEST_HINT_RELEASE_EVENT = 'guest-hint-release';
