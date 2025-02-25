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
  isVerified: boolean;
  setIsVerified: (open: boolean) => void;
}

export default function VerificationDialog({
  isOpen,
  setIsOpen,
  expectedCode,
  isVerified,
  setIsVerified,
}: VerificationDialogProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Verify OTP
  const handleVerificationSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (verificationCode === expectedCode) {
        setIsVerified(true);
        toast.success("شماره تأیید شد ✅");
        setTimeout(() => setIsOpen(false), 1000);
      } else {
        toast.error("کد تأیید نادرست است ❌");
      }
      setIsLoading(false);
    }, 1000);
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
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
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
