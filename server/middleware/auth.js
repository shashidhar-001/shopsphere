import { supabase } from '../supabase.js'

// Verify the user's JWT token from Supabase
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.user = user
  next()
}

// Check if the user is an admin
export async function adminGuard(req, res, next) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single()

  if (error || data?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}