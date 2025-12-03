import { useConfig } from "@/lib/hooks/config";
import { useEmployee } from "@/lib/hooks/employee";
import { DeepPartial } from "@apollo/client/utilities";
import {
  IEmployee,
  IEmployeeAttendance,
  IEmployeeHistory,
} from "@em-plor/contracts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { omit } from "lodash-es";
import EmployeeAttendanceGraph from "./EmployeeAttendanceGraph";
import EmployeeHistoryGraph from "./EmployeeHistoryGraph";

interface EmployeeFormProps {
  employee: DeepPartial<IEmployee>;
  readonly?: boolean;
  onCancel?: () => void;
  onUpdated?: (employee: IEmployee) => void;
  onCreated?: (employee: IEmployee) => void;
}

export default function EmployeeForm({
  employee,
  readonly,
  onCancel,
  onUpdated,
  onCreated,
}: EmployeeFormProps) {
  const isCreating = !employee.id;
  const { departments, positions } = useConfig();
  const {
    createEmployee,
    updateEmployee,
    employee: updatedEmployee,
    loading: isUpdatingEmployee,
  } = useEmployee(employee.id || "");
  const [formData, setFormData] = useState<DeepPartial<IEmployee>>(
    omit(employee, "attendances"),
  );

  const onFormDataChange = (updatedData: DeepPartial<IEmployee>) => {
    setFormData((prevData) => {
      return { ...prevData, ...updatedData };
    });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreating) {
      createEmployee({
        name: formData!.name!,
        dob: formData!.dob!,
        departmentId: formData!.departmentId!,
        positionId: formData!.positionId!,
        email: formData!.account!.email!,
      });
    } else {
      updateEmployee({
        accountId: formData!.accountId!,
        name: formData!.name!,
        dob: formData!.dob!,
        departmentId: formData!.departmentId!,
        positionId: formData!.positionId!,
        email: formData!.account!.email!,
      });
    }
  };

  const handleCancellation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCancel) {
      onCancel();
    }
  };

  const parseDate = (date: Date | string) => {
    if (typeof date === "string") {
      return new Date(date);
    }
    return date;
  };

  const toDateInputValue = (date: Date | string) => {
    try {
      const parsedDate = parseDate(date);

      return parsedDate.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (updatedEmployee && onUpdated && !isCreating) {
      onUpdated(updatedEmployee);
    } else if (updatedEmployee && onCreated && isCreating) {
      onCreated(updatedEmployee);
    }
  }, [updatedEmployee, onUpdated, onCreated, isCreating]);

  useEffect(() => {
    setFormData(omit(employee, "attendances"));
  }, [employee]);

  const attendances = useMemo(
    () => (employee.attendances ?? []) as DeepPartial<IEmployeeAttendance>[],
    [employee.attendances],
  );

  const histories = useMemo(
    () => (employee.histories ?? []) as DeepPartial<IEmployeeHistory>[],
    [employee.histories],
  );

  return (
    <form onSubmit={onFormSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Account</h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Update account settings
          </p>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="janesmith@example.com"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData?.account?.email}
                  disabled={isUpdatingEmployee || readonly}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      account: {
                        ...formData.account,
                        email: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Update personal information (name, DOB, etc.)
          </p>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData?.name}
                  disabled={isUpdatingEmployee || readonly}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="dob"
                className="block text-sm/6 font-medium text-gray-900"
              >
                DOB
              </label>
              <div className="mt-2">
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  autoComplete="dob"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={toDateInputValue(formData?.dob || new Date())}
                  disabled={isUpdatingEmployee || readonly}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      dob: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="department"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Department
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="department"
                  name="department"
                  autoComplete="department-name"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData?.departmentId}
                  disabled={isUpdatingEmployee || readonly}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      departmentId: e.target.value,
                      department: departments.find(
                        (dept) => dept.id === e.target.value,
                      ),
                    })
                  }
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="position"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Position
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="position"
                  name="position"
                  autoComplete="position-name"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData?.positionId}
                  disabled={isUpdatingEmployee || readonly}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      positionId: e.target.value,
                      position: positions.find(
                        (pos) => pos.id === e.target.value,
                      ),
                    })
                  }
                >
                  <option value="">Select a position</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
              </div>
            </div>
          </div>
        </div>

        {readonly && (
          <>
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base/7 font-semibold text-gray-900">
                Attendance Information
              </h2>
              <p className="mt-1 text-sm/6 text-gray-600">
                View attendance records for this employee.
              </p>

              <div className="mt-6">
                <EmployeeAttendanceGraph
                  attendances={attendances}
                ></EmployeeAttendanceGraph>
              </div>
            </div>

            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base/7 font-semibold text-gray-900">
                Employee History
              </h2>
              <p className="mt-1 text-sm/6 text-gray-600">
                See the history of positions and departments this employee has
                held.
              </p>

              <div className="mt-6">
                <EmployeeHistoryGraph
                  histories={histories}
                ></EmployeeHistoryGraph>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm/6 font-semibold text-gray-900 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
          disabled={isUpdatingEmployee}
          onClick={handleCancellation}
        >
          Cancel
        </button>
        {!readonly && (
          <button
            type="submit"
            className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:bg-cyan-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            disabled={isUpdatingEmployee}
          >
            {isUpdatingEmployee && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isCreating ? "Create" : "Update"}
          </button>
        )}
      </div>
    </form>
  );
}
