import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Template } from '../types';

export function useTemplates() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['templates'] });

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: () => api.get<Template[]>('/api/templates'),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; content: string }) =>
      api.post<Template>('/api/templates', data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; content: string }) =>
      api.put<Template>(`/api/templates/${id}`, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/templates/${id}`),
    onSuccess: invalidate,
  });

  return {
    templates,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
  };
}
