const Vehicle = require("../models/Vehicle");

// @desc    Get all active vehicles (public)
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle (public)
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vehicles including inactive (admin)
// @route   GET /api/vehicles/all
// @access  Admin
const getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().sort({ sortOrder: 1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Admin
const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Admin
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Admin
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.json({ success: true, message: "Vehicle deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVehicles, getVehicleById, getAllVehicles, createVehicle, updateVehicle, deleteVehicle };
