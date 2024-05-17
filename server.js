import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 8000;

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.post('/proxy', async (req, res) => {
    const { url, method, headers, body } = req.body;

    try {
		console.log(url,method, headers,body);
         // Ensure the body is only included for non-GET and non-HEAD requests
        const requestOptions = {
            method: method,
            headers: headers,
            body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined
        };

        const apiResponse = await fetch(url, requestOptions);

        // Ensure the response is correctly handled, whether it's JSON or another content type
        const contentType = apiResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await apiResponse.json();
            res.json(data);
        } else {
            const data = await apiResponse.text();
            res.send(data);
        }
    } catch (error) {
        console.error('Error forwarding request:', error);
        res.status(500).json({ error: 'Error forwarding request' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
