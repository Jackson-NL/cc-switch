import { invoke } from "@tauri-apps/api/core";
import type { SessionMessage, SessionMeta } from "@/types";

export interface DeleteSessionOptions {
  providerId: string;
  sessionId: string;
  sourcePath: string;
}

export interface DeleteSessionResult extends DeleteSessionOptions {
  success: boolean;
  error?: string;
}

export interface UpdateSessionUserMetaOptions extends DeleteSessionOptions {
  customTitle?: string | null;
  isPinned?: boolean | null;
}

export const sessionsApi = {
  async list(): Promise<SessionMeta[]> {
    return await invoke("list_sessions");
  },

  async listWithMeta(): Promise<SessionMeta[]> {
    return await invoke("list_sessions_with_meta");
  },

  async getMessages(
    providerId: string,
    sourcePath: string,
  ): Promise<SessionMessage[]> {
    return await invoke("get_session_messages", { providerId, sourcePath });
  },

  async delete(options: DeleteSessionOptions): Promise<boolean> {
    const { providerId, sessionId, sourcePath } = options;
    return await invoke("delete_session", {
      providerId,
      sessionId,
      sourcePath,
    });
  },

  async deleteMany(
    items: DeleteSessionOptions[],
  ): Promise<DeleteSessionResult[]> {
    return await invoke("delete_sessions", { items });
  },

  async updateMeta(options: UpdateSessionUserMetaOptions): Promise<boolean> {
    const { providerId, sessionId, sourcePath, customTitle, isPinned } =
      options;
    return await invoke("update_session_user_meta", {
      request: {
        providerId,
        sessionId,
        sourcePath,
        customTitle,
        isPinned,
      },
    });
  },

  async clearMeta(options: DeleteSessionOptions): Promise<boolean> {
    const { providerId, sessionId, sourcePath } = options;
    return await invoke("clear_session_user_meta", {
      providerId,
      sessionId,
      sourcePath,
    });
  },

  async launchTerminal(options: {
    command: string;
    cwd?: string | null;
    customConfig?: string | null;
  }): Promise<boolean> {
    const { command, cwd, customConfig } = options;
    return await invoke("launch_session_terminal", {
      command,
      cwd,
      customConfig,
    });
  },
};
