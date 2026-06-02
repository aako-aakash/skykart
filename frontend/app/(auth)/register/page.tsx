"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authService } from "@/services";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, User, Phone } from "lucide-react";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Must contain a number").regex(/[a-zA-Z]/, "Must contain a letter"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, { message: "Passwords don't match", path: ["confirm_password"] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ confirm_password, ...data }: FormData) => {
    try {
      await authService.register(data);
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090f] py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/"><span className="text-2xl font-black tracking-tighter gradient-text" style={{ fontFamily: "var(--font-syne)" }}>SKYKART</span></Link>
          <h1 className="text-xl font-bold mt-4 mb-1" style={{ fontFamily: "var(--font-syne)" }}>Create account</h1>
          <p className="text-sm text-[rgba(240,239,248,0.4)]">Start your SKYKART journey</p>
        </div>

        <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" icon={<User className="w-3.5 h-3.5" />} error={errors.full_name?.message} {...register("full_name")} />
            <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail className="w-3.5 h-3.5" />} error={errors.email?.message} {...register("email")} />
            <Input label="Phone (optional)" placeholder="+91 98765 43210" icon={<Phone className="w-3.5 h-3.5" />} {...register("phone")} />
            <Input label="Password" type="password" placeholder="Min 8 chars, 1 letter, 1 number" icon={<Lock className="w-3.5 h-3.5" />} error={errors.password?.message} {...register("password")} />
            <Input label="Confirm Password" type="password" placeholder="••••••••" icon={<Lock className="w-3.5 h-3.5" />} error={errors.confirm_password?.message} {...register("confirm_password")} />
            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2" size="lg">Create Account</Button>
          </form>
          <p className="text-center text-xs text-[rgba(240,239,248,0.4)] mt-5">
            Already have an account? <Link href="/login" className="text-[#9d97ff] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
