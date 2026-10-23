"use client";

import { useState } from "react";
import { campus } from "../data";

export default function SchoolAdminSettingsPage() {
  const [calmMode, setCalmMode] = useState(false);
  const [familyNotes, setFamilyNotes] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div className="admin-content" style={{ maxWidth: "760px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">SETTINGS</p>
          <h1>Settings</h1>
          <p className="dashboard-subtitle">Campus details and how {campus.name} uses Equilinks.</p>
        </div>
      </section>

      <form
        className="dashboard-panel school-admin-settings"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <label htmlFor="school-name">School name</label>
        <input id="school-name" name="school-name" defaultValue={campus.name} />

        <label htmlFor="school-email">Campus email</label>
        <input id="school-email" name="school-email" type="email" defaultValue="hello@harborview.edu" />

        <label htmlFor="school-phone">Phone</label>
        <input id="school-phone" name="school-phone" type="tel" defaultValue="(555) 014-2200" />

        <label className="school-admin-toggle">
          <input
            type="checkbox"
            checked={calmMode}
            onChange={(event) => {
              setCalmMode(event.target.checked);
              setSaved(false);
            }}
          />
          <span>
            <strong>Calm display</strong>
            <small>Softer contrast for shared classroom screens.</small>
          </span>
        </label>

        <label className="school-admin-toggle">
          <input
            type="checkbox"
            checked={familyNotes}
            onChange={(event) => {
              setFamilyNotes(event.target.checked);
              setSaved(false);
            }}
          />
          <span>
            <strong>Family notes</strong>
            <small>Show parent messages on the overview.</small>
          </span>
        </label>

        <div className="school-admin-settings-actions">
          <button className="add-student-button" type="submit">
            Save settings
          </button>
          {saved ? <p role="status">Settings saved for this session.</p> : null}
        </div>
      </form>
    </div>
  );
}
