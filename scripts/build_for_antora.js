const yaml = require('js-yaml')
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const { exec, execSync } = require("child_process");


var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')

var myEnv = dotenv.config({ path: ".env.codespace" }) // use env.local for local builds - fix for your own setup
dotenvExpand.expand(myEnv)

const topic_map = process.env.TOPIC_MAP_DIR + '/' + process.env.TOPIC_MAP_FILE;

const docsDir = process.env.BASE_DIR + '/docs';

let currLevel = 0;
let topLevel = 'modules'
let currNavDoc = "";
let currImagesDir = "";
let topLevelNavYAML = process.env.BASE_DIR + "/top-level-nav.yml";

// Function to find and copy images from an AsciiDoc file
function findAndCopyImages(sourceFile, sourceDirectory, destinationDirectory) {
  // Read the AsciiDoc file
  const content = fs.readFileSync(sourceFile, 'utf-8');
  const imageRegex = /image(?::{1,2}|::)([^[\]\n]+)\[[^\]]*?\](?!\S)/gm;

  // Extract image names and copy them
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const imageName = match[1];
    const sourceImagePath = path.join(sourceDirectory, imageName);
    const destinationImagePath = path.join(destinationDirectory, imageName);

    // Check if the image file exists in the source directory
    if (fs.existsSync(sourceImagePath)) {
      // Copy the image file to the destination directory
      fs.copyFileSync(sourceImagePath, destinationImagePath);
      //console.log(`Copied ${imageName} to ${destinationImagePath}`);
    } else {
      console.log(`Image ${imageName} not found in the source directory.`);
    }
  }
}

// Function to delete the existing file if present
const deleteExistingFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error deleting the existing file:', err);
    }
  }
};

// Function to create a file and its parent directories recursively
const createDirectoriesIfNeeded = (filePath) => {
  // Extract the directory path from the file path
  const directoryPath = path.dirname(filePath);

  // Recursively create the parent directories
  fs.mkdir(directoryPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directories:', err);
    } 
  });
};

try {
  deleteExistingFile(topLevelNavYAML);
  createDirectoriesIfNeeded(topLevelNavYAML);
  fs.appendFileSync(topLevelNavYAML, "nav:\n")

  let fileContents = fs.readFileSync(topic_map, 'utf8');
  let data = yaml.loadAll(fileContents);

  console.log("nav:");

  for (var topic of data) {
    processTopic(topic, topLevel);
  }

} catch (e) {
  console.log(e);
}

function processTopic(topic, dir) {

  if (topic.Dir && topic.Dir.includes("rest_api"))
    return;

  if (topic.Distros && !topic.Distros.includes(process.env.DISTRO))
    return;

  currLevel++;

  if (topic.Dir) {
    let filespec = dir + "/" + topic.Dir
    let fullFilespec = docsDir + '/' + filespec

    if (currLevel == 1) {
      try {
        fs.mkdirSync(fullFilespec, { recursive: true });
        fs.mkdirSync(fullFilespec + "/pages", { recursive: true });
        currImagesDir = fullFilespec + "/images";
        fs.mkdirSync(currImagesDir, { recursive: true });
      } catch (err) {
        console.error('Error creating the directory:', err);
      }

      let navEntry = "  - " + filespec + "/nav.adoc"
      fs.appendFileSync(topLevelNavYAML, navEntry + "\n")
      console.log(navEntry)

      currNavDoc = fullFilespec + "/nav.adoc";
      deleteExistingFile(currNavDoc)
      fs.appendFileSync(currNavDoc, "." + topic.Name + "\n")
    }
    else {
      fs.appendFileSync(currNavDoc, '*'.repeat(currLevel - 1) + " " + topic.Name + "\n")
    }

    for (var subtopic of topic.Topics) {
      processTopic(subtopic, dir + '/' + topic.Dir)
    }
  }
  else {
    if (!topic.Distros || topic.Distros.includes(process.env.DISTRO)) {
      let filespec = dir + "/" + topic.File + ".adoc";

      const parts = filespec.split('/');
      let navspec = parts.slice(2).join('/')

      try {
        fs.appendFileSync(currNavDoc, '*'.repeat(currLevel - 1) + " xref:" + navspec + "[" + topic.Name + "]\n");
      } catch (err) {
        console.error('Error writing lines to the file:', err);
      }

      const moreparts = filespec.split('/');
      parts.splice(2, 0, "pages");
      const resultString = parts.join('/');

      let fullFilespec = docsDir + "/" + resultString;

      processAdoc(dir, filespec, fullFilespec);

      // copy images from source to module/images dir
      // Specify the source AsciiDoc file, source directory, and destination directory
      const sourceFile = fullFilespec;
      const sourceDirectory = process.env.INPUT_DIR + '/images';
      const destinationDirectory = currImagesDir;
      // Call the function to find and copy images
      findAndCopyImages(sourceFile, sourceDirectory, destinationDirectory);

    }
  }

  currLevel--;
}

function processAdoc(dir, file, fullFilespec) {
  var adocFile = process.env.INPUT_DIR + file.slice(file.indexOf("modules") + 7)

  var cmd = "asciidoctor-reducer -r asciidoctor/reducer/include_mapper"
  cmd += " -a " + process.env.DISTRO
  cmd += " -a product-title=" + process.env.PRODUCT_TITLE
  cmd += " -a product-version=" + process.env.PRODUCT_VERSION
  cmd += " -o " + fullFilespec + " " + adocFile;

  execSync(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });


  const fileContent = fs.readFileSync(fullFilespec, 'utf-8');

  // Define the patterns to replace
  const patternsToReplace = [
    /xref:(\.\.\/)+/g, // Matches "xref:../../../", "xref:../../", "xref:../"
  ];

  // Replace each pattern with "xref:"
  let modifiedContent = fileContent;
  patternsToReplace.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern, 'xref:');
  });

  modifiedContent = modifiedContent.replace(/xref:(.+?)\/(.+?)(?=\s|$)/g, 'xref:$1:$2');

  // Replace lines like "toc::[]" with "//toc::[]"
  modifiedContent = modifiedContent.replace(/^toc::\[\]/gm, '//toc::[]');

  // Write the modified content back to the file
  fs.writeFileSync(fullFilespec, modifiedContent);

}
