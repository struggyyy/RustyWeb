import { Timestamp, GeoPoint } from "firebase/firestore";
import { Report, ReportStatus } from "@/lib/types/reports";

const getRandomStatus = (): ReportStatus => {
  const statuses: ReportStatus[] = [
    "Submitted",
    "Accepted",
    "Completed",
    "Canceled",
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getRandomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const startDate = new Date("2025-12-01T00:00:00");
const endDate = new Date("2026-01-10T23:59:59");

export const MOCK_REPORTS: Report[] = [
  {
    id: "mock-report-1",
    userId: "mock-user-1",
    userEmail: "demo@husky.com",
    description: "Abandoned vehicle blocking the driveway.",
    imageUrl: "/images/mock/Mustang.png",
    location: new GeoPoint(49.54, 22.28),
    status: getRandomStatus(),
    points: 10,
    createdAt: Timestamp.fromDate(getRandomDate(startDate, endDate)),
  },
  {
    id: "mock-report-2",
    userId: "mock-user-1",
    userEmail: "demo@husky.com",
    description: "Old sedan left on the side of the road for weeks.",
    imageUrl: "/images/mock/2cv.png",
    location: new GeoPoint(50.05, 19.91),
    status: getRandomStatus(),
    points: 50,
    createdAt: Timestamp.fromDate(getRandomDate(startDate, endDate)),
  },
  {
    id: "mock-report-3",
    userId: "mock-user-1",
    userEmail: "demo@husky.com",
    description: "Damaged truck abandoned in the park.",
    imageUrl: "/images/mock/Bronco.png",
    location: new GeoPoint(50.02, 19.9),
    status: getRandomStatus(),
    points: 100,
    createdAt: Timestamp.fromDate(getRandomDate(startDate, endDate)),
  },
  {
    id: "mock-report-4",
    userId: "mock-user-1",
    userEmail: "demo@husky.com",
    description: "Rusted car without license plates.",
    imageUrl: "/images/mock/Delorean.png",
    location: new GeoPoint(49.55, 22.33),
    status: getRandomStatus(),
    points: 0,
    createdAt: Timestamp.fromDate(getRandomDate(startDate, endDate)),
  },
];
