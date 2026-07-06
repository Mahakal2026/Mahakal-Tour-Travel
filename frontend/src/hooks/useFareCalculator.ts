"use client";

import { useState, useCallback } from "react";
import { type TripType } from "@/lib/constants";

/**
 * Fare calculator hook — dynamic version using backend vehicles
 */
export function useFareCalculator(vehicles: any[] = []) {
  const [tripType, setTripType] = useState<TripType>("local");
  const [vehicle, setVehicle] = useState<string>(vehicles.length > 0 ? vehicles[0].name : "");
  const [distance, setDistance] = useState<number>(150);
  const [days, setDays] = useState<number>(1);

  const calculateFare = useCallback((): number => {
    const selectedVehicle = vehicles.find(v => v.name === vehicle);
    if (!selectedVehicle) return 0;

    const rateOutstation = selectedVehicle.pricePerKm || 0;
    const rateLocal = selectedVehicle.localPrice || (rateOutstation * 80); // Fallback to 80km if local price missing

    if (tripType === "local") {
      return rateLocal;
    }

    if (tripType === "one-way") {
      return distance * rateOutstation;
    }

    if (tripType === "outstation-round") {
      // Outstation policy: minimum billing of 250km per day
      const minAllowedKm = days * 250;
      const billableKm = Math.max(distance, minAllowedKm);
      return billableKm * rateOutstation;
    }

    return 0;
  }, [tripType, vehicle, distance, days, vehicles]);

  const fare = calculateFare();

  const formattedFare = `₹${fare.toLocaleString("en-IN")}`;

  const getTripDescription = useCallback((): string => {
    if (tripType === "local") return "Local Sightseeing (8h/80km)";
    if (tripType === "one-way") return `One-Way Drop (Est. ${distance} km)`;
    return `Round-Trip (Est. ${distance} km over ${days} Days)`;
  }, [tripType, distance, days]);

  const getVehicleLabel = useCallback((): string => {
    return vehicle || "";
  }, [vehicle]);

  return {
    tripType,
    setTripType,
    vehicle,
    setVehicle,
    distance,
    setDistance,
    days,
    setDays,
    fare,
    formattedFare,
    getTripDescription,
    getVehicleLabel,
  };
}
