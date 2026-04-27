import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider } from '@/components/ui/Toast';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';

const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const NewsArchive = lazy(() => import('@/pages/NewsArchive'));
const RustTasksArchive = lazy(() => import('@/pages/RustTasksArchive'));
const RustReadingsArchive = lazy(() => import('@/pages/RustReadingsArchive'));
const RustTaskDetail = lazy(() => import('@/pages/RustTaskDetail'));
const RustReadingDetail = lazy(() => import('@/pages/RustReadingDetail'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<FullScreenLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <AppShell>
                        <Home />
                      </AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/archive/news"
                  element={
                    <RequireAuth>
                      <AppShell>
                        <NewsArchive />
                      </AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/archive/rust-tasks"
                  element={
                    <RequireAuth>
                      <AppShell>
                        <RustTasksArchive />
                      </AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/archive/rust-readings"
                  element={
                    <RequireAuth>
                      <AppShell>
                        <RustReadingsArchive />
                      </AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/rust-tasks/:id"
                  element={
                    <RequireAuth>
                      <AppShell>
                        <RustTaskDetail />
                      </AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/rust-readings/:id"
                  element={
                    <RequireAuth>
                      <AppShell>
                        <RustReadingDetail />
                      </AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="*"
                  element={
                    <RequireAuth>
                      <AppShell>
                        <NotFound />
                      </AppShell>
                    </RequireAuth>
                  }
                />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
