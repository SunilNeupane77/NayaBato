"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from "lucide-react";

export default function WeeklyDigestSubscription() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("API Response:", response.status, data);

      if (response.ok) {
        setIsSubscribed(true);
        setEmail("");
      } else {
        console.error("API Error:", data);
        alert(`Failed to subscribe: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100">
      {isSubscribed ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <CheckCircle size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Successfully Subscribed!</h3>
          </div>
          <p className="text-gray-600">
            Thank you for subscribing to our weekly digest. You'll receive updates about community issues and resolutions.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-teal-500 text-white">
              <Mail size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Weekly Digest</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Stay updated with weekly summaries of community issues and resolutions in your area.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
