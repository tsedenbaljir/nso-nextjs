"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Checkbox,
  Tabs,
  DatePicker,
} from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

// 📌 meta_data_id mapping (адилхан)
const FIELD_META_MAP = {
  description: 24451,
  sector: 7092151,
  subSector: 7092152,
  methodology: 7092153,
  calculation: 7092154,
  startDate: 7092155,
  frequency: 9651,
  unit: 7092156,
  lastModified: 7092158,
  source: 8404,
  language: 3084801,
  expert: 7092157,
  downloadLink: 7092159,
};

export default function MetadataNew() {
  const [form] = Form.useForm();
  const router = useRouter();

  // const [catalogues, setCatalogues] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 📌 сонголтын жагсаалтуудыг серверээс ачаалах
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await axios.get("/api/metadata/admin/options"); // өөрийн options API
        // setCatalogues(res.data.catalogues || []);
        setSectors(res.data.subClassifications || []);
        setFrequencies(res.data.frequencies || []);
      } catch (e) {
        message.error("Жагсаалтууд ачаалахад алдаа гарлаа");
      }
    };
    loadOptions();
  }, []);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const metaValues = [
        {
          meta_data_id: FIELD_META_MAP.description,
          valuemn: values.descriptionmn,
          valueen: values.descriptionEn,
        },
        {
          meta_data_id: FIELD_META_MAP.sector,
          valuemn: values.sector?.join(","),
          valueen: values.sectorEn?.join(","),
        },
        {
          meta_data_id: FIELD_META_MAP.subSector,
          valuemn: values.subSector,
          valueen: values.subSectorEn,
        },
        {
          meta_data_id: FIELD_META_MAP.methodology,
          valuemn: values.methodology,
          valueen: values.methodologyEn,
        },
        {
          meta_data_id: FIELD_META_MAP.calculation,
          valuemn: values.calculation,
          valueen: values.calculationEn,
        },
        {
          meta_data_id: FIELD_META_MAP.startDate,
          valuemn: values.startDate
            ? values.startDate.format("YYYY-MM-DD")
            : null,
          valueen: values.startDateEn
            ? values.startDateEn.format("YYYY-MM-DD")
            : null,
        },
        {
          meta_data_id: FIELD_META_MAP.frequency,
          valuemn: values.frequency?.join(","),
          valueen: values.frequencyEn?.join(","),
        },
        {
          meta_data_id: FIELD_META_MAP.unit,
          valuemn: values.unit,
          valueen: values.unitEn,
        },
        {
          meta_data_id: FIELD_META_MAP.source,
          valuemn: values.source,
          valueen: values.sourceEn,
        },
        {
          meta_data_id: FIELD_META_MAP.language,
          valuemn: values.language?.join(","),
          valueen: values.languageEn?.join(","),
        },
        {
          meta_data_id: FIELD_META_MAP.expert,
          valuemn: values.expert,
          valueen: values.expertEn,
        },
        {
          meta_data_id: FIELD_META_MAP.lastModified,
          valuemn: values.lastModified
            ? values.lastModified.format("YYYY-MM-DD")
            : null,
          valueen: values.lastModifiedEn
            ? values.lastModifiedEn.format("YYYY-MM-DD")
            : null,
        },
        {
          meta_data_id: FIELD_META_MAP.downloadLink,
          valuemn: values.downloadLink,
          valueen: values.downloadLinkEn,
        },
      ];

      await axios.post("/api/metadata/admin", {
        ...values,
        metaValues,
        user: "admin",
      });

      message.success("Амжилттай бүртгэлээ");
      // router.push("/admin/metadata");
    } catch (e) {
      message.error("Алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-medium">Мета өгөгдөл шинээр нэмэх</h2>
      </div>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="type" label="Төрөл" rules={[{ required: true }]}>
          <Select placeholder="Сонгоно уу">
            <Select.Option value="indicator">Үзүүлэлт</Select.Option>
            <Select.Option value="variable">Хувьсагч</Select.Option>
            <Select.Option value="question">Асуулт</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="namemn" label="Нэр (MN)" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="nameen" label="Нэр (EN)">
          <Input />
        </Form.Item>
        <Form.Item name="version" label="Хувилбар" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="previousVersion" label="Өмнөх хувилбар">
          <Select placeholder="Хайж сонгоно уу" showSearch />
        </Form.Item>

        <Form.Item name="active" valuePropName="checked">
          <Checkbox>Идэвхтэй эсэх</Checkbox>
        </Form.Item>
        <Form.Item name="is_current" valuePropName="checked">
          <Checkbox>Сүүлийн хувилбар</Checkbox>
        </Form.Item>
        <Form.Item name="is_secure" valuePropName="checked">
          <Checkbox>Нууцлалтай эсэх</Checkbox>
        </Form.Item>

        <Tabs>
          <Tabs.TabPane tab="Монгол" key="mn">
            <Form.Item name="sector" label="Салбар">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {sectors.map((s) => (
                  <Select.Option key={s.id} value={s.namemn}>
                    {s.namemn} ({s.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="subSector" label="Дэд салбар">
              <Input />
            </Form.Item>
            <Form.Item name="descriptionmn" label="Тодорхойлолт">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item name="methodology" label="Аргачлал, арга зүй">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name="calculation" label="Тооцох аргачлал">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name="startDate" label="Тооцож эхэлсэн хугацаа">
              <DatePicker />
            </Form.Item>
            <Form.Item name="frequency" label="Давтамж">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {frequencies.map((f) => (
                  <Select.Option key={f.id} value={f.namemn}>
                    {f.namemn} ({f.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="unit" label="Хэмжих нэгж">
              <Input />
            </Form.Item>
            <Form.Item name="source" label="Эх үүсвэр">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name="language" label="Хэл">
              <Select mode="tags" placeholder="MGL, ENG гэх мэт" />
            </Form.Item>
            <Form.Item name="expert" label="Боловсруулсан мэргэжилтэн">
              <Input />
            </Form.Item>
            <Form.Item
              name="lastModified"
              label="Хамгийн сүүлд өөрчлөгдсөн огноо"
            >
              <DatePicker />
            </Form.Item>
            <Form.Item name="downloadLink" label="Үзүүлэлтийг татах холбоос">
              <Input
                addonAfter={
                  <a href="#" target="_blank">
                    Линк
                  </a>
                }
              />
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="English" key="en">
            <Form.Item name="sectorEn" label="Sector">
              <Select mode="multiple" placeholder="Select sector" allowClear>
                {sectors.map((s) => (
                  <Select.Option key={s.id} value={s.nameen || s.namemn}>
                    {s.namemn} ({s.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="subSectorEn" label="Sub sector">
              <Input />
            </Form.Item>
            <Form.Item name="descriptionEn" label="Description">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item name="methodologyEn" label="Methodology">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name="calculationEn" label="Calculation method">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name="startDateEn" label="Start date">
              <DatePicker />
            </Form.Item>
            <Form.Item name="frequencyEn" label="Frequency">
              <Select mode="multiple" placeholder="Select frequency" allowClear>
                {frequencies.map((f) => (
                  <Select.Option key={f.id} value={f.nameen || f.namemn}>
                    {f.nameen || f.namemn}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="unitEn" label="Unit">
              <Input />
            </Form.Item>
            <Form.Item name="sourceEn" label="Source">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name="languageEn" label="Language">
              <Select mode="tags" placeholder="ENG, MGL" />
            </Form.Item>
            <Form.Item name="expertEn" label="Expert">
              <Input />
            </Form.Item>
            <Form.Item name="lastModifiedEn" label="Last modified date">
              <DatePicker />
            </Form.Item>
            <Form.Item name="downloadLinkEn" label="Download link">
              <Input
                addonAfter={
                  <a href="#" target="_blank">
                    Link
                  </a>
                }
              />
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => window.history.back()}>Буцах</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Хадгалах
          </Button>
        </div>
      </Form>
    </div>
  );
}
