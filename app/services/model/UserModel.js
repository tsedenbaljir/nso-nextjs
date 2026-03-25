"use server";

import { db } from '@/app/api/config/db_csweb.config';

const getUserInfoModel = async (token_text) => {
  try {
    const data = await db.raw(`
      SELECT id, lastname, firstname, email
      FROM md_users
      WHERE token_text = ?
    `, [token_text]);

    if (data) {
      const accessData = await db.raw(`
        INSERT INTO log_api_access (user_token)
        VALUES (?)
      `, [token_text]);
    }

    return data;
  } catch (error) {
    console.error("Error in getUserInfoModel:", error);
    throw new Error("Failed to fetch getUserInfoModel");
  }
};

export { getUserInfoModel };
