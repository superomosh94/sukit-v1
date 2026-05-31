/* projectManager.js */
const fs = require('fs');
const path = require('path');

/**
 * Save the current project configuration to a JSON file.
 * @param {Object} project - Project data containing pages, components, and assets.
 * @param {string} outputPath - Destination file path.
 */
function saveProject(project, outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(project, null, 2), 'utf8');
    console.log(`Project saved to ${outputPath}`);
}

/**
 * Load a project configuration from a JSON file.
 * @param {string} inputPath - Path to the project JSON file.
 * @returns {Object|null} Parsed project object or null if error.
 */
function loadProject(inputPath) {
    if (!fs.existsSync(inputPath)) {
        console.error(`File not found: ${inputPath}`);
        return null;
    }
    try {
        const data = fs.readFileSync(inputPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Failed to parse project file:', err);
        return null;
    }
}

module.exports = { saveProject, loadProject };
