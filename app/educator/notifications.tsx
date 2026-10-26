"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { loadNotifications, markNotificationsRead } from "./actions";
import type { HomeIncidentNotification } from "@/lib/educator-roster";
import { ENERGY_LEVELS, INCIDENT_MOODS } from "@/lib/incident";

const POLL_MS = 60_000;

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationBell({ initial }: { initial: HomeIncidentNotification[] | null }) {
  const [items, setItems] = useState<HomeIncidentNotification[]>(initial ?? []);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const unread = items.filter((item) => !item.read).length;

  useEffect(() => {
    if (initial) setItems(initial);
  }, [initial]);

  useEffect(() => {
    if (!initial) return;
    const timer = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        setItems(await loadNotifications());
      } catch {}
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [initial]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = (ids: string[]) => {
    if (ids.length === 0) return;
    setItems((current) => current.map((item) => (ids.includes(item.id) ? { ...item, read: true } : item)));
    markNotificationsRead(ids).catch(() => {});
  };

  return (
    <div className="notification-wrap" ref={wrapRef}>
      <button
        className="icon-button notification-button"
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        {unread > 0 ? <span className="notification-badge">{unread > 9 ? "9+" : unread}</span> : null}
        <Bell size={18} />
      </button>

      {open ? (
        <div className="notification-panel" role="dialog" aria-label="Home incident notifications">
          <div className="notification-panel-head">
            <div>
              <strong>Home incidents</strong>
              <small>Reported by parents</small>
            </div>
            {unread > 0 ? (
              <button
                className="notification-mark"
                type="button"
                onClick={() => markRead(items.filter((item) => !item.read).map((item) => item.id))}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="notification-empty">No home incidents yet.</p>
          ) : (
            <ul className="notification-list">
              {items.map((item) => {
                const mood = INCIDENT_MOODS.find((option) => option.id === item.mood);
                const energy = ENERGY_LEVELS.find((option) => option.id === item.energy);
                return (
                  <li key={item.id}>
                    <button
                      className={`notification-item${item.read ? "" : " is-unread"}`}
                      type="button"
                      onClick={() => markRead([item.id])}
                    >
                      <span className="notification-emoji" aria-hidden="true">
                        {mood?.emoji ?? "🏠"}
                      </span>
                      <span className="notification-copy">
                        <strong>
                          {item.studentName} · {mood?.label ?? "Home incident"}
                        </strong>
                        <span>
                          {item.parentName} reported from home
                          {energy ? ` · ${energy.label} energy` : ""}
                        </span>
                        {item.note ? <span className="notification-note">{item.note}</span> : null}
                        <small>{formatWhen(item.occurredAt)}</small>
                      </span>
                      {item.read ? null : <span className="notification-unread-dot" aria-label="Unread" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
