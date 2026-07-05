import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Sprout, BarChart3, Bot, CloudSun, Target, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Aa-GROWW</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/login')} className="rounded-full px-6">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute top-40 right-20 w-[30rem] h-[30rem] bg-green-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Introducing Aa-GROWW AI Assistant 2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            The Future of Farming is <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">Intelligent & Connected</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Empower your agricultural business with AI-driven disease detection, smart irrigation, and an integrated marketplace for crops and equipment rentals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto" onClick={() => navigate('/login')}>
              Start for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto bg-background/50 backdrop-blur-md">
              Book a Demo
            </Button>
          </div>
          
          {/* Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass">
            <div className="h-8 bg-muted/80 backdrop-blur-md flex items-center px-4 gap-2 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="aspect-[16/9] bg-card p-2 md:p-6 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
              <div className="w-full h-full bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="glass-panel p-4 rounded-xl text-white">
                      <p className="text-sm opacity-80">Total Yield Predict</p>
                      <p className="text-3xl font-bold">12.5 Tons</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl text-white">
                      <Bot className="h-6 w-6 mb-2 text-primary" />
                      <p className="text-sm">"Soil moisture is optimal."</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to grow</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A comprehensive suite of tools designed specifically for modern agriculture.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Bot, title: "Multilingual AI Assistant", desc: "Get voice-supported advice in English, Hindi, and Telugu." },
              { icon: Target, title: "Disease Detection", desc: "Upload leaf images for instant AI diagnosis and treatment plans." },
              { icon: CloudSun, title: "Smart Irrigation", desc: "Automate watering based on real-time soil and weather data." },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Track revenue, yield, and generate PDF reports instantly." },
              { icon: Sprout, title: "Crop Marketplace", desc: "Connect directly with buyers to sell your harvest at the best price." },
              { icon: Sprout, title: "Equipment Rentals", desc: "Rent or lease tractors and heavy machinery within your community." }
            ].map((f, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t text-center text-muted-foreground">
        <p>© 2026 Aa-GROWW AgriTech. All rights reserved.</p>
      </footer>
    </div>
  );
};
