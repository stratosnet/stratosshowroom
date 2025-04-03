import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
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
      </div>
    </footer>
  );
};

export default Footer;
