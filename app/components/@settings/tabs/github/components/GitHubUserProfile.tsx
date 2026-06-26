import React from 'react';
import type { GitHubUserResponse } from '~/types/GitHub';

interface GitHubUserProfileProps {
  user: GitHubUserResponse;
  className?: string;
}

export function GitHubUserProfile({ user, className = '' }: GitHubUserProfileProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 bg-zouk-elements-background-depth-1 dark:bg-zouk-elements-background-depth-1 rounded-lg ${className}`}
    >
      <img
        src={user.avatar_url}
        alt={user.login}
        className="w-12 h-12 rounded-full border-2 border-zouk-elements-item-contentAccent dark:border-zouk-elements-item-contentAccent"
      />
      <div>
        <h4 className="text-sm font-medium text-zouk-elements-textPrimary dark:text-zouk-elements-textPrimary">
          {user.name || user.login}
        </h4>
        <p className="text-sm text-zouk-elements-textSecondary dark:text-zouk-elements-textSecondary">@{user.login}</p>
        {user.bio && (
          <p className="text-xs text-zouk-elements-textTertiary dark:text-zouk-elements-textTertiary mt-1">
            {user.bio}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-zouk-elements-textSecondary">
          <span className="flex items-center gap-1">
            <div className="i-ph:users w-3 h-3" />
            {user.followers} followers
          </span>
          <span className="flex items-center gap-1">
            <div className="i-ph:folder w-3 h-3" />
            {user.public_repos} public repos
          </span>
          <span className="flex items-center gap-1">
            <div className="i-ph:file-text w-3 h-3" />
            {user.public_gists} gists
          </span>
        </div>
      </div>
    </div>
  );
}
