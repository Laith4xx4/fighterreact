import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CoachesPreviewSection } from "@/components/landing/CoachesPreviewSection";
import { SessionsPreviewSection } from "@/components/landing/SessionsPreviewSection";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Current User Role:", user.role);
      
      if (user.role === 'Admin') {
        navigate('/admin');
      } else if (user.role === 'Coach') {
        navigate('/coach');
      } else if (user.role === 'Member') {
        navigate('/member');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <PublicLayout>
      <HeroSection />
      <FeaturesSection />
      <CoachesPreviewSection />
      <SessionsPreviewSection />
      <CTASection />
    </PublicLayout>
  );
};

export default Index;
