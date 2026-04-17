"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, Space, Table, message } from "antd";
import Link from "next/link";
import axios from "axios";

const { Search } = Input;

export default function MetadataAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");

  const fetchData = async (pg = page, ps = pageSize, q = searchText) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/metadata-questionnaire/admin?page=${pg - 1
        }&pageSize=${ps}&q=${encodeURIComponent(q)}`
      );
      setData(res.data?.data || []);
      if (res.data?.pagination) {
        setTotal(res.data.pagination.total || 0);
      }
    } catch (e) {
      message.error("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    setPage(1); // эхнээс нь хайна
    fetchData(1, pageSize, value);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm("Энэ бичлэгийг идэвхгүй болгох уу?");
    if (!ok) return;
    try {
      setLoading(true);
      const res = await axios.delete(`/api/metadata-questionnaire/admin/${id}`);
      if (res.data?.status) {
        message.success("Амжилттай идэвхгүй болголоо");
        // refresh current page
        fetchData(page, pageSize, searchText);
      } else {
        message.error(res.data?.message || "Амжилтгүй");
      }
    } catch (e) {
      message.error("Устгах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Нэр (MN)", dataIndex: "name" },
      { title: "Нэр (EN)", dataIndex: "name_eng" },
      // { title: "Хувилбар", dataIndex: "version" },
      {
        title: "Үүсгэсэн огноо", dataIndex: "created_date",
        render: (_, record) => (
          <span className='whitespace-nowrap'>{record?.created_date?.substring(0, 10)}</span>
        ),
      },
      {
        title: "Өөрчилсөн огноо", dataIndex: "last_modified_date", width: 200,
        render: (_, record) => (
          <span className='whitespace-nowrap'>{record?.last_modified_date?.substring(0, 10)}</span>
        ),
      },
      {
        title: "Идэвхтэй эсэх", dataIndex: "active",
        render: (_, record) => (
          <span className={`whitespace-nowrap ${record?.active.toString() === "1" ? "bg-green-500 text-white" : "bg-red-500 text-white"} px-2 py-1 rounded-md`}>{record?.active.toString() === "1" ? "Идэвхтэй" : "Идэвхгүй"}</span>
        ),
      },
      { title: "Өөрчилсөн хэрэглэгч", dataIndex: "last_modified_by" },
      {
        title: "Нээлттэй эсэх", dataIndex: "is_secret",
        render: (_, record) => (
          <span className={`whitespace-nowrap ${record?.is_secret.toString() === "1" ? "bg-gray-500 text-white" : "bg-blue-500 text-white"} px-2 py-1 rounded-md`}>{record?.is_secret.toString() === "1" ? "Нууцлалттай" : "Нууцлалгүй"}</span>
        ),
      },
      {
        title: "Үйлдэл",
        width: 200,
        render: (_, record) => (
          <Space>
            <Link href={`/admin/metadata-questionnaire/${record.id}`}>
              <Button size="small">Засах</Button>
            </Link>
            <Button danger size="small" onClick={() => handleDelete(record.id)}>Идэвхгүй болгох</Button>
          </Space>
        ),
      },
    ],
    [page, pageSize, searchText]
  );

  return (
    <div className="max-w-screen">
      <div className="mb-4 flex justify-between items-center p-5">
        <h2 className="text-lg font-medium">Мэдээ, тооллого, судалгаа - Мета өгөгдөл</h2>
        <div className="flex gap-2">
          <Search
            placeholder="Нэрээр хайх..."
            onSearch={handleSearch}
            allowClear
            style={{ width: 250 }}
          />
          {/* <Button type="primary" onClick={handleAdd}>Шинэ нэмэх</Button> */}
        </div>
      </div>
      <Table
        rowKey={(r) => r.id + "_" + (r.meta_id || "x")}
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchData(p, ps, searchText);
          },
        }}
      />
    </div>
  );
}
