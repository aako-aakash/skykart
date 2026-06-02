"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { userService, authService } from "@/services";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { User, Package, Lock } from "lucide-react";
import Link from "next/link";

const profileSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional(),
});
const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).regex(/\d/).regex(/[a-zA-Z]/),
});

export default function AccountPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pe, isSubmitting: pSubmitting }, reset: resetProfile } = useForm({ resolver: zodResolver(profileSchema), defaultValues: { full_name: user?.full_name ?? "", phone: user?.phone ?? "" } });
  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: we, isSubmitting: wSubmitting }, reset: resetPwd } = useForm({ resolver: zodResolver(passwordSchema) });

  const saveProfile = async (data: any) => {
    try {
      const updated = await userService.updateProfile(data);
      setUser(updated);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
  };

  const changePassword = async (data: any) => {
    try {
      await authService.changePassword(data.current_password, data.new_password);
      toast.success("Password changed!");
      resetPwd();
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-syne)" }}>My Account</h1>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[{ href: "/orders", icon: Package, label: "My Orders" }].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-3 p-4 bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl hover:border-[rgba(108,99,255,0.3)] transition-all">
              <Icon className="w-4 h-4 text-[#9d97ff]" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Profile */}
      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
        <h2 className="font-semibold text-sm flex items-center gap-2 mb-5"><User className="w-4 h-4 text-[#9d97ff]" /> Profile Details</h2>
        <form onSubmit={handleProfile(saveProfile)} className="space-y-4">
          <Input label="Full Name" {...regProfile("full_name")} error={pe.full_name?.message} />
          <Input label="Phone" {...regProfile("phone")} />
          <div>
            <label className="text-xs font-medium text-[rgba(240,239,248,0.4)] uppercase tracking-wide">Email</label>
            <p className="mt-1.5 text-sm text-[rgba(240,239,248,0.5)] bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2.5">{user?.email}</p>
          </div>
          <Button type="submit" isLoading={pSubmitting} size="sm">Save Changes</Button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
        <h2 className="font-semibold text-sm flex items-center gap-2 mb-5"><Lock className="w-4 h-4 text-[#9d97ff]" /> Change Password</h2>
        <form onSubmit={handlePwd(changePassword)} className="space-y-4">
          <Input label="Current Password" type="password" {...regPwd("current_password")} error={we.current_password?.message} />
          <Input label="New Password" type="password" {...regPwd("new_password")} error={we.new_password?.message} />
          <Button type="submit" isLoading={wSubmitting} size="sm">Update Password</Button>
        </form>
      </div>
    </div>
  );
}
