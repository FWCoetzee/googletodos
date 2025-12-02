-- RLS policies for profiles table
create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

-- Trigger function to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger to call function on user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects for insert
with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
on storage.objects for update
using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);