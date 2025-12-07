"use client";

import EmployeeForm from "@/components/EmployeeForm";
import { useGetEmployee } from "@/lib/hooks/employee";
import { useSnackbar } from "@/lib/providers";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const { employee, fetchEmployeeError } = useGetEmployee(id);
  const snackbar = useSnackbar();

  useEffect(() => {
    if (fetchEmployeeError) {
      snackbar("Error fetching employee data", "error");
    }
  }, [fetchEmployeeError, snackbar]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Information */}
        <div className="my-8 xl:my-10">
          <h1
            data-testid="page-heading"
            className="text-3xl font-bold tracking-tight text-gray-900"
          >
            Employee
          </h1>
          <p
            data-testid="page-description"
            className="mt-4 max-w-xl text-sm text-gray-700"
          >
            Edit employee information and manage their details.
          </p>
        </div>

        {employee && (
          <EmployeeForm
            employee={employee}
            className="py-6"
            onUpdated={() => {
              snackbar("Employee updated successfully", "success");
            }}
            onError={(e) => {
              snackbar(`Failed to update employee: ${e.message}`, "error");
            }}
          />
        )}
      </div>
    </div>
  );
}
