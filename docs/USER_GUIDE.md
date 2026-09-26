# Aura Video AI - User Guide

Welcome to **Aura Video AI**, the enterprise-grade AI Text-to-Video SaaS platform. This guide provides step-by-step instructions on how to use all features of the platform.

---

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Creating Your First Video](#2-creating-your-first-video)
3. [Advanced Prompt Engineering](#3-advanced-prompt-engineering)
4. [Using Storyboards](#4-using-storyboards)
5. [Workspace & Team Management](#5-workspace--team-management)
6. [API Keys & Developer Tools](#6-api-keys--developer-tools)
7. [Billing & Credits](#7-billing--credits)

---

## 1. Getting Started

### Registration & Login
1. Navigate to `https://app.aura.ai/register` (or `http://localhost:3000/register` for local dev).
2. Enter your Full Name, Email, Username, and Password.
3. Verify your email using the 6-digit OTP sent to your inbox.
4. Set up Two-Factor Authentication (2FA) in **Settings > Security** for enhanced protection.

---

## 2. Creating Your First Video

1. Go to the **Generate** tab from the left sidebar.
2. Select your generation mode:
   - **Text to Video**: Generate video directly from a descriptive text prompt.
   - **Image to Video**: Upload a reference image and provide motion instructions.
   - **Video to Video**: Transform existing videos using AI style transfer.
3. Type your prompt into the main textarea or click **AI Enhance** to automatically optimize your prompt using GPT-4o.
4. Adjust generation settings:
   - **Duration**: Select between 5 and 120 seconds.
   - **Resolution**: 720p, 1080p, 2K, or 4K.
   - **Aspect Ratio**: 16:9 (Landscape), 9:16 (Portrait), 1:1 (Square), or 4:3.
   - **Camera Motion**: Choose camera movements (Pan, Zoom, Orbit, Dolly, etc.).
   - **Style & Mood**: Apply visual styles (Cinematic, Anime, Realistic, 3D).
5. Select AI Provider: Keep **Auto (Recommended)** for dynamic provider routing based on speed, cost, and availability.
6. Click **Generate Video**! Track progress in real-time via the progress tracker bar.

---

## 3. Advanced Prompt Engineering

To get cinematic results:
- **Describe the subject**: "A sleek silver electric sports car..."
- **Specify environment & lighting**: "...driving along a coastal highway during golden hour sunset..."
- **Specify camera & motion**: "...cinematic low-angle tracking shot, 4K resolution, 60fps..."
- **Use Negative Prompts**: Exclude unwanted elements like "blurry, low quality, distortion, watermarks".

---

## 4. Using Storyboards

For long-form videos or multi-scene commercials:
1. Go to **Generate > Storyboard** tab.
2. Enter a high-level concept or script.
3. Click **Generate Storyboard with AI**. The system will break your prompt into multi-scene shots with custom camera directions.
4. Edit individual scenes, reorder timeline cards, or adjust durations.
5. Click **Generate All Scenes** to render the full video sequence.

---

## 5. Workspace & Team Management

- **Switch Workspaces**: Click the workspace selector dropdown at the top of the left sidebar.
- **Invite Members**: Go to **Workspace > Members**, enter an email address, select a role (`ADMIN`, `EDITOR`, `VIEWER`), and send an invitation.
- **Roles & Permissions**:
  - `OWNER`: Full administrative control & billing access.
  - `ADMIN`: Manage members, projects, and API keys.
  - `EDITOR`: Create and manage video projects.
  - `VIEWER`: View and download generated videos.

---

## 6. API Keys & Developer Tools

Generate API keys to integrate Aura Video AI into your own applications:
1. Go to **API Keys** in the dashboard.
2. Click **Create New Key**, set permissions/scopes, and copy your key.
3. Include the key in HTTP requests:
   ```bash
   curl -X POST https://api.aura.ai/v1/jobs \
     -H "Authorization: Bearer aura_sk_your_key_here" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "A futuristic city skyline", "jobType": "TEXT_TO_VIDEO"}'
   ```

---

## 7. Billing & Credits

- **Credit System**: Video generations consume credits based on duration, resolution, and AI provider rate.
- **Monthly Plans**: Free (50 credits), Starter ($9.99/mo - 500 credits), Pro ($29.99/mo - 2000 credits), Enterprise ($99.99/mo - 10000 credits).
- **Top Up**: Purchase additional credit top-up packs anytime from the **Billing** page.
