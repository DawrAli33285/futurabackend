const purchaseModel = require('../models/purchase');

const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

       
        const salesByMonth = await purchaseModel.aggregate([
            { $match: { createdAt: { $gte: sevenMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    sales: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        
        const ordersByDay = await purchaseModel.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        const topSellingItems = await purchaseModel.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'items',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'itemDetails'
                }
            },
            { $unwind: '$itemDetails' },
            {
                $project: {
                    _id: 0,
                    itemId: '$_id',
                    title: '$itemDetails.title',
                    count: 1
                }
            }
        ]);

     
        const totalsAgg = await purchaseModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalPrice' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const totals = totalsAgg[0] || { totalSales: 0, totalOrders: 0 };

        return res.status(200).json({
            message: 'Dashboard stats fetched successfully',
            totals,
            salesByMonth,
            ordersByDay,
            topSellingItems
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching dashboard stats' });
    }
};

module.exports = { getDashboardStats };