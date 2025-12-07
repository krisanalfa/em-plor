"use client";

import { useState, ReactNode } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/lib/stores/auth.store";
import Image from "next/image";
import Link from "next/link";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navigation: NavigationItem[];
  pageTitle?: string;
}

export default function DashboardLayout({
  children,
  navigation,
  pageTitle,
}: DashboardLayoutProps) {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const { account, logout } = useAuthStore();

  return (
    <>
      {/* Mobile - Sidebar */}
      <Dialog
        open={navMenuOpen}
        onClose={setNavMenuOpen}
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
                  onClick={() => setNavMenuOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
              <div className="flex h-16 shrink-0 items-center">
                <Image
                  height={32}
                  width={37}
                  alt="Em-Plor"
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
                          <Link
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-50 text-cyan-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-cyan-600",
                              "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
                            )}
                            onNavigate={() => setNavMenuOpen(false)}
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
                          </Link>
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

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <Image
              width={32}
              height={37}
              alt="Em-Plor"
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
                      <Link
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
                      </Link>
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
                  <Image
                    width={32}
                    height={32}
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
      <div className="xl:pl-72">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setNavMenuOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div className="flex-1 text-sm/6 font-semibold text-gray-900">
            {pageTitle || "Dashboard"}
          </div>
          <a href="#">
            <span className="sr-only">Your profile</span>
            <Image
              width={32}
              height={32}
              alt=""
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="size-8 rounded-full bg-gray-50"
            />
          </a>
        </div>

        {/* Page content */}
        <main className="lg:pr-96">{children}</main>

        {/* Side bar */}
        <aside className="hidden lg:block lg:fixed lg:top-10 lg:right-0 lg:bottom-0 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-white/5 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Lorem Ipsum
          </h1>
          <p className="mt-4 max-w-xl text-sm text-gray-700">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam
            dolorum dolor odit praesentium corrupti reprehenderit id perferendis
            quas, aliquam eligendi. Similique iusto praesentium laboriosam
            sequi, perspiciatis fuga corrupti blanditiis iste!
          </p>
        </aside>
      </div>
    </>
  );
}
