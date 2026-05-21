export type TUserDetails = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  credits: number;
  /** Present after the user has started Stripe Checkout at least once. */
  stripeCustomerId: string | null;
};
