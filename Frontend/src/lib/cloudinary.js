// Đổi file này thành module upload ảnh lên Cloudinary
// Sử dụng unsigned upload API của Cloudinary
// https://cloudinary.com/documentation/upload_images#unsigned_upload

export async function uploadImageToCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/dauf2hy7w/upload";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "gowafood"); 

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Upload ảnh thất bại");
  const data = await response.json();
  return data.secure_url;
}
