import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CampaignAutopilot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("");
  const [audienceAge, setAudienceAge] = useState("");
  const [audienceInterests, setAudienceInterests] = useState("");
  const [audienceLocation, setAudienceLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const channels = [
    { id: "email", label: "Email Marketing", icon: "📧" },
    { id: "social", label: "Social Media", icon: "📱" },
    { id: "ads", label: "Paid Ads", icon: "💰" },
    { id: "sms", label: "SMS", icon: "💬" },
    { id: "content", label: "Content Marketing", icon: "📝" }
  ];

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleCreateCampaign = async () => {
    if (!goal || !budget || selectedChannels.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const targetAudience = {
        age: audienceAge,
        interests: audienceInterests.split(',').map(i => i.trim()),
        location: audienceLocation
      };

      const { data, error } = await supabase.functions.invoke('create-ai-campaign', {
        body: {
          goal,
          targetAudience,
          budget: parseFloat(budget),
          channels: selectedChannels
        }
      });

      if (error) throw error;

      toast({
        title: "Campaign created! 🚀",
        description: "Your AI-powered campaign is ready. View the generated content now.",
      });

      // Navigate to campaigns page
      setTimeout(() => navigate('/campaigns'), 1500);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-primary mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Smart Campaign Autopilot</h1>
          <p className="text-lg text-muted-foreground">
            AI creates, optimizes, and manages your campaigns automatically
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaign Goal
              </CardTitle>
              <CardDescription>
                What do you want to achieve with this campaign?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Campaign Objective *</Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., Launch new product, increase brand awareness, drive sales..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget ($) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Target Audience
              </CardTitle>
              <CardDescription>
                AI will optimize content for your specific audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age Range</Label>
                <Input
                  id="age"
                  placeholder="e.g., 25-45"
                  value={audienceAge}
                  onChange={(e) => setAudienceAge(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests (comma-separated)</Label>
                <Input
                  id="interests"
                  placeholder="e.g., technology, fitness, travel"
                  value={audienceInterests}
                  onChange={(e) => setAudienceInterests(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., United States, Global"
                  value={audienceLocation}
                  onChange={(e) => setAudienceLocation(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Marketing Channels *
              </CardTitle>
              <CardDescription>
                Select channels for your multi-channel campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedChannels.includes(channel.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleChannelToggle(channel.id)}
                  >
                    <Checkbox
                      checked={selectedChannels.includes(channel.id)}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                    />
                    <span className="text-2xl">{channel.icon}</span>
                    <span className="font-medium">{channel.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button
            size="lg"
            className="flex-1 bg-gradient-primary shadow-glow"
            onClick={handleCreateCampaign}
            disabled={loading}
          >
            {loading ? (
              "Creating AI Campaign..."
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Create AI Campaign
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 p-6 rounded-lg border border-primary/20 bg-primary/5">
          <h3 className="font-semibold mb-2">✨ What AI Autopilot Does:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Analyzes your audience and creates personalized content</li>
            <li>• Optimizes posting times and budget allocation</li>
            <li>• A/B tests content variations automatically</li>
            <li>• Monitors performance and adjusts strategy in real-time</li>
            <li>• Generates performance reports and recommendations</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default CampaignAutopilot;