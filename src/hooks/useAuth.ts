import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { User } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasToken = !!localStorage.getItem('token');

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get<User>('/api/auth/me'),
    enabled: hasToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.post<{ token: string }>('/api/auth/login', { email, password }),
    onSuccess: ({ token }) => {
      localStorage.setItem('token', token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/workbench');
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, name, password }: { email: string; name: string; password: string }) =>
      api.post<User>('/api/auth/register', { email, name, password }),
    onSuccess: async (_, { email, password }) => {
      // Auto-login after register
      const { token } = await api.post<{ token: string }>('/api/auth/login', { email, password });
      localStorage.setItem('token', token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/workbench');
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    navigate('/login');
  };

  return {
    user,
    isLoading: hasToken && isLoading,
    isAuthenticated: !!user,
    login: (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
    loginError: loginMutation.error?.message,
    loginPending: loginMutation.isPending,
    register: (email: string, name: string, password: string) =>
      registerMutation.mutateAsync({ email, name, password }),
    registerError: registerMutation.error?.message,
    registerPending: registerMutation.isPending,
    logout,
  };
}
