
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, RefreshCw } from "lucide-react";

interface AIChatProps {
  selectedExam: {
    id: string;
    title: string;
    difficulty: string;
    category: string;
    description: string | null;
  } | null;
}

interface AIMessage {
  role: "assistant" | "user";
  content: string;
}

export const AIChat = ({ selectedExam }: AIChatProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedExam) {
      // Reset the conversation with a new initial prompt for this exam
      const initialPrompt = getInitialPrompt(selectedExam);
      setMessages([{ role: "assistant", content: initialPrompt }]);
    }
  }, [selectedExam]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const getInitialPrompt = (exam: typeof selectedExam) => {
    if (!exam) return "";
    
    if (exam.category === "Technical") {
      return `Hello! I'm your technical interviewer for the ${exam.title} assessment. This is a ${exam.difficulty} level technical evaluation. ${exam.description || ''}

I'll ask you a series of technical questions related to the position you're applying for. Please respond to each question with your best answer. I'll provide feedback and follow-up questions based on your responses.

Let's begin with your first question: Please introduce yourself and explain your relevant technical experience for this position.`;
    } else {
      return `Hello! I'm your interviewer for the ${exam.title} assessment. This is designed to evaluate your ${exam.category.toLowerCase()} skills and fit for the role. ${exam.description || ''}

I'll ask you a series of questions to better understand your work style, problem-solving approach, and how you handle various professional situations.

Let's begin with your first question: Could you tell me about yourself and what interests you about this position?`;
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !selectedExam) return;
    
    const userMessage = { role: "user" as const, content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsAILoading(true);
    
    // Simulate AI thinking (in a real app, we would call an API endpoint)
    setTimeout(() => {
      let aiResponse = "";
      
      // Generate a contextual response based on the exam type and user input
      if (selectedExam.category === "Technical") {
        if (userInput.toLowerCase().includes("experience") || messages.length <= 1) {
          aiResponse = "Thank you for sharing that. Now, let's dive into some technical questions.\n\nCan you explain how you would approach debugging a complex issue in a production environment?";
        } else if (userInput.toLowerCase().includes("debug") || userInput.toLowerCase().includes("production")) {
          aiResponse = "That's a good approach to debugging. Let's move to a more specific question related to your technical skills.\n\n";
          
          // Add a domain-specific question
          if (selectedExam.title.toLowerCase().includes("frontend")) {
            aiResponse += "How would you optimize the performance of a React application that's rendering a large dataset?";
          } else if (selectedExam.title.toLowerCase().includes("backend")) {
            aiResponse += "How would you design a scalable API that needs to handle high traffic and maintain data consistency?";
          } else if (selectedExam.title.toLowerCase().includes("data")) {
            aiResponse += "Can you explain your approach to cleaning and preparing a large dataset for analysis?";
          } else {
            aiResponse += "Tell me about a challenging technical project you worked on and how you overcame obstacles.";
          }
        } else {
          aiResponse = "Thank you for your detailed answer. One more question: How do you stay updated with the latest technologies and best practices in your field?";
        }
      } else { // Behavioral questions
        if (messages.length <= 1) {
          aiResponse = "Thank you for introducing yourself. I'd like to understand more about your work style.\n\nCan you describe a challenging situation you faced in a previous role and how you handled it?";
        } else if (userInput.toLowerCase().includes("challenge") || userInput.toLowerCase().includes("situation")) {
          aiResponse = "That's a great example of problem-solving. Now I'd like to know:\n\nHow do you prioritize tasks when you have multiple deadlines approaching?";
        } else if (userInput.toLowerCase().includes("prioritize") || userInput.toLowerCase().includes("deadline")) {
          aiResponse = "Effective prioritization is important. Let's talk about teamwork:\n\nCan you tell me about a time when you had to collaborate with a difficult team member? How did you handle it?";
        } else {
          aiResponse = "Thank you for sharing that experience. Final question:\n\nWhere do you see yourself professionally in five years, and how does this role align with your career goals?";
        }
      }
      
      const aiMessage = { role: "assistant" as const, content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
      setIsAILoading(false);
    }, 2000);
  };

  const handleResetConversation = () => {
    if (!selectedExam) return;
    
    const initialPrompt = getInitialPrompt(selectedExam);
    setMessages([{ role: "assistant", content: initialPrompt }]);
    
    // Scroll to the bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="flex-grow overflow-hidden flex flex-col">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">
          This is an AI-powered assessment. The AI will ask you a series of questions related to the {selectedExam?.category?.toLowerCase()} aspects of the role. 
          Answer the questions as you would in a real interview. Your responses will help the hiring team understand your qualifications better.
        </p>
      </div>
      
      <div className="flex-grow overflow-y-auto mb-4 pr-2" style={{ maxHeight: "400px" }}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "assistant" 
                  ? "bg-gray-100 text-gray-800" 
                  : "bg-blue-500 text-white"
              }`}>
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="bg-purple-100 text-purple-800">AI</AvatarFallback>
                      <AvatarImage src="/placeholder.svg" />
                    </Avatar>
                    <span className="text-xs font-medium">AI Interviewer</span>
                  </div>
                )}
                <div className="whitespace-pre-line">{message.content}</div>
              </div>
            </div>
          ))}
          {isAILoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="bg-purple-100 text-purple-800">AI</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="relative">
        <Textarea
          placeholder="Type your response here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="resize-none pr-12"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          size="sm"
          className="absolute bottom-3 right-3"
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isAILoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex justify-between border-t pt-4">
        <p className="text-xs text-gray-500">
          <Bot className="h-3 w-3 inline-block mr-1" />
          AI responses are generated for practice purposes only
        </p>
        <Button variant="outline" size="sm" onClick={handleResetConversation}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Reset Conversation
        </Button>
      </div>
    </div>
  );
};
