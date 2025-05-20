"use server";
const sendMail = async (data) => {
  try {
    const res = await fetch(`/api/send-mail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch user data");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch user data");
  }
};

export { sendMail };
