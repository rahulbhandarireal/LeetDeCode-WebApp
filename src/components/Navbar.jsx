import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router"; // or "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Import both Login and Logout icons
import { faArrowRightToBracket, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const location = useLocation(); // Forces re-render on route change
  const username = localStorage.getItem("name");
  const navigate=useNavigate();

  function logout(){
    console.log("licked"+username);
    localStorage.removeItem("name");
    navigate("/")
  }

  return (
    <div className="flex flex-row gap-30 p-2 bg-[var(--color-background)] items-center h-[80px]">
      <h1 className="text-[var(--color-logo)] font-bold text-2xl">LEET DECODE</h1>
      <ul className="flex flex-row justify-between w-8/12 text-xl">
        <li><NavItem to={"Home"} /></li>
        <li><NavItem to={"Friends"} /></li>
        <li><NavItem to={"Sheets"} /></li>
        <li><NavItem to={"Battle"} /></li>
        <li className="flex items-center cursor-pointer">
          {username == null ? (
            <div className="flex items-center gap-2 text-neutral-500 hover:text-white">
              <span>Login</span>
              <FontAwesomeIcon icon={faArrowRightToBracket} />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[var(--color-logo)]
            " onClick={() => logout()}>
              <span>Logout</span>
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}


function NavItem({ to }) {
  return (
    
    <NavLink
      to={`/${to}`}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-sm transition ${
          isActive
            ? "bg-[#2a2a2a] text-[var(--color-logo)] font-extrabold translate-x-1 cursor-default "
            : "text-neutral-500 hover:bg-[#353535] hover:text-neutral-300"
        }`
      }
    >  
  {({ isActive }) => (
    <>
      {to}
      {isActive && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-[var(--color-logo)]" />
      )}
    </>
  )}
    </NavLink>
    
  );
}

export default Navbar;
