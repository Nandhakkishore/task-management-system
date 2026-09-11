import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_APP_PASSWORD;
const clientUrl = process.env.CLIENT_URL || "https://task-management-system-web-eta.vercel.app";

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
} else {
  // Safe mock transporter logging to console if no email credentials provided
  transporter = {
    sendMail: async (options) => {
      console.log("--------------------------------------------------");
      console.log("📧 [MOCK EMAIL DISPATCH - Configure EMAIL_USER & EMAIL_APP_PASSWORD for live delivery]");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Preview:\n${options.html.replace(/<[^>]*>?/gm, "").trim().slice(0, 300)}...`);
      console.log("--------------------------------------------------");
      return { messageId: "mock-email-id-" + Date.now() };
    },
  };
}

const senderAddress = `"TaskFlow Enterprise" <${emailUser || process.env.SMTP_USER || "notifications@taskflow.dev"}>`;

export async function sendWelcomeEmail(to, name, temporaryPassword) {
  try {
    await transporter.sendMail({
      from: senderAddress,
      to,
      subject: `Welcome to TaskFlow! Your Account Credentials`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
            .content { padding: 32px 28px; }
            .credential-card { background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #cbd5e1; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background-color: #e0e7ff; color: #4338ca; }
            .btn { display: block; width: fit-content; margin: 28px auto 0; padding: 12px 28px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; }
            .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">⚡ TaskFlow</h1>
              <p style="margin: 6px 0 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Enterprise Workspace</p>
            </div>
            <div class="content">
              <div class="badge">New Employee Account</div>
              <h2 style="margin: 16px 0 8px; font-size: 20px; color: #0f172a;">Welcome aboard, ${name}! 👋</h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
                Your employee account on the <strong>TaskFlow Management System</strong> is now active. You can log in using the credentials below:
              </p>
              <div class="credential-card">
                <p style="margin: 0 0 8px; font-size: 13px;"><strong>Login Email:</strong> <span style="font-family: monospace; color: #1e293b;">${to}</span></p>
                <p style="margin: 0; font-size: 13px;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 6px; font-weight: 700; color: #4338ca;">${temporaryPassword}</code></p>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                For security reasons, we recommend updating your password once you sign in to your workspace.
              </p>
              <a href="${clientUrl}/login" class="btn">Sign In to TaskFlow →</a>
            </div>
            <div class="footer">
              TaskFlow Enterprise • Automated Notification Service
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error.message);
  }
}

export async function sendTaskAssignedEmail(to, taskTitle, priority) {
  try {
    const priorityColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981';
    const priorityBg = priority === 'high' ? '#fee2e2' : priority === 'medium' ? '#fef3c7' : '#d1fae5';

    await transporter.sendMail({
      from: senderAddress,
      to,
      subject: `[TaskFlow] New Task Assigned: ${taskTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: #1e1b4b; padding: 28px 24px; text-align: center; color: #ffffff; }
            .content { padding: 32px 28px; }
            .task-card { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
            .priority-pill { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; background-color: ${priorityBg}; color: ${priorityColor}; }
            .btn { display: block; width: fit-content; margin: 28px auto 0; padding: 12px 28px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; }
            .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">⚡ TaskFlow Assignment</h1>
            </div>
            <div class="content">
              <span class="priority-pill">${priority} Priority</span>
              <h2 style="margin: 16px 0 8px; font-size: 20px; color: #0f172a;">You have a new task! 📋</h2>
              <div class="task-card">
                <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1e293b;">${taskTitle}</p>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Log in to your Employee Workspace to view full specifications, check deadlines, and update progress.
              </p>
              <a href="${clientUrl}/employee" class="btn">View Task on Workspace →</a>
            </div>
            <div class="footer">
              TaskFlow Enterprise • Automated Notification Service
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send task assigned email:", error.message);
  }
}

export async function sendStatusUpdateEmail(to, employeeName, taskTitle, status) {
  try {
    const formattedStatus = status.replace("_", " ").toUpperCase();

    await transporter.sendMail({
      from: senderAddress,
      to,
      subject: `[TaskFlow] Task Status Changed: ${taskTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 28px 24px; text-align: center; color: #ffffff; }
            .content { padding: 32px 28px; }
            .card { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
            .status-badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; background-color: #e0e7ff; color: #4338ca; }
            .btn { display: block; width: fit-content; margin: 28px auto 0; padding: 12px 28px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; }
            .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">⚡ TaskFlow Status Alert</h1>
            </div>
            <div class="content">
              <div class="status-badge">${formattedStatus}</div>
              <h2 style="margin: 16px 0 8px; font-size: 18px; color: #0f172a;">Task progress has been updated</h2>
              <div class="card">
                <p style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #0f172a;">"${taskTitle}"</p>
                <p style="margin: 0; font-size: 13px; color: #64748b;">Updated by: <strong>${employeeName}</strong></p>
              </div>
              <a href="${clientUrl}/admin" class="btn">Open Admin Dashboard →</a>
            </div>
            <div class="footer">
              TaskFlow Enterprise • Automated Notification Service
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send status update email:", error.message);
  }
}
