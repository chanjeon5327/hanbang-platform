import { supabase } from "@/lib/supabase";

await supabase.auth.getSession();
