import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../services/api';
import type { GenerateResponse, SessionMessage } from '../types';

export function useReport() {
  const queryClient = useQueryClient();
  const [dictation, setDictation] = useState('');
  const [report, setReport] = useState('');
  const [sessionHistory, setSessionHistory] = useState<SessionMessage[]>([]);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: () =>
      api.post<GenerateResponse>('/api/reports/generate', {
        dictation,
        sessionId,
        sessionHistory,
      }),
    onSuccess: (res) => {
      if (res.type === 'report') {
        setReport(res.content);
        setSessionHistory((prev) => [
          ...prev,
          { role: 'user', content: dictation },
          { role: 'assistant', content: res.content },
        ]);
        queryClient.invalidateQueries({ queryKey: ['reports'] });
      } else {
        // question — show in report panel, append to history
        setReport(res.content);
        setSessionHistory((prev) => [
          ...prev,
          { role: 'user', content: dictation },
          { role: 'assistant', content: res.content },
        ]);
      }
    },
  });

  const newPatient = () => {
    setDictation('');
    setReport('');
    setSessionHistory([]);
    setSessionId(crypto.randomUUID());
  };

  return {
    dictation,
    setDictation,
    report,
    setReport,
    generate: mutation.mutate,
    isGenerating: mutation.isPending,
    error: mutation.error?.message,
    newPatient,
  };
}
