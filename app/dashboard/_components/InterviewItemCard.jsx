import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'
import React from 'react'

function InterviewItemCard({ interview }) {

    const router = useRouter();

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockID)
    }

    const onFeedBackPress = () => {
        router.push('/dashboard/interview/' + interview?.mockID + "/feedback")
    }

    return (
        <div className="border-2 shadow-sm rounded-xl p-4 bg-white dark:bg-gray-800 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 group">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {interview?.jobPosition}
            </h2>
            <h2 className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Job Experience: <span className="font-medium">{interview?.jobExperience}</span>
            </h2>

            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                Created At: {interview?.createdAt}
            </div>

            <div className="flex gap-4 mt-4">
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-lg border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={onFeedBackPress}
                >
                    Feedbacks
                </Button>
                <Button
                    size="sm"
                    className="w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                    group-hover:bg-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/20
                    dark:group-hover:shadow-blue-900/30 transition-all duration-300 relative overflow-hidden"
                    onClick={onStart}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <svg
                            className="w-4 h-4 transition-transform group-hover:rotate-180"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Start / Redo
                    </span>
                </Button>
            </div>
        </div>
    )
}

export default InterviewItemCard