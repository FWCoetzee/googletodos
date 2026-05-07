import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { useAuth } from '@/contexts/AuthContext';

interface UserAvatarBadgeProps {
  className?: string;
}

/**
 * Compact user avatar shown in page headers. Subscribes to profile changes
 * so it stays in sync across every page in real time.
 */
export const UserAvatarBadge = ({ className = '' }: UserAvatarBadgeProps) => {
  const { user } = useAuth();
  const { avatarUrl, loading } = useUserAvatar();

  if (!user) return null;
  if (loading) return <Skeleton className={`h-10 w-10 rounded-full ${className}`} />;

  return (
    <Link to="/" aria-label="Go to your profile" className={className}>
      <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
        <AvatarImage src={avatarUrl || undefined} className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    </Link>
  );
};
