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

interface VerificationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  expectedCode: string;
  isVerified: boolean;
  setIsVerified: (open: boolean) => void;
}

export default function VerificationDialog({isOpen,setIsOpen,expectedCode,isVerified,setIsVerified}: VerificationDialogProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerificationSubmit = async () => {
    setIsLoading(true);
    setTimeout(() => {
      if (verificationCode === expectedCode) {
        setIsVerified(true);
        setTimeout(() => setIsOpen(false), 1500); // Close after 1.5 seconds
      } else {
        alert("کد تأیید نادرست است!");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setVerificationCode(value);
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
            onChange={handleCodeChange}
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
