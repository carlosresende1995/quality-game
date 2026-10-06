import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  'https://xlajvcwaledfjhllqcom.supabase.co'

const supabasePublishableKey =
  'sb_publishable_2uL_zCN03qLXS5vis_DJOg_WtVe9UVW'

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)
