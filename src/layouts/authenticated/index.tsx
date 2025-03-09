import { Outlet } from 'react-router'
import { Sidebar } from './components/sidebar'

export function AuthenticatedLayout() {
  return (
    // root wrapper has flex column
    <div className="flex w-full grow">
      <Sidebar />
      <div className="min-h-screen grow p-6 md:p-8 lg:p-10">
        <Outlet />
      </div>
    </div>
  )
}
