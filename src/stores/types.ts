export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type DisplayFormat = 'days' | 'month-day' | 'year-month-day';

export interface CountdownEvent {
    id: string;
    title: string;
    date: string; // ISO string
    repeat: RepeatType;
    background?: string; // URL or base64
    createdAt: number;
}

export interface SyncConfig {
    webdav?: {
        url: string;
        username: string;
        password?: string;
    };
    gist?: {
        token: string;
        gistId: string;
    };
    customUrl?: string;
}

export interface AppSettings {
    language: 'zh' | 'en';
    theme: 'light' | 'dark';
    displayFormat: DisplayFormat;
    sync: SyncConfig;
}
