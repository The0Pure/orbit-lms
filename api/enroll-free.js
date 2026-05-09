// api/enroll-free.js
// Vercel Serverless Function — handles free course enrollment server-side.
// Uses the Supabase service-role key (never exposed to the client) to write
// to the enrollments table, bypassing the client-only RLS restriction.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,   // secret — never VITE_ prefix
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify caller is authenticated via Supabase JWT
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const { courseId, orderId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'Missing courseId' });

  // Verify the course is actually free before enrolling
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, is_free, price, published')
    .eq('id', courseId)
    .single();

  if (courseError || !course) return res.status(404).json({ error: 'Course not found' });
  if (!course.published) return res.status(403).json({ error: 'Course not published' });
  if (!course.is_free && Number(course.price) > 0) {
    return res.status(403).json({ error: 'Course is not free' });
  }

  // Enroll the user (idempotent)
  const { error: enrollError } = await supabase
    .from('enrollments')
    .upsert({ user_id: user.id, course_id: courseId }, { onConflict: 'user_id,course_id' });

  if (enrollError) {
    console.error('Enrollment error:', enrollError.message);
    return res.status(500).json({ error: 'Enrollment failed' });
  }

  // Update the pending order to completed (if orderId was provided)
  if (orderId) {
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)
      .eq('user_id', user.id);
  }

  // Increment student count
  await supabase.rpc('increment_course_students', { course_id_arg: courseId }).catch(() => {});

  return res.status(200).json({ success: true });
}
