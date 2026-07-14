// Literal UI copy from the acceptance walkthroughs (section 6.1). The PDF renders from the
// same template (D-8), so these labels are owned server-side.

/** Section 6.1 item 5 — READY payments. Not an error state. */
export const LABEL_NOT_YET_SETTLED = 'Not yet settled.';

/** Section 6.1 item 6 — payment never routed through a proxy: no LastMile record exists. */
export const LABEL_DELIVERY_NOT_APPLICABLE = 'Not applicable';

/** Section 6.1 item 6 — LastMile record exists, confirmation not yet arrived. */
export const LABEL_DELIVERY_AWAITING = 'Awaiting confirmation';

/** Section 6.2 item 3 — the two legs, honestly labelled. */
export const LABEL_FUNDS_LEG = 'Funds sent';
export const LABEL_DELIVERY_LEG = 'Cash confirmed delivered';
