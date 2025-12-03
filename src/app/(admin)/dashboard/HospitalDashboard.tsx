"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RecentAppointments from "@/components/ecommerce/RecentAppointments";

// Dashboard cards data
const dashboardSections = [
  {
    title: "Patient Management",
    description: "Manage dental patient records, treatment plans, and medical history",
    href: "/patients",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: "bg-blue-500",
    stats: "1,247 Active Patients",
  },
  {
    title: "Dental Appointments",
    description: "Schedule and manage dental consultations and procedures",
    href: "/appointments",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-green-500",
    stats: "23 Today's Appointments",
  },
  {
    title: "Dentists",
    description: "Manage dental specialist profiles and schedules",
    href: "/dentists",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "bg-purple-500",
    stats: "15 Dental Specialists",
  },
  {
    title: "Dental Procedures",
    description: "Manage dental services and treatment procedures",
    href: "/procedures",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "bg-orange-500",
    stats: "25+ Dental Services",
  },
  {
    title: "Clinical Reports",
    description: "Generate and view dental practice reports",
    href: "/reports",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "bg-red-500",
    stats: "15 Monthly Reports",
  },
  {
    title: "Dental Emergency",
    description: "Emergency dental cases and urgent care alerts",
    href: "/emergency",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5C3.41 17.333 4.372 19 5.912 19z" />
      </svg>
    ),
    color: "bg-red-600",
    stats: "2 Urgent Cases",
  },
];

// Quick stats data
const quickStats = [
  { label: "Total Patients", value: "1,247", change: "+12%", trend: "up" },
  { label: "Today's Appointments", value: "23", change: "+5%", trend: "up" },
  { label: "Available Chairs", value: "8", change: "-1", trend: "down" },
  { label: "Staff on Duty", value: "28", change: "+2%", trend: "up" },
];

export default function HospitalDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Wavenet Care Dental Hospital
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name}! Here's what's happening at Wavenet Care today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <div className={`flex items-center mt-2 text-xs ${
                  stat.trend === 'up' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  <span>{stat.change}</span>
                  <span className="ml-1">vs last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardSections.map((section, index) => (
          <Link
            key={index}
            href={section.href}
            className="group block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-start space-x-4">
              <div className={`${section.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-200`}>
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {section.description}
                </p>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-500">
                  {section.stats}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Appointments with Pagination */}
      <RecentAppointments />
    </div>
  );
}