import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, User, Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/authContext";
import { StratosLogo } from "./assets/StratosLogo";

interface HeaderProps {}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();

  // Use auth context safely with try/catch block to prevent errors during mounting
  let user = null;
  let isAuthenticated = false;
  let logout = async () => {};

  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
    logout = auth.logout;
  } catch (error) {
    console.log("Auth provider not ready yet");
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center min-w-[200px] h-[40px]">
                <StratosLogo color="#3B82F6" className="w-full h-full" />
              </div>
              <span className="ml-2 text-xl font-semibold text-primary">
                Show Room
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex space-x-8">
              {/* <Link
                href="/"
                className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Home
              </Link> */}

              <Link
                href="/videos"
                className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                VIDEOS
              </Link>
              <Link
                href="/audios"
                className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                AUDIO
              </Link>
              <Link
                href="/pictures"
                className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                PICTURE
              </Link>

              <Link
                href="/myspace"
                className="
    inline-flex items-center justify-center
    px-4 py-2 rounded-md
    bg-gradient-to-r from-primary to-primary/80
    text-white font-semibold text-sm
    shadow-md hover:shadow-lg
    transition-all duration-200 ease-in-out
    hover:scale-105
    hover:brightness-110
  "
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                MY SPACE
              </Link>

              {/* <Link
                href="/discover"
                className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Discover
              </Link>
              <Link
                href="/library"
                className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Library
              </Link>
              <Link
                href="/admin"
                className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Admin
              </Link> */}
            </nav>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="/"
                    className="text-lg font-medium hover:text-primary"
                  >
                    Home
                  </Link>
                  <Link
                    href="/videos"
                    className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
                  >
                    VIDEOS
                  </Link>
                  <Link
                    href="/audios"
                    className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
                  >
                    AUDIO
                  </Link>
                  <Link
                    href="/pictures"
                    className="text-neutral-900 hover:text-primary px-3 py-2 text-sm font-medium"
                  >
                    PICTURE
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
