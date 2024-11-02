import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nyninlrhqeuwzoxsjhui.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bmlubHJocWV1d3pveHNqaHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NDcxNDIsImV4cCI6MjA0NjEyMzE0Mn0.Lhdj1ovJJb4dfE2_KdHSRktbmA8vt0T3kCG5_Or5hZs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 