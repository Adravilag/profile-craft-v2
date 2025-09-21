#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import cloudinaryService from '../services/cloudinaryService.js';
import { logger } from '../utils/logger.js';

type ReportItem = {
  localFile: string;
  localPath: string;
  cloudinary?: {
    public_id: string;
    url: string;
    bytes?: number;
    format?: string;
  };
  success: boolean;
  error?: string;
};

async function main() {
  try {
    const args = process.argv.slice(2);
    const shouldDelete = args.includes('--delete');
    const dryRun = args.includes('--dry-run');

    const uploadsDir = path.join(process.cwd(), config.FILE_UPLOAD.UPLOAD_DIR);

    if (!fs.existsSync(uploadsDir)) {
      console.error(`Uploads directory not found: ${uploadsDir}`);
      process.exit(1);
    }

    const allFiles = fs.readdirSync(uploadsDir);
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const files = allFiles.filter(f => imageExts.includes(path.extname(f).toLowerCase()));

    if (!files.length) {
      console.log('No image files found to migrate in', uploadsDir);
      process.exit(0);
    }

    console.log(`Found ${files.length} image(s) in ${uploadsDir}`);
    if (dryRun) console.log('--dry-run provided: no uploads will be performed');
    if (shouldDelete)
      console.log('--delete provided: local files will be removed after successful upload');

    const report: ReportItem[] = [];

    for (const file of files) {
      const localPath = path.join(uploadsDir, file);
      const item: ReportItem = { localFile: file, localPath, success: false };

      try {
        const buffer = fs.readFileSync(localPath);

        if (dryRun) {
          console.log(`[dry-run] Would upload: ${file}`);
          item.success = true;
          report.push(item);
          continue;
        }

        logger.debug('Uploading file to Cloudinary:', localPath);
        const result = await cloudinaryService.uploadProjectImage(buffer, file);

        item.cloudinary = {
          public_id: result.public_id,
          url: result.secure_url,
          bytes: result.bytes,
          format: result.format,
        };
        item.success = true;
        report.push(item);

        console.log(`Uploaded ${file} → ${result.secure_url}`);

        if (shouldDelete) {
          try {
            fs.unlinkSync(localPath);
            console.log(`Deleted local file: ${file}`);
          } catch (delErr) {
            logger.warn('Could not delete local file after upload:', localPath, delErr);
          }
        }
      } catch (err: any) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Failed to upload ${file}: ${msg}`);
        item.error = msg;
        item.success = false;
        report.push(item);
      }
    }

    const reportPath = path.join(process.cwd(), 'uploads-migration-report.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), items: report }, null, 2),
      { encoding: 'utf-8' }
    );
    console.log('Migration report written to', reportPath);

    const successCount = report.filter(r => r.success).length;
    const failCount = report.length - successCount;
    console.log(`Done. Success: ${successCount}, Failed: ${failCount}`);
    if (failCount > 0) process.exit(2);
    process.exit(0);
  } catch (error: any) {
    console.error(
      'Unexpected error during migration:',
      error instanceof Error ? error.message : error
    );
    process.exit(3);
  }
}

// Run when executed directly
if (require.main === module) {
  main();
}
