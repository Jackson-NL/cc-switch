import {
  ChevronRight,
  Clock,
  MoreHorizontal,
  Pin,
  PinOff,
  Pencil,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ProviderIcon } from "@/components/ProviderIcon";
import type { SessionMeta } from "@/types";
import {
  formatRelativeTime,
  formatSessionTitle,
  getProviderIconName,
  getProviderLabel,
  getSessionKey,
  highlightText,
} from "./utils";

interface SessionItemProps {
  session: SessionMeta;
  isSelected: boolean;
  selectionMode: boolean;
  isChecked: boolean;
  isCheckDisabled?: boolean;
  searchQuery?: string;
  onSelect: (key: string) => void;
  onToggleChecked: (checked: boolean) => void;
  onTogglePin: () => void;
  onRename: () => void;
}

export function SessionItem({
  session,
  isSelected,
  selectionMode,
  isChecked,
  isCheckDisabled = false,
  searchQuery,
  onSelect,
  onToggleChecked,
  onTogglePin,
  onRename,
}: SessionItemProps) {
  const { t } = useTranslation();
  const title = formatSessionTitle(session);
  const lastActive = session.lastActiveAt || session.createdAt || undefined;
  const sessionKey = getSessionKey(session);

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2.5 transition-all group",
        isSelected
          ? "bg-primary/10 border border-primary/30"
          : session.isPinned
            ? "bg-amber-50/70 border border-amber-300/70 dark:bg-amber-950/20 dark:border-amber-700/40"
            : "hover:bg-muted/60 border border-transparent",
      )}
    >
      {selectionMode && (
        <div className="shrink-0 pt-0.5">
          <Checkbox
            checked={isChecked}
            disabled={isCheckDisabled}
            aria-label={t("sessionManager.selectForBatch", {
              defaultValue: "选择会话",
            })}
            onCheckedChange={(checked) => onToggleChecked(Boolean(checked))}
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2 mb-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onSelect(sessionKey)}
                className="shrink-0 pt-0.5"
              >
                <ProviderIcon
                  icon={getProviderIconName(session.providerId)}
                  name={session.providerId}
                  size={18}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {getProviderLabel(session.providerId, t)}
            </TooltipContent>
          </Tooltip>
          <button
            type="button"
            onClick={() => onSelect(sessionKey)}
            className="min-w-0 flex-1 text-left text-sm font-medium line-clamp-2"
          >
            {searchQuery ? highlightText(title, searchQuery) : title}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-auto inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onTogglePin()}>
                {session.isPinned ? (
                  <PinOff className="mr-2 size-4" />
                ) : (
                  <Pin className="mr-2 size-4" />
                )}
                {session.isPinned
                  ? t("sessionManager.unpinSession", {
                      defaultValue: "取消置顶",
                    })
                  : t("sessionManager.pinSession", {
                      defaultValue: "置顶会话",
                    })}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onRename()}>
                <Pencil className="mr-2 size-4" />
                {t("sessionManager.renameSession", {
                  defaultValue: "重命名",
                })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronRight
            className={cn(
              "size-4 text-muted-foreground/50 shrink-0 transition-transform",
              isSelected && "text-primary rotate-90",
            )}
          />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          <span>
            {lastActive
              ? formatRelativeTime(lastActive, t)
              : t("common.unknown")}
          </span>
        </div>
      </div>
    </div>
  );
}
