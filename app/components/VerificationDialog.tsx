"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

interface VerificationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  expectedCode: string;
  phoneNumber: string; // Add this prop to pass phone number
  isVerified: boolean;
  setIsVerified: (open: boolean) => void;
}

export default function VerificationDialog({
  isOpen,
  setIsOpen,
  expectedCode,
  phoneNumber, // Receive phone number
  isVerified,
  setIsVerified,
}: VerificationDialogProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Verify OTP (Now sending phoneNumber to backend)
  const handleVerificationSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber, // Send phone number
          otp: verificationCode, // Send entered OTP
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در تأیید کد");
      }
      setIsVerified(true);
      toast.success("شماره تأیید شد ✅");
      setTimeout(() => setIsOpen(false), 1000);
    } catch (error) {
      toast.error("کد تأیید نادرست است ❌");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>کد تأیید را وارد کنید</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="text-center text-2xl tracking-widest w-40"
            placeholder="0000"
            disabled={isVerified}
          />
          <Button
            onClick={handleVerificationSubmit}
            disabled={verificationCode.length !== 4 || isLoading || isVerified}
            className="w-full"
          >
            {isVerified ? "تأیید شد!" : isLoading ? "در حال بررسی..." : "ثبت"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
