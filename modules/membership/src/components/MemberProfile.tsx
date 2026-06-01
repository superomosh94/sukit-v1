import { Award, Mail, Calendar, Shield, User } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  member: {
    id?: string;
    name: string;
    email: string;
    points?: number;
    status: string;
    planId?: string;
    avatar?: string;
    bio?: string;
  };
}

export function MemberProfile({ member }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-blue-600">
              {member.name?.[0]}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold">{member.name}</h3>
          <p className="text-sm text-gray-500">{member.email}</p>
          {member.bio && (
            <p className="text-sm text-gray-400 mt-1">{member.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <Award className="w-4 h-4 text-yellow-500" />
          <span>{member.points || 0} points</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <Shield
            className={cn(
              'w-4 h-4',
              member.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-500'
            )}
          />
          <span>{member.status}</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <User className="w-4 h-4 text-blue-500" />
          <span>Plan: {member.planId || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
