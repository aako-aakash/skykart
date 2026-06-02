"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { orderService, paymentService, userService } from "@/services";
import { formatPrice } from "@/utils";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MapPin, Plus, CreditCard, CheckCircle } from "lucide-react";
import type { Address } from "@/types";

const addrSchema = z.object({
  full_name: z.string().min(2), phone: z.string().min(10),
  line1: z.string().min(5), line2: z.string().optional(),
  city: z.string().min(2), state: z.string().min(2),
  pincode: z.string().min(4), country: z.string().default("India"),
  is_default: z.boolean().default(false),
});
type AddrForm = z.infer<typeof addrSchema>;

declare global { interface Window { Razorpay: any } }

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [selectedAddr, setSelectedAddr] = useState<string>("");
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState<"address" | "payment" | "done">("address");

  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated]);

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: userService.getAddresses,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (addresses?.length && !selectedAddr) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      setSelectedAddr(def.id);
    }
  }, [addresses]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AddrForm>({ resolver: zodResolver(addrSchema) });

  const saveAddress = async (data: AddrForm) => {
    const addr = await userService.addAddress(data as any);
    setSelectedAddr(addr.id);
    setShowAddrForm(false);
    reset();
    refetchAddresses();
    toast.success("Address saved!");
  };

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { toast.error("Please select a delivery address"); return; }
    setPlacing(true);
    try {
      const order = await orderService.checkout(selectedAddr);
      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) { toast.error("Payment gateway failed to load"); return; }

      const rzpOrder = await paymentService.createRazorpayOrder(order.id);

      const options = {
        key: rzpOrder.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "SKYKART",
        description: rzpOrder.description,
        order_id: rzpOrder.razorpay_order_id,
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await fetchCart();
            setStep("done");
            setTimeout(() => router.push(`/orders/${order.id}`), 2500);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#6C63FF" },
        modal: { ondismiss: () => toast.error("Payment cancelled") },
      };
      new window.Razorpay(options).open();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (step === "done") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "var(--font-syne)" }}>Order Placed!</h2>
        <p className="text-sm text-[rgba(240,239,248,0.5)]">Redirecting to your order…</p>
      </div>
    </div>
  );

  const shipping = cart && cart.total_amount < 499 ? 49 : 0;
  const total = cart ? cart.total_amount + shipping : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black mb-8" style={{ fontFamily: "var(--font-syne)" }}>Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Address */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[#9d97ff]" /> Delivery Address
            </h2>

            <div className="space-y-2.5 mb-4">
              {addresses?.map((addr: Address) => (
                <label key={addr.id} className={`flex gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${selectedAddr === addr.id ? "border-[#6C63FF]/50 bg-[rgba(108,99,255,0.07)]" : "border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)]"}`}>
                  <input type="radio" name="addr" value={addr.id} checked={selectedAddr === addr.id} onChange={() => setSelectedAddr(addr.id)} className="mt-0.5 accent-[#6C63FF]" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-[#f0eff8]">{addr.full_name} · {addr.phone}</p>
                    <p className="text-[rgba(240,239,248,0.5)]">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                    <p className="text-[rgba(240,239,248,0.5)]">{addr.city}, {addr.state} — {addr.pincode}</p>
                  </div>
                </label>
              ))}
            </div>

            <button onClick={() => setShowAddrForm((p) => !p)} className="flex items-center gap-2 text-xs text-[#9d97ff] hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add new address
            </button>

            {showAddrForm && (
              <form onSubmit={handleSubmit(saveAddress)} className="mt-5 space-y-3 border-t border-[rgba(255,255,255,0.07)] pt-5">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full Name" {...register("full_name")} error={errors.full_name?.message} />
                  <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
                </div>
                <Input label="Address Line 1" {...register("line1")} error={errors.line1?.message} />
                <Input label="Address Line 2 (optional)" {...register("line2")} />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="City" {...register("city")} error={errors.city?.message} />
                  <Input label="State" {...register("state")} error={errors.state?.message} />
                  <Input label="Pincode" {...register("pincode")} error={errors.pincode?.message} />
                </div>
                <Button type="submit" isLoading={isSubmitting} size="sm">Save Address</Button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6 h-fit">
          <h2 className="font-semibold mb-4 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#9d97ff]" /> Order Summary
          </h2>
          <div className="space-y-2.5 mb-4 text-xs">
            {cart?.items.map((item) => (
              <div key={item.id} className="flex justify-between text-[rgba(240,239,248,0.65)]">
                <span className="line-clamp-1 flex-1 mr-2">{item.product.name} × {item.quantity}</span>
                <span className="flex-shrink-0">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.07)] pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-[rgba(240,239,248,0.55)]">
              <span>Subtotal</span><span>{formatPrice(cart?.total_amount ?? 0)}</span>
            </div>
            <div className="flex justify-between text-[rgba(240,239,248,0.55)]">
              <span>Shipping</span><span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.07)] pt-3 mt-3 flex justify-between font-bold text-sm">
            <span>Total</span>
            <span style={{ fontFamily: "var(--font-syne)" }}>{formatPrice(total)}</span>
          </div>
          <Button onClick={handlePlaceOrder} isLoading={placing} className="w-full mt-5" size="lg" disabled={!selectedAddr || !cart?.items.length}>
            Pay {formatPrice(total)}
          </Button>
          <p className="text-center text-[10px] text-[rgba(240,239,248,0.3)] mt-3">Secured by Razorpay · 256-bit SSL</p>
        </div>
      </div>
    </div>
  );
}
