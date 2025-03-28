"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAIModal'
import {
    LoaderCircle,
    Plus,
    Briefcase,
    FileText,
    Clock,
    Sparkles,
    X,
    BookOpen
} from 'lucide-react'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false)
    const [formData, setFormData] = useState({
        jobPosition: '',
        jobDesc: '',
        jobExperience: ''
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { user } = useUser()

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const resetForm = () => {
        setFormData({
            jobPosition: '',
            jobDesc: '',
            jobExperience: ''
        })
    }

    const handleClose = () => {
        setOpenDialog(false)
        resetForm()
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const InputPrompt = `Job Position: ${formData.jobPosition}, Job Description: ${formData.jobDesc}, Year of Experience: ${formData.jobExperience}, Depends on Job Position, Job Description & Years of Experience give me ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} Interview questions along with suggest answers in JSON format, Give us question and suggest answer field on JSON`

            const result = await chatSession.sendMessage(InputPrompt)
            const MockJsonResp = (result.response.text()).replace('```json', '').replace('```', '')

            const resp = await db.insert(MockInterview)
                .values({
                    mockID: uuidv4(),
                    jsonMockResp: MockJsonResp,
                    jobPosition: formData.jobPosition,
                    jobDesc: formData.jobDesc,
                    jobExperience: formData.jobExperience,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-yyyy')
                }).returning({ mockID: MockInterview.mockID })

            if (resp) {
                handleClose()
                toast.success('Interview created successfully!')
                router.push('/dashboard/interview/' + resp[0]?.mockID)
            }
        } catch (error) {
            console.error('Error creating interview:', error)
            toast.error('Failed to create interview. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <Button
                onClick={() => setOpenDialog(true)}
                className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-12 px-6 rounded-lg shadow-lg transition-all duration-300 gap-2 w-full sm:w-auto"
            >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-500" />
                <BookOpen className="w-5 h-5 relative" />
                <span className="relative">Tạo Buổi Phỏng Vấn</span>
            </Button>

            <Dialog open={openDialog} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl p-6 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                    <DialogHeader>
                        <div className="flex items-center justify-between mb-6">
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Tạo Buổi Phỏng Vấn
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                onClick={handleClose}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            {/* Job Position */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <label className="font-medium text-gray-900 dark:text-white">
                                        Vị Trí Công Việc
                                    </label>
                                </div>
                                <Input
                                    value={formData.jobPosition}
                                    onChange={(e) => handleInputChange('jobPosition', e.target.value)}
                                    placeholder="Ex. Full Stack Developer"
                                    className="w-full border-2 focus:border-emerald-500 transition-colors rounded-lg"
                                    required
                                />
                            </div>

                            {/* Job Description */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <label className="font-medium text-gray-900 dark:text-white">
                                        Mô Tả Công Việc
                                    </label>
                                </div>
                                <Textarea
                                    value={formData.jobDesc}
                                    onChange={(e) => handleInputChange('jobDesc', e.target.value)}
                                    placeholder="Ex. React, Node.js, PostgreSQL"
                                    className="w-full border-2 focus:border-emerald-500 transition-colors rounded-lg min-h-[100px]"
                                    required
                                />
                            </div>

                            {/* Experience Level */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <label className="font-medium text-gray-900 dark:text-white">
                                        Số Năm Kinh Nghiệm
                                    </label>
                                </div>
                                <Input
                                    value={formData.jobExperience}
                                    onChange={(e) => handleInputChange('jobExperience', e.target.value)}
                                    placeholder="Ex. Junior (1-2 năm)"
                                    className="w-full border-2 focus:border-emerald-500 transition-colors rounded-lg"
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleClose}
                                    className="hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !formData.jobPosition || !formData.jobDesc || !formData.jobExperience}
                                    className={`relative group overflow-hidden ${loading || !formData.jobPosition || !formData.jobDesc || !formData.jobExperience
                                            ? 'bg-gray-300 dark:bg-gray-700'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                                        } text-white gap-2`}
                                >
                                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                    {loading ? (
                                        <>
                                            <LoaderCircle className="w-4 h-4 animate-spin" />
                                            <span className="relative">Đang Tạo...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span className="relative">Tạo Cuộc Phỏng Vấn</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview