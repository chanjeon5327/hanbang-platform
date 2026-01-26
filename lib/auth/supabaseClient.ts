import { supabase } from "@/lib/supabase/client";

await supabase.auth.getSession();
