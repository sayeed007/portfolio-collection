// src/app/ClientProvider.tsx
'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/redux/store';
import { ReactNode } from 'react';
import { ToastProvider } from '@/lib/contexts/ToastContext';

export function ClientProvider({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    {children}
                </PersistGate>
            </Provider>
        </ToastProvider>
    );
}