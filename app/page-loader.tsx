export function PageLoader({
  label,
  frame,
  full,
  compact,
}: {
  label: string;
  frame?: { section: string; title: string };
  full?: boolean;
  compact?: boolean;
}) {
  const loader = (
    <div className={compact ? "page-loader page-loader-compact" : "page-loader"} role="status" aria-live="polite">
      <span className="page-loader-ring" aria-hidden="true" />
      <p>Loading {label}</p>
    </div>
  );

  if (frame) {
    return (
      <main className="admin-main" style={full ? { marginLeft: 0, width: "100%" } : undefined}>
        <header className="admin-topbar">
          <div className="breadcrumb">
            <span>{frame.section}</span>
            <b>/</b>
            <strong>{frame.title}</strong>
          </div>
        </header>
        <div className="admin-content">{loader}</div>
      </main>
    );
  }

  if (full) {
    return (
      <main className="admin-main" style={{ marginLeft: 0, width: "100%" }}>
        <div className="admin-content">{loader}</div>
      </main>
    );
  }

  return loader;
}
