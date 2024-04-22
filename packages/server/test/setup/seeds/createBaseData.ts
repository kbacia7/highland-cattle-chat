import fs from "fs";
import path from "path";

import type { PrismaClient } from "@prisma/client";

import type { Bucket } from "@google-cloud/storage";

export default async (prisma: PrismaClient, bucket: Bucket) => {
  const mrGuideExists = await prisma.user.count({
    where: {
      displayName: "Mrs. Guide",
    },
  });

  const blankImage = fs.readFileSync(
    path.resolve(__dirname, "assets", "blank.png"),
  );

  const mrsGuideImage = fs.readFileSync(
    path.resolve(__dirname, "assets", "mrsguide.jpg"),
  );

  await bucket
    .file(path.basename(process.env.USER_PROFILE_PICTURE_PLACEHOLDER_URL || ""))
    .save(blankImage);

  await bucket
    .file(
      path.basename(
        process.env.MRS_GUIDE_PROFILE_PICTURE_PLACEHOLDER_URL || "",
      ),
    )
    .save(mrsGuideImage);

  // NOTE: Condition is false during tests due to race condition
  if (mrGuideExists && process.env.NODE_ENV !== "test") return;

  await prisma.user.create({
    data: {
      image: process.env.MRS_GUIDE_PROFILE_PICTURE_PLACEHOLDER_URL || "",
      displayName: "Mrs. Guide",
      email: "fake-incorrect-email",
      password: "fake-incorrect-password",
      online: true,
    },
  });
};
