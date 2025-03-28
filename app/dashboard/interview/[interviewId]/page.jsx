"use client"

import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import {
  Lightbulb,
  WebcamIcon,
  CheckCircle2,
  XCircle,
  Briefcase,
  Code2,
  Clock,
  MicIcon,
  CameraIcon,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Animation variants
const animations = {
  pageLoad: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  scaleOnHover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  }
}

// Interview tips data
const INTERVIEW_TIPS = {
  beforeStart: [
    'Find a quiet, well-lit space',
    'Test your camera and microphone',
    'Have a glass of water ready',
    'Take a few deep breaths'
  ],
  privacy: [
    'All sessions are private and secure',
    'No recordings are stored permanently',
    'Data is processed locally'
  ]
}

// Custom hooks
const useInterviewData = (interviewId) => {
  const [state, setState] = useState({
    data: null,
    isLoading: true,
    error: null
  })

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const result = await db.select()
        .from(MockInterview)
        .where(eq(MockInterview.mockID, interviewId))

      if (!result?.length) {
        throw new Error("Interview not found")
      }

      setState({
        data: result[0],
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error("Error fetching interview details:", error)
      setState({
        data: null,
        isLoading: false,
        error: error.message
      })
      toast.error("Failed to load interview details")
    }
  }, [interviewId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return state
}

const useDevicePermissions = () => {
  const [webCamEnabled, setWebCamEnabled] = useState(false)
  const [micPermission, setMicPermission] = useState(false)

  const checkMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setMicPermission(true)
    } catch (err) {
      setMicPermission(false)
    }
  }, [])

  const handleWebcamEnable = useCallback(async () => {
    try {
      setWebCamEnabled(true)
      toast.success("Camera enabled successfully!")
    } catch (error) {
      toast.error("Failed to enable camera. Please check permissions.")
      setWebCamEnabled(false)
    }
  }, [])

  useEffect(() => {
    checkMicrophonePermission()
  }, [checkMicrophonePermission])

  return {
    webCamEnabled,
    setWebCamEnabled,
    micPermission,
    handleWebcamEnable
  }
}

// Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[70vh]">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center"
    >
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="mt-4 text-lg text-gray-600">Loading interview details...</p>
    </motion.div>
  </div>
)

const Header = ({ jobPosition }) => (
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Interview Preparation
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Your path to interview excellence begins here
      </p>
    </div>
    <Badge
      variant="outline"
      className="text-lg py-2 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200/50 dark:border-blue-800/50"
    >
      <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
      {jobPosition || "Position Loading..."}
    </Badge>
  </div>
)

const JobDetail = ({ icon, title, value }) => (
  <motion.div
    whileHover={{ x: 5 }}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
  >
    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
      {icon}
    </div>
    <div>
      <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
      <p className="text-gray-600 dark:text-gray-400">{value}</p>
    </div>
  </motion.div>
)

