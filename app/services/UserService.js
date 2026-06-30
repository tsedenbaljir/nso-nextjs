export { createUserService } from "@/app/services/actions";

export const getUsers = async () => {
  try {
    const url = `${process.env.BASE_URL}/api/user`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.X_API_KEY,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
