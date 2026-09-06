"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, LogOut, LogIn, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCustomerSession, customerSignOut, CustomerSession } from "@/lib/actions/auth";

export function CustomerAccountBtn() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getCustomerSession().then((res) => {
      if (isMounted) {
        setSession(res);
        setIsLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoaded) {
    return (
      <Link href="/login">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 gap-2 px-3.5 rounded-full text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
      </Link>
    );
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-2 px-4 rounded-full border-border/80 text-sm font-bold hover:border-primary/50"
        >
          <LogIn className="h-4 w-4 text-primary" />
          <span>Sign In</span>
        </Button>
      </Link>
    );
  }

  const displayName = session.name.split(" ")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 px-3.5 rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10 text-sm font-bold text-foreground transition-all"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-black">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[100px] truncate">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl rounded-xl">
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <div className="flex flex-col space-y-0.5">
            <p className="text-xs font-bold text-foreground leading-none">{session.name}</p>
            <p className="text-[11px] text-muted-foreground font-mono">{session.phone}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/orders" />} className="cursor-pointer">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium w-full">
            <Package className="h-3.5 w-3.5 text-primary" />
            <span>My Orders & Status</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/" />} className="cursor-pointer">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium w-full">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Browse Catalog</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => customerSignOut()}
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-destructive cursor-pointer hover:bg-destructive/10"
        >
          <div className="flex items-center gap-2 w-full">
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
