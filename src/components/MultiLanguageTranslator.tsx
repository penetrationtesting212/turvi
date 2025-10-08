import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MultiLanguageTranslator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [contentType, setContentType] = useState("general");
  const [translatedContent, setTranslatedContent] = useState("");

  const languages = [
    { code: "hi", name: "Hindi (हिंदी)" },
    { code: "ta", name: "Tamil (தமிழ்)" },
    { code: "te", name: "Telugu (తెలుగు)" },
    { code: "bn", name: "Bengali (বাংলা)" },
    { code: "mr", name: "Marathi (मराठी)" },
    { code: "gu", name: "Gujarati (ગુજરાતી)" },
    { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
    { code: "ml", name: "Malayalam (മലയാളം)" },
    { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
    { code: "en", name: "English" },
  ];

  const handleTranslate = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content to translate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-multilingual-content', {
        body: { content, targetLanguage, contentType }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setTranslatedContent(data.translatedContent);

      toast({
        title: "Translation complete!",
        description: `Content translated to ${data.targetLanguage}`,
      });
    } catch (error: any) {
      console.error("Error translating content:", error);
      toast({
        title: "Translation failed",
        description: error.message || "Failed to translate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedContent);
    toast({
      title: "Copied!",
      description: "Translated content copied to clipboard",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Languages className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Multi-Language Translator</CardTitle>
            <CardDescription>Support for 15+ Indian languages + English</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Enter content to translate..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Language</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleTranslate} 
          disabled={loading}
          className="bg-gradient-primary w-full"
        >
          {loading ? "Translating..." : "Translate Content"}
        </Button>

        {translatedContent && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <Label>Translated Content</Label>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              value={translatedContent}
              onChange={(e) => setTranslatedContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiLanguageTranslator;
