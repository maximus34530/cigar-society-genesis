import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut, Settings, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function ProfileMenu({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { profile, signOut, user, isAdmin } = useAuth();

  if (!user) return null;

  const displayName = profile?.full_name?.trim() || user.email || "Account";
  const fallback = (displayName[0] ?? "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn("h-10 px-2 gap-2 hover:bg-muted/60", className)}
        >
          <Avatar className="h-8 w-8 border border-border/60">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-muted text-foreground/80">{fallback}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-body text-foreground/80 max-w-[12rem] truncate">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-body">Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          {isAdmin ? (
            <Link to="/admin" className="cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin dashboard
            </Link>
          ) : (
            <Link to="/dashboard" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Manage account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

