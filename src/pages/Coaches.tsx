import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Search, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { coachProfilesApi, usersApi } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function Coaches() {
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useApi(
    () => coachProfilesApi.getAll(),
    { autoFetch: isAuthenticated }
  );

  const { data: users, isLoading: usersLoading, error: usersError } = useApi(
    () => usersApi.getAll(),
    { autoFetch: isAuthenticated }
  );

  const isLoading = profilesLoading || usersLoading;
  const error = profilesError || usersError;

  // Join users and profiles
  const coachUsers = users?.filter(u => u.role === 'Coach') || [];
  const coaches = coachUsers.map(user => {
    const profile = profiles?.find(p => p.userName === user.userName);
    return {
      id: profile?.id || user.id,
      userName: user.userName,
      specialization: profile?.specialization || "New Coach",
      bio: profile?.bio || "No biography provided yet.",
      certifications: profile?.certifications,
      sessionsCount: profile?.sessionsCount || 0,
      feedbacksCount: profile?.feedbacksCount || 0
    };
  });

  // Extract unique specializations
  const specializations = coaches
    ? ["All", ...Array.from(new Set(coaches.map((c) => c.specialization)))]
    : ["All"];

  const filteredCoaches = coaches?.filter((coach) => {
    const matchesSearch =
      coach.userName.toLowerCase().includes(search.toLowerCase()) ||
      coach.specialization.toLowerCase().includes(search.toLowerCase()) ||
      coach.bio.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = selectedSpec === "All" || coach.specialization === selectedSpec;
    return matchesSearch && matchesSpec;
  }) || [];

  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background">
          <section className="bg-gradient-primary py-16 pt-24">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
                مدربونا الخبراء
              </h1>
              <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
                تعرف على فريقنا من المحترفين المعتمدين
              </p>
            </div>
          </section>

          <div className="container mx-auto px-4 py-12">
            <Alert className="max-w-2xl mx-auto">
              <Lock className="h-4 w-4" />
              <AlertTitle>تسجيل الدخول مطلوب</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  يجب تسجيل الدخول لعرض قائمة المدربين والاطلاع على تفاصيلهم.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/login")}>
                    تسجيل الدخول
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/register")}>
                    إنشاء حساب جديد
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner size="lg" text="جاري تحميل المدربين..." />
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-4">
            <ErrorAlert error={error} title="خطأ في تحميل المدربين" />
            <div className="text-center mt-4">
              <Button onClick={() => navigate("/login")}>
                تسجيل الدخول
              </Button>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-primary py-16 pt-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
              مدربونا الخبراء
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
              تعرف على فريقنا من المحترفين المعتمدين المكرسين لمساعدتك في تحقيق أهداف اللياقة البدنية
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن مدربين..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {specializations.map((spec) => (
                  <Button
                    key={spec}
                    variant={selectedSpec === spec ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpec(spec)}
                  >
                    {spec === "All" ? "الكل" : spec}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Coaches Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredCoaches.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">لم يتم العثور على مدربين</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoaches.map((coach, index) => (
                  <Link
                    key={coach.id}
                    to={`/coaches/${coach.id}`}
                    className="group block animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover-lift">
                      <div className="aspect-[4/3] bg-gradient-primary flex items-center justify-center">
                        <span className="text-6xl font-display font-bold text-primary-foreground/30">
                          {coach.userName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                            {coach.userName}
                          </h3>
                          {coach.certifications && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              معتمد
                            </span>
                          )}
                        </div>

                        <p className="text-primary text-sm font-medium mb-2">
                          {coach.specialization}
                        </p>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {coach.bio}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {coach.sessionsCount} جلسة
                          </span>
                          <span className="flex items-center gap-1">
                            💬 {coach.feedbacksCount} تقييم
                          </span>
                        </div>

                        {coach.certifications && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                            الشهادات: {coach.certifications}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
