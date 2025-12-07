"use client";

import EmployeeForm from "@/components/EmployeeForm";
import { useSnackbar } from "@/lib/providers";
import { useRouter } from "next/navigation";

export default function EmployeeEditPage() {
  const snackbar = useSnackbar();
  const router = useRouter();

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

        <EmployeeForm
          employee={{}}
          onCreated={() => {
            snackbar("Employee created successfully.", "success");
            router.push("/");
          }}
          onError={(e) => {
            snackbar(`Failed to create employee: ${e.message}`, "error");
          }}
          className="py-6"
        />
      </div>
    </div>
  );
}
