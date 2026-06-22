export interface HealthScore {
  id: string;
  score: number;
  level: number;
  reasons: string[];
  strengths: string[];
  improvements: string[];
  recommendation: string;
  date: string;
  createdAt: Date;
}

export interface HealthLevel {
  level: number;
  min: number;
  max: number;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}
