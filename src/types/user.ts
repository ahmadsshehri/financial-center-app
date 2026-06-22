export type UserStage = "foundation" | "weekly" | "growth";
export type PreferredMode = "daily" | "weekly";

export interface UserProfile {
  displayName: string;
  email: string;
  createdAt: Date;
  onboardingCompleted: boolean;
  stage: UserStage;
  preferredMode: PreferredMode;
  healthScore: number;
  healthLevel: number;
  themeLevel: number;
  fixedIncome: boolean;
  payday?: number;
  planStartDate?: string;
}
