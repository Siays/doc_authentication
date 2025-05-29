import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { LayoutContext } from "../context/LayoutContext";

const userNavigation = [
  { name: "Your Profile", to: "#" },
  { name: "Settings", to: "#" },
  { name: "Sign out", to: "/login" },
];

function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// for menu styling
const dropdownItemClass = "block w-full px-4 py-2 text-sm text-left text-gray-700";

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Home", to: "/home-page" },
    { name: "New Document", to: "/new-document" },
    { name: "Edit Document", to: "/edit-document" },
    { name: "Authenticate Document", to: "/authenticate-document" },
    ...(user?.is_super ? [{ name: "Create User", to: "/create-user" }] : []),
  ];

  const [title, setTitle] = useState("Default Page");

  return (
    <>
      <LayoutContext.Provider value={{ setTitle }}>
        <div className="min-h-full">
          <Disclosure as="nav" className="bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <NavLink to="/home-page">
                      <img
                        alt="Your Company"
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                        className="size-8"
                      />
                    </NavLink>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-[100px] flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.to}
                          className={({ isActive }) =>
                            classNames(
                              isActive
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "rounded-md px-3 py-2 text-sm font-medium"
                            )
                          }
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <MenuButton className="relative flex items-center p-1 bg-gray-600 rounded-full hover:ring-2 ring-indigo-300">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          {user?.profile_picture ? (
                            <img
                              alt="Profile Picture"
                              src={user.profile_picture}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-white text-3xl">
                              person
                            </span>
                          )}
                        </MenuButton>
                      </div>
                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                      >
                          {userNavigation.map((item) => (
    <MenuItem key={item.name}>
      {({ active }) => {
        const itemClasses = classNames(
          active ? "bg-gray-100" : "",
          dropdownItemClass
        );

        return item.name === "Sign out" ? (
          <button onClick={logout} className={itemClasses}>
            {item.name}
          </button>
        ) : (
          <NavLink to={item.to!} className={itemClasses}>
            {item.name}
          </NavLink>
        );
      }}
    </MenuItem>
  ))}
                      </MenuItems>
                    </Menu>
                    <div className="ml-4 flex flex-col items-start text-left leading-tight text-white min-w-0">
                      <span className="font-bold truncate max-w-[160px] md:max-w-[200px] lg:max-w-[250px]">
                        {user?.name}
                      </span>
                      <span className="text-xs text-gray-300 break-all">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    <Bars3Icon
                      aria-hidden="true"
                      className="block size-6 group-data-open:hidden"
                    />
                    <XMarkIcon
                      aria-hidden="true"
                      className="hidden size-6 group-data-open:block"
                    />
                  </DisclosureButton>
                </div>
              </div>
            </div>

            <DisclosurePanel className="md:hidden">
              {/* <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium',
                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div> */}
              <div className="border-t border-gray-700 pt-4 pb-3">
                <div className="flex items-center px-5">
                  <div className="shrink-0">
                    <img alt="" src={"#"} className="size-10 rounded-full" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base/5 font-medium text-white">
                      User name{/*user.name*/}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      Email {/*user.email*/}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) =>
                    item.name === "Sign out" ? (
                      <DisclosureButton
                        key={item.name}
                        as="button"
                        onClick={logout}
                        className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </DisclosureButton>
                    ) : (
                      <NavLink
                        key={item.name}
                        to={item.to!}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? "bg-gray-700 text-white"
                              : "text-gray-400 hover:bg-gray-700 hover:text-white",
                            "block rounded-md px-3 py-2 text-base font-medium"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    )
                  )}
                </div>
              </div>
            </DisclosurePanel>
          </Disclosure>

          <header className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {title}
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </LayoutContext.Provider>
    </>
  );
}
