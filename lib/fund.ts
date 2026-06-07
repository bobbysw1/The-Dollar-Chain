/* How every dollar is split, after Stripe's processing fee is taken out.
 *
 *   net (after payment fees)
 *     → 10%  running costs (keeping the lights on)
 *     → then 10% of what's left  →  the southern Gold Coast Emergency Fund
 *     → the rest (~81% of net)   →  your suburb's local causes (the weekly vote)
 *
 * So "90% goes to causes" still holds — one tenth of that 90% is ring-fenced
 * coast-wide for emergencies, the rest stays local. */

export const RUNNING_COST_PCT = 0.10;
export const EMERGENCY_PCT = 0.10; // of the after-expenses amount

/* Stripe's Australian card pricing: 1.75% + A$0.30 per successful charge,
 * plus 10% GST on the fee. Used as an estimate whenever we don't (yet) have
 * the exact fee back from Stripe's balance transaction. */
export const STRIPE_PCT = 0.0175;
export const STRIPE_FIXED_CENTS = 30;
export const STRIPE_GST = 1.1;

/** Best-guess Stripe processing fee on a gross charge, in cents. */
export function estimateStripeFeeCents(grossCents: number): number {
  if (grossCents <= 0) return 0;
  return Math.round((grossCents * STRIPE_PCT + STRIPE_FIXED_CENTS) * STRIPE_GST);
}

/** What actually lands in the fund after Stripe's cut. Uses the real captured
 *  fee when we have it, otherwise estimates it — so we never quietly show the
 *  gross deposit as if it were the net. */
export function netAfterFees(grossCents: number, feeCents?: number): number {
  const fee = feeCents && feeCents > 0 ? feeCents : estimateStripeFeeCents(grossCents);
  return Math.max(0, Math.round(grossCents) - fee);
}

export interface FundSplit {
  net: number;
  runningCosts: number;
  afterExpenses: number;
  emergency: number;
  local: number;
}

export function fundSplit(netCents: number): FundSplit {
  const net = Math.max(0, Math.round(netCents));
  const runningCosts = Math.round(net * RUNNING_COST_PCT);
  const afterExpenses = net - runningCosts;
  const emergency = Math.round(afterExpenses * EMERGENCY_PCT);
  const local = afterExpenses - emergency;
  return { net, runningCosts, afterExpenses, emergency, local };
}

/** What the Emergency Fund exists for — genuine, can't-wait crises. */
export const EMERGENCY_COVERS: { title: string; detail: string }[] = [
  {
    title: "Escaping domestic & family violence",
    detail: "Helping women, children and anyone fleeing an abusive home — emergency accommodation, a bond, a removalist, changed locks, the first hard weeks. Handled discreetly, with specialist services.",
  },
  {
    title: "Single parents in sudden crisis",
    detail: "A parent who's just lost income or hit a wall — food, rent or power to get the kids through the week.",
  },
  {
    title: "Natural-disaster relief",
    detail: "Fire, flood, storm or cyclone — immediate essentials and homelessness relief for locals who've lost their home or belongings.",
  },
  {
    title: "A safe night indoors",
    detail: "Emergency accommodation for someone who'd otherwise be sleeping rough tonight.",
  },
  {
    title: "Urgent medical & medication costs",
    detail: "A script or treatment someone genuinely can't afford and can't go without.",
  },
  {
    title: "Sudden loss of income",
    detail: "Job loss, injury or illness that hits overnight — keeping the lights on and food on the table while things are sorted.",
  },
  {
    title: "Keeping the essentials connected",
    detail: "Stopping an imminent eviction or a power/water disconnection in a true emergency.",
  },
  {
    title: "Funeral & bereavement help",
    detail: "Helping a family who simply can't cope with the cost of saying goodbye.",
  },
];
