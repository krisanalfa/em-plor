"use client";

import EmployeeForm from "@/components/EmployeeForm";
import { useGetEmployee } from "@/lib/hooks/employee";
import { useSnackbar } from "@/lib/providers";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EmployeePage() {
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
      <div className="min-w-0 space-y-4 px-4 sm:px-6 lg:px-12 xl:px-16">
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
            View employee information. Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Necessitatibus iusto nemo, expedita dicta
            dignissimos modi, dolore vitae assumenda harum explicabo dolor sed
            facilis consequuntur eveniet nulla veniam placeat. Aspernatur, in?
          </p>
        </div>

        {employee && (
          <EmployeeForm employee={employee} readonly className="pb-6" />
        )}
      </div>
    </div>
  );
}
