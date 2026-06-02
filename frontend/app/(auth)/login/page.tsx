"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authService } from "@/services";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.login(data);
      setUser(res.user);
      await fetchCart();
      toast.success(`Welcome back, ${res.user.full_name.split(" ")[0]}!`);
      router.push(res.user.role === "admin" ? "/admin" : "/");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090f]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-black tracking-tighter gradient-text" style={{ fontFamily: "var(--font-syne)" }}>SKYKART</span>
          </Link>
          <h1 className="text-xl font-bold mt-4 mb-1" style={{ fontFamily: "var(--font-syne)" }}>Welcome back</h1>
          <p className="text-sm text-[rgba(240,239,248,0.4)]">Sign in to your account</p>
        </div>

        <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail className="w-3.5 h-3.5" />}
              error={errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" placeholder="••••••••" icon={<Lock className="w-3.5 h-3.5" />}
              error={errors.password?.message} {...register("password")} />
            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2" size="lg">Sign In</Button>
          </form>

          <div className="mt-5 text-center space-y-2">
            <p className="text-xs text-[rgba(240,239,248,0.4)]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#9d97ff] hover:underline">Sign up</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[rgba(240,239,248,0.25)] mt-6">
          Demo: admin@skykart.com / Admin@123
        </p>
      </div>
    </div>
  );
}
