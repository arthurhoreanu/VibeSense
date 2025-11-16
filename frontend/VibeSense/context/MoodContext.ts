import { createContext, useContext } from 'react';

export type MoodFactor = {
    icon: any;
    label: string;
    value: string;
};

export type CurrentMoodState = {
    type: string;
    factors: MoodFactor[];
};

export type MoodDataContext = {
    mood: CurrentMoodState;
    loading: boolean;
    error: string | null;
};

export const MoodContext = createContext<MoodDataContext | undefined>(undefined);

export const useMood = () => {
    const context = useContext(MoodContext);
    if (!context) {
        throw new Error('useMood must be used within a MoodProvider');
    }
    return context;
};
