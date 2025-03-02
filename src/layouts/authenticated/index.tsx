import { Outlet } from 'react-router'
export function AuthenticatedLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
