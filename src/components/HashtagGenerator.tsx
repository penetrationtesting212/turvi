import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Hash, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HashtagData {
  trending: string[];
  niche: string[];
  branded: string[];
  recommended: string[];
  usage: string;
  optimalCount: string;
}

const HashtagGenerator = () => {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashtagData | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to generate hashtags",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('hashtag-generator', {
        body: { content, platform }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Success",
        description: "Hashtags generated successfully!",
      });
    } catch (error) {
      console.error('Error generating hashtags:', error);
      toast({
        title: "Error",
        description: "Failed to generate hashtags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = (hashtags: string[]) => {
    const text = hashtags.join(' ');
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Hashtags copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Hashtag Generator
        </CardTitle>
        <CardDescription>Generate relevant hashtags for social media</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Post Content</Label>
          <Textarea
            id="content"
            placeholder="Enter your post content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Hash className="mr-2 h-4 w-4" />
              Generate Hashtags
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 space-y-6">
            <Card className="bg-primary/5">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Optimal Count</Label>
                  <p className="text-sm">{result.optimalCount}</p>
                  <Label className="text-sm font-semibold mt-3 block">Usage Tips</Label>
                  <p className="text-sm text-muted-foreground">{result.usage}</p>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">🔥 Trending Hashtags</h3>
                <Button variant="outline" size="sm" onClick={() => handleCopyAll(result.trending)}>
                  <Copy className="h-3 w-3 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.trending.map((tag, index) => (
                  <Badge key={index} variant="default" className="cursor-pointer text-sm px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">🎯 Niche Hashtags</h3>
                <Button variant="outline" size="sm" onClick={() => handleCopyAll(result.niche)}>
                  <Copy className="h-3 w-3 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.niche.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer text-sm px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">🏷️ Branded Hashtags</h3>
                <Button variant="outline" size="sm" onClick={() => handleCopyAll(result.branded)}>
                  <Copy className="h-3 w-3 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.branded.map((tag, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer text-sm px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">⭐ Recommended Mix</h3>
                <Button variant="outline" size="sm" onClick={() => handleCopyAll(result.recommended)}>
                  <Copy className="h-3 w-3 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.recommended.map((tag, index) => (
                  <Badge key={index} className="cursor-pointer text-sm px-3 py-1 bg-gradient-to-r from-primary to-primary/70">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HashtagGenerator;
