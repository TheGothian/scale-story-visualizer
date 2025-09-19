import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isWebAuthnEnabled } from "@/config/webauthn";
import { getWebAuthnOptions, verifyWebAuthn } from "@/hooks/useAuth";
import { userManager } from "@/lib/oidc";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setAuth } = useAuth();
  const webAuthnEnabled = isWebAuthnEnabled();
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "custom-auth-signup",
        {
          body: { email, password },
        }
      );

      if (error || !data?.token) {
        toast({
          title: "Sign up failed",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } else {
        setAuth(data.token, data.user);
        toast({ title: "Success!", description: "Account created." });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "custom-auth-login",
        {
          body: { email, password },
        }
      );

      if (error || !data?.token) {
        toast({
          title: "Sign in failed",
          description: error?.message || "Please check your credentials.",
          variant: "destructive",
        });
      } else {
        setAuth(data.token, data.user);
        toast({
          title: "Welcome back!",
          description: "Signed in successfully.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Bodybuilding Tracker
            </CardTitle>
          </div>
          <p className="text-gray-600">Sign in to track your fitness journey</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                {webAuthnEnabled && (
                  <Button
                    type="button"
                    className="w-full mt-2"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const options = await getWebAuthnOptions(
                          "authentication"
                        );
                        if (!options) return;
                        // @ts-ignore - WebAuthn types in DOM
                        const cred = await navigator.credentials.get({
                          publicKey: options,
                        });
                        const res = await verifyWebAuthn(
                          "authentication",
                          undefined,
                          cred
                        );
                        if (res?.ok)
                          toast({
                            title: "Passkey",
                            description:
                              "Authenticated (server placeholder). Finish flow.",
                          });
                      } catch (e) {
                        toast({
                          title: "Passkey failed",
                          description: "Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Use Passkey
                  </Button>
                )}
                <Button
                  type="button"
                  className="w-full mt-2"
                  variant="outline"
                  onClick={async () => {
                    try {
                      console.log("=== STARTING AUTHELIA SIGN-IN ===");
                      console.log("Current origin:", window.location.origin);
                      console.log("UserManager settings:", {
                        authority: userManager.settings.authority,
                        client_id: userManager.settings.client_id,
                        redirect_uri: userManager.settings.redirect_uri,
                        response_type: userManager.settings.response_type,
                        scope: userManager.settings.scope,
                      });
                      console.log(
                        "About to call userManager.signinRedirect()..."
                      );
                      await userManager.signinRedirect();
                    } catch (e) {
                      console.error("Error during sign-in redirect:", e);
                      toast({
                        title: "Sign-in error",
                        description: `Failed to redirect to Authelia: ${
                          e instanceof Error ? e.message : "Unknown error"
                        }`,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Sign in with Authelia
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
                {webAuthnEnabled && (
                  <Button
                    type="button"
                    className="w-full mt-2"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const options = await getWebAuthnOptions(
                          "registration"
                        );
                        if (!options) return;
                        // @ts-ignore - WebAuthn types in DOM
                        const cred = await navigator.credentials.create({
                          publicKey: options,
                        });
                        const res = await verifyWebAuthn(
                          "registration",
                          undefined,
                          cred
                        );
                        if (res?.ok)
                          toast({
                            title: "Passkey",
                            description:
                              "Passkey registered (server placeholder).",
                          });
                      } catch (e) {
                        toast({
                          title: "Passkey failed",
                          description: "Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Create Passkey
                  </Button>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
