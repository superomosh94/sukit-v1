'use client';

import { useCallback, useState } from 'react';

export function useAiChatIntegration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = useCallback(
    async (prompt: string, context?: string) => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/chat/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, context }),
        });
        const data = await res.json();
        return data.content as string;
      } catch (err) {
        console.error('AI generation failed:', err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const enhanceBlockContent = useCallback(
    async (blockContent: string, instruction: string) => {
      return generateContent(
        `Enhance the following content: "${blockContent}". Instruction: ${instruction}`
      );
    },
    [generateContent]
  );

  return { isGenerating, generateContent, enhanceBlockContent };
}
