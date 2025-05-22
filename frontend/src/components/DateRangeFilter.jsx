import React, { useState, useRef, useEffect } from 'react';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, 
  startOfYear, endOfYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';


const DateRangeFilter = ({ onDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Tháng này');
  const [customRange, setCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const dropdownRef = useRef(null);

  // Xử lý click bên ngoài dropdown để đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Áp dụng bộ lọc khi component mount
  useEffect(() => {
    handleOptionSelect('Tháng này');
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setCustomRange(false);
    let start, end;
    const today = new Date();

    switch (option) {
      case 'Hôm nay':
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case 'Hôm qua':
        start = startOfDay(subDays(today, 1));
        end = endOfDay(subDays(today, 1));
        break;
      case 'Tuần này':
        start = startOfWeek(today, { weekStartsOn: 1, locale: vi });
        end = endOfWeek(today, { weekStartsOn: 1, locale: vi });
        break;
      case 'Tuần trước':
        start = startOfWeek(subDays(today, 7), { weekStartsOn: 1, locale: vi });
        end = endOfWeek(subDays(today, 7), { weekStartsOn: 1, locale: vi });
        break;
      case 'Tháng này':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'Tháng trước':
        start = startOfMonth(subDays(startOfMonth(today), 1));
        end = endOfMonth(subDays(startOfMonth(today), 1));
        break;
      case 'Quý này':
        start = startOfQuarter(today);
        end = endOfQuarter(today);
        break;
      case 'Quý trước':
        start = startOfQuarter(subDays(startOfQuarter(today), 1));
        end = endOfQuarter(subDays(startOfQuarter(today), 1));
        break;
      case 'Năm nay':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      case 'Năm trước':
        start = startOfYear(subDays(startOfYear(today), 1));
        end = endOfYear(subDays(startOfYear(today), 1));
        break;
      case '30 ngày qua':
        start = subDays(today, 30);
        end = today;
        break;
      default:
        start = startOfMonth(today);
        end = endOfMonth(today);
    }

    const formattedStart = format(start, 'yyyy-MM-dd');
    const formattedEnd = format(end, 'yyyy-MM-dd');
    
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    onDateRangeChange(formattedStart, formattedEnd);
    setIsOpen(false);
  };

  const handleCustomRangeChange = () => {
  if (startDate && endDate) {
    // Kiểm tra startDate <= endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast.error('Ngày bắt đầu phải trước ngày kết thúc');
      return;
    }
    
    console.log('DateRangeFilter: Calling onDateRangeChange with custom range', startDate, endDate);
    onDateRangeChange(startDate, endDate);
    setIsOpen(false);
  } else {
    toast.error('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc');
  }
};


  return (
    <div className="date-range-filter" ref={dropdownRef}>
      <div className="selected-filter" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption}</span>
        <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>
      
      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-tabs">
            <div className="tab">Theo ngày</div>
            <div className="tab">Theo tuần</div>
            <div className="tab">Theo tháng</div>
            <div className="tab">Theo quý</div>
            <div className="tab">Theo năm</div>
          </div>
          
          <div className="filter-options">
            <div className="option-group">
              <div className="option" onClick={() => handleOptionSelect('Hôm nay')}>Hôm nay</div>
              <div className="option" onClick={() => handleOptionSelect('Hôm qua')}>Hôm qua</div>
            </div>
            
            <div className="option-group">
              <div className="option" onClick={() => handleOptionSelect('Tuần này')}>Tuần này</div>
              <div className="option" onClick={() => handleOptionSelect('Tuần trước')}>Tuần trước</div>
            </div>
            
            <div className="option-group">
              <div className="option" onClick={() => handleOptionSelect('Tháng này')}>Tháng này</div>
              <div className="option" onClick={() => handleOptionSelect('Tháng trước')}>Tháng trước</div>
              <div className="option" onClick={() => handleOptionSelect('30 ngày qua')}>30 ngày qua</div>
            </div>
            
            <div className="option-group">
              <div className="option" onClick={() => handleOptionSelect('Quý này')}>Quý này</div>
              <div className="option" onClick={() => handleOptionSelect('Quý trước')}>Quý trước</div>
            </div>
            
            <div className="option-group">
              <div className="option" onClick={() => handleOptionSelect('Năm nay')}>Năm nay</div>
              <div className="option" onClick={() => handleOptionSelect('Năm trước')}>Năm trước</div>
            </div>
          </div>
          
          <div className="custom-range">
            <label>
              <input 
                type="checkbox" 
                checked={customRange} 
                onChange={() => setCustomRange(!customRange)} 
              />
              Lựa chọn khác
            </label>
            
            {customRange && (
              <div className="custom-date-inputs">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
                <span>đến</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
                <button onClick={handleCustomRangeChange}>Áp dụng</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
