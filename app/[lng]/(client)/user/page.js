import CreateUserForm from "@/components/UserCreateForm";

import { Box, Stack, Typography } from "@mui/material";
import React from "react";

const UserPage = () => {
  return (
    <Stack>
      <Box sx={{ p: 2, container: "main", margin: "auto" }}>
        <Typography variant="h5">
          Хэрэглэгч үүсгэх, API ашиглах хүсэлт илгээх
        </Typography>
        <CreateUserForm />
      </Box>
    </Stack>
  );
};

export default UserPage;
