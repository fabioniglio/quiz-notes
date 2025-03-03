import { Outlet } from 'react-router'
import { Sidebar } from './components/sidebar'

export function AuthenticatedLayout() {
  return (
    // root wrapper has flex column
    <div className="flex w-full grow items-center">
      <Sidebar />
      <div className="min-h-full grow">
        <Outlet />
      </div>
    </div>
  )
}
