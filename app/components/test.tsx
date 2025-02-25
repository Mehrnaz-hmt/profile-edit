"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import VerificationDialog from "./VerificationDialog";
import { toast } from "react-hot-toast";

export default function PersianProfileDialog() {
  const [formData, setFormData] = useState({
    phoneNumber: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Handle phone number change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setFormData((prev) => ({ ...prev, phoneNumber: value }));
  };

  // Send phone number to server and get OTP
  const handlePhoneSubmit = async () => {
    if (formData.phoneNumber.length !== 11) {
      toast.error("شماره تلفن باید 11 رقم باشد.");
      return;
    }

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });

      if (!response.ok) throw new Error("خطا در دریافت کد تأیید");

      const data = await response.json();
      setVerificationCode(data.otp);
      setIsDialogOpen(true);
    } catch (error) {
      toast.error("خطا در ارسال شماره تلفن");
    }
  };

  return (
    <>
      <Card className="mt-4">
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="phoneNumber">شماره تماس</Label>
              <div className="flex gap-2">
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="09123456789"
                  disabled={isVerified}
                  dir="ltr"
                />
                <Button onClick={handlePhoneSubmit} disabled={isVerified}>
                  {isVerified ? "تأیید شد!" : "ثبت و دریافت کد"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <VerificationDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        expectedCode={verificationCode}
        isVerified={isVerified}
        setIsVerified={setIsVerified}
      />
    </>
  );
}
