
import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "./BottomNav";
import { EMOJI_OPTIONS } from "@/constants/emoji-constants";

const Layout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-cake-pink dark:bg-purple-900 bg-opacity-90 dark:bg-opacity-90 shadow-md py-4 px-4 fixed w-full z-10 top-0 easter-gradient">
        <div className="container mx-auto flex items-center justify-center relative">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl animate-wiggle inline-block">
              {EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)]}
            </span>
            <span className="drop-shadow-md whitespace-nowrap">{t("layout.appTitle")}</span>
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 mt-16 mb-20 relative">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default Layout;
