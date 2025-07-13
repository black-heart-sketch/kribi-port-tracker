import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ErrorResponse from './errorResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read a file asynchronously
 * @param {string} filePath - Path to the file (relative to the project root)
 * @returns {Promise<Buffer>} - File content as Buffer
 */
const readFile = async (filePath) => {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    return await fs.readFile(absolutePath);
  } catch (error) {
    throw new ErrorResponse(`Error reading file: ${error.message}`, 500);
  }
};

/**
 * Write data to a file asynchronously
 * @param {string} filePath - Path to the file (relative to the project root)
 * @param {string|Buffer} data - Data to write to the file
 * @param {Object} [options] - Options for file writing
 * @param {boolean} [options.overwrite=true] - Whether to overwrite if file exists
 * @returns {Promise<void>}
 */
const writeFile = async (filePath, data, { overwrite = true } = {}) => {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    
    // Check if file exists and overwrite is false
    if (!overwrite) {
      try {
        await fs.access(absolutePath);
        throw new ErrorResponse('File already exists', 409);
      } catch (error) {
        // File doesn't exist, continue with writing
        if (error.statusCode === 409) throw error;
      }
    }
    
    // Ensure directory exists
    const dir = path.dirname(absolutePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(absolutePath, data);
  } catch (error) {
    throw new ErrorResponse(`Error writing file: ${error.message}`, error.statusCode || 500);
  }
};

/**
 * Delete a file asynchronously
 * @param {string} filePath - Path to the file (relative to the project root)
 * @returns {Promise<boolean>} - True if file was deleted, false if it didn't exist
 */
const deleteFile = async (filePath) => {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    
    try {
      await fs.access(absolutePath);
    } catch (error) {
      // File doesn't exist
      return false;
    }
    
    await fs.unlink(absolutePath);
    return true;
  } catch (error) {
    throw new ErrorResponse(`Error deleting file: ${error.message}`, 500);
  }
};

/**
 * Get file information (size, extension, etc.)
 * @param {string} filePath - Path to the file (relative to the project root)
 * @returns {Promise<Object>} - File information
 */
const getFileInfo = async (filePath) => {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const stats = await fs.stat(absolutePath);
    
    return {
      name: path.basename(absolutePath),
      path: absolutePath,
      size: stats.size,
      extension: path.extname(absolutePath).toLowerCase().substring(1),
      created: stats.birthtime,
      modified: stats.mtime,
      isDirectory: stats.isDirectory(),
    };
  } catch (error) {
    throw new ErrorResponse(`Error getting file info: ${error.message}`, 500);
  }
};

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file (relative to the project root)
 * @returns {Promise<boolean>} - True if file exists, false otherwise
 */
const fileExists = async (filePath) => {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    await fs.access(absolutePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get all files in a directory
 * @param {string} dirPath - Path to the directory (relative to the project root)
 * @param {Object} [options] - Options
 * @param {string|string[]} [options.extensions] - File extensions to include
 * @param {boolean} [options.recursive=false] - Whether to include subdirectories
 * @returns {Promise<Array<Object>>} - Array of file information objects
 */
const getFilesInDirectory = async (dirPath, { extensions, recursive = false } = {}) => {
  try {
    const absolutePath = path.join(process.cwd(), dirPath);
    const files = [];
    
    const processEntry = async (entryPath, relativePath = '') => {
      const stats = await fs.stat(entryPath);
      
      if (stats.isDirectory() && recursive) {
        const dirEntries = await fs.readdir(entryPath);
        for (const entry of dirEntries) {
          const fullPath = path.join(entryPath, entry);
          const relPath = path.join(relativePath, entry);
          await processEntry(fullPath, relPath);
        }
      } else if (stats.isFile()) {
        const ext = path.extname(entryPath).toLowerCase().substring(1);
        
        // Skip if extensions are specified and current file's extension is not in the list
        if (extensions && extensions.length > 0) {
          const extList = Array.isArray(extensions) ? extensions : [extensions];
          if (!extList.includes(ext)) return;
        }
        
        files.push({
          name: path.basename(entryPath),
          path: relativePath || '.',
          fullPath: path.join(dirPath, relativePath),
          size: stats.size,
          extension: ext,
          created: stats.birthtime,
          modified: stats.mtime,
        });
      }
    };
    
    await processEntry(absolutePath);
    return files;
  } catch (error) {
    throw new ErrorResponse(`Error reading directory: ${error.message}`, 500);
  }
};

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Path to the directory (relative to the project root)
 * @returns {Promise<void>}
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    const absolutePath = path.join(process.cwd(), dirPath);
    await fs.mkdir(absolutePath, { recursive: true });
  } catch (error) {
    throw new ErrorResponse(`Error creating directory: ${error.message}`, 500);
  }
};

export {
  readFile,
  writeFile,
  deleteFile,
  getFileInfo,
  fileExists,
  getFilesInDirectory,
  ensureDirectoryExists,
};
