import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import cron from "node-cron"
import crypto from "crypto"
import zlib from "zlib"
import parser from "cron-parser"
import logger from "./winston.js"
import {
    withTimeout,
    measureExecutionTime
} from "../utils/timeoutProtection.js"
import mysqldump from "mysqldump";
import { spawn } from "child_process";

/**
 * converts __dirname to ES modules
*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..")
const envPath = path.resolve(rootDir, ".env");
dotenv.config({ path: envPath });

const execPromise = promisify(exec);
const grip = promisify(zlib.gzip);
const requiredEnvVariables = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DATABASE_NAME",
    "BACKUP_ENCRYPTION_KEY"
]
const missingVars = requiredEnvVariables.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
    console.log(`Missing required environment variables: ${missingVars.join(", ")}`);
    process.exit(1);
}

/**
 * destination directories where to store automatically the database backup
 */
/**
 * detects platform/WSL and resolve a same backup directory per enviroment
 */
const isWindows = process.platform === "win32";
const isLikelyWSL = () => {
    if (process.env.WSL_DISTRO_NAME) return true;

    try {
        return fs.existsSync("/proc/version") && /microsoft/i.test(fs.readFileSync("/proc/version", "utf-8"))
    } catch (error) {
        return false;
    }
}

const getDefaultDistro = () => process.env.WSL_DEFAULT_DISTRO || process.env.WSL_DISTRO_NAME || "Ubuntu";
const getCurrentUser = () => process.env.WSL_CURRENT_USER || process.env.USER || process.env.LOGNAME || process.env.USERNAME || "user";

/**
 * 
 * @function that resolves the backup directory based on the environment
 */
const resolveBackupDir = () => {
    if (process.env.BACKUP_DIR && process.env.BACKUP_DIR.trim() !== " ") {
        return process.env.BACKUP_DIR;
    }

    const env = process.env.NODE_ENV || "development";

    if (env === "production") {
        return "/var/backups/mysql";
    }

    if (isWindows && !isLikelyWSL()) {
        const distro = getDefaultDistro();
        const user = getCurrentUser();
        return `\\\\wsl$\\${distro}\\home\\${user}\\database_backups\\mysql`;
    }

    const user = getCurrentUser();
    return `/home/${user}/database_backups/mysql`;
}

const BACKUP_DIR = resolveBackupDir();
/**
 * number of days to keep backups
 */
const KEEP_DAYS = 7;
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || "default_encryption_key"
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * ennsure encryption key is secure in production
 */
if (process.env.NODE_ENV === "production" && !process.env.BACKUP_ENCRYPTION_KEY) {
    console.log(`WARNING! using default encryption key for database backup encryption. Please set the BACKUP_ENCRYPTION_KEY environment variable for production`)
}

/**
 * ensures backup directory exists
 */
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, {
        recursive: true
    })
    console.log(`Backup directory created at ${BACKUP_DIR}`)
}

/**
 * @function to encrypt data using AES-256-GCM encryption
 */
export const encryptData = async (data, key) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    /**
     * create cipher with aes-256-gcm
     */
    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(key.padEnd(32, '\0').slice(0, 32)),
        iv,
        {
            authTagLength: AUTH_TAG_LENGTH
        }
    )

    /**
     * encrypt the data
     */
    const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
    /**
     * generate authentication tag
     */
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encryptedData]);
}

/**
 * function decrypts sql data using aes-256-gcm
 */
export const decryptData = async (encrpytedData, key) => {
    /**
     * extract iv 
     */
    const iv = encrpytedData.subarray(0, IV_LENGTH);
    /**
     * extract auth tag
     */
    const authTag = encrpytedData.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    /**
     * extract encrypted data
     */
    const extract_encrypted_data = encrpytedData.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    /**
     * create a decipher
     */
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(key.padEnd(32, "\0").slice(0, 32)),
        iv,
        {
            authTagLength: AUTH_TAG_LENGTH
        }
    )

    /**
     * set the auth tag
     */
    decipher.setAuthTag(authTag);

    /**
     * decrypt the sql data
     */
    return Buffer.concat([decipher.update(extract_encrypted_data), decipher.final()]);
}

/**
 * @function creates a backup of the database schema
 */
