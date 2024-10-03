import multer from 'multer'

/**
 * Multer middleware for handling file uploads.
 * @description Configures Multer to store uploaded files temporarily in the 'temp/' directory.
 */
const upload = multer({ dest: 'temp/' })

export default upload
