// API endpoint for user operations
// URL: /api/users

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://gaafree.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // GET: Fetch user profile
    if (req.method === 'GET') {
      const { id, username } = req.query;

      if (!id && !username) {
        return res.status(400).json({ 
          success: false,
          error: 'User ID or username is required' 
        });
      }

      let query = supabase
        .from('users')
        .select(`
          id,
          username,
          email,
          avatar_url,
          wallet_address,
          bio,
          created_at,
          gaa_items:gaa_items (
            id,
            name,
            image_url,
            price,
            status
          )
        `);

      if (id) {
        query = query.eq('id', id);
      } else {
        query = query.eq('username', username);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            success: false,
            error: 'User not found' 
          });
        }
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      return res.status(200).json({
        success: true,
        data: data
      });
    }

    // PUT: Update user profile
    if (req.method === 'PUT') {
      const { id, username, bio, avatar_url } = req.body;

      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: 'User ID is required' 
        });
      }

      const updates = {};
      if (username) updates.username = username;
      if (bio !== undefined) updates.bio = bio;
      if (avatar_url) updates.avatar_url = avatar_url;

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to update user' 
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: data
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}
