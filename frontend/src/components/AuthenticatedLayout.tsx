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
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { LayoutContext } from "../context/LayoutContext";
import { useNotification } from "../context/NotificationContext";

const userNavigation = [
  { name: "Update Account", to: "/modify-user" },
  { name: "Sign out", to: "#" },
];

function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// for menu styling
const dropdownItemClass =
  "block w-full px-4 py-2 text-sm text-left text-gray-700";

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
 

  const profilePictureURL = user?.profile_picture
    ? `${user.profile_picture}`
    : null;

  const navigation = [
    { name: "Home", to: "/home-page" },
    { name: "New Document", to: "/new-document" },
    { name: "Edit Document", to: "/edit-document" },
    { name: "Authenticate Document", to: "/authenticate-document" },
    ...(user?.is_super ? [    
      { name: "Recover Document", to: "/recover-document"},
      { name: "Create User", to: "/create-user" }, 
    ] : []),
  ];

  const { notifications, hasUnread, markAsRead, markAllAsRead } = useNotification();
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
                    <Menu as="div" className="relative">
                      <Menu.Button className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                        {hasUnread && (
                          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                      </Menu.Button>

                      <Menu.Items className="absolute right-0 z-50 mt-2 w-[360px] max-h-[300px] overflow-y-auto rounded-md border border-gray-200 bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="mb-2 flex justify-between border-b pb-2">
                          <span className="font-semibold">Notifications</span>
                          <button
                            onClick={markAllAsRead}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            Read all
                          </button>
                        </div>
                        <div className="space-y-3">
                          {notifications.length === 0 ? (
                            <p className="text-sm text-gray-500">
                              No notifications
                            </p>
                          ) : (
                            notifications
                              .slice()
                              .map((notification) => (
                                <div
                                  key={notification.notification_id}
                                  className={`border-b pb-2 text-sm last:border-0 ${
                                    notification.has_read
                                      ? "bg-white cursor-default"
                                      : "bg-blue-50 cursor-pointer hover:bg-blue-100"
                                  }`}
                                  onClick={() => {
                                    if (!notification.has_read) {
                                      console.log(
                                        "Clicked notification:",
                                        notification
                                      );
                                      markAsRead(
                                        notification.notification_id
                                      );
                                    }
                                  }}
                                  tabIndex={notification.has_read ? -1 : 0}
                                  aria-disabled={notification.has_read}
                                >
                                  <p className="text-gray-800">
                                    {notification.message}
                                  </p>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>
                                      {new Date(
                                        notification.created_at
                                      ).toLocaleString() || "Invalid Date"}
                                    </span>
                                    {!notification.has_read && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(
                                            notification.notification_id
                                          );
                                        }}
                                        className="text-blue-500 hover:underline"
                                      >
                                        Read
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </Menu.Items>
                    </Menu>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <MenuButton className="relative flex items-center p-1 bg-gray-600 rounded-full hover:ring-2 ring-indigo-300">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          {user?.profile_picture ? (
                            <img
                              alt="Profile Picture"
                              src={profilePictureURL || "#"}
                              className="h-10 w-10 rounded-full object-cover"
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
                                <button
                                  onClick={logout}
                                  className={itemClasses}
                                >
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
              <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block rounded-md px-3 py-2 text-base font-medium"
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 pb-3">
                <div className="flex items-center px-5">
                  <div className="shrink-0">
                    <img
                      alt="Profile Picture"
                      src={profilePictureURL || "#"}
                      className="size-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {user?.name}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {user?.email}
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
