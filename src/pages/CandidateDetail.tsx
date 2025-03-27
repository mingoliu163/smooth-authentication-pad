
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Mail, Phone, Calendar, FileText, User, Star, MessageSquare, Plus } from "lucide-react";
import { CandidateType } from "@/components/CandidateCard";

// Sample candidate data
const candidatesData: Record<string, CandidateType & { 
  phone?: string,
  resume?: string,
  about?: string,
  education?: Array<{ degree: string, school: string, years: string }>,
  experience?: Array<{ title: string, company: string, years: string, description: string }>,
  interviewNotes?: Array<{ date: string, interviewer: string, notes: string, rating: number }>
}> = {
  "1": {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    avatar: undefined,
    position: "Senior Frontend Developer",
    status: "Interview",
    appliedDate: "March 15, 2023",
    tags: ["React", "TypeScript", "UI/UX"],
    resume: "resume_alex_johnson.pdf",
    about: "Experienced frontend developer with 7+ years building complex web applications. Passionate about creating intuitive user interfaces and optimizing performance. Strong advocate for code quality and testing.",
    education: [
      { degree: "B.S. Computer Science", school: "University of California, Berkeley", years: "2012 - 2016" },
      { degree: "Web Development Bootcamp", school: "Coding Academy", years: "2017" }
    ],
    experience: [
      { 
        title: "Senior Frontend Developer", 
        company: "Tech Solutions Inc.", 
        years: "2020 - Present", 
        description: "Led frontend development for enterprise SaaS product. Implemented component library and improved application performance by 40%."
      },
      { 
        title: "Frontend Developer", 
        company: "WebApps Co.", 
        years: "2017 - 2020", 
        description: "Developed responsive web applications using React and Redux. Worked closely with design team to implement UI/UX improvements."
      }
    ],
    interviewNotes: [
      {
        date: "March 20, 2023",
        interviewer: "Sarah Chen (Engineering Manager)",
        notes: "Alex demonstrated strong technical knowledge and communication skills. Solid understanding of React and state management. Could improve on system design knowledge.",
        rating: 4
      },
      {
        date: "March 25, 2023",
        interviewer: "Michael Rodriguez (Senior Engineer)",
        notes: "Technical skills are excellent. Solved the coding challenge efficiently and explained the approach clearly. Good cultural fit with the team.",
        rating: 5
      }
    ]
  },
};

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const candidate = id ? candidatesData[id] : null;

  if (!candidate) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Candidate Not Found</h1>
            <p className="mt-2 text-gray-600">We couldn't find the candidate you're looking for.</p>
            <Link to="/candidates">
              <Button className="mt-4 bg-brand-700 hover:bg-brand-800 text-white">
                Back to Candidates
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Screening":
        return "bg-purple-100 text-purple-800";
      case "Interview":
        return "bg-amber-100 text-amber-800";
      case "Final Round":
        return "bg-indigo-100 text-indigo-800";
      case "Offer":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/candidates" className="inline-flex items-center text-brand-700 hover:text-brand-800">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Candidates
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={candidate.avatar} alt={candidate.name} />
                  <AvatarFallback className="bg-brand-100 text-brand-800 text-xl">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                  <p className="text-gray-600">{candidate.position}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                    <span className="text-sm text-gray-500">Applied {candidate.appliedDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Button variant="outline" className="inline-flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> Email
                </Button>
                {candidate.phone && (
                  <Button variant="outline" className="inline-flex items-center">
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </Button>
                )}
                <Button className="bg-brand-700 hover:bg-brand-800 text-white">
                  <Calendar className="h-4 w-4 mr-2" /> Schedule Interview
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="interviews">Interviews</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-6 space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">About</h2>
                      <p className="text-gray-700">{candidate.about}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{candidate.email}</p>
                          </div>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-start">
                            <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium">{candidate.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {candidate.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Experience</h2>
                      <div className="space-y-6">
                        {candidate.experience?.map((exp, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4 pb-2">
                            <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                            <p className="text-gray-700">{exp.company}</p>
                            <p className="text-sm text-gray-500">{exp.years}</p>
                            <p className="mt-2 text-gray-700">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Education</h2>
                      <div className="space-y-4">
                        {candidate.education?.map((edu, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                            <p className="text-gray-700">{edu.school}</p>
                            <p className="text-sm text-gray-500">{edu.years}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="interviews" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Interview Notes</h2>
                        <Button className="bg-brand-700 hover:bg-brand-800 text-white">
                          <Plus className="h-4 w-4 mr-2" /> Add Note
                        </Button>
                      </div>
                      
                      {candidate.interviewNotes?.length ? (
                        <div className="space-y-6">
                          {candidate.interviewNotes.map((note, index) => (
                            <div key={index} className="border-l-2 border-brand-200 pl-4 pb-6">
                              <div className="flex justify-between">
                                <p className="font-semibold text-gray-900">{note.date}</p>
                                <div className="flex">
                                  {renderStars(note.rating)}
                                </div>
                              </div>
                              <p className="text-sm text-gray-500">{note.interviewer}</p>
                              <p className="mt-2 text-gray-700">{note.notes}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No interview notes yet</p>
                          <Button className="mt-4 bg-brand-700 hover:bg-brand-800 text-white">
                            Add First Note
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="documents" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Documents</h2>
                        <Button className="bg-brand-700 hover:bg-brand-800 text-white">
                          <Plus className="h-4 w-4 mr-2" /> Upload Document
                        </Button>
                      </div>
                      
                      {candidate.resume ? (
                        <div className="border rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-8 w-8 text-brand-700 mr-4" />
                            <div>
                              <p className="font-medium text-gray-900">{candidate.resume}</p>
                              <p className="text-sm text-gray-500">Resume • Uploaded with application</p>
                            </div>
                          </div>
                          <Button variant="outline">View</Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No documents uploaded</p>
                          <Button className="mt-4 bg-brand-700 hover:bg-brand-800 text-white">
                            Upload Document
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Candidate Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium">{candidate.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applied Date</p>
                      <p className="font-medium">{candidate.appliedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Source</p>
                      <p className="font-medium">Company Website</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full bg-brand-700 hover:bg-brand-800 text-white">
                        <Calendar className="h-4 w-4 mr-2" /> Schedule Interview
                      </Button>
                      <Button variant="outline" className="w-full">
                        <User className="h-4 w-4 mr-2" /> Change Status
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                        Reject Candidate
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Notes</h3>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CandidateDetail;
