
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Transform your</span>
            <span className="block text-brand-700">interview process</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            FinalRound helps companies streamline their hiring pipeline and find the best candidates faster.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-brand-700 hover:bg-brand-800 text-white px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-brand-700 border-brand-200 hover:bg-brand-50 px-8 py-6">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-16 sm:mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
          <div className="absolute inset-0">
            <div className="bg-gradient-to-r from-brand-700 to-brand-900 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-700 to-brand-900 mix-blend-multiply" />
          </div>
          <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Dashboard Preview
            </h2>
            <p className="mt-6 max-w-lg mx-auto text-xl text-white">
              Visualize your entire candidate pipeline in one place.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="h-72 bg-white/10 backdrop-blur-sm rounded-lg w-full max-w-4xl mx-auto flex items-center justify-center">
                <p className="text-white text-lg font-medium">Dashboard Interface</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
