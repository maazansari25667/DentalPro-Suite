"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "./Pagination";
import Badge from "../ui/badge/Badge";
import Image from "next/image";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

// Define the table data using the interface - expanded for better pagination demo
const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
  {
    id: 6,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Emma Johnson",
      role: "UX Designer",
    },
    projectName: "Mobile App Design",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
      ],
    },
    budget: "15.2K",
    status: "Active",
  },
  {
    id: 7,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Michael Brown",
      role: "Backend Developer",
    },
    projectName: "API Development",
    team: {
      images: ["/images/user/user-24.jpg", "/images/user/user-25.jpg"],
    },
    budget: "8.7K",
    status: "Pending",
  },
  {
    id: 8,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Sarah Wilson",
      role: "DevOps Engineer",
    },
    projectName: "Cloud Infrastructure",
    team: {
      images: ["/images/user/user-26.jpg"],
    },
    budget: "32.1K",
    status: "Active",
  },
  {
    id: 9,
    user: {
      image: "/images/user/user-21.jpg",
      name: "David Martinez",
      role: "Data Analyst",
    },
    projectName: "Analytics Dashboard",
    team: {
      images: [
        "/images/user/user-27.jpg",
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
      ],
    },
    budget: "18.4K",
    status: "Active",
  },
  {
    id: 10,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lisa Anderson",
      role: "QA Engineer",
    },
    projectName: "Quality Assurance",
    team: {
      images: ["/images/user/user-30.jpg", "/images/user/user-31.jpg"],
    },
    budget: "6.3K",
    status: "Pending",
  },
  {
    id: 11,
    user: {
      image: "/images/user/user-18.jpg",
      name: "James Taylor",
      role: "Full Stack Developer",
    },
    projectName: "E-commerce Platform",
    team: {
      images: [
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "45.8K",
    status: "Active",
  },
  {
    id: 12,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Rachel Green",
      role: "Product Manager",
    },
    projectName: "Product Strategy",
    team: {
      images: ["/images/user/user-22.jpg"],
    },
    budget: "21.9K",
    status: "Cancel",
  }
];

export default function BasicTableOne() {
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: displayedOrders,
    goToPage,
    setItemsPerPage,
  } = usePagination({
    data: tableData,
    initialItemsPerPage: 5,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Project Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Team
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Budget
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {displayedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <Image
                          width={40}
                          height={40}
                          src={order.user.image}
                          alt={order.user.name}
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.user.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {order.user.role}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.projectName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                      {order.team.images.map((teamImage, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                        >
                          <Image
                            width={24}
                            height={24}
                            src={teamImage}
                            alt={`Team member ${index + 1}`}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        order.status === "Active"
                          ? "success"
                          : order.status === "Pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.budget}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
        onItemsPerPageChange={setItemsPerPage}
        showItemsPerPageSelect={true}
        showItemCount={true}
        pageSizeOptions={[5, 10, 15, 20]}
      />
    </div>
  );
}
