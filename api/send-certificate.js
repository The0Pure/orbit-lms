// api/send-certificate.js
// Vercel Serverless Function — runs on Node.js edge
// Called when a student earns a certificate

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentName, courseName, studentEmail, completionDate, certificateId } = req.body;

  if (!studentName || !courseName || !studentEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Using EmailJS REST API — no server SDK needed
  const emailPayload = {
    service_id: process.env.VITE_EMAILJS_SERVICE_ID,
    template_id: process.env.VITE_EMAILJS_TEMPLATE_ID,
    user_id: process.env.VITE_EMAILJS_PUBLIC_KEY,
    template_params: {
      to_name: studentName,
      to_email: studentEmail,
      course_name: courseName,
      completion_date: completionDate,
      certificate_id: certificateId,
      download_link: `${process.env.VITE_APP_URL}/certificate/${certificateId}`,
      app_name: 'Orbit Learning',
    },
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Certificate sent successfully' });
    } else {
      const error = await response.text();
      return res.status(500).json({ error: `EmailJS error: ${error}` });
    }
  } catch (err) {
    console.error('Send certificate error:', err);
    return res.status(500).json({ error: 'Failed to send certificate email' });
  }
}
