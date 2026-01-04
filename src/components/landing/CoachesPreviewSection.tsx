import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with API data
const coaches = [
  {
    id: "1",
    fullName: "Alex Johnson",
    specialization: "Strength & Conditioning",
    bio: "10+ years of experience in professional fitness coaching.",
    profilePictureUrl: null,
    averageRating: 4.9,
    totalReviews: 128,
  },
  {
    id: "2",
    fullName: "Sarah Williams",
    specialization: "Yoga & Flexibility",
    bio: "Certified yoga instructor with holistic wellness approach.",
    profilePictureUrl: null,
    averageRating: 4.8,
    totalReviews: 95,
  },
  {
    id: "3",
    fullName: "Mike Chen",
    specialization: "HIIT & Cardio",
    bio: "Former athlete specializing in high-intensity training.",
    profilePictureUrl: null,
    averageRating: 4.9,
    totalReviews: 156,
  },
];

export function CoachesPreviewSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Meet Our <span className="text-gradient">Expert Coaches</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Our certified coaches are dedicated to helping you reach your full potential.
            </p>
          </div>
          <Button variant="ghost" asChild className="mt-4 md:mt-0">
            <Link to="/coaches">
              View All Coaches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach, index) => (
            <Link
              key={coach.id}
              to={`/coaches/${coach.id}`}
              className="group block animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover-lift">
                {/* Avatar Placeholder */}
                <div className="aspect-[4/3] bg-gradient-primary flex items-center justify-center">
                  <span className="text-6xl font-display font-bold text-primary-foreground/30">
                    {coach.fullName.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{coach.averageRating}</span>
                    <span className="text-muted-foreground text-sm">({coach.totalReviews} reviews)</span>
                  </div>
                  
                  <h3 className="text-xl font-display font-semibold mb-1 group-hover:text-primary transition-colors">
                    {coach.fullName}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-2">{coach.specialization}</p>
                  <p className="text-muted-foreground text-sm line-clamp-2">{coach.bio}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
