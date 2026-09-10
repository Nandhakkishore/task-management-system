import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_APP_PASSWORD;

let transporter = null;

if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
} else {
  // Mock transporter logging to console in dev mode
  transporter = {
    sendMail: async (options) => {
      console.log("--------------------------------------------------");
      console.log("📧 [MOCK EMAIL DISPATCH]");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:\n${options.html.replace(/<[^>]*>?/gm, "")}`);
      console.log("--------------------------------------------------");
      return { messageId: "mock-email-id-" + Date.now() };
    },
  };
}

export async function sendWelcomeEmail(to, name, temporaryPassword) {
  try {
    await transporter.sendMail({
      from: `"Task Management System" <${emailUser || "noreply@taskmanager.com"}>`,
      to,
      subject: `Welcome to Task Management System!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Welcome, ${name}!</h2>
          <p>An employee account has been created for you on the Task Management System.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
          </div>
          <p>Please log in and update your password as soon as possible.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error.message);
  }
}

export async function sendTaskAssignedEmail(to, taskTitle, priority) {
  try {
    await transporter.sendMail({
      from: `"Task Management System" <${emailUser || "noreply@taskmanager.com"}>`,
      to,
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h3 style="color: #4f46e5;">New Task Assignment</h3>
          <p>You have been assigned a new task: <strong>${taskTitle}</strong></p>
          <p><strong>Priority:</strong> <span style="text-transform: capitalize; font-weight: bold; color: ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'};">${priority}</span></p>
          <p>Please log into your dashboard to review and manage this task.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send task assigned email:", error.message);
  }
}

export async function sendStatusUpdateEmail(to, employeeName, taskTitle, status) {
  try {
    await transporter.sendMail({
      from: `"Task Management System" <${emailUser || "noreply@taskmanager.com"}>`,
      to,
      subject: `Task Status Update: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h3 style="color: #4f46e5;">Task Progress Update</h3>
          <p><strong>${employeeName}</strong> updated the task <strong>"${taskTitle}"</strong> to status: <strong style="text-transform: capitalize;">${status.replace("_", " ")}</strong>.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send status update email:", error.message);
  }
}
