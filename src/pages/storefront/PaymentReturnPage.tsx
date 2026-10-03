import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Order } from "@/lib/types";
import { verifyPayment } from "@/services/paymentService";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDateTime } from "@/lib/utils";

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const hasRun = useRef(false);

  const verify = useCallback(async (ref: string) => {
    setStatus("verifying");
    try {
      const result = await verifyPayment(ref);
      setOrder(result);
      if (result.paymentStatus === "paid" || result.paymentStatus === "success") {
        setStatus("success");
      } else {
        // Verification returned but payment is not confirmed yet
        setStatus("success");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Payment verification failed");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    if (reference) {
      verify(reference);
    } else {
      setErrorMsg("No payment reference found in the URL.");
      setStatus("error");
    }
  }, [reference, verify]);

  return (
    <StorefrontLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          {status === "verifying" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-teal-600 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Verifying Payment</h1>
              <p className="text-gray-500 text-sm mt-2">
                Please wait while we confirm your payment with Paystack…
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Payment Confirmed</h1>
              <p className="text-gray-500 text-sm mt-2">
                Your payment has been verified successfully.
              </p>
              {order && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment</span>
                    <span className="font-medium capitalize">{order.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>
              )}
              <div className="mt-6 flex flex-col gap-3">
                {order && (
                  <Link to={`/orders/${order._id}`}>
                    <Button className="w-full">View order</Button>
                  </Link>
                )}
                <Link to="/orders">
                  <Button variant="outline" className="w-full">All orders</Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Verification Failed</h1>
              <p className="text-gray-500 text-sm mt-2">{errorMsg}</p>
              <p className="text-gray-400 text-xs mt-3">
                If you completed payment, your order will be updated once the payment is confirmed.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {reference && (
                  <Button className="w-full" onClick={() => verify(reference)}>
                    Retry verification
                  </Button>
                )}
                <Link to="/orders">
                  <Button variant="outline" className="w-full">Go to orders</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
