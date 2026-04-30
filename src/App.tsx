import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { router } from '@/routes';
import { queryClient } from '@/lib/queryClient';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
