import type { VercelRequest, VercelResponse } from "@vercel/node";

// Email service configuration
// Support for Resend or SendGrid
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "resend";

async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "A2H Store <noreply@a2h-store.store>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${error.message}`);
  }
}

async function sendEmailViaSendGrid(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (!sendgridApiKey) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sendgridApiKey}`,
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: "noreply@a2h-store.com", name: "A2h Store" },
      content: [
        {
          type: "text/html",
          value: html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (EMAIL_PROVIDER === "sendgrid") {
    await sendEmailViaSendGrid(to, subject, html);
  } else {
    await sendEmailViaResend(to, subject, html);
  }
}

function generateOrderConfirmationEmail(
  fullName: string,
  orderId: string,
  planName: string,
  amount: number
): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>تأكيد الطلب</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9f9f9;
      }
      .header {
        text-align: center;
        padding: 20px 0;
        border-bottom: 2px solid #d4af37;
      }
      .header h1 {
        color: #d4af37;
        margin: 0;
        font-size: 28px;
      }
      .content {
        background-color: white;
        padding: 30px;
        margin: 20px 0;
        border-radius: 8px;
      }
      .order-details {
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 6px;
        margin: 20px 0;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .detail-row:last-child {
        border-bottom: none;
      }
      .label {
        color: #666;
        font-weight: 500;
      }
      .value {
        color: #333;
        font-weight: 600;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #999;
        font-size: 12px;
      }
      .status-pending {
        background-color: #fff3cd;
        color: #856404;
        padding: 12px;
        border-radius: 4px;
        margin: 15px 0;
        border-right: 4px solid #ffc107;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>A2h Store</h1>
      </div>

      <div class="content">
        <p>مرحباً ${fullName},</p>

        <p>شكراً لك على اختيار خدمات A2h Store!</p>

        <p>لقد استقبلنا طلبك بنجاح. سيتم التحقق من إثبات الدفع الخاص بك وتأكيد اشتراكك قريباً.</p>

        <div class="status-pending">
          <strong>⏳ الحالة: قيد المراجعة</strong><br />
          سيتم معالجة طلبك خلال 24 ساعة بعد التحقق من إثبات الدفع.
        </div>

        <h3 style="color: #d4af37; margin-top: 25px;">تفاصيل الطلب</h3>
        <div class="order-details">
          <div class="detail-row">
            <span class="label">رقم الطلب:</span>
            <span class="value">${orderId}</span>
          </div>
          <div class="detail-row">
            <span class="label">الخطة:</span>
            <span class="value">${planName}</span>
          </div>
          <div class="detail-row">
            <span class="label">المبلغ:</span>
            <span class="value">${amount.toFixed(2)} BHD</span>
          </div>
        </div>

        <h3 style="color: #d4af37; margin-top: 25px;">الخطوات التالية</h3>
        <ol style="color: #555;">
          <li>سيقوم فريقنا بالتحقق من إثبات الدفع الخاص بك</li>
          <li>عند الموافقة، ستتلقى بيانات الدخول الخاصة بك عبر البريد الإلكتروني</li>
          <li>ستتمكن من الوصول الفوري إلى الخدمة بعد تأكيد الطلب</li>
        </ol>

        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          إذا كان لديك أي أسئلة، يرجى التواصل معنا عبر صفحة الاتصال بنا.
        </p>
      </div>

      <div class="footer">
        <p>© 2024 A2h Store. جميع الحقوق محفوظة.</p>
        <p>هذا البريد الإلكتروني تم إرساله تلقائياً. يرجى عدم الرد عليه مباشرة.</p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate request body
  const { email, fullName, orderId, planName, amount } = req.body;

  if (!email || !fullName || !orderId || !planName || amount === undefined) {
    return res.status(400).json({
      error: "Missing required fields: email, fullName, orderId, planName, amount",
    });
  }

  try {
    const htmlContent = generateOrderConfirmationEmail(
      fullName,
      orderId,
      planName,
      amount
    );

    await sendEmail(
      email,
      `تأكيد طلب الاشتراك - ${orderId}`,
      htmlContent
    );

    return res.status(200).json({
      success: true,
      message: "Order confirmation email sent successfully",
    });
  } catch (error: any) {
    console.error("Email sending error:", error);

    return res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
}
