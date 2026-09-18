import {
  Home,
  MessageSquare,
  Users,
  BarChart3,
  Search,
  ClipboardList,
  ClipboardCheck,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Home", href: "/dashboard", icon: Home }],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Ask Coach", href: "/dashboard/ask-coach", icon: MessageSquare },
      { label: "Players", href: "/dashboard/players", icon: Users },
      { label: "Teams", href: "/dashboard/teams", icon: BarChart3 },
    ],
  },
  {
    label: "Game",
    items: [
      { label: "Scouting", href: "/dashboard/scouting", icon: Search },
      { label: "Pre-Match", href: "/dashboard/pre-match", icon: ClipboardList },
      { label: "Post-Match", href: "/dashboard/post-match", icon: ClipboardCheck },
    ],
  },
  {
    label: "Coaching",
    items: [{ label: "Practice Planner", href: "/dashboard/practice", icon: Calendar }],
  },
];
