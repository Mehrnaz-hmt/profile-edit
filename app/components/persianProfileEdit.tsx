"use client";
import React, { ChangeEvent, useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import VerificationDialog from "./VerificationDialog";
import Image from "next/image";
import { Edit2 } from "lucide-react";

// ---------- profile picture

interface submittedData {
  firstName: string;
  lastName: string;
  englishFirstName: string;
  englishLastName: string;
  displayFirstName: string;
  displayLastName: string;
  phoneNumber: string;
  email: string;
  profileImageBase64: string;
}

interface PersonData {
  id?: number;
  firstName: string;
  lastName: string;
  englishFirstName: string;
  englishLastName: string;
  displayFirstName: string;
  displayLastName: string;
  phoneNumber: string;
  email: string;
  profileImage: File | null;
}

export default function persianProfileEdit() {
  const persianRegex = /^[\u0600-\u06FF\s]*$/;
  const englishRegex = /^[A-Za-z\s]*$/;
  // const numberRegex = /^[0-9]+$/;
  const numberRegex = /^09\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PersonData>({
    firstName: "",
    lastName: "",
    englishFirstName: "",
    englishLastName: "",
    displayFirstName: "",
    displayLastName: "",
    phoneNumber: "",
    email: "",
    profileImage: null,
  });
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<PersonData>();
  const [isClient, setIsClient] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  ); //when user is typing her/his phone number

  //send data to the server:
  useEffect(() => {
    const sendData = async () => {
      try {
        const response = await fetch("/your-endpoint-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Network response was not ok.");
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error("Failed to send data:", error);
      }
    };
  }, [formData]);

  useEffect(() => {
    const PhoneInput = ({
      onOTPReceived,
    }: {
      onOTPReceived: (otp: string) => void;
    }) => {
      const [phoneNumber, setPhoneNumber] = useState("");

      const handleInputChange = async (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        const onlyPhoneNumber = e.target.value.replace(/\D/g, "");
        setPhoneNumber(onlyPhoneNumber);

        if (onlyPhoneNumber.length === 11) {
          try {
            const response = await fetch("/api/send-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phoneNumber: onlyPhoneNumber }),
            });

            if (response.ok) {
              const data = await response.json();
              onOTPReceived(data.otp);
            } else {
              console.error("Failed to send OTP");
            }
          } catch (error) {
            console.error("Error sending OTP:", error);
          }
        }
      };
    };
  }, [formData.phoneNumber]);

  useEffect(() => {
    function fetchUserData() {
      setUserData({ ...getpersonData(), profileImage: null });
    }
    if (userData) {
      setFormData(userData);
      setIsLoading(false);
    } else {
      fetchUserData();
    }
  }, [userData]);

  useEffect(() => {
    const storedData = localStorage.getItem("formData");
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      displayName: generateShortName(
        `${prevFormData.firstName} ${prevFormData.lastName}`
      ),
    }));
  }, [formData.firstName, formData.lastName]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const generateShortName = (fullName: string): string => {
    if (!fullName) {
      return ""; // Handle empty input
    }
    const nameParts = fullName.split(" ");
    const theFirstLast = [nameParts[0], nameParts[nameParts.length - 1]].join(
      " "
    );
    return theFirstLast;
  };

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      (name === "firstName" || name === "lastName") &&
      !persianRegex.test(value)
    ) {
      toast.error("لطفا به فارسی تایپ کنید");
      return;
    }
    if (
      (name === "englishFirstName" || name === "englsihLastName") &&
      !englishRegex.test(value)
    ) {
      toast.error("لطفا به انگلیسی تایپ کنید");
      return;
    }

    if (name === "phoneNumber") {
      if (typingTimeout) clearTimeout(typingTimeout);
      const newTimeout = setTimeout(() => {
        if (value.length !== 11) {
          toast.error("شماره موبایل باید دقیقاً ۱۱ رقم باشد");
        }
      }, 1000); // 1-second delay after user stops typing
      setTypingTimeout(newTimeout);
    }

    if (name === "email" && !emailRegex.test(value)) {
      toast.error("فرمت ایمیل صحیح نیست");
    }
    setFormData({ ...formData, [name]: value });
  };

  // ----profile picture
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log(e.target.files[0]);
      setFormData({ ...formData, profileImage: e.target.files[0] });
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, profileImage: null });
  };

  // phone editing moode
  const handlePhoneSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });

      console.log("Sending phone number:", formData.phoneNumber); // Debug log

      if (!formData.phoneNumber) {
        toast.error("شماره تلفن را وارد کنید");
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت کد تأیید");
      }

      const data = await response.json();
      setVerificationCode(data.otp); // Save OTP for verification
      setIsDialogOpen(true); // Open the verification dialog
    } catch (error) {
      toast.error("خطا در ارسال شماره تلفن");
    }
  };

  // -------base64--convert image to text (for sending to server)
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("File reading failed"));
    });

  // ------Send Informations to server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);

    // Append the image file (if it exists)
    let base64ProfileImage;
    if (formData.profileImage) {
      base64ProfileImage = await toBase64(formData.profileImage);
      // Remove "data:image/jpeg; base64," part from the string if needed
      const baseIndex = base64ProfileImage.indexOf(",");
      base64ProfileImage =
        baseIndex !== -1 ? base64ProfileImage.substring(baseIndex + 1) : "";
    }

    if (!isVerified) {
      toast.error("شماره تلفن را وارد کنید !");
    }

    const data: submittedData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      englishFirstName: formData.englishFirstName,
      englishLastName: formData.englishLastName,
      displayFirstName: formData.displayFirstName,
      displayLastName: formData.displayLastName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      profileImageBase64: base64ProfileImage ?? "",
    };

    try {
      console.log(JSON.stringify(data));
    } catch (error) {
      toast.error("Error submitting form");
    }
  };

  function getpersonData() {
    return {
      firstName: "سید رضا",
      lastName: " جوادی  آملی",
      englishFirstName: "Seyed Reza",
      englishLastName: "Javadi Amoli",
      displayFirstName: "رضا",
      displayLastName: "جوادی",
      phoneNumber: "+989123456789",
      email: "reza@example.com",
    };
  }

  return (
    <div className="p-4" dir="rtl">
      <Toaster />

      <Button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? "بستن فرم" : "ویرایش پروفایل"}
      </Button>

      {isEditing && (
        <Card className="mt-4">
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 items-center justify-center "
            >
              <div className="relative w-32 h-32  mb-4 mx-10">
                {formData.profileImage ? (
                  <>
                    <Image
                      src={
                        URL.createObjectURL(formData.profileImage) ||
                        "/placeholder.svg"
                      }
                      alt="Profile Preview"
                      style={{ objectFit: "cover" }}
                      className="rounded-full"
                      fill
                      sizes="100vw"
                    />
                    <button
                      onClick={() =>
                        document.getElementById("profileImage")?.click()
                      }
                      className="absolute bottom-2 right-2 bg-blue-500 p-2 rounded-full text-white shadow-md"
                      type="button"
                      aria-label="Edit image"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white shadow-md"
                      type="button"
                      aria-label="Remove image"
                    >
                      <FaTrash size={12} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                    <label htmlFor="profileImage" className="cursor-pointer">
                      <Edit2 size={24} className="text-gray-400" />
                      <span className="sr-only">Upload profile picture</span>
                    </label>
                  </div>
                )}
                <Input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={profileImageInputRef}
                />
              </div>
              <div className="flex justify-between gap-[20px]">
                <div>
                  <Label htmlFor="firstName">نام</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">نام خانوادگی</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <Label htmlFor="englishFirstName">نام انگلیسی</Label>
                  <Input
                    id="englishFirstName"
                    name="englishFirstName"
                    value={formData.englishFirstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">نام خانوادگی انگلیسی</Label>
                  <Input
                    id="englishLastName"
                    name="englishLastName"
                    value={formData.englishLastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  <Label htmlFor="displayFirstName">نام نمایشی</Label>
                  <Input
                    id="displayFirstName"
                    name="displayFirstName"
                    value={formData.displayFirstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="displayLastName">نام خانوادگی نمایشی</Label>
                  <Input
                    id="displayLastName"
                    name="displayLastName"
                    value={formData.displayLastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

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
                        <Button
                          onClick={handlePhoneSubmit}
                          disabled={isVerified}
                        >
                          {isVerified ? "تأیید شد!" : "ثبت و دریافت کد"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isDialogOpen && (
                <VerificationDialog
                  isOpen={isDialogOpen}
                  setIsOpen={setIsDialogOpen}
                  expectedCode={verificationCode}
                  isVerified={isVerified}
                  setIsVerified={setIsVerified}
                  phoneNumber={formData.phoneNumber}
                />
              )}

              <div>
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  dir="ltr"
                />
              </div>
              {isVerified ? (
                <Button type="submit">ثبت</Button>
              ) : (
                <Button disabled type="submit">
                  ثبت
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
