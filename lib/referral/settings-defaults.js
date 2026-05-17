/** Default referral / commission / bonus configuration. */
export const DEFAULT_REFERRAL_SETTINGS = {
  commissionEnabled: true,
  maxLevels: 3,
  level1Percent: 10,
  level2Percent: 5,
  level3Percent: 3,
  requireSponsorOnRegister: false,
  sponsorMustBeVerified: true,
  commissionOnPackagePurchaseOnly: true,
  minPackageInvestment: 0,
  bonusesEnabled: true,
  newUserBonus: 0,
  referrerSignupBonus: 0,
  milestones: [
    { directReferrals: 5, bonusAmount: 10, label: "5 direct referrals" },
    { directReferrals: 10, bonusAmount: 25, label: "10 direct referrals" },
    { directReferrals: 25, bonusAmount: 75, label: "25 direct referrals" },
  ],
};
