export const campus = {
  name: "Harborview Learning Center",
  type: "Inclusive Support Center",
};

export type PersonStatus = "Active" | "Pending Invite" | "Inactive";

export interface CampusPerson {
  id: string;
  firstname?: string;
  surname?: string;
  name: string;
  email: string;
  initials: string;
  role: "Educator" | "Parent";
  detail: string;
  status: PersonStatus;
  lastActive: string;
  avatar?: string;
  avatarColor: "green" | "coral" | "blue" | "amber" | "purple";
}

export interface CampusStudent {
  id: string;
  firstname: string;
  surname: string;
  name: string;
  initials: string;
  school: string;
  classId: string | null;
  avatar?: string;
  parentIds: string[];
  guardians: string;
  status: PersonStatus;
  lastActive: string;
  avatarColor: CampusPerson["avatarColor"];
}

export const educators: CampusPerson[] = [
  {
    id: "edu-1",
    name: "Sarah Lin",
    email: "sarah.lin@harborview.edu",
    initials: "SL",
    role: "Educator",
    detail: "Room 8 · Visual schedules",
    status: "Active",
    lastActive: "Today, 8:40 AM",
    avatarColor: "green",
  },
  {
    id: "edu-2",
    name: "Noah Patel",
    email: "noah.patel@harborview.edu",
    initials: "NP",
    role: "Educator",
    detail: "Room 4 · Literacy",
    status: "Active",
    lastActive: "Today, 8:12 AM",
    avatarColor: "blue",
  },
  {
    id: "edu-3",
    name: "Amelia Brooks",
    email: "amelia.brooks@harborview.edu",
    initials: "AB",
    role: "Educator",
    detail: "Room 2 · Early years",
    status: "Active",
    lastActive: "Yesterday",
    avatarColor: "amber",
  },
  {
    id: "edu-4",
    name: "Chris Adeyemi",
    email: "chris.adeyemi@harborview.edu",
    initials: "CA",
    role: "Educator",
    detail: "Learning support",
    status: "Pending Invite",
    lastActive: "Never",
    avatarColor: "purple",
  },
];

export const parents: CampusPerson[] = [
  {
    id: "par-1",
    name: "Eleanor Vance",
    email: "e.vance@family.org",
    initials: "EV",
    role: "Parent",
    detail: "Guardian of Avery Morgan",
    status: "Active",
    lastActive: "Today, 9:15 AM",
    avatarColor: "green",
  },
  {
    id: "par-2",
    name: "Beatrice Kim",
    email: "b.kim@pacificreach.io",
    initials: "BK",
    role: "Parent",
    detail: "Guardian of Sam Kim",
    status: "Active",
    lastActive: "Yesterday",
    avatarColor: "coral",
  },
  {
    id: "par-3",
    name: "Priya Shah",
    email: "priya.shah@email.com",
    initials: "PS",
    role: "Parent",
    detail: "Guardian of Leela Shah",
    status: "Active",
    lastActive: "Today, 7:50 AM",
    avatarColor: "blue",
  },
  {
    id: "par-4",
    name: "Owen Blake",
    email: "owen.blake@email.com",
    initials: "OB",
    role: "Parent",
    detail: "Guardian of Miles Blake",
    status: "Pending Invite",
    lastActive: "Never",
    avatarColor: "amber",
  },
];

export const activities = [
  {
    id: "act-1",
    title: "Accommodation updated",
    description: "Sarah Lin refreshed the visual schedule for Room 8.",
    time: "25m ago",
    category: "Educator",
  },
  {
    id: "act-2",
    title: "Parent note received",
    description: "Eleanor Vance shared a morning transit note for Avery.",
    time: "1h ago",
    category: "Parent",
  },
  {
    id: "act-3",
    title: "Student checked in",
    description: "Rowan Ellis arrived and joined the quiet start group.",
    time: "2h ago",
    category: "Student",
  },
  {
    id: "act-4",
    title: "Invite waiting",
    description: "Chris Adeyemi has not opened the educator invite.",
    time: "Yesterday",
    category: "Educator",
  },
];
