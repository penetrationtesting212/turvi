import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, Calendar, Zap, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

// Content templates by type
const CONTENT_TEMPLATES = {
  social: [
    { name: "Product Launch", prompt: "Create an exciting announcement for a new product launch" },
    { name: "Behind the Scenes", prompt: "Share a behind-the-scenes look at our company culture" },
    { name: "Customer Testimonial", prompt: "Highlight a customer success story" },
    { name: "Educational Tip", prompt: "Share an educational tip or industry insight" },
    { name: "Event Promotion", prompt: "Promote an upcoming event or webinar" },
  ],
  email: [
    { name: "Welcome Email", prompt: "Write a warm welcome email for new subscribers" },
    { name: "Newsletter", prompt: "Create an engaging newsletter with recent updates" },
    { name: "Promotion", prompt: "Announce a special promotion or discount" },
    { name: "Re-engagement", prompt: "Reach out to inactive subscribers to re-engage them" },
    { name: "Thank You", prompt: "Send a thank you message to loyal customers" },
  ],
  blog: [
    { name: "How-to Guide", prompt: "Write a comprehensive how-to guide" },
    { name: "Industry Trends", prompt: "Analyze current trends in the industry" },
    { name: "Case Study", prompt: "Create a detailed case study" },
    { name: "Best Practices", prompt: "Share best practices and actionable tips" },
    { name: "Thought Leadership", prompt: "Write a thought leadership piece on emerging topics" },
  ],
};

interface GeneratedContent {
  id: string;
  content: string;
  topic: string;
  type: string;
}

const AIContentGenerator = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("single");
  const [loading, setLoading] = useState(false);
  
  // Single generation state
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("social");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [generatedContent, setGeneratedContent] = useState("");
  
  // Batch generation state
  const [batchTopics, setBatchTopics] = useState("");
  const [batchResults, setBatchResults] = useState<GeneratedContent[]>([]);
  
  // Scheduling state
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [schedulePlatform, setSchedulePlatform] = useState("facebook");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for content generation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { type: contentType, topic, tone, length }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedContent(data.content);
      
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        await supabase.from("generated_content").insert({
          user_id: session.session.user.id,
          content_type: contentType,
          prompt: topic,
          content: data.content,
        });
      }

      toast({
        title: "Content generated!",
        description: "Your AI-powered content is ready",
      });
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchGenerate = async () => {
    const topics = batchTopics.split('\n').filter(t => t.trim());
    
    if (topics.length === 0) {
      toast({
        title: "Topics required",
        description: "Please enter at least one topic (one per line)",
        variant: "destructive",
      });
      return;
    }

    if (topics.length > 10) {
      toast({
        title: "Too many topics",
        description: "Please limit batch generation to 10 topics at a time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const results: GeneratedContent[] = [];

    try {
      for (const topicItem of topics) {
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: { type: contentType, topic: topicItem, tone, length }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        results.push({
          id: crypto.randomUUID(),
          content: data.content,
          topic: topicItem,
          type: contentType,
        });

        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          await supabase.from("generated_content").insert({
            user_id: session.session.user.id,
            content_type: contentType,
            prompt: topicItem,
            content: data.content,
          });
        }
      }

      setBatchResults(results);
      toast({
        title: "Batch generation complete!",
        description: `Generated ${results.length} pieces of content`,
      });
    } catch (error: any) {
      console.error("Error in batch generation:", error);
      toast({
        title: "Batch generation failed",
        description: error.message || "Some content failed to generate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!generatedContent) {
      toast({
        title: "No content to schedule",
        description: "Please generate content first",
        variant: "destructive",
      });
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Schedule time required",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    try {
      const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to schedule content",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("scheduled_content").insert({
        user_id: session.session.user.id,
        content: generatedContent,
        content_type: contentType,
        platform: schedulePlatform,
        scheduled_for: scheduledFor.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Content scheduled!",
        description: `Content will be published on ${scheduledFor.toLocaleString()}`,
      });

      setScheduleDate("");
      setScheduleTime("");
    } catch (error: any) {
      console.error("Error scheduling content:", error);
      toast({
        title: "Scheduling failed",
        description: error.message || "Failed to schedule content",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const handleUseTemplate = (template: { name: string; prompt: string }) => {
    setTopic(template.prompt);
    toast({
      title: "Template loaded",
      description: `Using "${template.name}" template`,
    });
  };

  const removeBatchResult = (id: string) => {
    setBatchResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>AI Content Generator</CardTitle>
            <CardDescription>Create engaging content with templates and batch processing</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">
              <FileText className="h-4 w-4 mr-2" />
              Single
            </TabsTrigger>
            <TabsTrigger value="batch">
              <Zap className="h-4 w-4 mr-2" />
              Batch
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Single Generation Tab */}
          <TabsContent value="single" className="space-y-4">
            {/* Templates */}
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TEMPLATES[contentType as keyof typeof CONTENT_TEMPLATES]?.map((template, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleUseTemplate(template)}
                  >
                    {template.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Brief</Label>
              <Input
                id="topic"
                placeholder="E.g., New product launch announcement"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Post</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="blog">Blog Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-gradient-primary w-full"
            >
              {loading ? "Generating..." : "Generate Content"}
            </Button>

            {generatedContent && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <Label>Generated Content</Label>
                  <Button size="sm" variant="outline" onClick={() => handleCopy(generatedContent)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            )}
          </TabsContent>

          {/* Batch Generation Tab */}
          <TabsContent value="batch" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchTopics">Topics (one per line, max 10)</Label>
              <Textarea
                id="batchTopics"
                placeholder="Enter topics, one per line:&#10;New product features&#10;Customer success story&#10;Industry insights"
                value={batchTopics}
                onChange={(e) => setBatchTopics(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Post</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="blog">Blog Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleBatchGenerate} 
              disabled={loading}
              className="bg-gradient-primary w-full"
            >
              {loading ? "Generating Batch..." : "Generate All"}
            </Button>

            {batchResults.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <Label>Generated Content ({batchResults.length})</Label>
                {batchResults.map((result) => (
                  <Card key={result.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{result.topic}</Label>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCopy(result.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => removeBatchResult(result.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={result.content}
                        readOnly
                        className="min-h-[100px] text-sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {!generatedContent && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate content first to schedule it</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab("single")}
                >
                  Go to Generator
                </Button>
              </div>
            )}

            {generatedContent && (
              <>
                <div className="space-y-2">
                  <Label>Content Preview</Label>
                  <Textarea
                    value={generatedContent}
                    readOnly
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduleDate">Date</Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduleTime">Time</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={schedulePlatform} onValueChange={setSchedulePlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSchedule}
                  className="bg-gradient-primary w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Content
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIContentGenerator;