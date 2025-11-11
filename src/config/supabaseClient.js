import { createClient } from '@supabase/supabase-js'

// 🪄 Replace these with your actual keys from Supabase
const SUPABASE_URL = 'https://xhrxjfieftfytbmirmyz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocnhqZmllZnRmeXRibWlybXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDMzODUsImV4cCI6MjA3NzkxOTM4NX0.BOuJjc5Uw6zwrlio-GdLdjsTw5YqGSTYiKj1KfX8b0w'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
