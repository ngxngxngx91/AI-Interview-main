import React from 'react'
import Header from './_components/Header'

// Add metadata configuration for dashboard
export const metadata = {
  title: 'AI-Interview | Dashboard',
  description: 'AI-Interview dashboard',
}

function DashBoardLayout({children}) {
  return (
    <div>
        <Header/>
        <div className='mx-5 md:mx-20 lg:mx-36'>
        {children}
        </div>
    </div>
  )
}

export default DashBoardLayout