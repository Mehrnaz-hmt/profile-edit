"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns-jalali"
import { CalendarIcon } from "lucide-react"

export function PersianProfileDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">ویرایش پروفایل</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ویرایش پروفایل</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullNameFa">نام و نام خانوادگی فارسی</Label>
            <Input id="fullNameFa" placeholder="نام و نام خانوادگی کامل" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayNameFa">نام و نام خانوادگی نمایشی فارسی</Label>
            <Input id="displayNameFa" placeholder="نام نمایشی کوتاه‌تر" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullNameEn">نام و نام خانوادگی انگلیسی</Label>
            <Input id="fullNameEn" placeholder="First and Last Name in English" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">تماس</Label>
            <Input id="phone" type="tel" placeholder="شماره تلفن" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" placeholder="آدرس ایمیل" />
          </div>
          <div className="space-y-2">
            <Label>تولد</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-right font-normal ${!date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? format(date, "yyyy/MM/dd") : <span>تاریخ تولد را انتخاب کنید</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>عکس پروفایل</Label>
            <div className="flex items-center space-x-4">
              {profilePicture && (
                <img
                  src={profilePicture || "/placeholder.svg"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="w-full"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            ثبت تغییرات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

