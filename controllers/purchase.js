const nodemailer = require('nodemailer');
const purchaseModel = require('../models/purchase');
const cartModel = require('../models/carts');
const path = require('path');
const fs = require('fs');
const usersModel=require('../models/users')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL, 
        pass: process.env.SMTP_PASSWORD,
    },
});

const placeOrder = async (req, res) => {
    try {
        const logoPath = path.join(__dirname, '..', 'logo.png');

        const userId = req.user.id || req.user._id;
        const { formData, paymentMethod, agreements, cartItems, total } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const itemIds = cartItems.map((item) => item.id || item._id);

     
        const newPurchase = new purchaseModel({
            items: itemIds,
            user: userId,
            totalPrice: total,
            shippingCost: total - cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
            paymentMethod,
            shippingAddress: formData,
            agreements,
        });
        await newPurchase.save();

       
        await cartModel.findOneAndUpdate({ users: userId }, { items: [] });

        

            const itemsListHtml = cartItems
            .map(
                (item) => `
                <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#1f2937; font-size:14px;">
                        ${item.name} <span style="color:#6b7280;">× ${item.quantity}</span>
                    </td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#1f2937; font-size:14px; text-align:right; font-weight:600;">
                        $${(item.price * item.quantity).toFixed(2)}
                    </td>
                </tr>`
            )
            .join('');

            const emailHtml = `
            <div style="margin:0; padding:0; background-color:#050807; font-family:'Segoe UI', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050807; padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:16px; overflow:hidden;">
            
                      <!-- Header -->
                      <tr>
                        <td align="center" style="padding:32px 32px 20px 32px; border-bottom:1px solid rgba(255,255,255,0.08);">
                          <img src="cid:companyLogo" alt="Futura" style="height:84px; width:auto; display:block; margin:0 auto 16px auto;" />
                          <div style="color:#ffffff; font-size:20px; font-weight:600; letter-spacing:0.3px;">
                            Futura Research
                          </div>
                          <div style="color:#14b8a6; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; margin-top:4px;">
                            New Order Received
                          </div>
                        </td>
                      </tr>
            
                      <!-- Body -->
                      <tr>
                        <td style="padding:28px 32px;">
            
                          <!-- Customer Info -->
                          <div style="color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px;">Customer Information</div>
                          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                            <tr>
                              <td style="padding:6px 0; color:#9ca3af; font-size:13px; width:120px; vertical-align:top;">Name</td>
                              <td style="padding:6px 0; color:#e5e7eb; font-size:13px; font-weight:500;">${formData.firstName} ${formData.lastName}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0; color:#9ca3af; font-size:13px; vertical-align:top;">Email</td>
                              <td style="padding:6px 0; color:#14b8a6; font-size:13px; font-weight:500;">${formData.email}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0; color:#9ca3af; font-size:13px; vertical-align:top;">Phone</td>
                              <td style="padding:6px 0; color:#e5e7eb; font-size:13px; font-weight:500;">${formData.phone}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0; color:#9ca3af; font-size:13px; vertical-align:top;">Address</td>
                              <td style="padding:6px 0; color:#e5e7eb; font-size:13px; font-weight:500; line-height:1.5;">
                                ${formData.address} ${formData.apartment || ''}<br/>
                                  ${formData.apartment ? `${formData.apartment}<br/>` : ''}
                                ${formData.city}, ${formData.postcode}<br/>
                                ${formData.country}, ${formData.state}
                              </td>
                            </tr>
                          </table>
            
                          <!-- Order Items -->
                          <div style="color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px;">Order Items</div>
                          <table style="width:100%; border-collapse:collapse; margin-bottom:20px; background-color:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">
                            ${itemsListHtml}
                          </table>
            
                          <!-- Total -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(20,184,166,0.08); border:1px solid rgba(20,184,166,0.3); border-radius:10px; margin-bottom:20px;">
                            <tr>
                              <td style="padding:14px 16px; color:#e5e7eb; font-size:15px; font-weight:600;">Total</td>
                              <td style="padding:14px 16px; color:#2dd4bf; font-size:18px; font-weight:700; text-align:right;">$${total.toFixed(2)}</td>
                            </tr>
                          </table>
            
                          <!-- Payment -->
                          <div style="color:#9ca3af; font-size:13px; margin:0 0 20px;">
                            <span style="color:#e5e7eb; font-weight:600;">Payment Method:</span> ${paymentMethod}
                          </div>
            
                          <!-- Agreements -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.08); padding-top:16px;">
                            <tr>
                              <td style="padding-top:16px;">
                                <div style="color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px;">Agreements</div>
                                <div style="color:#9ca3af; font-size:13px; margin:4px 0;">
                                  Terms Accepted:
                                  <span style="color:${agreements.terms ? '#2dd4bf' : '#f87171'}; font-weight:600;">
                                    ${agreements.terms ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div style="color:#9ca3af; font-size:13px; margin:4px 0;">
                                  Research Only Acknowledged:
                                  <span style="color:${agreements.researchOnly ? '#2dd4bf' : '#f87171'}; font-weight:600;">
                                    ${agreements.researchOnly ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </table>
            
                        </td>
                      </tr>
            
                      <!-- Footer -->
                      <tr>
                        <td align="center" style="padding:20px 32px; border-top:1px solid rgba(255,255,255,0.08);">
                          <div style="color:#6b7280; font-size:12px;">
                        Futura Research &middot; In-vitro research use only
                          </div>
                        </td>
                      </tr>
            
                    </table>
                  </td>
                </tr>
              </table>
            </div>
            `;
       
        await transporter.sendMail({
            from: `"Futura Orders" <${process.env.SMTP_EMAIL}>`,
            to: 'shahg33285@gmail.com',
            subject: `New Order from ${formData.firstName} ${formData.lastName}`,
            html: emailHtml,
            attachments: [
                {
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'companyLogo',
                },
            ],
        });

        return res.status(201).json({
            message: 'Order placed successfully',
            purchase: newPurchase,
        });
    } catch (error) {
        console.error('Place order error:', error);
        return res.status(500).json({ message: 'Something went wrong placing the order' });
    }
};



const getAllPurchases = async (req, res) => {
    try {
        const purchases = await purchaseModel
            .find()
            .populate('items') 
            .populate('user', 'username email') 
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Purchases fetched successfully',
            purchases,
        });
    } catch (error) {
        console.error('Get all purchases error:', error);
        return res.status(500).json({ message: 'Something went wrong fetching purchases' });
    }
};



const getAllCustomers = async (req, res) => {
    try {
        const customers = await usersModel.aggregate([
            {
                $lookup: {
                    from: 'purchases',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'orders',
                },
            },
            {
                $project: {
                    password: 0, 
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        return res.status(200).json({
            message: 'Customers fetched successfully',
            customers,
        });
    } catch (error) {
        console.error('Get all customers error:', error);
        return res.status(500).json({ message: 'Something went wrong fetching customers' });
    }
};
module.exports = { placeOrder, getAllPurchases, getAllCustomers};