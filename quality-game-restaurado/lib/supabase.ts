import { createClient } from '@supabase/supabase-js'

const url = 'https://xlajvcwaledfjhllqcom.supabase.co'
const key = 'sb_publishable_2uL_zCN03qLXS5vis_DJOg_WtVe9UVW'

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
})
