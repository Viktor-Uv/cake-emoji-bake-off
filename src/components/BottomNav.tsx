
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Star, User, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 w-full bg-white shadow-lg rounded-t-xl border-t z-20">
      <div className="container flex items-center justify-around py-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 transition-colors ${
              isActive ? "text-primary" : "text-gray-500"
            }`
          }
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">{t("layout.feed")}</span>
        </NavLink>

        <NavLink
          to="/top-rated"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 transition-colors ${
              isActive ? "text-primary" : "text-gray-500"
            }`
          }
        >
          <Star className="w-6 h-6" />
          <span className="text-xs">{t("layout.topRated")}</span>
        </NavLink>

        {user && (
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `flex flex-col items-center p-2 transition-colors ${
                isActive ? "text-primary" : "text-gray-500"
              }`
            }
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-xs">{t("layout.addCake")}</span>
          </NavLink>
        )}

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 transition-colors ${
              isActive ? "text-primary" : "text-gray-500"
            }`
          }
        >
          {user ? (
            <span className="text-xl">{user.emojiAvatar}</span>
          ) : (
            <User className="w-6 h-6" />
          )}
          <span className="text-xs">{t("layout.profile")}</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
