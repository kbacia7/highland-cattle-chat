import type { Bucket } from "@google-cloud/storage";

export default async (bucket: Bucket) => {
  const protectedFiles = [
    process.env.USER_PROFILE_PICTURE_PLACEHOLDER_URL,
    process.env.MRS_GUIDE_PROFILE_PICTURE_PLACEHOLDER_URL,
  ];

  const [files] = await bucket.getFiles();
  const filesToDelete = files.filter(
    (file) => !protectedFiles.includes(file.publicUrl()),
  );

  const promises = filesToDelete.map((file) => file.delete());
  await Promise.all(promises);
};
