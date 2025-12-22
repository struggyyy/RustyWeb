/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// External libraries
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
