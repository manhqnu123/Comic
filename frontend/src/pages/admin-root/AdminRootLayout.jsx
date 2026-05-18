import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/admin-root/permissions", label: "Quản lý Quyền", icon: "🔐" },
  { path: "/admin-root/roles", label: "Quản lý Role", icon: "🔐" },
];

export default function AdminRootLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-primary">Root Panel</h1>
          <p className="text-xs text-muted-foreground">Hệ thống phân quyền</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors text-left"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
