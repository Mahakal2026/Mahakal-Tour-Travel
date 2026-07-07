const Package = require("../models/Package");

// @desc    Get all active packages (public)
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res, next) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single package (public)
// @route   GET /api/packages/:id
// @access  Public
const getPackageById = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all packages including inactive (admin)
// @route   GET /api/packages/all
// @access  Admin
const getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.find().sort({ sortOrder: 1 });
    res.json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a package
// @route   POST /api/packages
// @access  Admin
const createPackage = async (req, res, next) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a package
// @route   PUT /api/packages/:id
// @access  Admin
const updatePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Admin
const deletePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.json({ success: true, message: "Package deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPackages, getPackageById, getAllPackages, createPackage, updatePackage, deletePackage };
