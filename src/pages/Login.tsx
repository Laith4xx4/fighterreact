import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedInUser = await login(emailOrUsername, password);
      toast.success("أهلاً بك مرة أخرى! تم تسجيل الدخول بنجاح");
      
      // Redirect based on user role from the returned object
      if (loggedInUser.role === 'Admin') {
        navigate('/admin', { replace: true });
      } else if (loggedInUser.role === 'Coach') {
        navigate('/coach', { replace: true });
      } else {
        navigate('/member', { replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تسجيل الدخول. تحقق من بياناتك");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl">FitClub</span>
          </Link>

          <h1 className="text-3xl font-display font-bold mb-2">مرحباً بعودتك</h1>
          <p className="text-muted-foreground mb-8">
            سجل الدخول لحسابك لمتابعة رحلة لياقتك البدنية
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">البريد الإلكتروني أو اسم المستخدم</Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="you@example.com أو username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                disabled={isLoading}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            حوّل حياتك
          </h2>
          <p className="text-lg text-primary-foreground/70">
            احصل على برامج تدريبية مخصصة، تتبع تقدمك، وتواصل مع مدربينا الخبراء
          </p>
        </div>
      </div>
    </div>
  );
}
