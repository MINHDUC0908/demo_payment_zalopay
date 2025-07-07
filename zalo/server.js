// Import các thư viện cần thiết
const axios       = require('axios').default;  // npm install axios
const CryptoJS    = require('crypto-js');      // npm install crypto-js
const express     = require('express');        // npm install express
const bodyParser  = require('body-parser');    // npm install body-parser
const moment      = require('moment');         // npm install moment
const qs         = require('qs');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());
// Cấu hình ứng dụng với ZaloPay
const config = {
    app_id   : '2553',
    key1     : 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2     : 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint : 'https://sb-openapi.zalopay.vn/v2/create',
};

// Route tạo đơn hàng & thanh toán
app.get('/payment', async (req, res) => {
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
        app_id       : config.app_id,
        app_trans_id : `${moment().format('YYMMDD')}_${transID}`,
        app_user     : 'user123',
        app_time     : Date.now(),
        amount       : 50000,
        item         : JSON.stringify([]),
        embed_data   : JSON.stringify({ redirecturl: 'https://phongthuytaman.com' }),
        callback_url : 'https://b074-1-53-37-194.ngrok-free.app/callback',
        description  : `Lazada - Payment for order #${transID}`,
        bank_code    : '',
    };

    const data = [
        config.app_id, 
        order.app_trans_id, 
        order.app_user, 
        order.amount, 
        order.app_time, 
        order.embed_data, 
        order.item
    ].join('|');

    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post(config.endpoint, null, { params: order });
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('Error creating payment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route callback từ ZaloPay khi thanh toán thành công
app.post('/callback', (req, res) => {
    const { data: dataStr, mac: reqMac } = req.body;
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    if (reqMac !== mac) {
        return res.json({
            return_code    : -1,
            return_message : 'mac not equal',
        });
    }

    const dataJson = JSON.parse(dataStr);

    console.log(
        "Update order's status = success where app_trans_id =",
        dataJson.app_trans_id
    );

    return res.json({
        return_code    : 1,
        return_message : 'success',
    });
});
// nodemon zalo/server.js
// Route kiểm tra trạng thái đơn hàng
app.post('/check-status-order', async (req, res) => {
    const { app_trans_id } = req.body;

    const postData = {
        app_id       : config.app_id,
        app_trans_id : app_trans_id,
    };

    const data = [postData.app_id, postData.app_trans_id, config.key1].join('|');
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post(
            'https://sb-openapi.zalopay.vn/v2/query', 
            qs.stringify(postData), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return res.status(200).json(result.data);
    } catch (error) {
        console.error('Error checking order status:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Khởi động server
app.listen(8888, () => {
    console.log('Server is running on port 8888');
});
