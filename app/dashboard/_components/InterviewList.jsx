import React, { useState, useEffect } from 'react';
import InterviewCard from './InterviewCard';
import { motion } from "framer-motion";
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Component hiển thị danh sách các buổi phỏng vấn
const InterviewList = ({ setShowDesignModal }) => {
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [highestScore, setHighestScore] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = React.useState("vi");
  const [selectedIndustry, setSelectedIndustry] = React.useState("");

  // Lấy dữ liệu danh sách phỏng vấn và điểm cao nhất khi component được mount
  useEffect(() => {
    fetchInterviews();
    fetchHighestScore();
  }, []);

  // Hàm lấy danh sách phỏng vấn từ API
  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/interview-list');
      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }
      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  // Hàm lấy điểm cao nhất từ API
  const fetchHighestScore = async () => {
    try {
      const response = await fetch('/api/highest-score');
      if (!response.ok) {
        throw new Error('Failed to fetch highest score');
      }
      const data = await response.json();
      setHighestScore(data.highestScore);
    } catch (error) {
      console.error('Error fetching highest score:', error);
    }
  };

  // Xử lý xóa phỏng vấn
  const handleDeleteInterview = async (mockId) => {
    try {
      const response = await fetch(`/api/interview-list/${mockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }

      // Cập nhật lại danh sách phỏng vấn sau khi xóa
      await fetchInterviews();
    } catch (error) {
      console.error('Error deleting interview:', error);
    }
  };

  // Lọc danh sách phỏng vấn dựa trên từ khóa tìm kiếm
  const filteredInterviews = interviews.filter(interview =>
    interview.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header với animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl md:text-4xl font-bold text-[#2d332b] text-left mb-8 mt-24">Hành trình luyện tập của bạn</h2>
        {/* Grid thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card thống kê 1: Số lượng phỏng vấn */}
          <div className="relative flex items-center justify-between rounded-[1.5rem] px-6 py-5 h-[120px] border border-[#e0d8ce] transition-all duration-200 hover:bg-white hover:border-[#d6d0c4] overflow-hidden">
            <Image
              src="/dasboard_background_2.png"
              alt="Background 1"
              layout="fill"
              objectFit="cover"
              quality={100}
              className="absolute inset-0 z-0 rounded-[1.5rem]"
            />
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-2xl font-bold text-[#2d332b] mb-1">{interviews.length}</span>
              <span className="text-base text-[#6b6f6a]">Buổi phỏng vấn</span>
            </div>
          </div>
          {/* Card thống kê 2: Điểm cao nhất */}
          <div className="relative flex items-center justify-between rounded-[1.5rem] px-6 py-5 h-[120px] border border-[#cfe2d2] transition-all duration-200 hover:bg-white hover:border-[#b7c8b7] overflow-hidden">
            <Image
              src="/dasboard_background_3.png"
              alt="Background 2"
              layout="fill"
              objectFit="cover"
              quality={100}
              className="absolute inset-0 z-0 rounded-[1.5rem]"
            />
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-2xl font-bold text-[#2d332b] mb-1">{highestScore}/100</span>
              <span className="text-base text-[#6b6f6a]">Điểm cao nhất</span>
            </div>
          </div>
          {/* Card thống kê 3: Tỷ lệ phát triển */}
          <div className="relative flex items-center justify-between rounded-[1.5rem] px-6 py-5 h-[120px] border border-[#e6e3c9] transition-all duration-200 hover:bg-white hover:border-[#d1ceb6] overflow-hidden">
            <Image
              src="/dasboard_background_4.png"
              alt="Background 3"
              layout="fill"
              objectFit="cover"
              quality={100}
              className="absolute inset-0 z-0 rounded-[1.5rem]"
            />
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-2xl font-bold text-[#2d332b] mb-1">+50%</span>
              <span className="text-base text-[#6b6f6a]">Tỷ lệ phát triển</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Thanh tìm kiếm và nút tạo mới với animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex w-full gap-6 items-stretch justify-between"
      >
        <div className="flex w-full gap-6 items-stretch justify-between mt-3">
          {/* Ô tìm kiếm với icon */}
          <div className="relative w-[440px] max-w-full">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6b6f6a]">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#6b6f6a" strokeWidth="2" /><path stroke="#6b6f6a" strokeWidth="2" strokeLinecap="round" d="M20 20l-3-3" /></svg>
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên buổi phỏng vấn"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-[1rem] border-2 border-[#e0d8ce] bg-white text-[#3d463b] placeholder-[#6b6f6a] focus:outline-none focus:border-[#b6b6a8] text-base shadow-sm h-full"
            />
          </div>
          {/* Nút tạo phỏng vấn mới */}
          <div>
            <Button
              variant="outline"
              className="border-2 border-[#f3b6b6] text-[#e45a5a] hover:bg-[#f9f3ef] hover:border-[#e45a5a] rounded-[2rem] gap-2 font-semibold px-8 py-3 text-base flex items-center justify-center h-full"
              style={{ color: '#e45a5a', background: 'transparent' }}
              onClick={() => setShowDesignModal(true)}
            >
              <PlusCircle className="w-5 h-5 text-[#e45a5a]" />
              <span className='max-[450px]:hidden'>Tạo buổi phỏng vấn mới</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Grid hiển thị các card phỏng vấn với animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 min-[950px]:grid-cols-2 gap-6"
      >
        {filteredInterviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
            onDelete={handleDeleteInterview}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default InterviewList; 