"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Car } from "lucide-react";
import { Vehicle } from "@/types";

interface CabSelectProps {
  vehicles: Vehicle[];
  value: string; // vehicle name
  onChange: (vehicleName: string) => void;
}

export default function CabSelect({ vehicles = [], value, onChange }: CabSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedVehicle = vehicles.find((v) => v.name === value) || vehicles[0];

  useEffect(() => {
    if (!selectedVehicle && vehicles.length > 0) {
      onChange(vehicles[0].name);
    }
  }, [vehicles, selectedVehicle, onChange]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const activeIdx = vehicles.findIndex((v) => v.name === value);
      setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleSelect = (idx: number) => {
    if (vehicles[idx]) {
      onChange(vehicles[idx].name);
      handleClose();
      // focus back on trigger button
      const button = containerRef.current?.querySelector("button");
      button?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (vehicles.length === 0) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) {
          handleToggle();
        } else {
          if (focusedIndex >= 0) {
            handleSelect(focusedIndex);
          }
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          handleToggle();
        } else {
          setFocusedIndex((prev) => (prev + 1) % vehicles.length);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          handleToggle();
        } else {
          setFocusedIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
        }
        break;
      case "Escape":
      case "Tab":
        if (isOpen) {
          e.preventDefault();
          handleClose();
          const button = containerRef.current?.querySelector("button");
          button?.focus();
        }
        break;
      default:
        break;
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Scroll active item into view inside dropdown
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const listbox = document.getElementById(listboxId);
      const activeOption = listbox?.children[focusedIndex] as HTMLElement;
      if (activeOption) {
        activeOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex, isOpen, listboxId]);

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm text-slate-800 font-bold transition-all text-left"
      >
        <span className="flex items-center gap-2">
          <Car className="w-4 h-4 text-saffron-600" />
          {selectedVehicle ? selectedVehicle.name : "Select Cab"}
        </span>
        <span className="flex items-center gap-2">
          {selectedVehicle && (
            <span className="text-xs text-saffron-600 bg-saffron-50 px-2.5 py-0.5 rounded-full border border-saffron-100">
              Min ₹{selectedVehicle.pricePerKm}/km
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Select a vehicle"
          className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto focus:outline-none py-1.5"
        >
          {vehicles.map((v, idx) => {
            const isSelected = v.name === value;
            const isFocused = idx === focusedIndex;
            return (
              <li
                key={v._id || v.name}
                id={`${listboxId}-option-${idx}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer select-none transition-colors ${
                  isSelected
                    ? "bg-saffron-50 text-saffron-900 font-bold"
                    : isFocused
                    ? "bg-slate-50 text-slate-900"
                    : "text-slate-700"
                }`}
              >
                <span className="font-bold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-saffron-600" : "bg-transparent"}`} />
                  {v.name}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Min ₹{v.pricePerKm}/km
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
