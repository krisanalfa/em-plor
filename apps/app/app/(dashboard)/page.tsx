"use client";

import { useEffect, useState } from "react";
import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useGetEmployees } from "@/lib/hooks/employee";
import Pagination from "@/components/Pagination";
import { SortableEmployeeField } from "@em-plor/contracts";
import { useSnackbar } from "@/lib/providers";
import Image from "next/image";
import Link from "next/link";

const sortOptions = [
  { name: "Name", href: "#", value: SortableEmployeeField.NAME },
  {
    name: "Earliest Join Date",
    href: "#",
    value: SortableEmployeeField.JOIN_DATE_DESC,
  },
  {
    name: "Oldest Join Date",
    href: "#",
    value: SortableEmployeeField.JOIN_DATE_ASC,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const limitPerPage = 15;

export default function EmployeePage() {
  const [page, setPage] = useState(1);
  const {
    data,
    fetchEmployees,
    loading: isFetchingEmployees,
    error: fetchEmployeesError,
  } = useGetEmployees();
  const snackbar = useSnackbar();

  const [sortField, setSortField] = useState<SortableEmployeeField>(
    SortableEmployeeField.NAME,
  );
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    if (!fetchEmployeesError) return;

    snackbar(fetchEmployeesError.message, "error");
  }, [fetchEmployeesError, snackbar]);

  useEffect(() => {
    if (isFetchingEmployees) return;

    fetchEmployees({
      skip: (page - 1) * limitPerPage,
      take: limitPerPage,
      filter,
      sortby: sortField,
    });
  }, [fetchEmployees, filter, isFetchingEmployees, page, sortField]);

  const handleSearch = () => {
    if (isFetchingEmployees) return;

    setPage(1);
    fetchEmployees({ skip: 0, take: limitPerPage, filter, sortby: sortField });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Information */}
        <div className="my-8 xl:my-10">
          <h1
            data-testid="page-heading"
            className="text-3xl font-bold tracking-tight text-gray-900"
          >
            Employees
          </h1>
          <p
            data-testid="page-description"
            className="mt-4 max-w-xl text-sm text-gray-700"
          >
            Through the Employee Management System (EMS), you can easily manage
            employee data, track performance, and streamline HR processes. You
            can add, update, and view employee profiles, monitor attendance, and
            generate reports to make informed decisions.
          </p>
        </div>

        {/* Filters */}
        <Disclosure
          as="section"
          data-testid="filter-section"
          aria-labelledby="filter-heading"
          className="border-t border-b border-gray-200"
        >
          <h2 id="filter-heading" className="sr-only">
            Filters
          </h2>
          <div className="flex items-center justify-between px-4 py-4">
            <div className="max-w-md flex-1 lg:max-w-lg">
              <form
                action="#"
                method="GET"
                className="relative"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-0 size-5 -translate-y-1/2 text-gray-500"
                />
                <input
                  data-testid="employee-search-input"
                  name="search"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  className="block w-full bg-transparent pl-8 text-base text-gray-800 outline-hidden placeholder:text-gray-500 sm:text-sm/6"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {/* Create Employee button */}
              <Link
                data-testid="create-employee-button"
                className="flex cursor-pointer items-center gap-2 rounded-md bg-cyan-600 px-2 py-1 text-xs font-semibold text-white shadow-xs hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                href="/employee/create"
              >
                Create
              </Link>

              {/* Sort menu */}
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton
                    data-testid="sort-menu-button"
                    className="group inline-flex cursor-pointer justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sort
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                    />
                  </MenuButton>
                </div>

                <MenuItems
                  transition
                  anchor={{ to: "bottom start" }}
                  className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <MenuItem key={option.name}>
                        <a
                          onClick={() => {
                            setSortField(option.value);
                            setPage(1);
                          }}
                          href={option.href}
                          className={classNames(
                            sortField === option.value
                              ? "font-medium text-gray-900"
                              : "text-gray-500",
                            "block px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden",
                          )}
                        >
                          {option.name}
                        </a>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </Disclosure>

        {/* Employees */}
        <ul
          data-testid="employee-list"
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {data?.items?.map((employee) => (
            <li
              key={employee.id}
              data-testid="employee-card"
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div className="flex w-full items-start justify-between space-x-4 p-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/employee/${employee.id}`}
                      data-testid="employee-name"
                      className="cursor-pointer truncate text-sm font-medium text-cyan-500 hover:text-cyan-600"
                    >
                      {employee.name}
                    </Link>
                    <span
                      data-testid="employee-department-badge"
                      className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset"
                    >
                      {employee.department?.name}
                    </span>
                  </div>
                  <p
                    data-testid="employee-position"
                    className="mt-1 truncate text-sm text-gray-500"
                  >
                    {employee.position?.name}
                    {employee.reportsTo?.id && (
                      <span className="mt-1 block text-xs text-gray-400">
                        {" "}
                        Reports to{" "}
                        <Link
                          href={`/employee/${employee.reportsTo.id}`}
                          className="cursor-pointer text-cyan-500 hover:text-cyan-600"
                        >
                          {employee.reportsTo.name}
                        </Link>
                      </span>
                    )}
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm text-gray-400">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Deleniti eos corporis esse quos sequi illo! Quae rerum id
                    iste cum iure repudiandae maxime corporis eveniet
                  </p>
                </div>
                <Image
                  data-testid="employee-image"
                  alt={`Image of ${employee.name}`}
                  src={`https://picsum.photos/200?random=${employee.id}`}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full bg-gray-300"
                />
              </div>
              <div>
                <div className="-mt-px flex divide-x divide-gray-200">
                  <div className="flex w-0 flex-1">
                    <a
                      data-testid="employee-email-link"
                      href={`mailto:${employee.account?.email}`}
                      className="relative -mr-px inline-flex w-0 flex-1 cursor-pointer items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                      <EnvelopeIcon
                        aria-hidden="true"
                        className="size-5 text-gray-400"
                      />
                      Email
                    </a>
                  </div>
                  <div className="-ml-px flex w-0 flex-1">
                    <Link
                      href={`/employee/${employee.id}/edit`}
                      data-testid="employee-edit-button"
                      className="relative inline-flex w-0 flex-1 cursor-pointer items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                      <PencilIcon
                        aria-hidden="true"
                        className="size-5 text-gray-400"
                      />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        {data?.total && (
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            totalPages={Math.ceil((data?.total ?? 0) / limitPerPage)}
            className="m-auto lg:mt-8 lg:max-w-lg"
          ></Pagination>
        )}
      </div>
    </div>
  );
}
