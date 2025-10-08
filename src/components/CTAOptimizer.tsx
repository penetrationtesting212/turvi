import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Target } from "lucide-react";

interface CTASuggestion {
  cta: string;
  reason: string;
  expectedImpact: string;
}

interface CTAResult {
  originalCTA: string;
  suggestions: CTASuggestion[];
  bestPractices: string[];
}

export const CTAOptimizer = () => {
  const [cta, setCta] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<CTAResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOptimize = async () => {
    if (!cta.trim()) {
      toast({
        title: "CTA Required",
        description: "Please enter a call-to-action to optimize.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cta-optimizer', {
        body: { cta, context }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "CTA Optimized",
        description: "Better CTA suggestions have been generated.",
      });
    } catch (error) {
      console.error('Error optimizing CTA:', error);
      toast({
        title: "Error",
        description: "Failed to optimize CTA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCTA = (ctaText: string) => {
    navigator.clipboard.writeText(ctaText);
    toast({
      title: "Copied!",
      description: "CTA copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Call-to-Action Optimizer
        </CardTitle>
        <CardDescription>Suggest better CTAs for higher conversions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Current CTA</label>
          <Input
            placeholder="e.g., Click here, Sign up now..."
            value={cta}
            onChange={(e) => setCta(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Context (Optional)</label>
          <Textarea
            placeholder="Describe where this CTA will be used..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
          />
        </div>
        
        <Button onClick={handleOptimize} disabled={loading}>
          {loading ? "Optimizing..." : "Optimize CTA"}
        </Button>

        {result && (
          <div className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold mb-3">Suggested CTAs</h4>
              <div className="space-y-3">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">{suggestion.cta}</span>
                      <Button 
                        onClick={() => handleCopyCTA(suggestion.cta)} 
                        variant="ghost" 
                        size="sm"
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Why:</strong> {suggestion.reason}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Expected Impact:</strong> {suggestion.expectedImpact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {result.bestPractices.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Best Practices</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {result.bestPractices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
