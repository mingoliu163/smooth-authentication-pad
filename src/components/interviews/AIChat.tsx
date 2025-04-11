
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Video, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  interviewId: string;
  candidateName: string;
  position: string;
  settings: {
    language?: string;
    interviewer_style?: string;
    stress_level?: string;
    virtual_background?: string;
    interview_type?: string;
    experience_level?: string;
  };
}

export const AIChat: React.FC<AIChatProps> = ({ 
  interviewId, 
  candidateName,
  position,
  settings
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample interviewer avatars for different styles
  const interviewerAvatars: Record<string, string> = {
    friendly: "https://api.dicebear.com/7.x/personas/svg?seed=interviewer1",
    tough: "https://api.dicebear.com/7.x/personas/svg?seed=interviewer2",
    technical: "https://api.dicebear.com/7.x/personas/svg?seed=interviewer3",
  };
  
  // Get the correct avatar based on interviewer style
  const interviewerAvatar = interviewerAvatars[settings?.interviewer_style || 'friendly'];

  // Automatically scroll to the bottom of the messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start the interview with an introduction
  useEffect(() => {
    if (!interviewStarted && candidateName && position) {
      setInterviewStarted(true);
      
      // Set interview type based on settings
      const interviewType = settings?.interview_type || "technical";
      const experienceLevel = settings?.experience_level || "mid";
      const stressLevel = settings?.stress_level || "normal";
      
      // Generate appropriate introduction based on settings
      let introMessage = `Hello ${candidateName}, I'm your interviewer for the ${position} position. `;
      
      if (interviewType === "behavioral") {
        introMessage += "Today, I'll be asking about your past experiences and how they demonstrate your skills. ";
      } else if (interviewType === "technical") {
        introMessage += "I'll be asking technical questions to assess your skills for this role. ";
      } else if (interviewType === "panel") {
        introMessage += "Today you'll be speaking with several interviewers to assess different aspects of your experience. ";
      } else if (interviewType === "case") {
        introMessage += "We'll be working through a business case to see your problem-solving approach. ";
      } else if (interviewType === "informational") {
        introMessage += "This is primarily an informational interview to help you learn more about our company and the role. ";
      }
      
      // Add stress level context
      if (stressLevel === "high") {
        introMessage += "Please note that this interview will be challenging to assess how you perform under pressure. ";
      }
      
      introMessage += "Let's get started. Could you please introduce yourself and tell me why you're interested in this position?";
      
      // Add initial message from the interviewer
      setMessages([
        {
          role: "assistant",
          content: introMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [interviewStarted, candidateName, position, settings]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate API call to get AI response
    setTimeout(() => {
      // Here you would normally call a real API to get the AI's response
      // For demonstration purposes, we're using canned responses
      const aiResponses: Record<string, string[]> = {
        technical: [
          "Can you explain your experience with modern JavaScript frameworks?", 
          "What challenges did you face in your last project and how did you overcome them?",
          "How would you optimize a slow-performing website?",
          "Describe your approach to testing and quality assurance.",
          "What's your experience with cloud platforms like AWS, Azure, or GCP?"
        ],
        behavioral: [
          "Tell me about a time you had to deal with a difficult team member.",
          "Describe a situation where you had to work under a tight deadline.",
          "Can you share an example of when you showed leadership?",
          "How do you handle criticism?",
          "What's your biggest professional achievement so far?"
        ],
        informational: [
          "Do you have any questions about our company culture?",
          "What aspects of the role are you most excited about?",
          "What skills are you looking to develop in this position?",
          "How do you see this role fitting into your long-term career goals?",
          "What do you value most in a workplace?"
        ]
      };
      
      // Select response type based on interview settings
      const interviewType = settings?.interview_type || "technical";
      const responseArray = aiResponses[interviewType] || aiResponses.technical;
      
      // Pick a "random" response from the array based on the number of existing messages
      const responseIndex = (messages.length / 2) % responseArray.length;
      const aiResponse = responseArray[responseIndex];

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)]">
      <CardHeader className="pb-0">
        <CardTitle className="flex justify-between items-center">
          <span>AI Interview - {position}</span>
          {videoEnabled && (
            <Button variant="ghost" size="sm" onClick={toggleVideo}>
              <X className="h-4 w-4 mr-1" /> Close Video
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-grow p-0 overflow-hidden">
        {videoEnabled && (
          <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center border-b">
            <div className="absolute inset-0 bg-cover bg-center" 
                 style={{ 
                   backgroundImage: `url(https://source.unsplash.com/800x600/?${settings?.virtual_background || 'office'})`,
                   opacity: 0.5
                 }}></div>
            <div className="relative z-10 flex items-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden mr-8 border-4 border-white shadow-md">
                <img src={interviewerAvatar} alt="AI Interviewer" className="w-full h-full object-cover" />
              </div>
              <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden border-4 border-white shadow-md">
                <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white">
                  You
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-grow overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <img src={interviewerAvatar} alt="AI Interviewer" />
                    </Avatar>
                    <span className="text-xs font-medium">AI Interviewer</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs mt-2 opacity-70 text-right">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={toggleVideo}
            >
              <Video className={`h-5 w-5 ${videoEnabled ? 'text-primary' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" type="button">
              <Mic className="h-5 w-5" />
            </Button>
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              className="flex-1 min-h-[40px]"
              rows={1}
            />
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
