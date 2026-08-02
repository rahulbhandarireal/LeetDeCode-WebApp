import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router"; // or "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Import both Login and Logout icons
import { faArrowRightToBracket, faArrowRightFromBracket, faCode } from '@fortawesome/free-solid-svg-icons';
import { ROUTES } from '../constants/routes';
import { STORAGE_KEYS } from '../constants/storage';

function Navbar() {
  const location = useLocation(); // Forces re-render on route change
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
  const navigate=useNavigate();

  function logout(){
    console.log("logout triggered for " + username);
    localStorage.clear();
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="flex flex-row gap-8 lg:gap-30 px-6 py-2 bg-gradient-to-r from-[#0d0d0d] via-[#1a130c] to-[#0d0d0d] items-center h-[80px] border-b border-orange-900/20 shadow-md shadow-orange-900/10">
      <h1 className="font-extrabold font-headline text-2xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate(ROUTES.HOME)}>
        <FontAwesomeIcon icon={faCode} className="text-gray-400 text-xl" />
        <span className="bg-gradient-to-r from-[var(--color-logo)] to-yellow-500 bg-clip-text text-transparent">
          LEET DECODE
        </span>
      </h1>
      <ul className="flex flex-row justify-between w-full md:w-8/12 text-lg lg:text-xl">
        <li><NavItem to={ROUTES.HOME} label="Home" /></li>
        <li><NavItem to={ROUTES.FRIENDS} label="Friends" /></li>
        <li><NavItem to={ROUTES.SHEETS} label="Sheets" /></li>
        <li><NavItem to={ROUTES.BATTLE} label="Battle" /></li>
        <li className="flex items-center cursor-pointer ml-auto">
          {username == null ? (
            <div className="flex items-center gap-2 text-neutral-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all" onClick={() => navigate(ROUTES.LOGIN)}>
              <span>Login</span>
              <FontAwesomeIcon icon={faArrowRightToBracket} />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-400 hover:text-orange-300 px-4 py-2 rounded-lg hover:bg-orange-500/10 transition-all font-bold" onClick={() => logout()}>
              <span>Logout</span>
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}


function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 relative overflow-hidden ${
          isActive
            ? "text-[var(--color-logo)] font-extrabold translate-x-1 cursor-default bg-gradient-to-t from-orange-500/10 to-transparent"
            : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 hover:scale-105"
        }`
      }
    >  
      {({ isActive }) => (
        <>
          <span className="relative z-10">{label}</span>
          {isActive && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--color-logo)] to-transparent" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default Navbar;
