import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-primary opacity-95" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-sm mb-6 animate-fade-in">
            <Star className="h-4 w-4 fill-current" />
            <span>Rated 4.9/5 by 1000+ members</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Transform Your Body,{" "}
            <span className="text-primary-foreground/70">Elevate Your Life</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Join our elite fitness community with world-class coaches, personalized training programs, and state-of-the-art facilities designed for your success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" variant="secondary" asChild className="text-base">
              <Link to="/register">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/sessions">View Schedule</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-foreground/10">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">1000+</div>
                <div className="text-sm text-primary-foreground/60">Active Members</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-foreground/10">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">50+</div>
                <div className="text-sm text-primary-foreground/60">Weekly Classes</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-foreground/10">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">15+</div>
                <div className="text-sm text-primary-foreground/60">Expert Coaches</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-foreground/10">
                <Star className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">4.9</div>
                <div className="text-sm text-primary-foreground/60">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
