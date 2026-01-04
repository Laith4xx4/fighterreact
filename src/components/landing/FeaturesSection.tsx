import { Dumbbell, Clock, Users, TrendingUp, Heart, Zap } from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    title: "Expert Coaching",
    description: "Train with certified professionals who create personalized programs for your goals.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Book sessions that fit your lifestyle with our easy-to-use scheduling system.",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Join a motivating community of like-minded fitness enthusiasts.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your achievements with detailed analytics and progress reports.",
  },
  {
    icon: Heart,
    title: "Holistic Approach",
    description: "From strength to flexibility, we cover all aspects of your fitness journey.",
  },
  {
    icon: Zap,
    title: "Quick Results",
    description: "See real transformation with our proven training methodologies.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Why Choose <span className="text-gradient">FitClub</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            We offer a comprehensive fitness experience designed to help you achieve your goals faster and more effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-3 rounded-xl bg-primary/5 w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
