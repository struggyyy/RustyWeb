import { GeoPoint, Timestamp } from "firebase/firestore";

export type ReportStatus = "Submitted" | "Accepted" | "Completed" | "Canceled";

export const reportStatuses: ReportStatus[] = [
  "Submitted",
  "Accepted",
  "Completed",
  "Canceled",
];

export interface Report {
  id: string;
  userId: string;
  description: string;
  location: GeoPoint;
  imageUrl: string;
  createdAt: Timestamp;
  status: ReportStatus;
  points: number;
  userEmail?: string;
}
