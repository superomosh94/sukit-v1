"use client";

import { useSukit } from "./provider";
import type { BlocksAPI, EventsAPI, AuthAPI, FSAPI, StorageAPI, SitesAPI, PagesAPI, MediaAPI, SettingsAPI, TasksAPI, CacheAPI, LogAPI, UIAPI, APIRoutesAPI, ModulesAPI } from "@sukit/core";

export function useBlocks(): BlocksAPI {
  return useSukit().blocks;
}

export function useEvents(): EventsAPI {
  return useSukit().events;
}

export function useAuth(): AuthAPI {
  return useSukit().auth;
}

export function useFS(): FSAPI {
  return useSukit().fs;
}

export function useStorage(): StorageAPI {
  return useSukit().storage;
}

export function useSites(): SitesAPI {
  return useSukit().sites;
}

export function usePages(): PagesAPI {
  return useSukit().pages;
}

export function useMedia(): MediaAPI {
  return useSukit().media;
}

export function useSettings(): SettingsAPI {
  return useSukit().settings;
}

export function useTasks(): TasksAPI {
  return useSukit().tasks;
}

export function useCache(): CacheAPI {
  return useSukit().cache;
}

export function useLog(): LogAPI {
  return useSukit().log;
}

export function useUI(): UIAPI {
  return useSukit().ui;
}

export function useAPIRoutes(): APIRoutesAPI {
  return useSukit().api;
}

export function useModules(): ModulesAPI {
  return useSukit().modules;
}
