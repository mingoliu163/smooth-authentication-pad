
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, BarChart3, User, Calendar, Clock, BrainCircuit, FileCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      
      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trusted by companies worldwide
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Our platform has helped hundreds of companies improve their hiring process.
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Companies
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-brand-700">500+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Interviews
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-brand-700">50k+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Successful Hires
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-brand-700">10k+</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* New Assessment Feature Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-10 lg:mb-0">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
                Standardized Candidate Assessments
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Evaluate all candidates with the same objective criteria using our customizable assessment templates.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileCheck className="h-6 w-6 text-brand-700" />
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Technical skills assessments with automated scoring
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileCheck className="h-6 w-6 text-brand-700" />
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Behavioral interview questionnaires to evaluate culture fit
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileCheck className="h-6 w-6 text-brand-700" />
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Customizable templates for different roles and departments
                  </p>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/questionnaires">
                  <Button className="bg-brand-700 hover:bg-brand-800 text-white">
                    Explore Assessments
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Sample Assessment</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-700">1. Technical Question</p>
                    <p className="text-gray-600 mt-1">Explain the difference between synchronous and asynchronous programming.</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-700">2. Multiple Choice</p>
                    <p className="text-gray-600 mt-1">Which of these is NOT a JavaScript data type?</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                        <span>String</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                        <span>Character</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                        <span>Object</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New AI Interview Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-100 to-teal-100 p-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">AI Interview Session</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-brand-100 p-2 rounded-full">
                      <BrainCircuit className="h-6 w-6 text-brand-700" />
                    </div>
                    <div className="ml-3 bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-gray-700">Tell me about a challenging project you recently worked on.</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <div className="mr-3 bg-brand-50 rounded-lg p-3 max-w-xs">
                      <p className="text-gray-700">I recently led a team of 5 developers to redesign our company's payment processing system...</p>
                    </div>
                    <div className="bg-gray-200 p-2 rounded-full">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-brand-100 p-2 rounded-full">
                      <BrainCircuit className="h-6 w-6 text-brand-700" />
                    </div>
                    <div className="ml-3 bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-gray-700">How did you handle any obstacles that came up during the project?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-10 lg:mb-0 order-1 lg:order-2">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
                AI-Powered Interview Experience
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Let our AI conduct preliminary interviews, saving your team valuable time while ensuring a consistent evaluation process.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <BrainCircuit className="h-6 w-6 text-brand-700" />
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Conversational AI that adapts based on candidate responses
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <BrainCircuit className="h-6 w-6 text-brand-700" />
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Sentiment analysis and soft skill evaluation
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <BrainCircuit className="h-6 w-6 text-brand-700" />
                  </div>
                  <p className="ml-3 text-base text-gray-600">
                    Structured interview reports with key insights and recommendations
                  </p>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/ai-interview">
                  <Button className="bg-brand-700 hover:bg-brand-800 text-white">
                    Try AI Interview
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-700 rounded-lg shadow-xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to streamline</span>
                  <span className="block">your hiring process?</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-white">
                  Start using FinalRound today to find and hire the best talent for your team.
                </p>
                <Link to="/signup" className="mt-8 bg-white border border-transparent rounded-md shadow px-5 py-3 inline-flex items-center text-base font-medium text-brand-700 hover:bg-gray-50">
                  Sign up for free
                </Link>
              </div>
            </div>
            <div className="-mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1">
              <div className="transform translate-x-6 translate-y-6 rounded-md object-cover object-left-top sm:translate-x-16 lg:translate-y-20 bg-brand-600/30 flex items-center justify-center">
                <div className="p-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-medium text-white">FinalRound Dashboard</h3>
                    <div className="mt-4 flex flex-col space-y-3">
                      <div className="flex items-center text-white/80">
                        <Check className="h-5 w-5 mr-2 text-green-400" />
                        <span>Centralized candidate management</span>
                      </div>
                      <div className="flex items-center text-white/80">
                        <Check className="h-5 w-5 mr-2 text-green-400" />
                        <span>Automated interview scheduling</span>
                      </div>
                      <div className="flex items-center text-white/80">
                        <Check className="h-5 w-5 mr-2 text-green-400" />
                        <span>Collaborative hiring workflows</span>
                      </div>
                      <div className="flex items-center text-white/80">
                        <Check className="h-5 w-5 mr-2 text-green-400" />
                        <span>Comprehensive analytics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
