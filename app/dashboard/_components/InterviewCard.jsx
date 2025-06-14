import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, Briefcase } from "lucide-react"; // Using lucide-react for icons
import { useRouter } from 'next/navigation'; // Import useRouter

// Component hiển thị thông tin một buổi phỏng vấn
const InterviewCard = ({ interview }) => {
  // Lấy điểm số từ dữ liệu phỏng vấn
  const overallScore = interview.averageScore || 0;
  const router = useRouter(); // Get router instance
  
  // Hàm xác định màu sắc badge dựa trên độ khó
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-900/30 text-green-200 border-green-500';
      case 'medium': return 'bg-yellow-900/30 text-yellow-100 border-yellow-500';
      case 'hard': return 'bg-red-900/30 text-red-100 border-red-500';
      default: return 'bg-gray-700/30 text-gray-300 border-gray-600';
    }
  };

  // Hàm chuyển đổi thời gian từ giây sang định dạng phút:giây
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(parseInt(seconds) / 60);
    const remainingSeconds = parseInt(seconds) % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Hàm xác định màu sắc dựa trên điểm số
  const getScoreColor = (score) => {
    if (score < 30) return '#e88a7d'; // đỏ
    if (score < 65) return '#eac36b'; // vàng
    return '#8bc34a'; // xanh lá
  };

  // Xử lý khi nhấn nút xem phản hồi
  const handleViewFeedback = () => {
    router.push(`/result-feedback?mockId=${interview.mockID}`);
  };

  // Xử lý khi nhấn nút làm lại phỏng vấn
  const handleRedoInterview = () => {
    router.push(`/live-practice-arena?mockId=${interview.mockID}`);
  };

  return (
    <div className="bg-white rounded-[1.5rem] shadow-md p-6 flex flex-col justify-between min-h-[170px] border border-[#e0d8ce] transition-colors duration-200 hover:text-[#2d332b] group">
      <div className="flex items-start">
        {/* Icon placeholder */}
        <div className="w-12 h-12 rounded-xl bg-[#f3e0d2] flex items-center justify-center mr-4"></div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-[#2d332b] truncate mb-1 group-hover:text-[#2d332b] transition-colors duration-200">{interview.title || 'Untitled Interview'}</h3>
          <div className="flex items-center gap-2 mb-1">
            {/* Badge độ khó */}
            <span className="bg-[#f3f4f6] text-[#6b6f6a] group-hover:text-[#2d332b] rounded-full px-3 py-2 text-xs font-semibold flex items-center gap-1 transition-colors duration-200">
              <Target className="w-4 h-4" />
              {interview.difficulty || 'N/A'}
            </span>
            {/* Badge thời gian */}
            <span className="bg-[#f3f4f6] text-[#6b6f6a] group-hover:text-[#2d332b] rounded-full px-3 py-2 text-xs font-semibold flex items-center gap-1 transition-colors duration-200">
              <Clock className="w-4 h-4" />
              {formatDuration(interview.duration)}
            </span>
            {/* Badge ngành nghề nếu có */}
            {interview.industry && (
              <span className="bg-[#f3f4f6] text-[#6b6f6a] group-hover:text-[#2d332b] rounded-full px-3 py-2 text-xs font-semibold flex items-center gap-1 transition-colors duration-200">
                <Briefcase className="w-4 h-4" />
                {interview.industry}
              </span>
            )}
          </div>
        </div>
        {/* Hiển thị điểm số dạng vòng tròn */}
        <div className="flex items-center justify-center ml-4">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e5e5" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={getScoreColor(overallScore)}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - (overallScore / 100))}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s' }}
            />
            <text x="32" y="40" textAnchor="middle" fontSize="20" fill="#7a8a5a" fontWeight="bold">{overallScore}</text>
          </svg>
        </div>
      </div>
      <hr className="my-4 border-[#f3f4f6]" />
      {/* Các nút hành động */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1 bg-[#ebf7ee] border-2 border-[#b6e388] text-[#2d332b] rounded-[2rem] font-semibold py-6 px-4 text-xl flex items-center justify-center gap-2 hover:bg-[#dcffb9] hover:text-[#2d332b]"
          onClick={handleRedoInterview}
        >
          <span className="inline-block rotate-[-45deg]">&#8635;</span> Làm lại
        </Button>
        <Button
          variant="default"
          className="flex-1 bg-[#b6e388] text-[#2d332b] rounded-[2rem] font-semibold py-6 px-4 text-xl flex items-center justify-center gap-2 border-2 border-[#b6e388] hover:bg-[#a3d977] hover:text-[#2d332b]"
          onClick={handleViewFeedback}
        >
          Xem đánh giá
        </Button>
      </div>
    </div>
  );
};

export default InterviewCard; 