"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Define the keywords (can be passed as command-line arguments or use defaults)
const keywords = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['user'];
const distFolder = path.join(__dirname, '..', 'dist');
// Define subfolders for the microservice architecture
const subfolders = ['controllers', 'routes', 'middlewares', 'models', 'services', 'configs', 'handlers'];
// Define folders that should be copied entirely (regardless of keyword)
const copyEntireFolders = ['models', 'configs', 'services', 'middlewares', 'utils'];
// Define root-level files that should always be copied
const rootFilesToCopy = ['app.js', 'lambda.js', 'local.js'];
// Define project root files that should always be copied
const projectRootFilesToCopy = ['package.json', 'package-lock.json', 'samconfig.toml', 'template.yml'];
// Helper function to create folders
function createFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created folder: ${folderPath}`);
    }
}
// Helper function to copy files
function copyFile(src, dest) {
    fs.copyFileSync(src, dest);
    console.log(`Copied file: ${src} -> ${dest}`);
}
// Helper function to copy directories recursively
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    entries.forEach((entry) => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        }
        else {
            copyFile(srcPath, destPath);
        }
    });
}
// Updated file/directory copy logic
function copyFileOrDirectory(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        copyDirectory(src, dest); // Copy directory contents
    }
    else {
        const destFolder = path.dirname(dest); // Ensure parent folder exists
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        copyFile(src, dest); // Copy file directly
    }
}
// Helper function to delete a folder recursively
function deleteFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const currentPath = path.join(folderPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                deleteFolder(currentPath); // Recursively delete subfolders
            }
            else {
                fs.unlinkSync(currentPath); // Delete files
            }
        });
        fs.rmdirSync(folderPath);
        console.log(`Deleted folder: ${folderPath}`);
    }
}
// Helper function to scan directory recursively and return files
function scanDirectoryRecursively(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            scanDirectoryRecursively(filePath, fileList);
        }
        else {
            fileList.push(filePath);
        }
    });
    return fileList;
}
// Helper function to modify app.js to only include routes related to the keyword
function customizeAppJs(appJsPath, keyword) {
    console.log(`Customizing app.js for keyword: ${keyword}`);
    // Read the original app.js file
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    // Find all route import lines
    const routeImportRegex = /^.*require\(['"]\.\/routes\/.*['"]\).*$/gm;
    const allRouteImports = appJsContent.match(routeImportRegex) || [];
    // Filter route imports to only keep those related to the keyword
    const relevantRouteImports = allRouteImports.filter(line => line.toLowerCase().includes(keyword.toLowerCase()));
    console.log(`Found ${allRouteImports.length} route imports, keeping ${relevantRouteImports.length} for ${keyword}`);
    // Replace all route import lines with only the relevant ones
    if (allRouteImports.length > 0 && allRouteImports[0]) {
        // Get the position of the first and last import
        const firstImportIndex = appJsContent.indexOf(allRouteImports[0]);
        const lastImport = allRouteImports[allRouteImports.length - 1];
        if (lastImport) {
            const lastImportIndex = appJsContent.indexOf(lastImport) + lastImport.length;
            // Replace the entire block of route imports with only the relevant ones
            appJsContent = appJsContent.substring(0, firstImportIndex) +
                relevantRouteImports.join('\n') +
                appJsContent.substring(lastImportIndex);
        }
    }
    // Also find and modify any app.use statements for routes
    const routeUseRegex = /^.*app\.use\(['"]\/.*['"]\s*,\s*.*Routes\s*\).*$/gm;
    const allRouteUses = appJsContent.match(routeUseRegex) || [];
    // Filter route uses to only keep those related to the keyword
    const relevantRouteUses = allRouteUses.filter(line => line.toLowerCase().includes(keyword.toLowerCase()));
    console.log(`Found ${allRouteUses.length} route uses, keeping ${relevantRouteUses.length} for ${keyword}`);
    // Replace all route use lines with only the relevant ones
    if (allRouteUses.length > 0) {
        // Create a map of all route use lines to find and replace them
        allRouteUses.forEach(routeUse => {
            // Only keep this line if it's in the relevant list
            if (!relevantRouteUses.includes(routeUse)) {
                // Comment out non-relevant routes instead of removing them completely
                appJsContent = appJsContent.replace(routeUse, `// ${routeUse} // Removed by build script`);
            }
        });
    }
    // Write the modified content back to app.js
    fs.writeFileSync(appJsPath, appJsContent);
    console.log(`Modified app.js saved with only ${keyword}-related routes`);
}
// Main function to organize files for a specific keyword
function organizeFilesForKeyword(keyword) {
    console.log(`\n=== Starting build for keyword: ${keyword} ===\n`);
    const buildFolder = path.join(__dirname, '..', 'build', keyword);
    // Delete the build folder if it exists
    if (fs.existsSync(buildFolder)) {
        deleteFolder(buildFolder);
    }
    // Create the main build folder and subfolders
    createFolder(buildFolder);
    subfolders.forEach((subfolder) => createFolder(path.join(buildFolder, subfolder)));
    // First, copy entire folders that should be included regardless of keyword
    copyEntireFolders.forEach(folder => {
        const srcFolderPath = path.join(distFolder, folder);
        if (fs.existsSync(srcFolderPath)) {
            const destFolderPath = path.join(buildFolder, folder);
            console.log(`Copying entire folder: ${folder}`);
            copyDirectory(srcFolderPath, destFolderPath);
        }
    });
    // Copy and customize app.js
    const appJsPath = path.join(distFolder, 'app.js');
    if (fs.existsSync(appJsPath)) {
        const destAppJsPath = path.join(buildFolder, 'app.js');
        console.log(`Copying and customizing app.js`);
        copyFile(appJsPath, destAppJsPath);
        customizeAppJs(destAppJsPath, keyword);
    }
    // Copy other root-level files from dist (excluding app.js which was handled separately)
    rootFilesToCopy.filter(file => file !== 'app.js').forEach(file => {
        const srcFilePath = path.join(distFolder, file);
        if (fs.existsSync(srcFilePath)) {
            const destFilePath = path.join(buildFolder, file);
            console.log(`Copying root-level file: ${file}`);
            copyFile(srcFilePath, destFilePath);
        }
    });
    // Copy project root files like package.json, samconfig.toml, etc.
    projectRootFilesToCopy.forEach((rootFile) => {
        const rootFilePath = path.join(__dirname, '..', rootFile);
        if (fs.existsSync(rootFilePath)) {
            copyFile(rootFilePath, path.join(buildFolder, rootFile));
        }
        else {
            console.log(`Warning: ${rootFile} not found in project root`);
        }
    });
    // Scan the dist folder for files recursively
    const allFiles = scanDirectoryRecursively(distFolder);
    // Log matching files for debugging
    console.log(`Scanning for files with keyword: ${keyword}`);
    console.log(`Found ${allFiles.length} files in total`);
    // Process all files for keyword-specific content
    allFiles.forEach((filePath) => {
        const fileName = path.basename(filePath);
        const relativePath = path.relative(distFolder, filePath);
        // Skip files that are in folders we've already copied entirely
        if (copyEntireFolders.some(folder => relativePath.startsWith(folder))) {
            return;
        }
        // Skip root-level files we've already copied
        if (rootFilesToCopy.includes(fileName)) {
            return;
        }
        // Check if the file name or path contains the keyword (case-insensitive)
        if (fileName.toLowerCase().includes(keyword.toLowerCase()) ||
            relativePath.toLowerCase().includes(keyword.toLowerCase())) {
            console.log(`Matched file: ${relativePath}`);
            // Determine the destination folder based on file type
            let destFolder = buildFolder;
            if (filePath.toLowerCase().includes('controller')) {
                destFolder = path.join(buildFolder, 'controllers');
            }
            else if (filePath.toLowerCase().includes('routes')) {
                destFolder = path.join(buildFolder, 'routes');
            }
            else if (filePath.toLowerCase().includes('handler')) {
                destFolder = path.join(buildFolder, 'handlers');
            }
            else {
                // If it doesn't match any specific folder but contains the keyword,
                // copy it to the root of the build folder
                destFolder = buildFolder;
            }
            // Copy the file to the destination
            copyFile(filePath, path.join(destFolder, fileName));
        }
    });
    console.log(`\n=== Build completed for keyword: ${keyword} ===\n`);
}
// Main function to process all keywords
function processAllKeywords() {
    console.log(`Starting build process for keywords: ${keywords.join(', ')}`);
    // Process each keyword
    keywords.forEach(keyword => {
        organizeFilesForKeyword(keyword);
    });
    // Build triggers functions
    buildTriggersFunction();
    console.log(`\nAll builds completed successfully!`);
}
// Function to build the triggers Lambda
function buildTriggersFunction() {
    console.log(`\n=== Building Triggers Function ===\n`);
    const triggersSrc = path.join(distFolder, 'triggers');
    const triggersDest = path.join(__dirname, '..', 'build', 'triggers');
    if (fs.existsSync(triggersSrc)) {
        // Delete existing triggers build folder
        if (fs.existsSync(triggersDest)) {
            deleteFolder(triggersDest);
        }
        // Copy entire triggers folder
        console.log('Copying triggers function...');
        copyDirectory(triggersSrc, triggersDest);
        console.log(`\n=== Triggers build completed ===\n`);
    }
    else {
        console.log('Warning: Triggers folder not found in dist/');
    }
}
// Run the script
if (keywords.length === 0) {
    console.error('Please provide at least one keyword as an argument (e.g., node scripts/custom-build.js teacher student)');
    process.exit(1);
}
processAllKeywords();
//# sourceMappingURL=custom-build.js.map