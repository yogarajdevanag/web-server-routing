// 1. Import necessary modules
const http = require('http'); // To create the server
const fs = require('fs');     // To interact with the File System

// 2. Create the HTTP server
const server = http.createServer((req, res) => {
    // Get the URL and HTTP method from the request
    const url = req.url;
    const method = req.method;

    // Route for the homepage
    if (url === '/') {
        // --- If the request is a GET, show the form ---
        if (method === 'GET') {
            res.setHeader('Content-Type', 'text/html');
            res.write('<html>');
            res.write('<head><title>Enter Message</title></head>');
            res.write('<body>');
            res.write(`
                <form action="/" method="POST">
                    <input type="text" name="message" autocomplete="off">
                    <button type="submit">Send</button>
                </form>
            `);
            res.write('</body>');
            res.write('</html>');
            return res.end(); // Finish and send the response
        }

        // --- If the request is a POST, handle the form data ---
        if (method === 'POST') {
            const body = []; // An array to store the chunks of data

            // Listen for the 'data' event. This fires for every chunk received.
            req.on('data', (chunk) => {
                console.log('Receiving chunk:', chunk);
                body.push(chunk); // Add the buffer chunk to our array
            });

            // Listen for the 'end' event. This fires when all data has been received.
            return req.on('end', () => {
                // Concatenate all buffer chunks into a single buffer, then convert to a string.
                const parsedBody = Buffer.concat(body).toString(); // Result: "message=your-text"
                
                // Extract the actual message from the key-value pair.
                const message = parsedBody.split('=')[1];

                // Write the message to a file named 'message.txt'.
                // This is an asynchronous operation.
                fs.writeFile('message.txt', message, (err) => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500; // Internal Server Error
                        res.end('Error writing to file.');
                        return;
                    }

                    // --- The core of the redirect task ---
                    // Set the status code to 302 (Found/Redirect)
                    res.statusCode = 302;
                    // Set the 'Location' header to tell the browser where to go
                    res.setHeader('Location', '/');
                    // End the response to execute the redirect
                    return res.end();
                });
            });
        }
    } else {
        // For any other URL, send a 404 Not Found response
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 404;
        res.end('<h1>404 Page Not Found</h1>');
    }
});

// 3. Start the server and listen on port 3000
const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});