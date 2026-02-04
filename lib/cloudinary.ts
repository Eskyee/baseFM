import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export interface CloudinaryImage {
  id: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  blur_data_url?: string;
  secure_url: string;
}

export function getCloudinaryUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const transforms = [];

  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.quality) transforms.push(`q_${options.quality}`);
  transforms.push('c_fill');

  const transformString = transforms.length > 0 ? transforms.join(',') + '/' : '';
  const format = options?.format || 'auto';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}f_${format}/${publicId}`;
}

export function getBlurDataUrl(publicId: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_10,q_10,e_blur:1000/${publicId}`;
}
