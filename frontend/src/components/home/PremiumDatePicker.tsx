"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import "react-day-picker/style.css";
import "./premium-calendar.css";

interface PremiumDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minToday?: boolean;
}

export default function PremiumDatePicker({
  value,
  onChange,
  label = "Date",
  placeholder = "Select Date",
  minToday = true,
}: PremiumDatePickerProps) {
  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState<Date | undefined>(() => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return !isNaN(parsed.getTime()) ? parsed : undefined;
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setSelected(parsed);
      } else {
        setSelected(undefined);
      }
    } else {
      setSelected(undefined);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) {
      setSelected(undefined);
      onChange("");
      return;
    }

    setSelected(date);
    onChange(format(date, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <div ref={ref}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full h-[52px]
          rounded-xl
          bg-white/5
          backdrop-blur-xl
          border
          transition-all
          duration-300
          flex
          items-center
          justify-between
          px-4
          ${
            open
              ? "border-saffron-500 ring-2 ring-saffron-500/30"
              : "border-white/10 hover:border-white/20"
          }
          `}
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400" />

            <span
              className={`text-sm ${
                selected && !isNaN(selected.getTime()) ? "text-white" : "text-slate-400"
              }`}
            >
              {selected && !isNaN(selected.getTime())
                ? format(selected, "dd MMM yyyy")
                : placeholder}
            </span>
          </div>

          <Calendar className="w-4 h-4 text-slate-400" />
        </button>

        {open && (
          <div
            className="
            absolute
            left-0
            mt-2
            z-50
            rounded-2xl
            border
            border-white/10
            bg-slate-950/95
            backdrop-blur-2xl
            p-3
            w-[265px]
            shadow-[0_20px_60px_rgba(0,0,0,.45)]
            premium-calendar"
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              disabled={minToday ? { before: new Date() } : undefined}
              showOutsideDays
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  ),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}