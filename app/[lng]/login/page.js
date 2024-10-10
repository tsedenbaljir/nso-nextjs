"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, Spin, message } from "antd";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        name: values.username,
        password: values.password,
        redirect: false,
      });
      if (result.error) {
        message.error("Хэрэглэгчийн нэр эсвэл нууц үг буруу байна.");
        setLoading(false);
      } else {
        router.refresh();
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      <main style={{
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: '100vh',
        backgroundImage: `url("https://images.unsplash.com/photo-1554034483-04fda0d3507b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80")`, backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover"
      }}>
        <Spin tip="Уншиж байна ..." spinning={loading}>
          <div style={{ padding: 50, borderRadius: 9, backgroundColor: "white", textAlign: "center" }}>
            <img src="/NSO-LOGO-ENG.png" width={150} alt="Logo" style={{ marginLeft: "calc(150px - 25%)" }} />
            <div style={{ minWidth: 200, marginTop: 30 }}>
              <Form
                name="normal_login"
                className="login-form"
                initialValues={{
                  remember: true,
                }}
                onFinish={onFinish}
              >
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: 'Нэвтрэх Нэр оруулна уу!',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="Нэвтрэх Нэр"
                    size='large'
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Нууц үг оруулна уу!',
                    },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Нууц үг"
                    size='large'
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="login-form-button" size='large' block>
                    НЭВТРЭХ
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </Spin>
      </main>
    </>
  );
}
