import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { business } from "@/lib/business";
import { finalizeCheckoutSession } from "@/lib/finalizeCheckoutSession";
import { userBookingsQueryKey } from "@/hooks/queries/useUserBookings";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

const ThankYou = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const finalizedRef = useRef(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    if (checkout !== "success" || finalizedRef.current) return;
    if (!sessionId) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("checkout");
          next.delete("booking_id");
          return next;
        },
        { replace: true },
      );
      return;
    }
    finalizedRef.current = true;

    (async () => {
      let showToast = false;
      try {
        const result = await finalizeCheckoutSession(sessionId);
        if (!result.ok) throw new Error(result.message);
        showToast = true;
      } catch (e) {
        toast({
          title: "Payment received, syncing…",
          description: e instanceof Error ? e.message : "We’re still confirming your payment. Refresh in a moment.",
        });
      } finally {
        const { data: sessionData } = await supabase.auth.getSession();
        const uid = sessionData.session?.user?.id;
        if (uid) {
          await queryClient.invalidateQueries({ queryKey: userBookingsQueryKey(uid) });
        }
        if (showToast) {
          toast({
            title: "Payment confirmed",
            description: "Your ticket purchase was saved to your account.",
          });
        }
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete("checkout");
            next.delete("session_id");
            next.delete("booking_id");
            return next;
          },
          { replace: true },
        );
      }
    })();
  }, [searchParams, setSearchParams, queryClient]);

  const reserved = searchParams.get("reserved") === "1";

  return (
    <RequireAuth>
      <Layout>
        <Seo title="Thank you" description="Your ticket purchase at Cigar Society." path="/thank-you" noIndex />
        <section className="section-padding">
          <div className="container mx-auto max-w-xl text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
            </div>
            <SectionHeading
              title="Thank you for your ticket purchase"
              subtitle="We’re glad you’re joining us at the lounge. You’ll receive a confirmation by email when it’s ready."
            />

            <div className="mt-8 rounded-xl border border-destructive/25 bg-destructive/5 px-5 py-4 text-left">
              <p className="font-heading text-sm font-semibold text-foreground">All ticket sales are final and non-refundable.</p>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Questions? Call{" "}
                <a href={`tel:${business.phoneE164}`} className="text-primary underline underline-offset-2 hover:text-primary/90">
                  {business.phoneDisplay}
                </a>{" "}
                or{" "}
                <Link to="/contact" className="text-primary underline underline-offset-2 hover:text-primary/90">
                  contact us
                </Link>{" "}
                — we’re happy to help with event details only (not refunds or reschedules).
              </p>
            </div>

            {reserved ? (
              <p className="mt-6 font-body text-sm text-muted-foreground">
                Your free event tickets are saved to your account.
              </p>
            ) : null}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="bg-gold-gradient font-body text-sm uppercase tracking-wider text-primary-foreground shadow-gold hover:opacity-90">
                <Link to="/dashboard">View my tickets</Link>
              </Button>
              <Button asChild variant="outline" className="border-border/70 font-body">
                <Link to="/events">Browse events</Link>
              </Button>
              <Button asChild variant="outline" className="border-border/70 font-body">
                <a href={business.googleDirectionsUrl} target="_blank" rel="noopener noreferrer">
                  Directions
                </a>
              </Button>
            </div>

            <p className="mt-10 font-body text-xs text-muted-foreground">
              See also{" "}
              <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary/90">
                Terms of Service
              </Link>{" "}
              for event ticket policies.
            </p>
          </div>
        </section>
      </Layout>
    </RequireAuth>
  );
};

export default ThankYou;
