"use client"
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export const App = () => {
    useEffect(() => {
        createChat({
            webhookUrl: 'https://statgpt.nso.mn/webhook/a9a92b5a-28a6-45f0-baf4-6bee5069fd38/chat',
            webhookConfig: {
                method: 'POST',
                headers: {}
            },
            target: '#n8n-chat',
            mode: 'window',
            chatInputKey: 'chatInput',
            chatSessionKey: 'sessionId',
            loadPreviousSession: true,
            metadata: {},
            showWelcomeScreen: false,
            defaultLanguage: 'mn',
            initialMessages: [
                'Сайн байна уу! 👋',
                'Намайг StatGPT гэдэг. Би таньд Монгол Улсын статистикийн мэдээлэл өгөх боломжтой болно.'
            ],
            i18n: {
                mn: {
                    title: 'Сайн байна уу! 👋',
                    subtitle: "Би таньд 24/7 туслах болно.",
                    footer: '',
                    getStarted: 'Эхлэх',
                    inputPlaceholder: 'Асуулт оруулна уу',
                },
            },
            enableStreaming: false,
        });
    }, []);

    return (<div></div>);
};