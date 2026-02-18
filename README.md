# Welcome to your  project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## BenefitPay Checkout System ✨

This project includes a complete manual BenefitPay payment checkout system for accepting digital subscriptions.

### Features
- 🛒 Checkout page with payment proof image upload
- 💼 Order management in Supabase database
- 📧 Automated email confirmations via Resend or SendGrid
- 👨‍💼 Admin dashboard for order verification
- 📸 Payment proof preview in admin panel
- ✅ Manual approval/rejection workflow

### Getting Started with BenefitPay

1. **Setup Guide**: [BENEFITPAY_SETUP.md](BENEFITPAY_SETUP.md)
   - Database setup instructions
   - Email service configuration
   - Supabase Storage bucket creation

2. **Deployment Guide**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
   - Vercel deployment steps
   - Environment variables setup
   - Post-deployment verification

3. **Admin Guide**: [ADMIN_ORDERS_GUIDE.md](ADMIN_ORDERS_GUIDE.md)
   - How to review orders
   - Payment verification process
   - Order approval/rejection

4. **Customer Guide**: [CUSTOMER_CHECKOUT_GUIDE.md](CUSTOMER_CHECKOUT_GUIDE.md)
   - Checkout instructions
   - Payment proof requirements
   - Troubleshooting

### Routes
- **Checkout Page**: `/checkout` - Customer payment form
- **Admin Orders**: `/admin/orders` - Order management dashboard

### Environment Variables (for Email API)

```env
# Choose one email provider:

# Resend (recommended)
RESEND_API_KEY=<your-api-key>
EMAIL_PROVIDER=resend

# OR SendGrid
SENDGRID_API_KEY=<your-api-key>
EMAIL_PROVIDER=sendgrid
```

### API Endpoint
```
POST /api/send-order-email
```
Sends order confirmation email to customers.

### Database Schema
- `orders` table with customer info, plan details, payment proof, and status
- `payment-proofs` storage bucket for image uploads
- RLS policies for admin-only access control

### Full Implementation Details
See [BENEFITPAY_IMPLEMENTATION.md](BENEFITPAY_IMPLEMENTATION.md) for complete technical overview.

---

## Deploy to Vercel

Quick steps to connect this repository to Vercel:

1. Go to https://vercel.com/new and import the GitHub repository `7ussain-073/eshop`.
2. Set the **Build Command** to `npm run build` and **Output Directory** to `dist` (Vercel will usually detect these automatically).
3. Add these Environment Variables in your Vercel project settings (do NOT commit secrets to the repo):
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase publishable (anon) key
   - (optional / secret) `SUPABASE_SERVICE_ROLE` — required only if you deploy server-side migration/endpoints
   - (optional / secret) `DATABASE_URL` — required only for running the local/serverless migration runner
4. Deploy — the app is a static build (Vite -> `dist`) and client-side routing is handled by `vercel.json`.

Tips:
- To make the admin migration runner work on Vercel you must add `SUPABASE_SERVICE_ROLE` and `DATABASE_URL` as encrypted environment variables.
- If you want the admin-selected currency to be stored globally, add a settings table + persist the value in Supabase and I can implement that for you.


