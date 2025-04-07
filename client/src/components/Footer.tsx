import { Link } from "wouter";
import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-8">
      <footer className="mt-16 py-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center gap-2 mb-4 md:mb-0">
            <a
              href="https://github.com/stratosnet/stratosshowroom"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github size={18} />
              <span>Download from GitHub</span>
            </a>
          </div>
          <div className="flex space-x-6">
            <p className="text-gray-500 text-sm">
              Powered by{" "}
              <a
                href="https://www.thestratos.org/"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Stratos Show Room
              </a>
            </p>
            {/* <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
              How It Works
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
              Terms
            </a> */}
          </div>
        </div>
      </footer>
      {/* <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="ml-2 text-lg font-semibold text-primary">
                Stratos Show Room
              </span>
            </Link>
            <span className="text-sm text-neutral-500 ml-4">
              © {new Date().getFullYear()} Stratos. All rights reserved.
            </span>
          </div>
        </div>
      </div> */}
    </footer>
  );
};

export default Footer;
