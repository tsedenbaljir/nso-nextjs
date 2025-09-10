"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

const { TextArea } = Input;

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

export default function MetadataEdit() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [catalogues, setCatalogues] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [frequencies, setFrequencies] = useState([]);

  const [rows, setRows] = useState([]);

  const labelToMetaId = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => {
      if (r?.namemn) m.set(r.namemn.trim(), Number(r.meta_data_id));
    });
    return m;
  }, [rows]);

  const DATE_LABELS_MN = new Set(["Маягт батлагдсан огноо", "Сүүлд өөрчлөгдсөн огноо"]);
  const MULTI_LABELS_MN = new Set(["Мэдээлэл цуглуулах давтамж", "Ажиглалтын хугацаа", "Хэл"]);

  const normalizeInit = (label, v) => {
    if (v == null) return undefined;
    if (DATE_LABELS_MN.has(label)) return dayjs(v);
    if (MULTI_LABELS_MN.has(label)) return (v || "").split(",").map((s) => s.trim()).filter(Boolean);
    return v;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data: outer } = await axios.get(`/api/metadata-questionnaire/admin/${id}`);
        const payload = outer?.data; 
        console.log("payload", payload);
        
        if (!payload || typeof payload !== "object") throw new Error("Invalid payload");

        const numericRows = Object.values(payload).filter(
          (it) => it && typeof it === "object" && "meta_data_id" in it && "namemn" in it
        );
        setRows(numericRows);

        setCatalogues(payload.catalogues || []);
        setSectors(payload.subClassifications || []);
        setFrequencies(payload.frequencies || []);

        const data_catalogue_mn = numericRows[0]?.data_catalogue_mn ?? "";
        const data_catalogue_en = numericRows[0]?.data_catalogue_en ?? "";
        const labelMn = numericRows[0]?.label ?? "";
        const labelEn = numericRows[0]?.label_en ?? "";
        const active = numericRows[0]?.active ?? "";
        const isSecure = numericRows[0]?.is_secret ?? "";

        const dynamicMn = {};
        const dynamicEn = {};
        for (const r of numericRows) {
          const metaId = Number(r.meta_data_id);
          dynamicMn[metaId] = normalizeInit(r.namemn?.trim(), r.valuemn ?? "");
          dynamicEn[metaId] = normalizeInit(r.namemn?.trim(), r.valueen ?? "");
        }

        form.setFieldsValue({
          namemn: labelMn,
          nameen: labelEn,
          dynamicMn,
          dynamicEn,
          active: active,
          isSecure: isSecure,
          data_catalogue_mn: data_catalogue_mn,
          data_catalogue_en: data_catalogue_en,
        });
      } catch (e) {
        console.error(e);
        message.error("Ачаалах үед алдаа гарлаа");
      }
    };
    if (id) load();
  }, [id]);

  const mid = (mnLabel) => labelToMetaId.get(mnLabel);

  const encodeVal = (v) => {
    if (v == null) return null;
    if (dayjs.isDayjs(v)) return v.format("YYYY-MM-DD");
    if (Array.isArray(v)) return v.join(",");
    return v;
  };

  const onFinish = async (values) => {
    try {
      // 1) Static meta (optional – keep if you still need to post these)
      const staticMeta = [
        { meta_data_id: FIELD_META_MAP.description, valuemn: values.descriptionmn, valueen: values.descriptionEn },
        { meta_data_id: FIELD_META_MAP.sector, valuemn: values.sector?.join(","), valueen: values.sectorEn?.join(",") },
        { meta_data_id: FIELD_META_MAP.subSector, valuemn: values.subSector, valueen: values.subSectorEn },
        { meta_data_id: FIELD_META_MAP.methodology, valuemn: values.methodology, valueen: values.methodologyEn },
        { meta_data_id: FIELD_META_MAP.calculation, valuemn: values.calculation, valueen: values.calculationEn },
        { meta_data_id: FIELD_META_MAP.startDate, valuemn: values.startDate ? values.startDate.format("YYYY-MM-DD") : null, valueen: values.startDateEn ? values.startDateEn.format("YYYY-MM-DD") : null },
        { meta_data_id: FIELD_META_MAP.frequency, valuemn: values.frequency?.join(","), valueen: values.frequencyEn?.join(",") },
        { meta_data_id: FIELD_META_MAP.unit, valuemn: values.unit, valueen: values.unitEn },
        { meta_data_id: FIELD_META_MAP.source, valuemn: values.source, valueen: values.sourceEn },
        { meta_data_id: FIELD_META_MAP.language, valuemn: values.language?.join(","), valueen: values.languageEn?.join(",") },
        { meta_data_id: FIELD_META_MAP.expert, valuemn: values.expert, valueen: values.expertEn },
        { meta_data_id: FIELD_META_MAP.lastModified, valuemn: values.lastModified ? values.lastModified.format("YYYY-MM-DD") : null, valueen: values.lastModifiedEn ? values.lastModifiedEn.format("YYYY-MM-DD") : null },
        { meta_data_id: FIELD_META_MAP.downloadLink, valuemn: values.downloadLink, valueen: values.downloadLinkEn },
      ].filter((x) => x.meta_data_id);

      // 2) Dynamic meta from tabs – ALL rows bound by meta_data_id
      const dynMn = values.dynamicMn || {};
      const dynEn = values.dynamicEn || {};
      const dynamicMeta = Object.keys(dynMn).map((k) => ({
        meta_data_id: Number(k),
        valuemn: encodeVal(dynMn[k]),
        valueen: encodeVal(dynEn[k]),
      }));

      // 3) Merge – dynamic overrides static when same meta_data_id
      const merged = new Map();
      for (const m of staticMeta) merged.set(Number(m.meta_data_id), m);
      for (const m of dynamicMeta) merged.set(Number(m.meta_data_id), m);
      const metaValues = Array.from(merged.values());

      await axios.put(`/api/metadata-questionnaire/admin/${id}`, {
        id,
        ...values,
        metaValues,
        user: "admin",
      });

      message.success("Амжилттай хадгаллаа");
      router.push("/admin/metadata-questionnaire");
    } catch (e) {
      console.error(e);
      message.error("Алдаа гарлаа");
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-medium">Мета өгөгдөл засах</h2>
      </div>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="data_catalogue_mn" label="Дата каталог">
          <Select mode="multiple" placeholder="Сонгоно уу" allowClear optionFilterProp="children">
            {catalogues.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.data_catalogue_mn} ({cat.data_catalogue_en})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="namemn" label="Нэр (MN)" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="nameen" label="Нэр (EN)">
          <Input />
        </Form.Item>

        <Form.Item name="type" label="Төрөл">
          <Select placeholder="Сонгоно уу">
            <Select.Option value="indicator">Мэдээ</Select.Option>
            <Select.Option value="variable">Судалгаа</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="dataCatalogues" label="Төрийн байгууллага">
          <Select mode="multiple" placeholder="Сонгоно уу" allowClear optionFilterProp="children">
            {catalogues.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.namemn} ({cat.nameen})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="dataCatalogues" label="Ажиглалтын хугацаа">
          <Select mode="multiple" placeholder="Сонгоно уу" allowClear optionFilterProp="children">
            {catalogues.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.namemn} ({cat.nameen})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="active" valuePropName="checked">
          <Checkbox>Идэвхтэй эсэх</Checkbox>
        </Form.Item>
        <Form.Item name="isSecure" valuePropName="checked">
          <Checkbox>Нууцлалтай эсэх</Checkbox>
        </Form.Item>

        <Tabs>
          <Tabs.TabPane tab="Монгол" key="mn">
            <Form.Item name={["dynamicMn", mid("Маягт")]} label="Маягт">
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Шифр")]} label="Шифр">
              <Input />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Хариуцах газар/хэлтэс")]} label="Хариуцах газар/хэлтэс">
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Статистик мэдээг хамтран гаргадаг байгууллага")]} label="Статистик мэдээг хамтран гаргадаг байгууллага">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Мэдээ төрөл")]} label="Мэдээ төрөл">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {frequencies.map((f) => (
                  <Select.Option key={f.id} value={f.namemn}>
                    {f.namemn} ({f.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Маягт батлагдсан огноо")]} label="Маягт батлагдсан огноо">
              <DatePicker />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Тушаалын дугаар")]} label="Тушаалын дугаар">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Агуулга")]} label="Агуулга">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Анхан шатны мэдээлэгч")]} label="Анхан шатны мэдээлэгч">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Ажиглалтын хугацаа")]} label="Ажиглалтын хугацаа">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {frequencies.map((f) => (
                  <Select.Option key={f.id} value={f.namemn}>
                    {f.namemn} ({f.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Статистик ажиглалтын төрөл")]} label="Статистик ажиглалтын төрөл">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Статистик ажиглалтын төрөл")]} label="Статистик ажиглалтын төрөл">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {frequencies.map((f) => (
                  <Select.Option key={f.id} value={f.namemn}>
                    {f.namemn} ({f.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Мэдээлэл цуглуулах давтамж")]} label="Мэдээлэл цуглуулах давтамж">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {frequencies.map((f) => (
                  <Select.Option key={f.id} value={f.namemn}>
                    {f.namemn} ({f.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Мэдээлэл цуглуулах хэлбэр")]} label="Мэдээлэл цуглуулах хэлбэр">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Мэдээлэл цуглуулах ажилтан")]} label="Мэдээлэл цуглуулах ажилтан">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Мэдээлэл дамжуулах урсгал")]} label="Мэдээлэл дамжуулах урсгал">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Мэдээлэл дамжуулах хугацаа")]} label="Мэдээлэл дамжуулах хугацаа">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Үр дүнг тархаах түвшин буюу үзүүлэлтийн задаргаа")]} label="Үр дүнг тархаах түвшин буюу үзүүлэлтйн задаргаа">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {sectors.map((s) => (
                  <Select.Option key={s.id} value={s.namemn}>
                    {s.namemn} ({s.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Ашиглагдсан ангилал, кодууд")]} label="Ашиглагдсан ангилал, кодууд">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {sectors.map((s) => (
                  <Select.Option key={s.id} value={s.namemn}>
                    {s.namemn} ({s.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Мэдээлэл тархаах хугацаа")]} label="Мэдээлэл тархаах хугацаа">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Тооцон гаргадаг үзүүлэлтүүд")]} label="Тооцон гаргадаг үзүүлэлтүүд">
              <Select mode="multiple" placeholder="Сонгоно уу" allowClear>
                {sectors.map((s) => (
                  <Select.Option key={s.id} value={s.namemn}>
                    {s.namemn} ({s.nameen})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Санхүүжүүлэгч байгууллага")]} label="Санхүүжүүлэгч байгууллага">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Нэмэлт мэдээлэл")]} label="Нэмэлт мэдээлэл">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Түлхүүр үг")]} label="Түлхүүр үг">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid(" Хэл")] } label="Хэл">
              <Select mode="tags" placeholder="MGL, ENG гэх мэт" />
            </Form.Item>

            <Form.Item name={["dynamicMn", mid("Боловсруулсан мэргэжилтэн")]} label="Боловсруулсан мэргэжилтэн">
              <Input />
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="English" key="en">
            <Form.Item name={["dynamicEn", mid("Маягт")]} label="Form">
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Шифр")]} label="Cipher">
              <Input />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Хариуцах газар/хэлтэс")]} label="Place of responsibility">
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Статистик мэдээг хамтран гаргадаг байгууллага")]} label="Partner organization">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Мэдээ төрөл")]} label="Type">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Маягт батлагдсан огноо")]} label="Form confirmed date">
              <DatePicker />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Тушаалын дугаар")]} label="Order No.">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Агуулга")]} label="About">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Анхан шатны мэдээлэгч")]} label="Informant">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Ажиглалтын хугацаа")]} label="Observation period">
              <Select mode="multiple" placeholder="Select" allowClear>
                {frequencies.map((f) => (
                  <Select.Option key={f.id} value={f.nameen || f.namemn}>
                    {f.nameen || f.namemn}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Статистик ажиглалтын төрөл")]} label="Sampling procedure">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Мэдээлэл цуглуулах давтамж")]} label="Frequency">
              <Select mode="multiple" placeholder="Select" allowClear>
                {frequencies.map((f) => (
                  <Select.Option key={f.id} value={f.nameen || f.namemn}>
                    {f.nameen || f.namemn}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Мэдээлэл цуглуулах хэлбэр")]} label="Collection mode">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Мэдээлэл цуглуулах ажилтан")]} label="Enumerator">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Мэдээлэл цуглуулах урсгал")]} label="Data flow">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Мэдээлэл дамжуулах хугацаа")]} label="Transmission time">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Үр дүнг тархаах түвшин буюу үзүүлэлтийн задаргаа")]} label="Disaggregation">
              <Select mode="multiple" placeholder="Select" allowClear>
                {sectors.map((s) => (
                  <Select.Option key={s.id} value={s.nameen || s.namemn}>
                    {s.nameen || s.namemn}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Ашиглагдсан ангилал, кодууд")]} label="Classifications & codes">
              <Select mode="multiple" placeholder="Select" allowClear>
                {sectors.map((s) => (
                  <Select.Option key={s.id} value={s.nameen || s.namemn}>
                    {s.nameen || s.namemn}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Мэдээлэл тархаах хугацаа")]} label="Publication time">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Тооцон гаргадаг үзүүлэлтүүд")]} label="Derived indicators">
              <Select mode="multiple" placeholder="Select" allowClear>
                {sectors.map((s) => (
                  <Select.Option key={s.id} value={s.nameen || s.namemn}>
                    {s.nameen || s.namemn}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Санхүүжүүлэгч байгууллага")]} label="Funding organization">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Нэмэлт мэдээлэл")]} label="Additional information">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Түлхүүр үг")]} label="Keywords">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid(" Хэл")] } label="Language">
              <Select mode="tags" placeholder="ENG, MGL" />
            </Form.Item>

            <Form.Item name={["dynamicEn", mid("Боловсруулсан мэргэжилтэн")]} label="Expert">
              <Input />
            </Form.Item>

            <Form.Item name="lastModifiedEn" label="Last modified date">
              <DatePicker />
            </Form.Item>
            <Form.Item name="downloadLinkEn" label="Download link">
              <Input addonAfter={<a href="#" target="_blank">Link</a>} />
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => window.history.back()}>Буцах</Button>
          <Button type="primary" htmlType="submit">Хадгалах</Button>
        </div>
      </Form>
    </div>
  );
}
