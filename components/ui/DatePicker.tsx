/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
"use client";

// React specific imports
import { useState, useRef, useEffect } from "react";

// External libraries
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface DatePickerProps {
  dateFrom: string;
  dateTo: string;
  onChange: (from: string, to: string) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function DatePicker({ dateFrom, dateTo, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Buffered state for proper "Cancel/Apply" flow
  const [tempFrom, setTempFrom] = useState(dateFrom);
  const [tempTo, setTempTo] = useState(dateTo);

  // viewDate controls Left Calendar (Right is viewDate + 1 month)
  const [viewDate, setViewDate] = useState(new Date());

  // Init/Reset on Open
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      // Always show Previous Month on Left, Current Month on Right
      setViewDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));

      if (!dateFrom && !dateTo) {
        // Default behavior: To = Today, From = Empty.
        const strToday = today.toLocaleDateString("en-CA");
        setTempTo(strToday);
        setTempFrom(strToday);
      } else {
        // Sync with existing selection
        setTempFrom(dateFrom);
        setTempTo(dateTo);
      }
    }
  }, [isOpen, dateFrom, dateTo]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDayClick = (date: Date) => {
    // We use "en-CA" (YYYY-MM-DD) for local date consistency
    const strDate = date.toLocaleDateString("en-CA");

    // 1. If we have a complete range (or single day confirmed) -> Reset and Start New
    if (tempFrom && tempTo) {
      setTempFrom(strDate);
      setTempTo(""); // Clear 'To' to indicate new selection started
      return;
    }

    // 2. If we have a start date but no end date
    if (tempFrom && !tempTo) {
      if (strDate < tempFrom) {
        // Clicked before start -> Swap or just set new start?
        // Standard behavior: Reset start to this new date, clear end
        // OR make it a range [New, OldStart].
        // Let's allow selecting backwards as a range:
        setTempTo(tempFrom);
        setTempFrom(strDate);
      } else if (strDate === tempFrom) {
        // Clicked same day -> Confirm Single Day
        setTempTo(strDate);
      } else {
        // Clicked after start -> Confirm Range
        setTempTo(strDate);
      }
      return;
    }

    // 3. Fallback (Empty state)
    setTempFrom(strDate);
    setTempTo("");
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = (offset: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + offset;
    const current = new Date(year, month, 1);
    const displayYear = current.getFullYear();
    const displayMonth = current.getMonth();

    const daysInMonth = getDaysInMonth(displayYear, displayMonth);
    const startDay = getFirstDayOfMonth(displayYear, displayMonth);

    const days = [];
    // Empty slots
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(displayYear, displayMonth, d);
      const strDate = currentDate.toLocaleDateString("en-CA");
      const isFrom = tempFrom === strDate;
      const isTo = tempTo === strDate;
      const inRange =
        tempFrom && tempTo && strDate > tempFrom && strDate < tempTo;

      // Preview Range on Hover could be nice but not strictly required
      // For now, simple logic

      days.push(
        <button
          key={d}
          onClick={() => handleDayClick(currentDate)}
          className={`
                    w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all relative z-10
                    ${
                      isFrom || isTo
                        ? "bg-brand-primary text-white font-bold shadow-md shadow-brand-primary/20"
                        : "hover:bg-neutral-100 text-neutral-700"
                    }
                    ${
                      inRange
                        ? "bg-brand-primary/10 text-brand-primary rounded-none w-full mx-[-2px]"
                        : ""
                    }
                    ${
                      isFrom && tempTo && tempFrom !== tempTo
                        ? "rounded-r-none"
                        : ""
                    }
                    ${
                      isTo && tempFrom && tempFrom !== tempTo
                        ? "rounded-l-none"
                        : ""
                    }
                `}
        >
          {d}
        </button>
      );
    }
    return { days, year: displayYear, month: displayMonth };
  };

  const calLeft = renderCalendar(0);
  const calRight = renderCalendar(1);

  const changeMonth = (delta: number) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + delta,
      1
    );
    setViewDate(newDate);
  };

  const handleApply = () => {
    // If only Start is selected, interpret as Single Day
    const finalTo = tempTo || tempFrom;
    onChange(tempFrom, finalTo);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 flex-shrink-0 flex items-center gap-2 px-3 py-2 border rounded-lg transition-all shadow-sm ${
          dateFrom || dateTo
            ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
        }`}
      >
        <CalendarIcon className="w-4 h-4" />
        {(dateFrom || dateTo) && (
          <span className="hidden sm:inline text-xs font-medium">
            {dateFrom && dateTo && dateFrom === dateTo
              ? dateFrom
              : !dateFrom && dateTo
              ? `Up to ${dateTo}`
              : `${dateFrom} ${dateTo ? "- " + dateTo : ""}`}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown / Modal Card */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90vw] max-w-[340px] sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:mt-2 sm:z-50 sm:w-auto sm:max-w-none sm:min-w-[600px] p-4 bg-white border border-neutral-100 rounded-2xl shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-50">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-neutral-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-500" />
              </button>
              <div className="flex gap-8 font-bold text-neutral-700">
                <span className="w-32 text-center hidden sm:block">
                  {MONTHS[calLeft.month]} {calLeft.year}
                </span>
                <span className="w-32 text-center">
                  {MONTHS[calRight.month]} {calRight.year}
                </span>
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-neutral-100 rounded-full"
              >
                <ChevronRight className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-8">
              {/* Left Calendar */}
              <div className="flex-1 hidden sm:block">
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-neutral-400"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                  {calLeft.days}
                </div>
              </div>

              {/* Right Calendar (Hidden on mobile usually or stacked) */}
              <div className="flex-1">
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-neutral-400"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                  {calRight.days}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-50">
              <button
                onClick={() => {
                  setTempFrom("");
                  setTempTo("");
                }}
                className="text-xs text-neutral-400 hover:text-neutral-600 font-medium"
              >
                Clear Selection
              </button>
              <div className="text-xs text-neutral-400">
                {!tempFrom && tempTo && `Up to ${tempTo}`}
                {tempFrom && !tempTo && tempFrom}
                {tempFrom && tempTo && tempFrom === tempTo && tempFrom}
                {tempFrom &&
                  tempTo &&
                  tempFrom !== tempTo &&
                  `${tempFrom} - ${tempTo}`}
              </div>
              <button
                onClick={handleApply}
                className="bg-brand-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-brand-primary/20 hover:opacity-90 transition-opacity"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
