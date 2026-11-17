import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "./components/Sidebar";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": {
    title: "DASHBOARD",
    subtitle: "Overview of your content",
  },
  "/admin/products": {
    title: "PRODUCTS",
    subtitle: "Manage your product catalog",
  },
  "/admin/highlights": {
    title: "HIGHLIGHTS",
    subtitle: "Manage athlete highlight reels",
  },
  "/admin/reviews": {
    title: "REVIEWS",
    subtitle: "Manage customer reviews",
  },
  "/admin/promotions": {
    title: "PROMOTIONS",
    subtitle: "Manage homepage promotional slides",
  },
};

const AdminPanel = () => {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] ?? pageMeta["/admin/dashboard"];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-black lg:h-screen lg:overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
        <header className="flex min-h-18 items-center gap-3 border-b border-white/5 px-4 sm:px-6 lg:shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center text-descText2 transition hover:bg-white/5 hover:text-floesky lg:hidden"
          >
            <FaBars size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="font-montserrat text-xl font-bold tracking-[2px] text-white">
              {meta.title}
            </h1>
            <p className="mt-0.5 truncate font-montserrat text-[11px] tracking-wider text-descText2 sm:text-[12px]">
              {meta.subtitle}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
