import categoryModel from '../models/categoryModel.js';
import slugify from 'slugify';

// Create category
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category exists
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category already exists' });
    }
    
    // Create new category
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in creating category',
      error,
    });
  }
};

// Update category
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    
    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Update category
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in updating category',
      error,
    });
  }
};

// Get all categories
export const getCategoriesController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting categories',
      error,
    });
  }
};

// Get single category
export const getSingleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting category',
      error,
    });
  }
};

// Delete category
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await categoryModel.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in deleting category',
      error,
    });
  }
}; 