import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mnliaxjgdzwpummgoooe.supabase.co", // Supabase URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubGlheGpnZHp3cHVtbWdvb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU0MDUsImV4cCI6MjA3NTIzMTQwNX0.DEKo3PGTc-QLiQ0kOkF0jOnHQgJcbtCVjaVnTpYUOGI"              // anon key
);

export default supabase;