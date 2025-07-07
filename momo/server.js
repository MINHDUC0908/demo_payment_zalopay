// demo payment momo by "collection link"
const { urlencoded } = require('body-parser');
const express        = require('express');
const axios          = require('axios');
const crypto         = require('crypto');
const config         = require('./config');

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(express.static('./public'));

// ===========================
// 🔹 Tạo yêu cầu thanh toán
// ===========================
app.post('/payment', async (req, res) => {
    const {
        accessKey,
        secretKey,
        orderInfo,
        partnerCode,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData,
        orderGroupId,
        autoCapture,
        lang,
    } = config;

    const amount    = '10000';
    const orderId   = partnerCode + new Date().getTime();
    const requestId = orderId;

    const rawSignature =
        'accessKey='   + accessKey +
        '&amount='     + amount +
        '&extraData='  + extraData +
        '&ipnUrl='     + ipnUrl +
        '&orderId='    + orderId +
        '&orderInfo='  + orderInfo +
        '&partnerCode='+ partnerCode +
        '&redirectUrl='+ redirectUrl +
        '&requestId='  + requestId +
        '&requestType='+ requestType;

    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = JSON.stringify({
        partnerCode,
        partnerName  : 'Test',
        storeId      : 'MomoTestStore',
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        autoCapture,
        extraData,
        orderGroupId,
        signature,
    });

    const options = {
        method  : 'POST',
        url     : 'https://test-payment.momo.vn/v2/gateway/api/create',
        headers : {
            'Content-Type'  : 'application/json',
            'Content-Length': Buffer.byteLength(requestBody),
        },
        data: requestBody,
    };

    try {
        const result = await axios(options);
        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
});

// ===========================
// 🔹 Callback từ MoMo
// ===========================
app.post('/callback', async (req, res) => {
    console.log('callback:');
    console.log(req.body);

    // Có thể xử lý trạng thái đơn hàng tại đây...

    return res.status(204).json(req.body);
});

// ===========================
// 🔹 Kiểm tra trạng thái giao dịch
// ===========================
app.post('/check-status-transaction', async (req, res) => {
    const { orderId } = req.body;

    const secretKey  = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const accessKey  = 'F8BBA842ECF85';
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: 'MOMO',
        requestId  : orderId,
        orderId    : orderId,
        signature,
        lang       : 'vi',
    });

    const options = {
        method  : 'POST',
        url     : 'https://test-payment.momo.vn/v2/gateway/api/query',
        headers : {
            'Content-Type': 'application/json',
        },
        data: requestBody,
    };

    try {
        const result = await axios(options);
        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// ===========================
// 🔹 Khởi động server
// ===========================
app.listen(5000, () => {
    console.log('Server is running at port 5000');
});
