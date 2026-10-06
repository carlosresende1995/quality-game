import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  'https://lencuatmlbufezfgqcrn.supabase.co'

const supabasePublishableKey =
  'sb_publishable_Vt-66nXNvYaRXbKoaNEZxA_kvyFZwL6'

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)