const JobDetailsCard = ({ jobPosition, jobDesc, jobExperience }) => (
  <Card className="border-2 border-transparent hover:border-blue-500/20 transition-all duration-300">
    <CardHeader className="space-y-1">
      <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Position Details
      </CardTitle>
      <CardDescription>Key information about your upcoming interview</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <JobDetail
        icon={<Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        title="Role"
        value={jobPosition}
      />
      <JobDetail
        icon={<Code2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        title="Job Description"
        value={jobDesc}
      />
      <JobDetail
        icon={<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        title="Experience Required"
        value={`${jobExperience} years`}
      />
    </CardContent>
  </Card>
)

const TipSection = ({ title, tips, icon }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="space-y-2 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50"
  >
    <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
      {icon}
      {title}
    </h3>
    <ul className="ml-6 space-y-2">
      {tips.map((tip, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-gray-600 dark:text-gray-400 flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {tip}
        </motion.li>
      ))}
    </ul>
  </motion.div>
)

const TipsCard = ({ showTips, setShowTips }) => (
  <Card className="border-2 border-primary/20">
    <CardHeader className="space-y-1">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Interview Tips
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTips(!showTips)}
        >
          {showTips ? 'Hide' : 'Show'} Tips
        </Button>
      </div>
      <CardDescription>Essential reminders for a successful interview</CardDescription>
    </CardHeader>
    <AnimatePresence>
      {showTips && (
        <motion.div {...animations.fadeIn}>
          <CardContent className="space-y-4">
            <TipSection
              title="Before You Start"
              tips={INTERVIEW_TIPS.beforeStart}
              icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
            />
            <TipSection
              title="Privacy Assurance"
              tips={INTERVIEW_TIPS.privacy}
              icon={<ShieldCheck className="h-4 w-4 text-blue-500" />}
            />
          </CardContent>
        </motion.div>
      )}
    </AnimatePresence>
  </Card>
)

const DeviceStatus = ({ icon, label, isEnabled }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300
      ${isEnabled
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200/50 dark:border-green-800/50'
        : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-200/50 dark:border-red-800/50'
      }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className={isEnabled ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
        {label}
      </span>
    </div>
    {isEnabled ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )}
  </motion.div>
)

const CameraPreview = ({ webCamEnabled, handleWebcamEnable, setWebCamEnabled }) => (
  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 aspect-video border-2 border-gray-200/50 dark:border-gray-700/50">
    <AnimatePresence mode="wait">
      {webCamEnabled ? (
        <motion.div {...animations.fadeIn}>
          <Webcam
            onUserMedia={() => setWebCamEnabled(true)}
            onUserMediaError={() => {
              setWebCamEnabled(false)
              toast.error("Failed to access camera")
            }}
            mirrored={true}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ) : (
        <motion.div
          {...animations.fadeIn}
          className="flex flex-col items-center justify-center h-full p-8"
        >
          <WebcamIcon className="h-20 w-20 text-gray-400 animate-pulse" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
            Enable your camera to prepare for the interview
          </p>
          <Button
            variant="outline"
            className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
            onClick={handleWebcamEnable}
          >
            <CameraIcon className="w-4 h-4 mr-2" />
            Enable Camera
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

const DeviceCheckCard = ({ webCamEnabled, micPermission, handleWebcamEnable, setWebCamEnabled }) => (
  <Card>
    <CardHeader>
      <CardTitle>System Check</CardTitle>
      <CardDescription>Verify your device setup before starting</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <DeviceStatus
        icon={<CameraIcon className="h-5 w-5" />}
        label="Camera"
        isEnabled={webCamEnabled}
      />
      <DeviceStatus
        icon={<MicIcon className="h-5 w-5" />}
        label="Microphone"
        isEnabled={micPermission}
      />
      <CameraPreview
        webCamEnabled={webCamEnabled}
        handleWebcamEnable={handleWebcamEnable}
        setWebCamEnabled={setWebCamEnabled}
      />
    </CardContent>
  </Card>
)

const StartInterviewButton = ({ interviewId, isDisabled }) => (
  <div className="space-y-3">
    <motion.div
      {...animations.scaleOnHover}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-20 rounded-lg" />
      <Link href={`/dashboard/interview/${interviewId}/start`}>
        <Button
          className={`w-full h-16 text-lg relative
            ${isDisabled
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg'
            }`}
          disabled={isDisabled}
        >
          Start Interview
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </motion.div>
    {isDisabled && (
      <p className="text-center text-sm text-red-500 dark:text-red-400 animate-pulse">
        Please enable both camera and microphone to begin
      </p>
    )}
  </div>
)

function Interview({ params }) {
  const [showTips, setShowTips] = useState(true)
  const { data: interviewData, isLoading } = useInterviewData(params.interviewId)
  const { webCamEnabled, setWebCamEnabled, micPermission, handleWebcamEnable } = useDevicePermissions()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <motion.div {...animations.pageLoad} className="container mx-auto py-8 px-4">
      <Header jobPosition={interviewData?.jobPosition} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <JobDetailsCard
            jobPosition={interviewData?.jobPosition}
            jobDesc={interviewData?.jobDesc}
            jobExperience={interviewData?.jobExperience}
          />
          <TipsCard
            showTips={showTips}
            setShowTips={setShowTips}
          />
        </div>

        <div className="space-y-6">
          <DeviceCheckCard
            webCamEnabled={webCamEnabled}
            micPermission={micPermission}
            handleWebcamEnable={handleWebcamEnable}
            setWebCamEnabled={setWebCamEnabled}
          />
          <StartInterviewButton
            interviewId={params.interviewId}
            isDisabled={!webCamEnabled || !micPermission}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default Interview