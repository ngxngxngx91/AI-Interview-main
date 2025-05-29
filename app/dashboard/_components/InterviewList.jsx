import React, { useState, useEffect } from 'react';
import InterviewCard from './InterviewCard';
import { motion } from "framer-motion";
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const InterviewList = () => {
  // State quản lý danh sách phỏng vấn và từ khóa tìm kiếm
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Effect hook để lấy dữ liệu phỏng vấn từ API
  useEffect(() => {
    // Hàm lấy dữ liệu phỏng vấn từ API
    const fetchInterviews = async () => {
      try {
        const response = await fetch('/api/interview-feedback'); // Giả định endpoint này tồn tại hoặc cần tạo mới
        if (!response.ok) {
          throw new Error('Failed to fetch interviews');
        }
        const data = await response.json();
        // Dữ liệu từ database có thể là chuỗi JSON, cần parse
        const parsedData = data.map(item => ({
          ...item,
          conversation: JSON.parse(item.conversation),
          strengths: JSON.parse(item.strengths),
          weaknesses: JSON.parse(item.weaknesses),
          detailedFeedback: JSON.parse(item.detailedFeedback),
          messageAnalysis: JSON.parse(item.messageAnalysis),
          // Không cần parse bodyLanguageFeedback nữa vì đã bị xóa
        }));
        setInterviews(parsedData);
      } catch (error) {
        console.error('Error fetching interviews:', error);
        // Xử lý lỗi (ví dụ: hiển thị thông báo cho người dùng)
      }
    };

    fetchInterviews();
  }, []); // Mảng dependency rỗng nghĩa là effect này chỉ chạy một lần khi component mount

  // Lọc danh sách phỏng vấn dựa trên từ khóa tìm kiếm
  const filteredInterviews = interviews.filter(interview =>
    interview.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Phần Header với animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl md:text-4xl font-bold text-[#2d332b] text-left mb-8 mt-24">Hành trình luyện tập của bạn</h2>
        {/* Grid hiển thị các thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card thống kê 1: Số buổi phỏng vấn */}
          <div className="flex items-center justify-between rounded-[1.5rem] bg-[#f9f3ef] px-6 py-5 h-[110px] border border-[#e0d8ce] transition-all duration-200 hover:bg-white hover:border-[#d6d0c4]">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-[#2d332b] mb-1">{interviews.length}</span>
              <span className="text-base text-[#6b6f6a]">Buổi phỏng vấn</span>
            </div>
            {/* Placeholder cho icon */}
            <div className="w-16 h-16 rounded-xl bg-[#f3e0d2] ml-4 flex items-center justify-center"></div>
          </div>
          {/* Card thống kê 2: Điểm cao nhất */}
          <div className="flex items-center justify-between rounded-[1.5rem] bg-[#eaf6e6] px-6 py-5 h-[110px] border border-[#cfe2d2] transition-all duration-200 hover:bg-white hover:border-[#b7c8b7]">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-[#2d332b] mb-1">80/100</span>
              <span className="text-base text-[#6b6f6a]">Điểm cao nhất</span>
            </div>
            {/* Placeholder cho icon */}
            <div className="w-16 h-16 rounded-xl bg-[#f7e7b7] ml-4 flex items-center justify-center"></div>
          </div>
          {/* Card thống kê 3: Tỷ lệ phát triển */}
          <div className="flex items-center justify-between rounded-[1.5rem] bg-[#f8f6e7] px-6 py-5 h-[110px] border border-[#e6e3c9] transition-all duration-200 hover:bg-white hover:border-[#d1ceb6]">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-[#2d332b] mb-1">+50%</span>
              <span className="text-base text-[#6b6f6a]">Tỷ lệ phát triển</span>
            </div>
            {/* Placeholder cho icon */}
            <div className="w-16 h-16 rounded-xl bg-[#d6eac7] ml-4 flex items-center justify-center"></div>
          </div>
        </div>
      </motion.div>

      {/* Phần tìm kiếm và nút tạo mới với animation */}
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
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#6b6f6a" strokeWidth="2"/><path stroke="#6b6f6a" strokeWidth="2" strokeLinecap="round" d="M20 20l-3-3"/></svg>
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên buổi phỏng vấn"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-[1rem] border-2 border-[#e0d8ce] bg-white text-[#3d463b] placeholder-[#6b6f6a] focus:outline-none focus:border-[#b6b6a8] text-base shadow-sm h-full"
          />
        </div>
        {/* Nút tạo buổi phỏng vấn mới */}
        <div>
          <Button
            variant="outline"
            className="border-2 border-[#f3b6b6] text-[#e45a5a] hover:bg-[#f9f3ef] hover:border-[#e45a5a] rounded-[2rem] gap-2 font-semibold px-8 py-3 text-base flex items-center justify-center h-full"
            style={{ color: '#e45a5a', background: 'transparent' }}
          >
            <PlusCircle className="w-5 h-5 text-[#e45a5a]" />
            Tạo buổi phỏng vấn mới
          </Button>
        </div>
        </div>
      </motion.div>

      {/* Danh sách các card phỏng vấn với animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredInterviews.map((interview) => (
          <InterviewCard key={interview.id} interview={interview} />
        ))}
      </motion.div>
    </div>
  );
};

export default InterviewList; 