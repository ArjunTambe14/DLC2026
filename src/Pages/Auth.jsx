// Purpose: Sign-in and registration flow for demo users.
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { api } from '@/api/client';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [signupChallenge, setSignupChallenge] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', answer: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/verify-challenge?purpose=signup').then(setSignupChallenge).catch(() => setSignupChallenge(null));
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login({ email: loginForm.email, password: loginForm.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await signup({
        fullName: signupForm.fullName,
        email: signupForm.email,
        password: signupForm.password,
        challengeToken: signupChallenge?.token,
        challengeAnswer: signupForm.answer
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // Render the UI for this view.
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to StreetPulse</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mt-4 text-sm text-red-600">{error}</div>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <Button type="submit" className="w-full">Sign In</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <Input
                    placeholder="Full name"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    required
                  />
                  {signupChallenge && (
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600">Verification: {signupChallenge.question}</div>
                      <Input
                        placeholder="Your answer"
                        value={signupForm.answer}
                        onChange={(e) => setSignupForm({ ...signupForm, answer: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full">Create Account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
