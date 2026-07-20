const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pagesModel = require('../models/pages');
const mongoose = require('mongoose');


const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'pages');
const DATA_URL_REGEX = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

const EXT_BY_MIME = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
};

const BLOCK_TYPES = ['heading', 'text', 'image', 'spacer', 'columns'];
const ALIGN_VALUES = ['left', 'center', 'right'];
const WIDTH_VALUES = ['contained', 'wide', 'full'];
const LEVEL_VALUES = ['h1', 'h2', 'h3'];

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const persistIfDataUrl = (value) => {
    if (typeof value !== 'string') return value;
    const match = value.match(DATA_URL_REGEX);
    if (!match) return value;

    const mimeType = match[1];
    const base64Data = match[2];
    const ext = EXT_BY_MIME[mimeType];
    if (!ext) {
        throw new Error(`Unsupported image type: ${mimeType}`);
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/pages/${filename}`;
};

const normalizeSettings = (settings = {}) => ({
    width: WIDTH_VALUES.includes(settings.width) ? settings.width : 'contained',
    align: ALIGN_VALUES.includes(settings.align) ? settings.align : 'left',
    contentAlign: ALIGN_VALUES.includes(settings.contentAlign) ? settings.contentAlign : 'left',
    background: typeof settings.background === 'string' ? settings.background : 'transparent',
    textColor: typeof settings.textColor === 'string' ? settings.textColor : '',
    paddingY: Number.isFinite(settings.paddingY) ? settings.paddingY : 16,
    paddingX: Number.isFinite(settings.paddingX) ? settings.paddingX : 16,
});

const normalizeColumn = (col) => {
    if (!col || typeof col !== 'object' || !col.id) {
        throw new Error('Each column requires an id');
    }
    const type = col.type === 'image' ? 'image' : 'text';

    if (type === 'image') {
        return {
            id: col.id,
            type,
            value: persistIfDataUrl(col.value || ''),
            alt: col.alt || '',
            imageWidth: Number.isFinite(col.imageWidth) ? col.imageWidth : 100,
            imageHeight: Number.isFinite(col.imageHeight) ? col.imageHeight : null,
        };
    }

    if (!col.value) {
        throw new Error('Text columns require a value');
    }
    return {
        id: col.id,
        type,
        value: col.value,
        alt: '',
        imageWidth: 100,
        imageHeight: null,
    };
};

const normalizeBlock = (block) => {
    if (!block || typeof block !== 'object' || !block.id) {
        throw new Error('Each block requires an id');
    }
    if (!BLOCK_TYPES.includes(block.type)) {
        throw new Error(`Invalid block type: ${block.type}`);
    }

    const base = {
        id: block.id,
        type: block.type,
        order: Number.isFinite(block.order) ? block.order : 0,
        settings: normalizeSettings(block.settings),
    };

    switch (block.type) {
        case 'heading':
            if (!block.value) throw new Error('Heading blocks require a value');
            return {
                ...base,
                value: block.value,
                level: LEVEL_VALUES.includes(block.level) ? block.level : 'h2',
            };

        case 'text':
            if (!block.value) throw new Error('Text blocks require a value');
            return { ...base, value: block.value };

        case 'image':
            return {
                ...base,
                value: persistIfDataUrl(block.value || ''),
                alt: block.alt || '',
                imageWidth: Number.isFinite(block.imageWidth) ? block.imageWidth : 100,
                imageHeight: Number.isFinite(block.imageHeight) ? block.imageHeight : null,
            };

        case 'spacer':
            return {
                ...base,
                height: Number.isFinite(block.height) ? block.height : 48,
            };

        case 'columns':
            if (!Array.isArray(block.columns) || block.columns.length === 0) {
                throw new Error('Columns blocks require at least one column');
            }
            return {
                ...base,
                columns: block.columns.map(normalizeColumn),
            };

        default:
            throw new Error(`Invalid block type: ${block.type}`);
    }
};

const parseBlocks = (blocksRaw) => {
    let blocks = blocksRaw;
    if (typeof blocksRaw === 'string') {
        try {
            blocks = JSON.parse(blocksRaw);
        } catch (err) {
            throw new Error('blocks must be valid JSON');
        }
    }
    if (!Array.isArray(blocks)) {
        throw new Error('blocks must be an array');
    }
    return blocks.map(normalizeBlock);
};

const collectImagePaths = (content = []) => {
    const paths = [];
    content.forEach((block) => {
        if (block.type === 'image' && block.value && block.value.startsWith('/uploads/pages/')) {
            paths.push(block.value);
        }
        if (block.type === 'columns' && Array.isArray(block.columns)) {
            block.columns.forEach((col) => {
                if (col.type === 'image' && col.value && col.value.startsWith('/uploads/pages/')) {
                    paths.push(col.value);
                }
            });
        }
    });
    return paths;
};

const deleteImageFiles = (relativePaths) => {
    relativePaths.forEach((relativePath) => {
        const filePath = path.join(__dirname, '..', relativePath);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete page image:', err.message);
        });
    });
};


const createPage = async (req, res) => {
    try {
        const { title, slug, status, background, blocks } = req.body;

        if (!title || !slug || !blocks) {
            return res.status(400).json({ message: 'title, slug and blocks are required' });
        }

        const existingPage = await pagesModel.findOne({ slug: slug.toLowerCase() });
        if (existingPage) {
            return res.status(409).json({ message: 'A page with this slug already exists' });
        }

        const content = parseBlocks(blocks);

        const newPage = await pagesModel.create({
            title,
            slug,
            status: status === 'Published' ? 'Published' : 'Draft',
            background: background || '#ffffff',
            content,
        });

        return res.status(201).json({
            message: 'Page created successfully',
            page: newPage,
        });
    } catch (error) {
        console.error('Create page error:', error);
        return res.status(400).json({ message: error.message || 'Something went wrong while creating the page' });
    }
};


const updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, status, background, blocks } = req.body;

        const page = await pagesModel.findById(id);
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (title) page.title = title;
        if (status === 'Draft' || status === 'Published') page.status = status;
        if (typeof background === 'string' && background) page.background = background;

        if (slug && slug.toLowerCase() !== page.slug) {
            const existingPage = await pagesModel.findOne({ slug: slug.toLowerCase() });
            if (existingPage) {
                return res.status(409).json({ message: 'A page with this slug already exists' });
            }
            page.slug = slug;
        }

        if (blocks) {
            const oldImagePaths = collectImagePaths(page.content);
            const newContent = parseBlocks(blocks);
            const newImagePaths = new Set(collectImagePaths(newContent));

        
            const orphanedPaths = oldImagePaths.filter((p) => !newImagePaths.has(p));
            deleteImageFiles(orphanedPaths);

            page.content = newContent;
        }

        const updatedPage = await page.save();

        return res.status(200).json({
            message: 'Page updated successfully',
            page: updatedPage,
        });
    } catch (error) {
        console.error('Update page error:', error);
        return res.status(400).json({ message: error.message || 'Something went wrong while updating the page' });
    }
};


const getPages = async (req, res) => {
    try {
        const pages = await pagesModel
            .find()
            .select('title slug status background createdAt updatedAt')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Pages fetched successfully',
            count: pages.length,
            pages,
        });
    } catch (error) {
        console.error('Get pages error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching pages' });
    }
};


const getPage = async (req, res) => {
    try {
        const { slug } = req.params;

        const page = mongoose.Types.ObjectId.isValid(slug)
            ? await pagesModel.findById(slug)
            : await pagesModel.findOne({ slug: slug.toLowerCase() });

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        return res.status(200).json({
            message: 'Page fetched successfully',
            page,
        });
    } catch (error) {
        console.error('Get page error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching the page' });
    }
};


const deletePage = async (req, res) => {
    try {
        const { id } = req.params;

        const page = await pagesModel.findById(id);

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        deleteImageFiles(collectImagePaths(page.content));

        await pagesModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Page deleted successfully',
        });
    } catch (error) {
        console.error('Delete page error:', error);
        return res.status(500).json({ message: 'Something went wrong while deleting the page' });
    }
};

module.exports = { createPage, updatePage, getPages, getPage, deletePage };