import { useConfig } from "@/lib/hooks/config";
import {
  useGetEmployee,
  useUpdateEmployee,
  useCreateEmployee,
} from "@/lib/hooks/employee";
import { DeepPartial } from "@apollo/client/utilities";
import { useEffect, useMemo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Fieldset, Legend } from "@headlessui/react";
import { ErrorLike } from "@apollo/client";
import { useForm } from "react-hook-form";

import {
  IEmployee,
  IEmployeeAttendance,
  IEmployeeHistory,
  IEmployeeInput,
} from "@em-plor/contracts";

import { TextInput, SelectInput } from "./Forms";
import EmployeeAttendanceGraph from "./EmployeeAttendanceGraph";
import EmployeeHistoryGraph from "./EmployeeHistoryGraph";
import Link from "next/link";

const employeeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  dob: z.string().min(1, "Date of birth is required"),
  departmentId: z.uuidv4().min(1, "Department is required"),
  positionId: z.uuidv4().min(1, "Position is required"),
  reportsTo: z.string().optional().nullable(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// Helper function to check if a field is required in the schema
const isFieldRequired = (fieldName: keyof EmployeeFormData): boolean => {
  const fieldSchema = employeeFormSchema.shape[fieldName].optional();
  return fieldSchema.safeParse(undefined).success;
};

interface EmployeeFormProps {
  employee: DeepPartial<IEmployee>;
  className?: string;
  readonly?: boolean;
  onCancel?: () => void;
  onUpdated?: (employee: IEmployee) => void;
  onCreated?: (employee: IEmployee) => void;
  onError?: (error: ErrorLike) => void;
}

export default function EmployeeForm({
  employee,
  className = "",
  readonly = false,
  onUpdated,
  onCreated,
  onError,
}: EmployeeFormProps) {
  const isCreating = !employee.id;
  const { departments, positions } = useConfig();

  // Use the separated hooks
  const { employee: fetchedEmployee } = useGetEmployee(employee.id || "", {
    skip: isCreating,
  });

  const {
    updateEmployee,
    updatedEmployee,
    isUpdatingEmployee,
    updateEmployeeError,
    resetUpdateEmployee,
  } = useUpdateEmployee();

  const {
    createEmployee,
    createdEmployee,
    isCreatingEmployee,
    createEmployeeError,
    resetCreateEmployee,
  } = useCreateEmployee();

  // Use the fetched employee data if available (for readonly mode with full data)
  const currentEmployee = useMemo(
    () => (isCreating ? employee : fetchedEmployee || employee),
    [isCreating, fetchedEmployee, employee],
  );

  const toDateInputValue = useCallback((date: Date | string | undefined) => {
    if (!date) return "";
    try {
      const parsedDate = typeof date === "string" ? new Date(date) : date;
      return parsedDate.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }, []);

  const toFormData = useCallback(
    (e: DeepPartial<IEmployee>): EmployeeFormData => ({
      name: e.name || "",
      email: e.account?.email || "",
      dob: toDateInputValue(e.dob),
      departmentId: e.departmentId || "",
      positionId: e.positionId || "",
      reportsTo: e.reportsTo?.name || "",
    }),
    [toDateInputValue],
  );

  const toGraphqlData = useCallback(
    (data: EmployeeFormData): IEmployeeInput => ({
      accountId: isCreating ? undefined : (employee.accountId as string),
      name: data.name,
      email: data.email,
      dob: new Date(data.dob),
      departmentId: data.departmentId,
      positionId: data.positionId,
    }),
    [isCreating, employee.accountId],
  );

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    control,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    mode: "onChange",
    defaultValues: toFormData(currentEmployee),
  });

  const hardReset = useCallback(
    (e: DeepPartial<IEmployee>) => {
      reset(toFormData(e), { keepDirtyValues: false });
    },
    [reset, toFormData],
  );

  const isLoading = isUpdatingEmployee || isCreatingEmployee;
  const currentError = isCreating ? createEmployeeError : updateEmployeeError;
  const savedEmployee = isCreating ? createdEmployee : updatedEmployee;

  const handleSubmission = useCallback(
    (data: EmployeeFormData) => {
      const graphqlData = toGraphqlData(data);
      if (isCreating) {
        createEmployee(graphqlData);
      } else {
        updateEmployee(employee.id as string, graphqlData);
      }
    },
    [isCreating, createEmployee, updateEmployee, employee.id, toGraphqlData],
  );

  useEffect(() => {
    if (!savedEmployee) return;

    const callback = isCreating ? onCreated : onUpdated;
    callback?.(savedEmployee);
    hardReset(savedEmployee);

    // Reset mutation state after successful save
    if (isCreating) {
      resetCreateEmployee();
    } else {
      resetUpdateEmployee();
    }
  }, [
    savedEmployee,
    isCreating,
    onCreated,
    onUpdated,
    hardReset,
    resetCreateEmployee,
    resetUpdateEmployee,
  ]);

  useEffect(() => {
    if (currentEmployee) hardReset(currentEmployee);
  }, [currentEmployee, hardReset]);

  useEffect(() => {
    if (currentError) onError?.(currentError);
  }, [currentError, onError]);

  const attendances = useMemo(
    () =>
      readonly
        ? ((currentEmployee.attendances ??
            []) as DeepPartial<IEmployeeAttendance>[])
        : [],
    [readonly, currentEmployee.attendances],
  );

  const histories = useMemo(
    () =>
      readonly
        ? ((currentEmployee.histories ?? []) as DeepPartial<IEmployeeHistory>[])
        : [],
    [readonly, currentEmployee.histories],
  );

  return (
    <form
      onSubmit={handleSubmit(handleSubmission)}
      className={`max-w-xl ${className}`}
    >
      <div className="space-y-12">
        <Fieldset className="border-b border-gray-900/10 pb-12">
          <div className="flex items-center justify-between">
            <Legend className="text-base/7 font-semibold text-gray-900">
              Account
            </Legend>
            {readonly && (
              <Link
                href={`/employee/${employee.id}/edit`}
                className="cursor-pointer text-sm/6 font-semibold text-cyan-500 hover:text-cyan-600"
              >
                Edit
              </Link>
            )}
          </div>
          <p className="mt-1 text-sm/6 text-gray-600">
            {readonly ? "View" : "Update"} account settings
          </p>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <TextInput
              name="email"
              control={control}
              label="Email"
              type="email"
              placeholder="janesmith@example.com"
              required={isFieldRequired("email")}
              error={errors.email}
              disabled={isLoading || readonly}
              className="col-span-full"
            />
          </div>
        </Fieldset>

        <Fieldset className="border-b border-gray-900/10 pb-12">
          <Legend className="text-base/7 font-semibold text-gray-900">
            Personal Information
          </Legend>
          <p className="mt-1 text-sm/6 text-gray-600">
            {readonly ? "View" : "Update"} personal information (name, DOB,
            Department as well as Position)
          </p>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <TextInput
              name="name"
              control={control}
              label="Name"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              required={isFieldRequired("name")}
              error={errors.name}
              disabled={isLoading || readonly}
              className="col-span-full"
            />

            <TextInput
              name="dob"
              control={control}
              label="DOB"
              type="date"
              autoComplete="dob"
              required={isFieldRequired("dob")}
              error={errors.dob}
              disabled={isLoading || readonly}
              className="sm:col-span-3"
            />

            {/* TODO: Implement this */}
            {!isCreating && (
              <TextInput
                name="reportsTo"
                control={control}
                label="Reports To"
                type="text"
                className="sm:col-span-3"
                disabled
              />
            )}
          </div>
        </Fieldset>

        <Fieldset className="border-b border-gray-900/10 pb-12">
          <Legend className="text-base/7 font-semibold text-gray-900">
            Department and Position
          </Legend>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <SelectInput
              name="departmentId"
              control={control}
              label="Department"
              options={departments}
              placeholder="Select a department"
              required={isFieldRequired("departmentId")}
              error={errors.departmentId}
              disabled={isLoading || readonly}
              className="sm:col-span-3"
            />

            <SelectInput
              name="positionId"
              control={control}
              label="Position"
              options={positions}
              placeholder="Select a position"
              required={isFieldRequired("positionId")}
              error={errors.positionId}
              disabled={isLoading || readonly}
              className="sm:col-span-3"
            />
          </div>
        </Fieldset>

        {readonly && (
          <>
            <Fieldset className="min-w-0 border-b border-gray-900/10 pb-12">
              <Legend className="text-base/7 font-semibold text-gray-900">
                Attendance Information
              </Legend>
              <p className="mt-1 text-sm/6 text-gray-600">
                View attendance records for this employee.
              </p>

              <div className="-mx-4 mt-6 sm:-mx-6 lg:-mx-12 xl:-mx-16">
                <div className="overflow-x-auto px-4 sm:px-6 lg:px-12 xl:px-16">
                  <EmployeeAttendanceGraph attendances={attendances} />
                </div>
              </div>
            </Fieldset>

            <Fieldset className="border-b border-gray-900/10 pb-12">
              <Legend className="text-base/7 font-semibold text-gray-900">
                Employee History
              </Legend>
              <p className="mt-1 text-sm/6 text-gray-600">
                See the history of positions and departments this employee has
                held.
              </p>

              <div className="mt-6">
                <EmployeeHistoryGraph
                  histories={histories}
                ></EmployeeHistoryGraph>
              </div>
            </Fieldset>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        {!readonly && (
          <>
            <Link
              href={isCreating ? `/` : `/employee/${employee.id}`}
              className="cursor-pointer text-sm/6 font-semibold text-gray-900 hover:text-gray-700"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:cursor-not-allowed disabled:bg-cyan-400"
              disabled={isLoading || !isValid || !isDirty}
            >
              {isLoading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {isCreating ? "Create" : "Update"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
