import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { AuthContext } from '../components/AuthContext';
import { loginSchema } from '../schemas/auth.schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('LoginPage must be used within AuthProvider');
  }

  const { login, error } = context;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setFormError(validationResult.error.issues[0]?.message ?? 'Input tidak valid');
      return;
    }

    try {
      setFormError(null);
      setIsLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-grid">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.12),transparent_35%)]" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-none grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="flex items-end p-6 md:p-10 lg:p-14">
          <div className="w-full max-w-2xl rounded-3xl border border-border/60 bg-surface-1/60 p-8 shadow-default backdrop-blur-xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Erparque</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-text-h md:text-5xl">
              ERP & R&D Management untuk Konveksi Make-to-Order.
            </h1>
            <p className="mt-4 text-base text-text md:text-lg">
              Kelola tech pack, costing, sales order, SPK produksi, hingga pembayaran dalam satu command center.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10 lg:p-14">
          <Card className="w-full max-w-md border-border/60 bg-surface-1/80 backdrop-blur-xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl">Admin Login</CardTitle>
              <CardDescription>Access is managed by your company administrator.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-text" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="pl-9"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-text" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-9"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {(formError || error) && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {formError ?? error}
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="h-11 w-full">
                  {isLoading ? 'Logging in...' : 'Continue to Dashboard'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
