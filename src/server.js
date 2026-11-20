import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import App from "./app.js";
import env from "./config/env.js";
import logger from "./utils/logger.js";

import connectDB from "./database/index.js";
import { logPaymentMode } from "./services/payment.service.js";
import Doctor, { DEFAULT_AVAILABILITY } from "./models/Doctor.js";
const PORT = env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        logger.info('server to DB connection done')
        logPaymentMode();

        // Doctors saved without working hours can never show slots. Give them the default schedule (Mon-Sat, 10:00-17:00);
        // admins can change it from Admin > Doctors > Edit.
        const fixed = await Doctor.updateMany(
            { $or: [{ availability: { $exists: false } }, { availability: { $size: 0 } }] },
            { $set: { availability: DEFAULT_AVAILABILITY() } }
        );
        if (fixed.modifiedCount) logger.info(`Applied default working hours to ${fixed.modifiedCount} doctor(s) that had none.`);

        App.listen(PORT, () => {
            console.log(`server is running at http://localhost:${PORT}`);

        });

    } catch (error) {
        logger.error('Server failed to start')

        process.exit(1);
    }
}


startServer();