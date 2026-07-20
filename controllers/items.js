const fs = require('fs');
const path = require('path');
const itemsModel = require('../models/items'); 


const createItem = async (req, res) => {
    try {
        const { title, description, price } = req.body;

        if (!title || !description || !price) {
            return res.status(400).json({ message: 'title, description and price are required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Item image is required' });
        }

      
        const imagePath = `/uploads/items/${req.file.filename}`;

        const newItem = await itemsModel.create({
            title,
            description,
            price,
            image: imagePath
        });

        return res.status(201).json({
            message: 'Item created successfully',
            item: newItem
        });
    } catch (error) {
        console.error('Create item error:', error);
        return res.status(500).json({ message: 'Something went wrong while creating the item' });
    }
};


const getItems = async (req, res) => {
    try {
        const items = await itemsModel.find().sort({ _id: -1 });

        return res.status(200).json({
            message: 'Items fetched successfully',
            count: items.length,
            items
        });
    } catch (error) {
        console.error('Get items error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching items' });
    }
};


const getFeaturedItems = async (req, res) => {
    try {
        const items = await itemsModel.find().sort({ _id: -1 }).limit(8);

        return res.status(200).json({
            message: 'Items fetched successfully',
            count: items.length,
            items
        });
    } catch (error) {
        console.error('Get items error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching items' });
    }
};


const getItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await itemsModel.findById(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        return res.status(200).json({
            message: 'Item fetched successfully',
            item
        });
    } catch (error) {
        console.error('Get item error:', error);
      
        return res.status(500).json({ message: 'Something went wrong while fetching the item' });
    }
};


const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price } = req.body;

        const item = await itemsModel.findById(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (title) item.title = title;
        if (description) item.description = description;
        if (price) item.price = price;

      
        if (req.file) {
           
            const oldImagePath = path.join(__dirname, '..', item.image);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error('Failed to delete old image:', err.message);
            });

            item.image = `/uploads/items/${req.file.filename}`;
        }

        const updatedItem = await item.save();

        return res.status(200).json({
            message: 'Item updated successfully',
            item: updatedItem
        });
    } catch (error) {
        console.error('Update item error:', error);
        return res.status(500).json({ message: 'Something went wrong while updating the item' });
    }
};


const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
 
        const item = await itemsModel.findById(id);
 
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
 
        
        if (item.image) {
            const imagePath = path.join(__dirname, '..', item.image);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Failed to delete image file:', err.message);
            });
        }
 
        await itemsModel.findByIdAndDelete(id);
 
        return res.status(200).json({
            message: 'Item deleted successfully',
            item
        });
    } catch (error) {
        console.error('Delete item error:', error);
        return res.status(500).json({ message: 'Something went wrong while deleting the item' });
    }
};


module.exports = { createItem, getItems, getItem, getFeaturedItems,updateItem, deleteItem };