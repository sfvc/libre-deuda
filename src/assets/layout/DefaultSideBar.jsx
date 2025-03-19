import React from 'react'
import { Sidebar } from 'flowbite-react'
import { Link, Outlet } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { FaHome, FaWpforms } from 'react-icons/fa'
import { IoMdLogIn } from 'react-icons/io'
import { FiLayout } from 'react-icons/fi'
import { HiOutlineMinusSm, HiOutlinePlusSm } from 'react-icons/hi'
import { TbLayoutNavbar, TbLayoutSidebar, TbFileDownload, TbClick, TbSortAscendingNumbers, TbTableColumn } from 'react-icons/tb'
import { BsCardHeading } from 'react-icons/bs'
import { TfiLayoutMediaOverlayAlt } from 'react-icons/tfi'

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
