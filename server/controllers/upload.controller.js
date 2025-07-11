// server/controllers/upload.controller.js

const uploadController = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const uploadedFile = req.files[0]; // ✅ grab first file

    return res.status(200).json({
      success: true,
      url: uploadedFile.path, // ✅ frontend expects this key
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
    });
  }
};

export default uploadController;
