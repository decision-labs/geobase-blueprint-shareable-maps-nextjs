-- Drop triggers
DROP TRIGGER IF EXISTS update_bounds_on_attachment_change ON public.smb_attachments;
DROP TRIGGER IF EXISTS update_bounds_on_annotation_change ON public.smb_annotations;
DROP TRIGGER IF EXISTS update_bounds_on_pin_change ON public.smb_pins;
DROP TRIGGER IF EXISTS update_bounds_on_drawing_change ON public.smb_drawings;

-- Drop function
DROP FUNCTION IF EXISTS public.update_project_bounds();

-- Remove avatar bucket policies
DROP POLICY IF EXISTS "Give users update access to own folder in avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Give users delete access to own folder in avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Give users insert access to own folder in avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Give users select access to own folder in avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to avatars bucket" ON storage.objects;

-- Remove avatar bucket
DELETE FROM storage.objects WHERE bucket_id = 'avatars';
DELETE FROM storage.buckets WHERE id = 'avatars';

-- Remove publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.smb_map_projects;

-- Drop tables
DROP TABLE IF EXISTS public.smb_attachments;
DROP TABLE IF EXISTS public.smb_annotations;
DROP TABLE IF EXISTS public.smb_pins;
DROP TABLE IF EXISTS public.smb_drawings;
DROP TABLE IF EXISTS public.smb_map_projects;

-- Remove trigger and function for handling new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop profiles table
DROP TABLE IF EXISTS public.profiles;


