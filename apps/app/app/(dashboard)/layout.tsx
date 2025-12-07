"use client";

import { ReactNode } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/DashboardLayout";

const navigation = [
  { name: "Employee", href: "/", icon: HomeIcon, current: true },
];

interface DashboardLayoutWrapperProps {
  children: ReactNode;
}

export default function DashboardLayoutWrapper({
  children,
}: DashboardLayoutWrapperProps) {
  return (
    <DashboardLayout navigation={navigation} pageTitle="Employee">
      {children}
    </DashboardLayout>
  );
}
