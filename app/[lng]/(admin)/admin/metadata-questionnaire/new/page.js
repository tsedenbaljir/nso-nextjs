"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button, Form, Input, message, Select, Checkbox, Tabs, DatePicker } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const { TextArea } = Input;

// === Meta IDs ===
const META_ID = {
  SHIFR: 3003,
  KEYWORDS: 9653,
  EXTRA_INFO: 35301,
  DEPT: 311803,
  PARTNER_ORG: 311804,
  FORM_CONFIRMED_DATE: 311806, // Date
  ORDER_NO: 311807,
  CONTENT: 311808,
  INFORMANT: 311809,
  OBS_PERIOD: 311810, // Multi
  COLLECT_MODE: 2163756,
  SAMPLE_TYPE: 3235254,
  FORM_NAME: 3235261,
  EXPERT: 7092157,
  FREQ: 7487907, // Multi
  COLLECT_WORKER: 7487908,
  DATA_FLOW: 7487909,
  TX_TIME: 7487910,
  DISAGG: 7487911, // Multi
  CLASS_CODES: 7487912, // Multi
  PUB_TIME: 7487913,
  DERIVED_INDICATORS: 7487914, // Multi
  FUNDER: 7487915,
  MEDEE_TURUL: 8551951,
};

const DATE_META_IDS = new Set([META_ID.FORM_CONFIRMED_DATE]);
const MULTI_ID_META_IDS = new Set([
  META_ID.OBS_PERIOD,
  META_ID.FREQ,
  META_ID.DISAGG,
  META_ID.CLASS_CODES,
  META_ID.DERIVED_INDICATORS,
]);

const encodeVal = (v) => {
  if (v == null) return null;
  if (dayjs.isDayjs(v)) return v.format("YYYY-MM-DD");
  if (Array.isArray(v)) return v.join(",");
  return v;
};

