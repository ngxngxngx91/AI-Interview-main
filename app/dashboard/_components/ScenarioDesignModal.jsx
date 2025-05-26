"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Wand2, Loader2, Sparkles, Target, Clock, AlertCircle, ArrowRight, RefreshCw, Globe2 } from "lucide-react";
import { chatSession } from "@/utils/GeminiAIModal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const industries = [
  { value: "sales", label: "Sales", icon: "💼" },
  { value: "customer-service", label: "Customer Service", icon: "🎯" },
  { value: "business-analysis", label: "Business Analysis", icon: "📊" },
  { value: "it", label: "IT", icon: "💻" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
];

const ScenarioDesignModal = ({
  show,
  onClose,
  selectedIndustry,
  roleDescription,
  onProceed
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState("en");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedScenario, setGeneratedScenario] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState(null);
  const [selectedIndustryLocal, setSelectedIndustryLocal] = React.useState(selectedIndustry || "");
  const [roleDescriptionLocal, setRoleDescriptionLocal] = React.useState(roleDescription || "");

  const difficulties = [
    { value: "easy", label: "Easy", description: "Phù Hợp Cho Người Mới", color: "bg-green-500" },
    { value: "medium", label: "Medium", description: "Có Tính Thử Thách", color: "bg-yellow-500" },
    { value: "hard", label: "Hard", description: "Phỏng Vấn Nâng Cao", color: "bg-red-500" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "vi", label: "Vietnamese" },
  ];

  const generateScenario = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const prompt = `Create an interview scenario with these parameters:
Industry: ${selectedIndustryLocal}
Role: ${roleDescriptionLocal}
Difficulty: ${difficulty}
Context: ${description}
Language: ${selectedLanguage}

Requirements:
- Create a realistic interview scenario specific to the ${selectedIndustryLocal} industry
- Include a relevant question or situation for the ${roleDescriptionLocal} role
- Make it appropriate for ${difficulty} level
- For easy level: Focus on basic skills and straightforward situations
- For medium level: Include some complexity and decision-making
- For hard level: Create challenging, high-pressure scenarios

Example (DO NOT COPY, just use as inspiration):
{
  "scenario": "You are interviewing for a Software Engineer position in the IT industry. The interviewer wants to understand your problem-solving approach and technical skills.",
  "customerQuery": "Can you walk me through how you would approach debugging a critical production issue that's affecting multiple users?",
  "expectedResponse": "Outline your systematic debugging process, communication strategy, and preventive measures"
}

Generate a realistic interview scenario in this exact JSON format:
{
  "scenario": "Initial situation description",
  "customerQuery": "What the interviewer says",
  "expectedResponse": "Key points to address"
}`;

      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();

      try {
        const jsonResponse = JSON.parse(responseText);
        setGeneratedScenario({
          customerQuery: typeof jsonResponse.customerQuery === 'string' ? jsonResponse.customerQuery : JSON.stringify(jsonResponse.customerQuery),
          expectedResponse: typeof jsonResponse.expectedResponse === 'string' ? jsonResponse.expectedResponse : JSON.stringify(jsonResponse.expectedResponse),
          scenario: typeof jsonResponse.scenario === 'string' ? jsonResponse.scenario : JSON.stringify(jsonResponse.scenario),
          difficulty,
          language: selectedLanguage,
          title,
          description,
          industry: selectedIndustryLocal,
          role: roleDescriptionLocal
        });
        setProgress(100);
      } catch (jsonError) {
        const cleanedResponse = responseText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        try {
          const jsonResponse = JSON.parse(cleanedResponse);
          setGeneratedScenario({
            customerQuery: typeof jsonResponse.customerQuery === 'string' ? jsonResponse.customerQuery : JSON.stringify(jsonResponse.customerQuery),
            expectedResponse: typeof jsonResponse.expectedResponse === 'string' ? jsonResponse.expectedResponse : JSON.stringify(jsonResponse.expectedResponse),
            scenario: typeof jsonResponse.scenario === 'string' ? jsonResponse.scenario : JSON.stringify(jsonResponse.scenario),
            difficulty,
            language: selectedLanguage,
            title,
            description,
            industry: selectedIndustryLocal,
            role: roleDescriptionLocal
          });
          setProgress(100);
        } catch {
          throw new Error("Failed to parse AI response");
        }
      }
    } catch (error) {
      console.error("Error generating scenario:", error);
      setError("Failed to generate scenario. Please try again.");
      setGeneratedScenario(null);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleProceed = () => {
    onProceed({
      title,
      description,
      difficulty,
      scenario: generatedScenario.scenario,
      customerQuery: generatedScenario.customerQuery,
      expectedResponse: generatedScenario.expectedResponse,
      language: selectedLanguage,
      industry: selectedIndustryLocal,
      role: roleDescriptionLocal
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gray-900/95 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-purple-700/30"
          >
            {/* Modal Header */}
            <div
              className="p-5 border-b border-gray-800 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg bg-purple-600 text-white shadow-lg">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Design Your Interview Session
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Customize your perfect scenario
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {!generatedScenario && (
                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">
                          Industry
                        </label>
                        <Select
                          value={selectedIndustryLocal}
                          onValueChange={setSelectedIndustryLocal}
                        >
                          <SelectTrigger className="w-full border-gray-700 bg-gray-800 text-gray-100 focus:border-purple-500 focus:ring-purple-500/20">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem
                                key={industry.value}
                                value={industry.value}
                                className="flex items-center gap-2"
                              >
                                <span className="text-lg mr-2">{industry.icon}</span>
                                {industry.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">
                          Difficulty Level
                        </label>
                        <Select
                          value={difficulty}
                          onValueChange={setDifficulty}
                        >
                          <SelectTrigger className="w-full border-gray-700 bg-gray-800 text-gray-100 focus:border-purple-500 focus:ring-purple-500/20">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map((level) => (
                              <SelectItem
                                key={level.value}
                                value={level.value}
                                className="flex items-center gap-2"
                              >
                                <span className={`w-2 h-2 rounded-full ${level.color} mr-2`}></span>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">
                        Role Description
                      </label>
                      <Textarea
                        value={roleDescriptionLocal}
                        onChange={(e) => setRoleDescriptionLocal(e.target.value)}
                        placeholder="Describe the role you're interviewing for..."
                        className="min-h-[80px] border border-gray-700 bg-gray-800 text-gray-100 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Additional Settings Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Additional Settings
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">
                          Language
                        </label>
                        <Select
                          value={selectedLanguage}
                          onValueChange={setSelectedLanguage}
                        >
                          <SelectTrigger className="w-full border-gray-700 bg-gray-800 text-gray-100 focus:border-purple-500 focus:ring-purple-500/20">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem
                                key={lang.value}
                                value={lang.value}
                              >
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">
                          Interview Title
                        </label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter interview title..."
                          className="border border-gray-700 bg-gray-800 text-gray-100 focus:border-purple-500 focus:ring-purple-500/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">
                        Additional Context (Optional)
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add any specific context or requirements..."
                        className="min-h-[80px] border border-gray-700 bg-gray-800 text-gray-100 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-900/20 border-2 border-red-700 rounded-lg flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                          Generating your interview scenario...
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-gray-800" />
                    </motion.div>
                  )}

                  {!isGenerating && (
                    <Button
                      className={`w-full h-12 rounded-lg transition-all duration-300 
                                      ${!difficulty || !selectedIndustryLocal || !roleDescriptionLocal || !title ? 'bg-gray-800 text-gray-500' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl'}
                                    `}
                      disabled={!difficulty || !selectedIndustryLocal || !roleDescriptionLocal || !title || isGenerating}
                      onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => {
                          generateScenario();
                        }, 200);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        Generate Scenario
                      </span>
                    </Button>
                  )}
                </div>
              )}
              {generatedScenario && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg border border-purple-700/40 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h3 className="font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Your Interview Scenario
                      </h3>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold uppercase bg-emerald-700 text-emerald-100`}>{selectedLanguage === 'vi' ? 'VI' : 'EN'}</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-300 mb-2">{generatedScenario.scenario}</p>
                      </div>
                      <div className="pl-4 border-l-2 border-purple-500">
                        <p className="text-sm font-medium text-gray-100">{generatedScenario.customerQuery}</p>
                        <p className="text-xs text-gray-400 mt-1">Expected: {generatedScenario.expectedResponse}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleProceed}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button
                      className="flex-1 h-11 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition-all duration-300"
                      onClick={() => {
                        setGeneratedScenario(null);
                        setProgress(0);
                        setIsGenerating(false);
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Redo
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScenarioDesignModal; 