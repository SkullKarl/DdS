import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wxekgvnqyhyjuvjmtnfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZWtndm5xeWh5anV2am10bmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzMzODcsImV4cCI6MjA2NDQ0OTM4N30.d1t-9F31Nh9KnprLnIMN1NjxCnWLX13IjIXcIYdSOP4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);