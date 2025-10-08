import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Share2, 
  Mail, 
  Target, 
  Sparkles,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Search,
  Hash,
  Award,
  Mic2,
  Wand2,
  Globe,
  CheckCircle2,
  PenTool,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const features = [
    {
      icon: Share2,
      title: "Social Media Manager",
      description: "Schedule posts, manage multiple accounts, and track engagement across all platforms",
      gradient: "from-primary to-secondary",
      route: "/social-media"
    },
    {
      icon: Mail,
      title: "Email Marketing",
      description: "Create campaigns, segment audiences, and automate workflows with ease",
      gradient: "from-secondary to-accent",
      route: "/email-marketing"
    },
    {
      icon: Target,
      title: "Lead Generation",
      description: "Capture, nurture, and convert leads with powerful automation tools",
      gradient: "from-accent to-primary",
      route: "/lead-generation"
    },
    {
      icon: Sparkles,
      title: "Content Creation",
      description: "AI-powered content generation for blogs, social posts, and marketing copy",
      gradient: "from-primary to-accent",
      route: "/content-creation"
    },
    {
      icon: Sparkles,
      title: "Smart Campaign Autopilot",
      description: "AI creates, optimizes, and manages multi-channel campaigns automatically",
      gradient: "from-primary to-secondary",
      route: "/campaign-autopilot",
      badge: "NEW"
    },
    {
      icon: Sparkles,
      title: "Social Listening & Monitoring",
      description: "Real-time brand tracking with AI-powered sentiment analysis and alerts",
      gradient: "from-secondary to-primary",
      route: "/social-listening",
      badge: "NEW"
    }
  ];

  const stats = [
    { icon: TrendingUp, value: "10x", label: "ROI Increase" },
    { icon: Users, value: "50k+", label: "Active Users" },
    { icon: FileText, value: "1M+", label: "Content Created" },
    { icon: BarChart3, value: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TurviHub
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent">
                      Features
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[400px] p-4">
                        <div className="grid gap-3">
                          {features.map((feature, index) => (
                            <button
                              key={index}
                              onClick={() => navigate(feature.route)}
                              className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-smooth text-left group"
                            >
                              <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <feature.icon className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                                  {feature.title}
                                  {feature.badge && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-primary text-white">
                                      {feature.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {feature.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
                About
              </a>
              {user ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                  <Button size="sm" className="bg-gradient-primary shadow-glow" onClick={() => navigate("/social-media")}>
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
                  <Button size="sm" className="bg-gradient-primary shadow-glow" onClick={() => navigate("/auth")}>Get Started</Button>
                </>
              )}
            </nav>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden pt-4 pb-2 flex flex-col gap-3">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground px-3 py-2">Features</div>
                {features.map((feature, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(feature.route);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-smooth text-left w-full"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                      <feature.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {feature.title}
                        {feature.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-gradient-primary text-white">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                About
              </a>
              <div className="flex gap-2 pt-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-primary" onClick={() => navigate("/social-media")}>
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/auth")}>
                      Sign In
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-primary" onClick={() => navigate("/auth")}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 md:py-48">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
              AI Digital Platform
              <span className="block bg-gradient-primary bg-clip-text text-transparent mt-2">
                Powered by Intelligence
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your digital presence with AI-powered tools for content creation, 
              social media management, marketing automation, and intelligent insights.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in">
            <Button 
              size="lg" 
              className="bg-gradient-primary shadow-glow hover:shadow-xl transition-all text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-32">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to grow your digital presence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group cursor-pointer hover:shadow-elegant transition-smooth border-border/50 hover:border-primary/50"
                onClick={() => navigate(feature.route)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      {feature.badge && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gradient-primary text-white">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Ready to Transform Your Digital Presence?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join businesses using TurviHub's AI Digital Platform to scale and succeed
          </p>
          <Button size="lg" className="bg-gradient-primary shadow-glow hover:shadow-xl transition-all text-lg px-8 py-6" onClick={() => navigate("/auth")}>
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-lg mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 TurviHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
