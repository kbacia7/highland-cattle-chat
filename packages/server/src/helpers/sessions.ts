import { randomBytes } from "crypto";

import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

import type { Firestore } from "@google-cloud/firestore";

type JWTTokenContent = {
  userId: string;
};

export const SESSION_AGE_IN_MS = 15 * 1000 * 60;
export const createSession = (userId: string, firestore: Firestore) => {
  const expiresAt = new Date().valueOf() + SESSION_AGE_IN_MS;
  const secret = uuidv4({
    random: randomBytes(16),
  });

  firestore.collection("sessions").add({
    user: firestore.doc(`users/${userId}`),
    expiresAt,
    secret,
  });

  const content: JWTTokenContent = { userId };
  return jwt.sign(content, secret, {
    expiresIn: SESSION_AGE_IN_MS,
  });
};

export const verifySession = async (
  token: string,
  userId: string,
  firestore: Firestore,
) => {
  const sessions = await firestore
    .collection("sessions")
    .where("user", "==", firestore.collection("users").doc(userId))
    .where("expiresAt", ">", new Date().valueOf())
    .get();

  if (sessions.empty) return null;

  for (let i = 0; i < sessions.docs.length; i += 1) {
    const { secret } = sessions.docs[i].data();
    try {
      jwt.verify(token, secret);
      return userId;
    } catch (e) {
      // eslint-disable-next-line no-continue
      continue;
    }
  }

  return null;
};
