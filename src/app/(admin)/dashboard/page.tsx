import type { Metadata } from "next";
import HospitalDashboard from "./HospitalDashboard";

export const metadata: Metadata = {
  title: "Dashboard | Wavenet Care Dental Hospital",
  description: "Wavenet Care Dental Hospital Administration Dashboard - Manage patients, dentists, appointments and dental procedures",
};

export default function DashboardPage() {
  return <HospitalDashboard />;
}