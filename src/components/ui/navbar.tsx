import { Link } from "react-router-dom";
import { Button } from "./button";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          Emoji Story Weaver
        </Link>
        <div className="space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/">Create Story</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/stories">Browse Stories</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
