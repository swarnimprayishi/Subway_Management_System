const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csv = require('csv-parser');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ FILE PATHS
const ordersFilePath = path.join(__dirname, "orders.csv");
const usersFilePath = path.join(__dirname, "users.csv");

// ===============================
// ✅ USER AUTHENTICATION API
// ===============================

app.post('/api/users', (req, res) => {
    const { name, rollNumber, role, password } = req.body;
    const userLine = `${name},${rollNumber},${role},${password}\n`;

    fs.appendFile(usersFilePath, userLine, (err) => {
        if (err) return res.status(500).json({ message: "Failed to save user" });
        res.status(200).json({ message: "Signup successful" });
    });
});

app.get('/api/users/:roll', (req, res) => {
    const roll = req.params.roll;
    const users = [];

    if (!fs.existsSync(usersFilePath)) return res.status(404).json({ message: "No users registered yet" });

    fs.createReadStream(usersFilePath)
        .pipe(csv(['name', 'rollNumber', 'role', 'password']))
        .on('data', (data) => {
            if (data.password) data.password = data.password.trim();
            users.push(data);
        })
        .on('end', () => {
            const user = users.find(u => u.rollNumber === roll);
            if (user) res.json(user);
            else res.status(404).json({ message: "User not found" });
        });
});

// ===============================
// ✅ ORDER API
// ===============================

// 1. POST: Create Order
app.post("/api/orders", (req, res) => {
    let { type="general", name="Guest", item="Unknown", quantity=1, price=0, total, notes="", rollNumber="N/A" } = req.body;
    if (!total) total = Number(price) * Number(quantity);

    // ✅ Added "new" as the default status at the end of the CSV line
    const order = `${Date.now()},${type},${name},${item},${quantity},${price},${total},${notes},${rollNumber},new\n`;

    fs.appendFile(ordersFilePath, order, (err) => {
        if (err) return res.status(500).json({ message: "Error saving order" });
        res.json({ message: "Order saved successfully" });
    });
});

// 2. GET: Fetch Orders
app.get("/api/orders", (req, res) => {
    fs.readFile(ordersFilePath, "utf8", (err, data) => {
        if (err || !data) return res.json([]);

        const rows = data.trim().split("\n");
        const orders = rows.map(row => {
            const [id, type, name, item, quantity, price, total, notes, rollNumber, status] = row.split(",");
            return { id, type, name, item, quantity, price, total, notes, rollNumber, status: status || "new" };
        });
        res.json(orders.reverse());
    });
});

// 3. PATCH: UPDATE STATUS (This is what you were missing!)
app.patch("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    fs.readFile(ordersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ message: "Error reading file" });

        const rows = data.trim().split("\n");
        
        // Find the specific row and update only the status part
        const updatedRows = rows.map(row => {
            const cols = row.split(",");
            if (cols[0] === id) {
                // The status is at index 9 (the 10th column)
                cols[9] = status; 
                return cols.join(",");
            }
            return row;
        });

        fs.writeFile(ordersFilePath, updatedRows.join("\n") + "\n", (err) => {
            if (err) return res.status(500).json({ message: "Error updating order" });
            res.json({ message: "Status updated successfully" });
        });
    });
});

// 4. DELETE: Cancel/Delete Order
app.delete("/api/orders/:id", (req, res) => {
    const id = req.params.id;
    fs.readFile(ordersFilePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ message: "Error reading file" });

        const rows = data.trim().split("\n");
        const updatedRows = rows.filter(row => !row.startsWith(id));

        fs.writeFile(ordersFilePath, updatedRows.join("\n") + "\n", (err) => {
            if (err) return res.status(500).json({ message: "Error deleting order" });
            res.json({ message: "Order removed" });
        });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
