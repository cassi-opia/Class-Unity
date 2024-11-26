'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs"; // Import useUser hook as well

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  visible: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MenuSkeleton = () => (
  <div className="mt-4 text-sm animate-pulse">
    {[1, 2].map((section) => (
      <div key={section} className="flex flex-col gap-2 mb-8">
        <div className="hidden lg:block h-4 w-20 bg-gray-200 rounded mb-4"></div>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="hidden lg:block h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Menu = () => {
  const [menuData, setMenuData] = useState<MenuSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        // Get the user's role from user.publicMetadata
        const role = (user.publicMetadata?.role as string) || 'student';

        const getDashboardLink = (role: string) => {
          switch (role) {
            case 'admin':
              return '/admin';
            case 'teacher':
              return '/teacher';
            case 'student':
              return '/student';
            default:
              return '/';
          }
        };

        const menuItems: MenuSection[] = [
          {
            title: "MENU",
            items: [
              {
                icon: "/home.png",
                label: "Dashboard",
                href: getDashboardLink(role),
                visible: ["admin", "teacher", "student", "parent"],
              },
              {
                icon: "/teacher.png",
                label: "Teachers",
                href: "/list/teachers",
                visible: ["admin", "teacher"],
              },
              {
                icon: "/student.png",
                label: "Students",
                href: "/list/students",
                visible: ["admin", "teacher"],
              },
              // {
              //   icon: "/parent.png",
              //   label: "Parents",
              //   href: "/list/parents",
              //   visible: ["admin", "teacher"],
              // },
              {
                icon: "/subject.png",
                label: "Courses",
                href: "/list/courses",
                visible: ["admin"],
              },
              {
                icon: "/class.png",
                label: "Classes",
                href: "/list/classes",
                visible: ["admin", "teacher"],
              },
              {
                icon: "/lesson.png",
                label: "Chapters",
                href: "/list/chapters",
                visible: ["admin", "teacher"],
              },
              {
                icon: "/exam.png",
                label: "Exams",
                href: "/list/exams",
                visible: ["admin", "teacher", "student", "parent"],
              },
              {
                icon: "/assignment.png",
                label: "Assignments",
                href: "/list/assignments",
                visible: ["admin", "teacher", "student", "parent"],
              },
              {
                icon: "/result.png",
                label: "Results",
                href: "/list/results",
                visible: ["admin", "teacher", "student", "parent"],
              },
              // {
              //   icon: "/attendance.png",
              //   label: "Attendance",
              //   href: "/list/attendance",
              //   visible: ["admin", "teacher", "student", "parent"],
              // },
              {
                icon: "/calendar.png",
                label: "Events",
                href: "/list/events",
                visible: ["admin", "teacher", "student", "parent"],
              },
              {
                icon: "/message.png",
                label: "Messages",
                href: "/chat",
                visible: ["admin", "teacher", "student"],
              },
              {
                icon: "/announcement.png",
                label: "Announcements",
                href: "/list/announcements",
                visible: ["admin", "teacher", "student", "parent"],
              },
            ],
          },
          {
            title: "OTHER",
            items: [
              {
                icon: "/profile.png",
                label: "Profile",
                href: "/profile",
                visible: ["admin", "teacher", "student", "parent"],
              },
              {
                icon: "/setting.png",
                label: "Settings",
                href: "/settings",
                visible: ["admin", "teacher", "student", "parent"],
              },
              {
                icon: "/logout.png",
                label: "Logout",
                href: "/logout",
                visible: ["admin", "teacher", "student", "parent"],
              },
            ],
          },
        ];

        // Filter menu items based on user role
        const filteredMenuItems = menuItems.map(section => ({
          ...section,
          items: section.items.filter(item => item.visible.includes(role))
        }));

        setMenuData(filteredMenuItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load menu. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, user]);

  if (loading) {
    return <MenuSkeleton />;
  }
  
  if (error) {
    return (
      <div className="mt-4 text-sm text-red-500">
        {error} <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }

  if (!menuData) {
    return null;
  }

  return (
    <div className="mt-4 text-sm">
      {menuData.map((section: MenuSection) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item: MenuItem) => {
            const userRole = (user?.publicMetadata?.role as string) || 'student';
            if (item.visible.includes(userRole)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
