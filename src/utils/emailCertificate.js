// src/utils/emailCertificate.js
// Uses EmailJS REST API directly — no npm package needed

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Send certificate email via EmailJS
 * EmailJS template should contain variables:
 * {{to_name}}, {{to_email}}, {{course_name}}, {{completion_date}},
 * {{certificate_id}}, {{download_link}}
 */
export const sendCertificateEmail = async ({
  studentName, studentEmail, courseName,
  completionDate, certificateId,
}) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Add keys to .env');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          to_name: studentName,
          to_email: studentEmail,
          course_name: courseName,
          completion_date: completionDate,
          certificate_id: certificateId,
          download_link: `${window.location.origin}/dashboard`,
          app_name: 'Orbit Learning',
        },
      }),
    });
    return res.ok ? { success: true } : { success: false, error: 'EmailJS delivery failed' };
  } catch (err) {
    return { success: false, error: 'Network error — check EmailJS credentials' };
  }
};
