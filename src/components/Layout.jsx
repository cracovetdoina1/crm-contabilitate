const menuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "firme", label: "Firme contabilitate" },
  { id: "clienti", label: "Clienți" },
  { id: "contracte", label: "Contracte" },
  { id: "documente", label: "Documente" }
];

function Layout({ activeModule, onChangeModule, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>CRM Contabilitate</h1>
          <p>MVP operațional</p>
        </div>

        <nav className="nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${activeModule === item.id ? "active" : ""}`}
              onClick={() => onChangeModule(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
