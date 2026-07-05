"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SecureLoginGateway() {
  const router = useRouter();
  
  // Dual-role state: 'student' | 'faculty'
  const [activeRole, setActiveRole] = useState<"student" | "faculty">("student");
  
  // Input states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Loading & simulation states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Simple validation checks
    if (!identifier.trim()) {
      setErrorMsg(
        activeRole === "student" 
          ? "Please enter your Student Enrollment Number or Email." 
          : "Please enter your Employee ID or Faculty Email."
      );
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your secure access password.");
      return;
    }

    setIsSubmitting(true);

    // Simulate authentication verification lag
    setTimeout(() => {
      // Route based on role
      if (activeRole === "student") {
        router.push("/student");
      } else {
        router.push("/faculty");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-white relative overflow-hidden select-none">
      
      {/* Background glowing radial gradient canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none z-0 animate-glow-pulse" />

      {/* Main glassmorphic login container */}
      <div className="backdrop-blur-xl bg-white/[0.02] border border-slate-800/80 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-page-entrance z-10 space-y-6">
        
        {/* Portal Branding Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="bg-white/95 rounded-xl border border-slate-200/50 p-2 shadow-sm max-w-[180px] hover:scale-105 transition-transform duration-300">
            <img 
              src="/ips-logo.png" 
              alt="IPS Academy Logo" 
              className="h-9 w-auto object-contain"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold tracking-wider text-white uppercase font-sans">
              IPS ACADEMY
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Student & Faculty Portal Gateway
            </p>
          </div>
        </div>

        {/* Role Toggle Tab Switcher */}
        <div className="relative flex p-1 bg-slate-900/80 border border-slate-800 rounded-xl w-full select-none">
          {/* Active background slider */}
          <div 
            className="absolute top-1 bottom-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/20 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              left: activeRole === "student" ? "4px" : "50%",
              width: "calc(50% - 4px)"
            }}
          />
          <button
            type="button"
            onClick={() => {
              setActiveRole("student");
              setErrorMsg("");
              setIdentifier("");
              setPassword("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg text-center transition-all duration-200 z-10 cursor-pointer ${
              activeRole === "student" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Student Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole("faculty");
              setErrorMsg("");
              setIdentifier("");
              setPassword("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg text-center transition-all duration-200 z-10 cursor-pointer ${
              activeRole === "faculty" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Faculty Portal
          </button>
        </div>

        {/* Action Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-semibold leading-relaxed animate-pulse">
              {errorMsg}
            </div>
          )}

          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              {activeRole === "student" ? "Enrollment Number / Email" : "Employee ID / Faculty Email"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={
                  activeRole === "student" 
                    ? "Enrollment Number (e.g. 0808CI251117)" 
                    : "Employee ID / Faculty Email"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isSubmitting}
                className="pl-9 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-blue-500/50 rounded-lg w-full text-sm focus:outline-none transition-all duration-200 text-slate-200 placeholder-slate-550 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="pl-9 pr-10 py-3 bg-slate-900/60 border border-slate-800 focus:border-blue-500/50 rounded-lg w-full text-sm focus:outline-none transition-all duration-200 text-slate-200 placeholder-slate-550 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Secure Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-sm font-medium tracking-wide shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure Login</span>
              </>
            )}
          </button>
        </form>

        {/* Security Footnote message */}
        <div className="pt-2 border-t border-slate-900 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>SSL Secure 256-bit Encrypted Session</span>
        </div>

      </div>

      {/* Academic plaque values */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-650 tracking-widest font-bold opacity-60 z-10">
        KNOWLEDGE • SKILLS • VALUES
      </div>

    </div>
  );
}
