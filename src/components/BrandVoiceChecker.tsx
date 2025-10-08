import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mic2, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface BrandVoiceData {
  consistencyScore: number;
  tone: string;
  toneMatch: boolean;
  voiceCharacteristics: string[];
  matches: string[];
  mismatches: string[];
  suggestions: string[];
  examples: string[];
}

const BrandVoiceChecker = () => {
  const [content, setContent] = useState("");
  const [brandGuidelines, setBrandGuidelines] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrandVoiceData | null>(null);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!content.trim() || !brandGuidelines.trim()) {
      toast({
        title: "Error",
        description: "Please enter both content and brand guidelines",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('brand-voice-checker', {
        body: { content, brandGuidelines }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Success",
        description: "Brand voice checked successfully!",
      });
    } catch (error) {
      console.error('Error checking brand voice:', error);
      toast({
        title: "Error",
        description: "Failed to check brand voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic2 className="h-5 w-5" />
          Brand Voice Checker
        </CardTitle>
        <CardDescription>Ensure consistency with brand guidelines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand-guidelines">Brand Guidelines</Label>
          <Textarea
            id="brand-guidelines"
            placeholder="Describe your brand voice (e.g., professional, friendly, empathetic, approachable...)"
            value={brandGuidelines}
            onChange={(e) => setBrandGuidelines(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content to Check</Label>
          <Textarea
            id="content"
            placeholder="Paste your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>

        <Button onClick={handleCheck} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Mic2 className="mr-2 h-4 w-4" />
              Check Brand Voice
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 space-y-6">
            <Card className={result.toneMatch ? "bg-green-500/10" : "bg-yellow-500/10"}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Consistency Score</p>
                    <p className="text-4xl font-bold">{result.consistencyScore}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={result.toneMatch ? "default" : "secondary"} className="mb-2">
                      {result.toneMatch ? "✓ Tone Match" : "⚠ Tone Mismatch"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Detected: {result.tone}</p>
                  </div>
                </div>
                <Progress value={result.consistencyScore} className="h-3" />
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-3">Voice Characteristics</h3>
              <div className="flex flex-wrap gap-2">
                {result.voiceCharacteristics.map((char, index) => (
                  <Badge key={index} variant="outline">{char}</Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    What Matches Well
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.matches.map((match, index) => (
                      <li key={index} className="text-sm">✓ {match}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    What Doesn't Match
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.mismatches.map((mismatch, index) => (
                      <li key={index} className="text-sm">✗ {mismatch}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Suggestions for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">💡 {suggestion}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-3">Example Improvements</h3>
              <div className="space-y-3">
                {result.examples.map((example, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <p className="text-sm">{example}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandVoiceChecker;
