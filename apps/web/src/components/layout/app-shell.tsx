"use client";

import { BarChart3, FolderKanban, LogOut, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/projects/new", label: "New Project", icon: Plus },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await api.post("/auth/logout");
    toast.success("Signed out");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card/80 p-4 backdrop-blur lg:block">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Team Task Manager</p>
            <p className="text-xs text-muted-foreground">Project operations</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  isActive && "bg-secondary text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button className="absolute bottom-4 left-4 right-4" variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm text-muted-foreground">Workspace</p>
            <h1 className="text-lg font-semibold">Task operations dashboard</h1>
          </div>
          <Button size="sm" asChild>
            <Link href="/projects">Open projects</Link>
          </Button>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
