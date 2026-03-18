import { createApp } from "./domain/http/app.js";
import cors from 'cors';
import 'dotenv/config';
import { ensureSeedData } from "./domain/db/seedData.js";

const app = createApp();
app.use(cors());

if (process.env.NODE_ENV !== "test") {
    ensureSeedData();
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
});