export const createBackup = async () => {
    const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_database_schema_${timeStamp}.sql.gz.enc`;
    const tempFileName = `temp_${Date.now()}.sql`;
    const tempFilePath = path.join(BACKUP_DIR, tempFileName);
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    const isMysqlDumpAvailable = async () => {
        try {
            await execPromise("mysqldump --version");
            return true;
        } catch (error) {
            return false;
        }
    }

    const escapeSingleQuotes = (str = "") => {
        return String(str).replace(/'/g, "'\"'\"'");
    }

    try {
        const useBinary = await isMysqlDumpAvailable();

        if (useBinary) {
            const safePassword = escapeSingleQuotes(process.env.DB_PASSWORD || "");
            /**
             * create mysql dump command
             */
            const dumpCommand = `mysqldump --no-data -h ${process.env.DB_HOST} -u ${process.env.DB_USER} --password='${safePassword}' ${process.env.DATABASE_NAME} > ${tempFilePath}`;
            await execPromise(dumpCommand);
        } else {
            try {
                mysqldump({
                    connection: {
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DATABASE_NAME,
                    },
                    dumpToFile: tempFilePath,
                    dump: {
                        data: false,
                    }
                });

                logger.log(`info`, `Database schema dumped using mysqldump npm package.`);
            } catch (error) {
                logger.log(`error`, `mysqldump binary not found. Falling back to mysqldump npm package. (${error})`);
                throw error;
            }
        }

        /**
         * reads the sql file
         */

        const sqlData = await fs.promises.readFile(tempFilePath);

        /**
         * compress the sql data
         */
        const compressed = await grip(sqlData);

        /**
         * encrypt the compressed sql data with aes-256-gcm
         */
        const encryptedData = await encryptData(compressed, ENCRYPTION_KEY);

        /**
         * saves the encrypted data to the backup file
         */
        await fs.promises.writeFile(backupPath, encryptedData);

        /**
         * clean up temporary file
         */
        await fs.promises.unlink(tempFilePath);

        console.log(`Backup database created and encrypted successfully at ${backupPath}`);

        return {
            success: true,
            message: "Backup database created and encrypted successfully",
        }
    } catch (error) {
        /**
         * clean up temp file if its exists
         */
        if (fs.existsSync(tempFilePath)) {
            await fs.promises.unlink(tempFilePath).catch(console.error)
        }

        console.log(`Error in creating a database backup: ${error}`);

        return {
            success: false,
            message: `Backup failed: ${error.message}`
        }
    }
}

/**
 * @function delete files older than the specified number of days
 */
export const cleanOldBackups = async (days = KEEP_DAYS) => {
    const now = new Date().getTime();
    const timeTreshold = now - (days * 24 * 60 * 60 * 1000);

    try {
        const files = fs.readdirSync(BACKUP_DIR);
        let deletedCount = 0;

        files.forEach((file) => {
            if (!file.endsWith(".sql.gz.enc")) return;

            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);

            if (stats.mtimeMs < timeTreshold) {
                fs.unlinkSync(filePath);
                console.log(`Latest Deleted Backup: ${file}`)
                deletedCount++;
            }
        });

        console.log(`Cleanup completed. Deleted ${deletedCount} old backup(s)`);
        return deletedCount;
    } catch (error) {
        console.log(`Error during backup cleanup: ${error}`)
        return 0;
    }
}

/**
 * @function schedules the backup job based on interval
 */
export const scheduleBackup = async (schedule = null) => {
    /**
     * default sechedules
     */
    const defaultSchedules = {
        production: "0 2 * * *", // Daily at 2AM
        development: "0 */6 * * *"
    };

    /**
     * used provided schedule or default based on enviroment
     */
    const effectiveSchedule = schedule || defaultSchedules[process.env.NODE_ENV || "development"];

    let nextRun = null;
    try {
        const it = parser.parse(effectiveSchedule);
        nextRun = it.next().toDate();
    } catch (error) {
        console.log(`Invalid! cron expression for backup schedule: - (${effectiveSchedule}) - (${error})`);
    }

    cron.schedule(effectiveSchedule, async () => {
        setImmediate(async () => {
            await measureExecutionTime(
                async () => {
                    logger.log(`info`, `[${new Date().toLocaleString()}] Running schedule database backup`);

                    try {
                        // const result = await createBackup();
                        // if (result.success) {
                        //     const deletedCount = await cleanOldBackups();
                        //     logger.log(`info`, `Backup completed successfully. Cleaned up ${deletedCount} old backups.`);
                        // } else {
                        //     logger.log(`error`, `Backup Failed: ${result.message}`);
                        // }

                        /**
                         * run the backup in a seperate  node process to avoid blocking the scheduler event loop
                         */
                        const child = spawn(process.execPath, [fileURLToPath(import.meta.url)], {
                            env: process.env,
                            stdio: ["ignore", "pipe", "pipe"]
                        })

                        let stdout = "";
                        let stderr = "";

                        child.stdout.on("data", (data) => stdout += data.toString());
                        child.stderr.on("data", (data) => stderr += data.toString());

                        const exitCode = await new Promise((resolve) => {
                            child.on("close", (code) => resolve(code))
                        });

                        if (exitCode === 0) {
                            logger.log(`info`, `Backup child process exited successfully.`);

                            const deletedCount = await cleanOldBackups();
                            logger.log(`info`, `Backup completed successfully. Cleaned up ${deletedCount} old backups.`);
                        } else {
                            logger.log(`error`, `Backup child process failed with exit code ${exitCode}: stderr=${stderr} stdout=${stdout}`);
                        }
                    } catch (error) {
                        logger.log(`info`, `Failed to run schedule database backup: ${error}`);
                    }
                },
                "Database Backup Process"
            )
        });
    }, {
        timezone: "Asia/Manila",
        name: "Database Backup Scheduler"
    })

    logger.log(`info`, `Database backup scheduled to run at: ${effectiveSchedule} - (${new Date().toLocaleString()}) - (${process.env.NODE_ENV || "development"}) - (${nextRun ? `Next Run: ${nextRun.toLocaleString("en-US", { timeZone: "Asia/Manila" })}` : ""})`);

    return effectiveSchedule;
}

/**
 * @function retrieve next backups runs
 */
export const getNextBackupRun = async (count = 5, schedule = null, timezone = "Asia/Manila") => {
    const defaultSchedules = {
        production: "0 2 * * *",
        development: "0 */6 * * *"
    }

    const cronExp = schedule || defaultSchedules[process.env.NODE_ENV || "development"];

    const runs = []

    try {
        const it = parser.parse(cronExp, { tz: timezone });
        for (let i = 0; i < count; i++) {
            runs.push(it.next().toDate());
        }
    } catch (error) {
        console.log(`Invalid! cron expression for backup schedule: - (${cronExp}) - (${error})`);
    }
    return runs;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        console.log(`Creating manual database backup`);
        const result = await createBackup();
        if (result.success) {
            const deletedCount = await cleanOldBackups();

            console.log(`Manual backup completed. Cleaned up ${deletedCount} old backups`);
        } else {
            console.log(`Manual backup database failed: ${result.message}`);
            process.exit(1);
        }
    })();
}