import { ROUTES } from "@/lib/constants";
import { api } from "@convex/api";
import { useConvexAuth, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const user = useQuery(api.users.getCurrentUser);
  const state = useConvexAuth();
  const isLoading = user === undefined || state.isLoading;
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure the user is authenticated
    if (!isLoading && user && state.isAuthenticated) {
      console.log("User authenticated, redirecting to quiz home");
      void navigate(generatePath(ROUTES.quizHome));
    }
  }, [isLoading, user, navigate, state.isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "login" | "register")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
