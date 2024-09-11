-- Drop triggers
DROP TRIGGER IF EXISTS update_bounds_on_attachment_change ON public.smb_attachments;
DROP TRIGGER IF EXISTS update_bounds_on_annotation_change ON public.smb_annotations;
DROP TRIGGER IF EXISTS update_bounds_on_pin_change ON public.smb_pins;
DROP TRIGGER IF EXISTS update_bounds_on_drawing_change ON public.smb_drawings;

-- Drop function
DROP FUNCTION IF EXISTS public.update_project_bounds();

-- Drop tables
DROP TABLE IF EXISTS public.smb_attachments CASCADE;
DROP TABLE IF EXISTS public.smb_annotations CASCADE;
DROP TABLE IF EXISTS public.smb_pins CASCADE;
DROP TABLE IF EXISTS public.smb_drawings CASCADE;
DROP TABLE IF EXISTS public.smb_map_projects CASCADE;

-- Drop trigger and function for handling new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remove storage policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;
