import React from 'react'
import Header from './_components/Header'

// Add metadata configuration for dashboard
export const metadata = {
    title: 'AI-Interview | Dashboard',
    description: 'AI-Interview dashboard',
}

function DashBoardLayout({ children }) {
    return (
        <div>
            <Header />
            <div style={{ background: '#FAF8F6', width: '100%' }} className="px-4 sm:px-2 lg:px-2">
                {children}
            </div>
        </div>
    )
}

export default DashBoardLayout