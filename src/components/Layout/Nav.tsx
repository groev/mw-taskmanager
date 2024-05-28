import { NavLink } from "react-router-dom";
import { Stack } from "@mantine/core";

import { IconCalendar, IconListCheck, IconFileText } from "@tabler/icons-react";

import classes from "./layout.module.css";

// get active menu item

export default function Nav() {
  const linkItems = [
    { href: "/", label: "Calendar", icon: IconCalendar },
    { href: "/documents", label: "Documents", icon: IconFileText },
    { href: "/lists", label: "Lists", icon: IconListCheck },
  ];

  const links = linkItems.map((item) => (
    <NavLink
      className={({ isActive }) => {
        return isActive ? `${classes.active} ${classes.link}` : classes.link;
      }}
      to={item.href}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
    </NavLink>
  ));
  return (
    <Stack mt="xl" className={classes.navbar}>
      {links}
    </Stack>
  );
}
