import { NavLink } from "react-router-dom";
import { IconCalendar, IconListCheck, IconFileText } from "@tabler/icons-react";

import classes from "./layout.module.css";

// get active menu item

export default function Nav({ close }: { close: () => void }) {
  const linkItems = [
    { href: "/", label: "Calendar", icon: IconCalendar },
    { href: "/documents", label: "Documents", icon: IconListCheck },
    { href: "/lists", label: "Lists", icon: IconFileText },
  ];

  const links = linkItems.map((item) => (
    <NavLink
      onClick={close}
      className={({ isActive }) => {
        return isActive ? `${classes.active} ${classes.link}` : classes.link;
      }}
      to={item.href}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </NavLink>
  ));
  return <nav className={classes.navbar}>{links}</nav>;
}
