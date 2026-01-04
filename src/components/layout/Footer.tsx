import { Link } from "react-router-dom";
import { Dumbbell, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <Dumbbell className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-xl">FitClub</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm">
              Transform your body and mind with our expert coaches and state-of-the-art facilities.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/coaches" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Our Coaches
                </Link>
              </li>
              <li>
                <Link to="/sessions" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Class Schedule
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Become a Member
                </Link>
              </li>
            </ul>
          </div>

          {/* Classes */}
          <div>
            <h4 className="font-display font-semibold mb-4">Our Classes</h4>
            <ul className="space-y-3">
              <li className="text-primary-foreground/70 text-sm">Strength Training</li>
              <li className="text-primary-foreground/70 text-sm">HIIT Workouts</li>
              <li className="text-primary-foreground/70 text-sm">Yoga & Flexibility</li>
              <li className="text-primary-foreground/70 text-sm">Cardio Sessions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <MapPin className="h-4 w-4" />
                <span>123 Fitness Street, City</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Phone className="h-4 w-4" />
                <span>+1 234 567 890</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Mail className="h-4 w-4" />
                <span>info@fitclub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © {new Date().getFullYear()} FitClub. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
