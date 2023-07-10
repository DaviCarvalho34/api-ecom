const cloudinary = require("cloudinary");

const dotenv = require("dotenv").config();

cloudinary.config({ 
  cloud_name: 'de1pki9tf', 
  api_key: '783473689246663', 
  api_secret: 'h-EGIpHVEKUqkNmxdu4vrkc689A' 
});

const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUploads, (result) => {
      console.log(result);
      resolve(
        {
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,        
        },
        {
          resource_type: "auto",
        }
      );
    });
  });
};

const cloudinaryDeleteImg = async (fileToDelete) => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(fileToDelete, (result) => {
      resolve(
        {
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        },
        {
          resource_type: "auto",
        }
      );
    });
  });
};

module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg }