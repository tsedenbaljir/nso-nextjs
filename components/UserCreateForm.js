"use client";
import {
  Box,
  Button,
  FormLabel,
  Input,
  Stack,
  TextField,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { createUserService } from "@/services/UserService";
import { notification } from 'antd';

const CreateUserForm = ({ userData }) => {
  const [api, contextHolder] = notification.useNotification();

  const validationSchema = Yup.object({
    firstname: Yup.string().min(2).max(30).required("Нэр оруулна уу."),
    organisation_name: Yup.string()
      .min(5)
      .max(30)
      .required("Байгууллагын нэр оруулна уу."),
    specification: Yup.string()
      .min(10)
      .max(100)
      .required("Зориулалтаа тодорхой оруулна уу."),
    lastname: Yup.string().min(2).max(30).required("Овог оруулна уу."),
    position: Yup.string().required("Албан тушаал оруулна уу."),
    email: Yup.string().email().required("И-мэйл хаяг оруулна уу."),
    mobile: Yup.string().min(6).max(8).required("Утасны дугаар оруулна уу."),
    user_level: Yup.string().required("Хэрэглэгчийн түвшин сонгоно уу."),
  });

  const initValues = {
    id: userData?.id || "0",
    organisation_name: userData?.organisation_name || "",
    user_level: userData?.user_level || 0,
    firstname: userData?.firstname || "",
    lastname: userData?.lastname || "",
    position: userData?.position || "",
    email: userData?.email || "",
    mobile: userData?.mobile || "",
    specification: userData?.specification || "",
  };

  return (
    <>
      <Stack spacing={3} sx={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
        <Formik
          initialValues={initValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm }) => {
            const data = {
              id: values?.id || "0",
              user_level: values?.user_level,
              organisation_name: values?.organisation_name,
              firstname: values?.lastname,
              lastname: values?.firstname,
              position: values?.position,
              email: values?.email,
              mobile: values?.mobile,
              specification: values?.specification,
            };

            const response = await createUserService(data);
            console.log(response);
            if (response.status) {
              api.success({
                message: 'Амжилттай',
                description: response.message,
                placement: 'bottomRight',
                duration: 4.5,
              });
              resetForm();
            } else {
              api.error({
                message: 'Алдаа гарлаа',
                description: response.message,
                placement: 'bottomRight',
                duration: 4.5,
              });
            }
          }}
          enableReinitialize={true}
        >
          {({ handleSubmit, values, setFieldValue, errors }) => {
            return (
              <Form method="post" onSubmit={handleSubmit}>
                {contextHolder}
                <Input type="hidden" value={values?.id} />
                <Stack spacing={3}>
                  <Box>
                    <FormLabel sx={{ color: "primary.main", fontWeight: 600, mb: 1, display: 'block' }}>Овог</FormLabel>
                    <TextField
                      fullWidth
                      placeholder="Овог"
                      type="text"
                      name="lastname"
                      value={values?.lastname}
                      onChange={(e) => {
                        setFieldValue("lastname", e.target.value);
                      }}
                      error={!!errors?.lastname}
                      helperText={errors?.lastname}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <FormLabel sx={{ color: "primary.main", fontWeight: 600, mb: 1, display: 'block' }}>Нэр</FormLabel>
                    <TextField
                      fullWidth
                      placeholder="Нэр"
                      type="text"
                      name="firstname"
                      value={values?.firstname}
                      onChange={(e) => {
                        setFieldValue("firstname", e.target.value);
                      }}
                      error={!!errors?.firstname}
                      helperText={errors?.firstname}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <FormLabel sx={{ color: "primary.main", fontWeight: 600, mb: 1, display: 'block' }}>
                      Байгууллагын нэр
                    </FormLabel>
                    <TextField
                      fullWidth
                      placeholder="Байгууллагын нэр"
                      type="text"
                      name="organisation_name"
                      value={values?.organisation_name}
                      onChange={(e) => {
                        setFieldValue("organisation_name", e.target.value);
                      }}
                      error={!!errors?.organisation_name}
                      helperText={errors?.organisation_name}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <FormLabel sx={{ color: "primary.main", fontWeight: 600, mb: 1, display: 'block' }}>
                      Албан тушаал
                    </FormLabel>
                    <TextField
                      fullWidth
                      placeholder="Албан тушаал"
                      type="text"
                      name="position"
                      value={values?.position}
                      onChange={(e) => {
                        setFieldValue("position", e.target.value);
                      }}
                      error={!!errors?.position}
                      helperText={errors?.position}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <FormLabel sx={{ color: "primary.main", fontWeight: 600, mb: 1, display: 'block' }}>
                      И-мэйл хаяг
                    </FormLabel>
                    <TextField
                      fullWidth
                      placeholder="И-мэйл хаяг"
                      type="email"
                      name="email"
                      value={values?.email}
                      onChange={(e) => {
                        setFieldValue("email", e.target.value);
                      }}
                      error={!!errors?.email}
                      helperText={errors?.email}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <FormLabel sx={{ color: "primary.main", fontWeight: 600, mb: 1, display: 'block' }}>
                      Утасны дугаар
                    </FormLabel>
                    <TextField
                      fullWidth
                      placeholder="Утасны дугаар"
                      type="text"
                      name="mobile"
                      value={values?.mobile}
                      onChange={(e) => {
                        setFieldValue("mobile", e.target.value);
                      }}
                      error={!!errors?.mobile}
                      helperText={errors?.mobile}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <FormLabel sx={{ color: "primary.main", fontWeight: 600, mb: 1, display: 'block' }}>
                      API ашиглаж буй зориулалт
                    </FormLabel>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="API ашиглаж буй зориулалт"
                      name="specification"
                      value={values?.specification}
                      onChange={(e) => {
                        setFieldValue("specification", e.target.value);
                      }}
                      error={!!errors?.specification}
                      helperText={errors?.specification}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                    >
                      Хадгалах
                    </Button>
                  </Box>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Stack>
    </>
  );
};

export default CreateUserForm;
