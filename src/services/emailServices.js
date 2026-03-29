import nodemailer from 'nodemailer';

// ─── Transporter banao — Gmail se connect ───
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Base Email Bhejne Ka Function ───
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error(`Email error: ${error.message}`);
  }
};

// ─── 1. Application Confirmation — Jobseeker Ko ───
export const sendApplicationConfirmation = async (applicantEmail, applicantName, jobTitle, company) => {
  const subject = `Application Submitted — ${jobTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Application Submitted! 🎉</h2>
      <p>Namaste <strong>${applicantName}</strong>,</p>
      <p>Tumhari application successfully submit ho gayi hai!</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #1f2937;">Job Details:</h3>
        <p><strong>Position:</strong> ${jobTitle}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Status:</strong> Pending Review</p>
      </div>
      
      <p>Hum tumhe status update karte rahenge.</p>
      <p style="color: #6b7280;">Job Portal Team</p>
    </div>
  `;
  
  await sendEmail(applicantEmail, subject, html);
};

// ─── 2. Status Change — Jobseeker Ko ───
export const sendStatusUpdateEmail = async (applicantEmail, applicantName, jobTitle, status) => {
  const statusMessages = {
    reviewed: { text: 'Review Ho Rahi Hai 👀', color: '#f59e0b' },
    shortlisted: { text: 'Shortlist Ho Gaye! 🎉', color: '#10b981' },
    rejected: { text: 'Application Rejected', color: '#ef4444' },
  };

  const statusInfo = statusMessages[status];
  const subject = `Application Update — ${jobTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusInfo.color};">${statusInfo.text}</h2>
      <p>Namaste <strong>${applicantName}</strong>,</p>
      <p>Tumhari <strong>${jobTitle}</strong> application ka status update hua hai.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>New Status:</strong> 
          <span style="color: ${statusInfo.color}; font-weight: bold;">
            ${status.toUpperCase()}
          </span>
        </p>
      </div>
      
      <p style="color: #6b7280;">Job Portal Team</p>
    </div>
  `;

  await sendEmail(applicantEmail, subject, html);
};

// ─── 3. New Application — Recruiter Ko ───
export const sendNewApplicationAlert = async (recruiterEmail, recruiterName, applicantName, jobTitle) => {
  const subject = `Naya Application — ${jobTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Naya Application Aaya! 📬</h2>
      <p>Namaste <strong>${recruiterName}</strong>,</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Applicant:</strong> ${applicantName}</p>
        <p><strong>Position:</strong> ${jobTitle}</p>
      </div>
      
      <p>Dashboard par jaake application dekho.</p>
      <p style="color: #6b7280;">Job Portal Team</p>
    </div>
  `;

  await sendEmail(recruiterEmail, subject, html);
};


{/*
  +

## Upload Service — Multer + Cloudinary

### Cloudinary Kya Hai?
```
Cloudinary = Cloud par files store karne ki service

Local server par mat rakho files:
  ❌ Server restart → files delete!
  ❌ Multiple servers → files share nahi hongi

Cloudinary par rakho:
  ✅ Hamesha available
  ✅ URL milta hai — database mein save karo
  ✅ Free tier available!
```

### Cloudinary Account Banao
```
1. cloudinary.com par jao
2. Free account banao
3. Dashboard mein yeh copy karo:
   - Cloud Name
   - API Key
   - API Secret
```

### `.env` mein add karo:
```
CLOUDINARY_CLOUD_NAME=tumhara_cloud_name
CLOUDINARY_API_KEY=tumhari_api_key
CLOUDINARY_API_SECRET=tumhara_api_secret*/}