"use client";

import Link from "next/link";
import { AlertTriangle, Compass, Plane, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS = {
  plane: Plane,
  compass: Compass,
  alert: AlertTriangle,
} as const;

type IconName = keyof typeof ICONS;

type EmptyStateProps = {
  icon?: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryHref?: string;
  className?: string;
};

export function EmptyState({
  icon = "plane",
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryLabel,
  onSecondary,
  secondaryHref,
  className,
}: EmptyStateProps) {
  const Icon: LucideIcon = ICONS[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-line bg-surface px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-500">
        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-ink-500">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction ? (
          <Button type="button" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {actionLabel && actionHref ? (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
        {secondaryLabel && onSecondary ? (
          <Button type="button" variant="secondary" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        ) : null}
        {secondaryLabel && secondaryHref ? (
          <Button asChild variant="secondary">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Couldn't load this",
  description = "Something went wrong. Try again in a moment.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon="alert"
      title={title}
      description={description}
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
      className={className}
    />
  );
}
