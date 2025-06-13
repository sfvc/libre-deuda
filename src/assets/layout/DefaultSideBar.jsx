import { Sidebar } from 'flowbite-react'
import { BsCardHeading } from 'react-icons/bs'
import { Link, Outlet } from 'react-router-dom'

export function DefaultSideBar ({ sidebarOpen }) {
  return (
    <div className='flex flex-1'>
      <Sidebar
        className={`z-20 rounded-none w-52 fixed__sidebar transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg-custom:translate-x-0`}
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item as={Link} to='/card' icon={BsCardHeading}>
              Card
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
      <div className='w-full'>
        <Outlet />
      </div>
    </div>
  )
}

export default DefaultSideBar