export default function MetadataNew() {
  const [form] = Form.useForm();
  const router = useRouter();

  const [catalogues, setCatalogues] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [metaValues, setMetaValues] = useState([]); // indicators

  // options (label/value)
  const orgOptions = useMemo(
    () =>
      (organizations || []).map((o) => ({
        value: Number(o.organization_id ?? o.id),
        label: `${o.fullname} (${o.name})`,
      })),
    [organizations]
  );

  const freqOptions = useMemo(
    () =>
      (frequencies || []).map((f) => ({
        value: Number(f.id),
        label: `${f.namemn}${f.nameen ? " (" + f.nameen + ")" : ""}`,
      })),
    [frequencies]
  );

  const sectorOptions = useMemo(
    () =>
      (sectors || []).map((s) => ({
        value: Number(s.id),
        label: `${s.namemn}${s.nameen ? " (" + s.nameen + ")" : ""}`,
      })),
    [sectors]
  );

  const indicatorOptions = useMemo(
    () =>
      (metaValues || []).map((s) => ({
        value: Number(s.id),
        label: `${s.namemn}${s.nameen ? " (" + s.nameen + ")" : ""}`,
      })),
    [metaValues]
  );

  // Options ачаалах
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const { data: outer } = await axios.get(`/api/metadata-questionnaire/admin/options`);
        if (!outer?.status) throw new Error("Invalid response");
        const p = outer.data || {};
        setCatalogues(p.catalogues || []);
        setSectors(p.subClassifications || []);
        setFrequencies(p.frequencies || []);
        setOrganizations(p.organizations || []);
        setMetaValues(p.metaValues || []);
      } catch (e) {
        console.error(e);
        message.error("Сонголтууд ачаалахад алдаа гарлаа");
      }
    };
    loadOptions();
  }, []);

  const onFinish = async (values) => {
    try {
      const dynMn = values.dynamicMn || {};
      const dynEn = values.dynamicEn || {};
      const allKeys = new Set([...Object.keys(dynMn), ...Object.keys(dynEn)]);

      const metaValuesPayload = Array.from(allKeys).map((k) => ({
        meta_data_id: Number(k),
        valuemn: encodeVal(dynMn[k]),
        valueen: encodeVal(dynEn[k]),
      }));

      const payload = {
        namemn: values.namemn || "",
        nameen: values.nameen || "",
        type: values.type || null,
        active: !!values.active,
        isSecure: !!values.isSecure,
        organizations: (values.organizations || []).map((x) => Number(x)),
        metaValues: metaValuesPayload,
        user: "admin",
      };

      const { data: res } = await axios.post(`/api/metadata-questionnaire/admin`, payload);
      if (!res?.status) throw new Error(res?.message || "Create failed");
      message.success("Амжилттай бүртгэлээ");
      router.push("/admin/metadata-questionnaire");
    } catch (e) {
      console.error(e);
      message.error("Хадгалах үед алдаа гарлаа");
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-medium">Мета өгөгдөл — Шинээр нэмэх</h2>
      </div>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        {/* Data catalogue (IDs expected) */}
        <Form.Item name="data_catalogue_ids" label="Дата каталог">
          <Select
            mode="multiple"
            placeholder="Сонгоно уу"
            allowClear
            showSearch
            optionFilterProp="label"
            options={(catalogues || []).map((c) => ({
              value: Number(c.id),
              label: `${c.namemn} (${c.nameen})`,
            }))}
          />
        </Form.Item>

        <Form.Item name="namemn" label="Нэр (MN)" rules={[{ required: true, message: "Нэр (MN) шаардлагатай" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="nameen" label="Нэр (EN)">
          <Input />
        </Form.Item>

        <Form.Item name="type" label="Төрөл">
          <Select
            placeholder="Сонгоно уу"
            options={[
              { value: "official", label: "Албан ёсны статистикийн мэдээ" },
              { value: "administrative", label: "Захиргааны мэдээ" },
              { value: "census", label: "Тооллого" },
              { value: "survey", label: "Судалгаа" },
            ]}
          />
        </Form.Item>

        <Form.Item name="organizations" label="Төрийн байгууллага">
          <Select
            mode="multiple"
            placeholder="Сонгоно уу"
            allowClear
            showSearch
            optionFilterProp="label"
            options={orgOptions}
          />
        </Form.Item>

        <Form.Item name="active" valuePropName="checked">
          <Checkbox>Идэвхтэй эсэх</Checkbox>
        </Form.Item>
        <Form.Item name="isSecure" valuePropName="checked">
          <Checkbox>Нууцлалтай эсэх</Checkbox>
        </Form.Item>

        <Tabs>
          <Tabs.TabPane tab="Монгол" key="mn">
            <Form.Item name={["dynamicMn", META_ID.FORM_NAME]} label="Маягт">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.SHIFR]} label="Шифр">
              <Input />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.DEPT]} label="Хариуцах газар/хэлтэс">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.PARTNER_ORG]} label="Статистик мэдээг хамтран гаргадаг байгууллага">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.MEDEE_TURUL]} label="Мэдээ төрөл">
              <Select
                placeholder="Сонгоно уу"
                options={[
                  { value: "official", label: "Албан ёсны статистикийн мэдээ" },
                  { value: "administrative", label: "Захиргааны мэдээ" },
                  { value: "census", label: "Тооллого" },
                  { value: "survey", label: "Судалгаа" },
                ]}
              />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.FORM_CONFIRMED_DATE]} label="Маягт батлагдсан огноо">
              <DatePicker />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.ORDER_NO]} label="Тушаалын дугаар">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.CONTENT]} label="Агуулга">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.INFORMANT]} label="Анхан шатны мэдээлэгч">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", META_ID.OBS_PERIOD]} label="Ажиглалтын хугацаа">
              <Select mode="multiple" allowClear showSearch optionFilterProp="label" options={freqOptions} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.SAMPLE_TYPE]} label="Статистик ажиглалтын төрөл">
              <Select
                placeholder="Сонгоно уу"
                options={[
                  { value: "sample", label: "Түүвэр ажиглалт" },
                  { value: "sample2", label: "Түүвэр ажиглалт-2" },
                  { value: "complete", label: "Нэлэнхүй ажиглалт" },
                ]}
              />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.FREQ]} label="Мэдээлэл цуглуулах давтамж">
              <Select mode="multiple" allowClear showSearch optionFilterProp="label" options={freqOptions} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.COLLECT_MODE]} label="Мэдээлэл цуглуулах хэлбэр">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.COLLECT_WORKER]} label="Мэдээлэл цуглуулах ажилтан">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.DATA_FLOW]} label="Мэдээлэл дамжуулах урсгал">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.TX_TIME]} label="Мэдээлэл дамжуулах хугацаа">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", META_ID.DISAGG]} label="Үр дүнг тархаах түвшин буюу үзүүлэлтийн задаргаа">
              <Select mode="multiple" allowClear showSearch optionFilterProp="label" options={sectorOptions} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.CLASS_CODES]} label="Ашиглагдсан ангилал, кодууд">
              <Select mode="multiple" allowClear showSearch optionFilterProp="label" options={sectorOptions} />
            </Form.Item>

            <Form.Item name={["dynamicMn", META_ID.PUB_TIME]} label="Мэдээлэл тархаах хугацаа">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicMn", META_ID.DERIVED_INDICATORS]} label="Тооцон гаргадаг үзүүлэлтүүд">
              <Select mode="multiple" allowClear showSearch optionFilterProp="label" options={indicatorOptions} />
            </Form.Item>

            <Form.Item name={["dynamicMn", META_ID.FUNDER]} label="Санхүүжүүлэгч байгууллага">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.EXTRA_INFO]} label="Нэмэлт мэдээлэл">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.KEYWORDS]} label="Түлхүүр үг">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicMn", META_ID.EXPERT]} label="Боловсруулсан мэргэжилтэн">
              <Input />
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="English" key="en">
            <Form.Item name={["dynamicEn", META_ID.FORM_NAME]} label="Form">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.SHIFR]} label="Cipher">
              <Input />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.FORM_CONFIRMED_DATE]} label="Form confirmed date">
              <DatePicker />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.ORDER_NO]} label="Order No.">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.CONTENT]} label="About">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.INFORMANT]} label="Informant">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", META_ID.OBS_PERIOD]} label="Observation period">
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                options={freqOptions.map((o) => ({
                  value: o.value,
                  label: o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label,
                }))}
              />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.SAMPLE_TYPE]} label="Sampling procedure">
              <Select
                placeholder="Select"
                options={[
                  { value: "sample", label: "Sample survey" },
                  { value: "sample2", label: "Sample survey 2" },
                  { value: "complete", label: "Complete enumeration" },
                ]}
              />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.FREQ]} label="Frequency">
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                options={freqOptions.map((o) => ({
                  value: o.value,
                  label: o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label,
                }))}
              />
            </Form.Item>

            <Form.Item name={["dynamicEn", META_ID.COLLECT_MODE]} label="Collection mode">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.COLLECT_WORKER]} label="Enumerator">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.DATA_FLOW]} label="Data flow">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.TX_TIME]} label="Transmission time">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item name={["dynamicEn", META_ID.DISAGG]} label="Disaggregation">
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                options={sectorOptions.map((o) => ({
                  value: o.value,
                  label: o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label,
                }))}
              />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.CLASS_CODES]} label="Classifications & codes">
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                options={sectorOptions.map((o) => ({
                  value: o.value,
                  label: o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label,
                }))}
              />
            </Form.Item>

            <Form.Item name={["dynamicEn", META_ID.PUB_TIME]} label="Publication time">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.DERIVED_INDICATORS]} label="Derived indicators">
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                options={indicatorOptions.map((o) => ({
                  value: o.value,
                  label: o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label,
                }))}
              />
            </Form.Item>

            <Form.Item name={["dynamicEn", META_ID.FUNDER]} label="Funding organization">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.EXTRA_INFO]} label="Additional information">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.KEYWORDS]} label="Keywords">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name={["dynamicEn", META_ID.EXPERT]} label="Expert">
              <Input />
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => router.back()}>Буцах</Button>
          <Button type="primary" htmlType="submit">Хадгалах</Button>
        </div>
      </Form>
    </div>
  );
}
