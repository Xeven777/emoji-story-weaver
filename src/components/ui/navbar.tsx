import { Link } from "react-router-dom";
import { Button } from "./button";
import { Plus, Search } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b sticky top-0 z-40 backdrop-blur-lg bg-background/20">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg inline-flex">
          😉{" "}
          <span className="md:block hidden hover:text-primary">
            Emoji Story Weaver
          </span>
        </Link>
        <div className="space-x-4 flex items-center">
          <Button variant="ghost" asChild>
            <Link to="/">
              <span>
                <Plus />
              </span>
              Create Story
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/stories">
              <span>
                <Search />
              </span>
              Browse Stories
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
