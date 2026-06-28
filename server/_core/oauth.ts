import express from "express";
import { setSessionCookie, clearSessionCookie } from "./cookies.ts";
import { db } from "../db.ts";

export const oauthRouter = express.Router();

// GET: Render a beautifully styled custom bypass auth selection screen
oauthRouter.get("/app-auth", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in to Community Hero</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body class="bg-[#FAFAFA] min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Logo and brand -->
        <div class="flex items-center justify-center space-x-2">
          <div class="flex items-center -space-x-1 shrink-0">
            <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black">C</div>
            <div class="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs font-black">X</div>
          </div>
          <span class="font-extrabold text-xl tracking-tight text-[#111111]">
            Community<span class="text-indigo-600">Hero</span>
            <span class="font-medium text-slate-400 ml-0.5 text-lg">X</span>
          </span>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold tracking-tight text-[#111111]">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-[#6B7280]">
          Enter your name, email, and password to proceed
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-10 px-6 shadow-sm border border-[#ECECEC] rounded-[18px] sm:px-10">
          <form action="/app-auth" method="POST" class="space-y-6">
            <input type="hidden" name="profile" value="custom">

            <!-- Full Name -->
            <div class="space-y-1.5">
              <label for="name" class="block text-sm font-semibold text-[#111111]">
                Full Name
              </label>
              <div class="mt-1">
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value="Mock User" 
                  required
                  class="appearance-none block w-full px-3.5 py-3 border border-[#ECECEC] rounded-[14px] shadow-2xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-[#111111]"
                  placeholder="John Doe"
                >
              </div>
            </div>

            <!-- Email Address -->
            <div class="space-y-1.5">
              <label for="email" class="block text-sm font-semibold text-[#111111]">
                Email Address
              </label>
              <div class="mt-1">
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value="mock-user@communityhero.org" 
                  required
                  class="appearance-none block w-full px-3.5 py-3 border border-[#ECECEC] rounded-[14px] shadow-2xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-[#111111]"
                  placeholder="you@example.com"
                >
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-semibold text-[#111111]">
                  Password
                </label>
              </div>
              <div class="mt-1 relative">
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value="community-hero-demo-123" 
                  required
                  class="appearance-none block w-full px-3.5 py-3 pr-10 border border-[#ECECEC] rounded-[14px] shadow-2xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-[#111111]"
                  placeholder="••••••••"
                >
                <button 
                  type="button"
                  id="toggle-password"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B7280] hover:text-[#111111] transition-colors"
                >
                  <svg id="eye-show" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg id="eye-hide" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 013.253-4.43m14.53 4.43a10.025 10.025 0 00-3.322-4.43m-2.483-1.077L19.05 4.05m-14.1 14.1L8.55 14.55M12 9a3 3 0 103 3" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Account Role -->
            <div class="space-y-1.5">
              <label for="role" class="block text-sm font-semibold text-[#111111]">
                Account Role
              </label>
              <div class="mt-1 relative rounded-[14px]">
                <select 
                  id="role" 
                  name="role" 
                  class="block w-full px-3.5 py-3 border border-[#ECECEC] rounded-[14px] bg-white text-sm font-medium text-[#111111] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer pr-10"
                >
                  <option value="Citizen">Citizen (Standard User)</option>
                  <option value="Official">City Official (Moderator)</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B7280]">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div>
              <button 
                type="submit" 
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-slate-950 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all cursor-pointer"
              >
                Sign In & Continue
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-[#ECECEC]"></div>
              </div>
              <div class="relative flex justify-center text-xs">
                <span class="px-2 bg-white text-[#9CA3AF] uppercase tracking-wider font-semibold">
                  Sandbox Bypass
                </span>
              </div>
            </div>
            <p class="mt-4 text-center text-xs text-[#9CA3AF] leading-relaxed">
              This environment bypasses real external identity providers for local sandbox simulation.
            </p>
          </div>
        </div>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const toggleBtn = document.getElementById('toggle-password');
          const pwdInput = document.getElementById('password');
          const showIcon = document.getElementById('eye-show');
          const hideIcon = document.getElementById('eye-hide');

          if (toggleBtn && pwdInput) {
            toggleBtn.addEventListener('click', () => {
              if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                showIcon.classList.add('hidden');
                hideIcon.classList.remove('hidden');
              } else {
                pwdInput.type = 'password';
                showIcon.classList.remove('hidden');
                hideIcon.classList.add('hidden');
              }
            });
          }
        });
      </script>
    </body>
    </html>
  `);
});

// POST: Process auth bypass form submission
oauthRouter.post("/app-auth", async (req, res) => {
  const { profile, name, email, password, role } = req.body;

  let userId = "";
  let userEmail = "";
  let userName = "";
  let userAvatar = "";

  if (profile === "user_1" || profile === "user_2" || profile === "user_3") {
    userId = profile;
    const existing = await db.getUserByOpenId(userId);
    if (existing) {
      userEmail = existing.email;
      userName = existing.name;
      userAvatar = existing.avatarUrl || "";
    }
  } else {
    // Custom user creation
    if (!name || !email) {
      return res.status(400).send("Name and Email are required for custom profile.");
    }
    
    // Look up if a user with this email already exists to retain their id, points, and reports
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      userId = existingUser.id;
      userEmail = existingUser.email;
      userName = existingUser.name;
      userAvatar = existingUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    } else {
      const sanitizedEmail = email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, "_");
      userId = name.toLowerCase() === "mock user" ? "mock_user" : `custom_${sanitizedEmail}`;
      userEmail = email;
      userName = name;
      // Elegant dynamic avatar based on name initials
      userAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    }
  }

  // Create or update user details in persistent DB
  await db.upsertUser({
    id: userId,
    email: userEmail,
    name: userName,
    avatarUrl: userAvatar,
    role: role || "Citizen"
  });

  // Write cookies and redirect back to client homepage
  setSessionCookie(res, userId);
  res.redirect("/");
});

// GET: Logout
oauthRouter.get("/app-auth/logout", (req, res) => {
  clearSessionCookie(res);
  res.redirect("/app-auth");
});
