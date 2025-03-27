
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="text-xl font-bold text-brand-800">
            FinalRound
          </Link>
          <p className="mt-2 text-gray-600 text-sm">
            Simplifying the interview process for both hiring teams and candidates.
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Product</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link to="/features" className="text-sm text-gray-600 hover:text-brand-700">
                Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-sm text-gray-600 hover:text-brand-700">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/integrations" className="text-sm text-gray-600 hover:text-brand-700">
                Integrations
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link to="/about" className="text-sm text-gray-600 hover:text-brand-700">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="text-sm text-gray-600 hover:text-brand-700">
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-sm text-gray-600 hover:text-brand-700">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Resources</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link to="/help" className="text-sm text-gray-600 hover:text-brand-700">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-brand-700">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-brand-700">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} FinalRound. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
