/**
 * Upload an image to Cloudinary
 * @param {string} dataUrl - Base64 data URL of the image
 * @param {string} fileName - Name for the uploaded file
 * @returns {Promise<string>} URL of the uploaded image
 */
export async function uploadImageToCloudinary(dataUrl, fileName) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || cloudName === 'your_cloud_name_here') {
        throw new Error('Cloudinary cloud name not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to your .env file.');
    }

    if (!uploadPreset || uploadPreset === 'your_upload_preset_here') {
        throw new Error('Cloudinary upload preset not configured. Please add VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.');
    }

    try {
        const formData = new FormData();
        formData.append('file', dataUrl);
        formData.append('upload_preset', uploadPreset);
        formData.append('public_id', `business-cards/${fileName}`);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        return data.secure_url; // Return the HTTPS URL
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

/**
 * Upload multiple images to Cloudinary
 * @param {Array<{dataUrl: string, fileName: string}>} images - Array of images to upload
 * @returns {Promise<string[]>} Array of uploaded image URLs
 */
export async function uploadImagesToCloudinary(images) {
    const uploadPromises = images.map(({ dataUrl, fileName }) =>
        uploadImageToCloudinary(dataUrl, fileName)
    );
    return Promise.all(uploadPromises);
}
