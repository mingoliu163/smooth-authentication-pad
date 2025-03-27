
import { Check, BarChart3, Calendar, Users, Briefcase, Clock } from "lucide-react";

const features = [
  {
    name: 'Candidate Management',
    description: 'Track all candidates in one centralized system, with complete profiles and application histories.',
    icon: Users,
  },
  {
    name: 'Job Listings Portal',
    description: 'Create and publish job listings with detailed descriptions and requirements.',
    icon: Briefcase,
  },
  {
    name: 'Interview Scheduling',
    description: 'Automate the scheduling process and sync with your team\'s calendars.',
    icon: Calendar,
  },
  {
    name: 'Analytics Dashboard',
    description: 'Get insights on your hiring pipeline with detailed metrics and conversion rates.',
    icon: BarChart3,
  },
  {
    name: 'Time-saving Automation',
    description: 'Reduce manual tasks with automated workflows for application screening and follow-ups.',
    icon: Clock,
  },
];

const Features = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-brand-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to streamline your hiring
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our platform helps you manage the entire interview process from job posting to final decisions.
          </p>
        </div>

        <div className="mt-16">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-brand-100 text-brand-600">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
