/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  EnvelopeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEmployees } from "@/lib/hooks/employee";
import Pagination from "@/components/Pagination";
import {
  IDepartment,
  IEmployee,
  IPosition,
  SortableEmployeeField,
} from "@em-plor/contracts";
import EmployeeForm from "@/components/EmployeeForm";
import { DeepPartial } from "@apollo/client/utilities";
import { useAuthStore } from "@/lib/stores/auth.store";

const navigation = [
  { name: "Employee", href: "#", icon: HomeIcon, current: true },
];

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

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { account, logout } = useAuthStore();
  const [page, setPage] = useState(1);
  const { data, fetchEmployees } = useEmployees();
  const [sortField, setSortField] = useState<SortableEmployeeField>(
    SortableEmployeeField.NAME,
  );
  const [filter, setFilter] = useState<string>("");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] =
    useState<DeepPartial<IEmployee> | null>(null);
  const [detailSidebarOpen, setDetailSidebarOpen] = useState(false);

  useEffect(() => {
    fetchEmployees({
      skip: (page - 1) * limitPerPage,
      take: limitPerPage,
      filter,
      sortby: sortField,
    });
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchEmployees({ skip: 0, take: limitPerPage, filter, sortby: sortField });
  }, [sortField]);

  const handleSearch = () => {
    setPage(1);
    fetchEmployees({ skip: 0, take: limitPerPage, filter, sortby: sortField });
  };

  const handleOnEmployeeUpdated = () => {
    fetchEmployees({
      skip: (page - 1) * limitPerPage,
      take: limitPerPage,
      filter,
      sortby: sortField,
    });
  };

  const handleOnEmployeeCreated = (employee: IEmployee) => {
    setFilter(employee.account!.email!);
    setPage(1);
    fetchEmployees({
      skip: 0,
      take: limitPerPage,
      filter: employee.account!.email!,
      sortby: sortField,
    });
    setRightSidebarOpen(false);
    setCurrentEmployee(null);
  };

  const calculateDobAge = (dob: Date | string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <>
      <div className="w-full grow lg:flex xl:px-2">
        <div className="flex-1 xl:flex">
          <Dialog
            open={sidebarOpen}
            onClose={setSidebarOpen}
            className="relative z-50 lg:hidden"
          >
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
            />

            <div className="fixed inset-0 flex">
              <DialogPanel
                transition
                className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
              >
                <TransitionChild>
                  <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="-m-2.5 p-2.5"
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="size-6 text-white"
                      />
                    </button>
                  </div>
                </TransitionChild>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      alt="Your Company"
                      src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=cyan&shade=600"
                      className="h-8 w-auto"
                    />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  item.current
                                    ? "bg-gray-50 text-cyan-600"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-cyan-600",
                                  "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
                                )}
                              >
                                <item.icon
                                  aria-hidden="true"
                                  className={classNames(
                                    item.current
                                      ? "text-cyan-600"
                                      : "text-gray-400 group-hover:text-cyan-600",
                                    "size-6 shrink-0",
                                  )}
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="-mx-2 mt-auto">
                        <a
                          href="#"
                          className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-cyan-600"
                          onClick={(e) => {
                            e.preventDefault();
                            logout();
                          }}
                        >
                          <ArrowRightStartOnRectangleIcon
                            aria-hidden="true"
                            className="size-6 shrink-0 text-gray-400 group-hover:text-cyan-600"
                          />
                          Logout
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </DialogPanel>
            </div>
          </Dialog>

          {/* Mobile - Edit Form */}
          <Dialog
            open={rightSidebarOpen}
            onClose={setRightSidebarOpen}
            className="relative z-50 lg:hidden"
          >
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
            />

            <div className="fixed inset-0 flex">
              <DialogPanel
                transition
                className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
              >
                {/* Sidebar component, swap this element with another sidebar if you like */}
                {currentEmployee && (
                  <div className="flex grow flex-col overflow-y-auto bg-white px-6 py-4">
                    <EmployeeForm
                      employee={currentEmployee}
                      onCancel={() => {
                        setCurrentEmployee(null);
                        setRightSidebarOpen(false);
                      }}
                      onUpdated={handleOnEmployeeUpdated}
                      onCreated={handleOnEmployeeCreated}
                    />
                  </div>
                )}
              </DialogPanel>
            </div>
          </Dialog>

          {/* Mobile - Detail Form */}
          <Dialog
            open={detailSidebarOpen}
            onClose={setDetailSidebarOpen}
            className="relative z-50 lg:hidden"
          >
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
            />

            <div className="fixed inset-0 flex">
              <DialogPanel
                transition
                className="relative flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
              >
                {/* Sidebar component, swap this element with another sidebar if you like */}
                {currentEmployee && (
                  <div className="flex grow flex-col overflow-y-auto bg-white px-6 py-4">
                    <EmployeeForm
                      readonly={true}
                      employee={currentEmployee}
                      onCancel={() => {
                        setCurrentEmployee(null);
                        setDetailSidebarOpen(false);
                      }}
                    />
                  </div>
                )}
              </DialogPanel>
            </div>
          </Dialog>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
              <div className="flex h-16 shrink-0 items-center">
                <img
                  alt="Your Company"
                  src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=cyan&shade=600"
                  className="h-8 w-auto"
                />
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-5">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-50 text-cyan-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-cyan-600",
                              "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={classNames(
                                item.current
                                  ? "text-cyan-600"
                                  : "text-gray-400 group-hover:text-cyan-600",
                                "size-6 shrink-0",
                              )}
                            />
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="-mx-2 mt-auto">
                    <a
                      href="#"
                      className="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-cyan-600"
                      onClick={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                    >
                      <ArrowRightStartOnRectangleIcon
                        aria-hidden="true"
                        className="size-6 shrink-0 text-gray-400 group-hover:text-cyan-600"
                      />
                      Logout
                    </a>
                  </li>
                  <li className="-mx-6">
                    <a
                      href="#"
                      className="flex items-center gap-x-2 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        className="size-8 rounded-full bg-gray-50"
                      />
                      <span className="sr-only">Your profile</span>
                      <span aria-hidden="true">
                        {account?.employee?.name ?? account?.email}
                      </span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main area */}
          <main className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
              <div className="flex-1 text-sm/6 font-semibold text-gray-900">
                Dashboard
              </div>
              <a href="#">
                <span className="sr-only">Your profile</span>
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="size-8 rounded-full bg-gray-50"
                />
              </a>
            </div>

            <div className="lg:pl-72 space-y-8">
              <div className="px-4 sm:px-6 lg:px-12 xl:px-16 space-y-4">
                {/* Information */}
                <div className="my-8 xl:my-10">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Employees
                  </h1>
                  <p className="mt-4 max-w-xl text-sm text-gray-700">
                    Through the Employee Management System (EMS), you can easily
                    manage employee data, track performance, and streamline HR
                    processes. You can add, update, and view employee profiles,
                    monitor attendance, and generate reports to make informed
                    decisions.
                  </p>
                </div>

                {/* Filters */}
                <Disclosure
                  as="section"
                  aria-labelledby="filter-heading"
                  className="border-t border-b border-gray-200"
                >
                  <h2 id="filter-heading" className="sr-only">
                    Filters
                  </h2>
                  <div className="flex items-center justify-between py-4 px-4">
                    <div className="flex-1 max-w-md">
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
                          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 size-5 text-gray-500"
                        />
                        <input
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
                      <button
                        className="rounded-md bg-cyan-600 px-2 py-1 text-xs font-semibold text-white shadow-xs hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 flex items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentEmployee({
                            accountId: null as unknown as string,
                            account: {
                              id: null as unknown as string,
                              email: "",
                            },
                            name: "",
                            departmentId: "",
                            department: null as unknown as IDepartment,
                            positionId: "",
                            position: null as unknown as IPosition,
                            dob: new Date(),
                          });
                          setRightSidebarOpen(true);
                        }}
                      >
                        Create
                      </button>

                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <div>
                          <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
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
                          className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white ring-1 shadow-2xl ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                        >
                          <div className="py-1">
                            {sortOptions.map((option) => (
                              <MenuItem key={option.name}>
                                <a
                                  onClick={() => setSortField(option.value)}
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
                  role="list"
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {data?.items?.map((employee) => (
                    <li
                      key={employee.id}
                      className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm"
                    >
                      <div className="flex w-full items-center justify-between space-x-6 p-6">
                        <div className="flex-1 truncate">
                          <div className="flex items-center space-x-3">
                            <h3
                              className="truncate text-sm font-medium text-gray-900 cursor-pointer"
                              onClick={() => {
                                setCurrentEmployee(employee);
                                setDetailSidebarOpen(true);
                                setRightSidebarOpen(false);
                              }}
                            >
                              {employee.name}{" "}
                              {employee.dob &&
                                `(${calculateDobAge(employee.dob)} yrs)`}
                            </h3>
                            <span className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                              {employee.department?.name}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-gray-500">
                            {employee.position?.name}
                          </p>
                        </div>
                        <img
                          alt=""
                          src={`https://picsum.photos/200?random=${employee.id}`}
                          className="size-10 shrink-0 rounded-full bg-gray-300"
                        />
                      </div>
                      <div>
                        <div className="-mt-px flex divide-x divide-gray-200">
                          <div className="flex w-0 flex-1">
                            <a
                              href={`mailto:${employee.account?.email}`}
                              className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 cursor-pointer"
                            >
                              <EnvelopeIcon
                                aria-hidden="true"
                                className="size-5 text-gray-400"
                              />
                              Email
                            </a>
                          </div>
                          <div className="-ml-px flex w-0 flex-1">
                            <span
                              className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 cursor-pointer"
                              onClick={() => {
                                setCurrentEmployee(employee);
                                setRightSidebarOpen(true);
                                setDetailSidebarOpen(false);
                              }}
                            >
                              <PencilIcon
                                aria-hidden="true"
                                className="size-5 text-gray-400"
                              />
                              Edit
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                <Pagination
                  currentPage={page}
                  onPageChange={setPage}
                  totalPages={Math.ceil((data?.total ?? 0) / limitPerPage)}
                ></Pagination>
              </div>
            </div>
          </main>
        </div>

        <div
          className={`shrink-0 border-t border-gray-200 px-4 py-6 sm:px-6 lg:w-96 lg:border-t-0 lg:border-l lg:pr-8 xl:pr-6 ${rightSidebarOpen ? "" : "hidden"}`}
        >
          {currentEmployee && (
            <EmployeeForm
              employee={currentEmployee}
              onCancel={() => {
                setCurrentEmployee(null);
                setRightSidebarOpen(false);
              }}
              onUpdated={handleOnEmployeeUpdated}
              onCreated={handleOnEmployeeCreated}
            />
          )}
        </div>

        <div
          className={`shrink-0 border-t border-gray-200 px-4 py-6 sm:px-6 lg:w-96 lg:border-t-0 lg:border-l lg:pr-8 xl:pr-6 ${detailSidebarOpen ? "" : "hidden"}`}
        >
          {currentEmployee && (
            <EmployeeForm
              readonly={true}
              employee={currentEmployee}
              onCancel={() => {
                setCurrentEmployee(null);
                setDetailSidebarOpen(false);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
