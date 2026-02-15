import { createApp } from "./domain/http/app.js";
import cors from 'cors';
import 'dotenv/config';

const app = createApp();
app.use(cors());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
});