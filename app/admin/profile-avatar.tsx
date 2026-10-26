import type { SidebarProfile } from "@/lib/sidebar-profile";

const imageStyle = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
  borderRadius: "50%",
};

export function ProfileAvatar({ profile }: { profile: SidebarProfile }) {
  return (
    <span className="profile-avatar" style={{ position: "relative" }}>
      {profile.avatar ? <img src={profile.avatar} alt="" style={imageStyle} /> : profile.initials}
      <span className="profile-avatar-online" title="Online" style={{ zIndex: 1 }} />
    </span>
  );
}

export function TopbarAvatar({ profile }: { profile: SidebarProfile }) {
  return (
    <span className="topbar-avatar" title={profile.name} style={{ position: "relative", overflow: "hidden" }}>
      {profile.avatar ? <img src={profile.avatar} alt="" style={imageStyle} /> : profile.initials}
    </span>
  );
}
