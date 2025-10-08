import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, Image as ImageIcon, Copy, Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import AIContentGenerator from "@/components/AIContentGenerator";
import AIImageGenerator from "@/components/AIImageGenerator";
import AISentimentAnalyzer from "@/components/AISentimentAnalyzer";
import ContentRewriter from "@/components/ContentRewriter";
import SEOOptimizer from "@/components/SEOOptimizer";
import GrammarChecker from "@/components/GrammarChecker";
import MultiLanguageTranslator from "@/components/MultiLanguageTranslator";
import KeywordResearchTool from "@/components/KeywordResearchTool";
import CompetitorAnalysis from "@/components/CompetitorAnalysis";
import HashtagGenerator from "@/components/HashtagGenerator";
import ContentScoring from "@/components/ContentScoring";
import BrandVoiceChecker from "@/components/BrandVoiceChecker";
import { PlagiarismChecker } from "@/components/PlagiarismChecker";
import { ReadabilityScore } from "@/components/ReadabilityScore";
import { ToneAdjuster } from "@/components/ToneAdjuster";
import { ContentExpander } from "@/components/ContentExpander";
import { SmartSummarizer } from "@/components/SmartSummarizer";
import { HeadlineGenerator } from "@/components/HeadlineGenerator";
import { CTAOptimizer } from "@/components/CTAOptimizer";
import { VideoScriptGenerator } from "@/components/VideoScriptGenerator";
import { ContentTrendPredictor } from "@/components/ContentTrendPredictor";

const ContentCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contents, setContents] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [contentsRes, imagesRes] = await Promise.all([
        supabase.from("generated_content").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("generated_images").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
      ]);

      if (contentsRes.data) setContents(contentsRes.data);
      if (imagesRes.data) setImages(imagesRes.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const handleDownloadImage = (url: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Content Creation Studio</h1>
              <p className="text-muted-foreground">AI-powered content generation at your fingertips</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div key={`content-${refreshKey}`}>
                <AIContentGenerator />
              </div>
              <div key={`image-${refreshKey}`}>
                <AIImageGenerator />
              </div>
            </div>
            <VideoScriptGenerator />
            <ContentTrendPredictor />
            <div key={`sentiment-${refreshKey}`}>
              <AISentimentAnalyzer />
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setRefreshKey(prev => prev + 1);
                  fetchData();
                }}
              >
                Refresh Library
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ContentRewriter />
              <SEOOptimizer />
              <GrammarChecker />
              <MultiLanguageTranslator />
              <KeywordResearchTool />
              <CompetitorAnalysis />
              <HashtagGenerator />
              <ContentScoring />
              <BrandVoiceChecker />
              <PlagiarismChecker />
              <ReadabilityScore />
              <ToneAdjuster />
              <ContentExpander />
              <SmartSummarizer />
              <HeadlineGenerator />
              <CTAOptimizer />
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            {/* Text Content */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Generated Content ({contents.length})</CardTitle>
                <CardDescription>Your AI-generated text content</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading content...</p>
                ) : contents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No content yet. Generate your first one!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contents.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.content_type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleCopyContent(item.content)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Prompt: {item.prompt}
                          </p>
                          <p className="text-sm line-clamp-3">{item.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Generated Images ({images.length})</CardTitle>
                <CardDescription>Your AI-generated images</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading images...</p>
                ) : images.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No images yet. Generate your first one!</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-border/50 mb-3">
                            <img 
                              src={item.image_url} 
                              alt={item.prompt} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadImage(item.image_url, item.prompt)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Content Templates</CardTitle>
                <CardDescription>Pre-built templates for faster content creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Product Description", desc: "Compelling product copy", icon: "📦" },
                    { name: "Email Newsletter", desc: "Engaging email content", icon: "📧" },
                    { name: "Press Release", desc: "Professional announcements", icon: "📰" },
                    { name: "Landing Page Copy", desc: "High-converting page text", icon: "🎯" },
                    { name: "Social Media Ad", desc: "Attention-grabbing ads", icon: "📱" },
                    { name: "Blog Post Intro", desc: "Captivating blog openings", icon: "✍️" },
                    { name: "Case Study", desc: "Success story templates", icon: "📊" },
                    { name: "Call to Action", desc: "Persuasive CTA copy", icon: "🚀" },
                    { name: "Value Proposition", desc: "Clear benefit statements", icon: "💎" }
                  ].map((template, i) => (
                    <Card key={i} className="cursor-pointer hover:shadow-glow transition-all group">
                      <CardContent className="pt-6">
                        <div className="text-4xl mb-3">{template.icon}</div>
                        <p className="font-medium mb-1 group-hover:text-primary transition-colors">
                          {template.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{template.desc}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-3"
                          onClick={() => {
                            toast({
                              title: "Template selected",
                              description: `Switch to Generate tab to use the ${template.name} template`,
                            });
                          }}
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Content Scheduling</CardTitle>
                <CardDescription>Plan your content distribution across channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-2xl font-bold mb-1">{contents.length}</p>
                      <p className="text-sm text-muted-foreground">Total Content Pieces</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-2xl font-bold mb-1">{images.length}</p>
                      <p className="text-sm text-muted-foreground">Total Images</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-2xl font-bold mb-1">{contents.length + images.length}</p>
                      <p className="text-sm text-muted-foreground">Total Assets</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Suggested Publishing Schedule</h3>
                  <div className="space-y-3">
                    {[
                      { day: "Monday", time: "9:00 AM", type: "Blog Post", engagement: "High" },
                      { day: "Tuesday", time: "2:00 PM", type: "Social Media", engagement: "Medium" },
                      { day: "Wednesday", time: "10:00 AM", type: "Email Newsletter", engagement: "High" },
                      { day: "Thursday", time: "3:00 PM", type: "Social Media", engagement: "Medium" },
                      { day: "Friday", time: "11:00 AM", type: "Blog Post", engagement: "High" }
                    ].map((schedule, i) => (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium">{schedule.day}</p>
                                <p className="text-sm text-muted-foreground">{schedule.time}</p>
                              </div>
                              <Badge variant="outline">{schedule.type}</Badge>
                            </div>
                            <div className="text-right">
                              <Badge variant={schedule.engagement === "High" ? "default" : "secondary"}>
                                {schedule.engagement} Engagement
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    💡 <strong>Pro Tip:</strong> Schedule content from your Library tab to maximize reach and engagement
                  </p>
                  <Button className="bg-gradient-primary w-full">
                    Set Up Auto-Scheduling
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentCreation;
