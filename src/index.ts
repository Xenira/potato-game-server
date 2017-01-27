import * as winston from 'winston';

// Set up logging
winston.configure({
    transports: [
        new winston.transports.File({ filename: 'server.log' }),
        new winston.transports.Console()
    ]
})

export { Server } from './server/server';

