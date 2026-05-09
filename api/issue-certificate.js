// api/issue-certificate.js
// Vercel Serverless Function — issues a certificate after verifying enrollment.
// Uses the service-role key to bypass RLS and write to certificates table.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const { courseId, svgData, courseTitle } = req.body;
  if (!courseId || !svgData || !courseTitle) {
    return res.status(400).json({ error: 'Missing courseId, svgData, or courseTitle' });
  }

  // Verify the user is actually enrolled before issuing certificate
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();

  if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this course' });

  const { error } = await supabase
    .from('certificates')
    .upsert(
      {
        user_id:       user.id,
        course_id:     courseId,
        course_title:  courseTitle,
        course_title_en: courseTitle,
        svg_data:      svgData,
      },
      { onConflict: 'user_id,course_id' }
    );

  if (error) {
    console.error('Certificate insert error:', error.message);
    return res.status(500).json({ error: 'Failed to issue certificate' });
  }

  return res.status(200).json({ success: true });
}
