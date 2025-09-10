"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button, Form, Input, message, Select, Checkbox, Tabs, DatePicker } from "antd";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

const { TextArea } = Input;

// === Meta IDs (label-аас хараат бус) ===
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
  DERIVED_INDICATORS: 7487914, // Multi (indicator IDs)
  FUNDER: 7487915,
  MEDEE_TURUL: 8551951, // “Мэдээ төрөл”
};

// аль нь огноо, аль нь multi ID талбар гэдгийг ялгана
const DATE_META_IDS = new Set([META_ID.FORM_CONFIRMED_DATE]);
const MULTI_ID_META_IDS = new Set([
  META_ID.OBS_PERIOD,
  META_ID.FREQ,
  META_ID.DISAGG,
  META_ID.CLASS_CODES,
  META_ID.DERIVED_INDICATORS,
]);

// CSV-г эхэнд parse хийхдээ тоо байвал number болгоно
const toMaybeNumber = (s) => {
  const t = String(s ?? "").trim();
  return /^\d+$/.test(t) ? Number(t) : t;
};

const normalizeInitById = (metaId, v) => {
  if (v == null) return undefined;
  if (DATE_META_IDS.has(Number(metaId))) return dayjs(v);
  if (MULTI_ID_META_IDS.has(Number(metaId))) {
    return String(v || "")
      .split(",")
      .map((s) => toMaybeNumber(s))
      .filter((x) => x !== "" && x !== null && x !== undefined);
  }
  return v;
};

// ✅ NULL → "" болгож, whitespace-ийг цэвэрлэнэ (DB NOT NULL-тэй тул)
const encodeVal = (v) => {
  if (v == null) return "";
  if (dayjs.isDayjs(v)) return v.format("YYYY-MM-DD");
  if (Array.isArray(v)) return v.join(",");
  return String(v).trim();
};

export default function MetadataEdit() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [catalogues, setCatalogues] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [metaValues, setMetaValues] = useState([]); // indicators from question_pool
  const [rows, setRows] = useState([]); // view rows
  const [mdvLatest, setMdvLatest] = useState({}); // { [meta_id]: { valuemn, valueen } }

  // анхдагч options-оо label/value хэлбэрт оруулж, label харагдуулах
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

  useEffect(() => {
    const load = async () => {
      try {
        const { data: outer } = await axios.get(`/api/metadata-questionnaire/admin/${id}`);
        if (!outer?.status) throw new Error("Invalid response");
        const payload = outer.data || {};
        // console.log("payload", payload);

        setRows(payload.rows || []);
        setCatalogues(payload.catalogues || []);
        setSectors(payload.subClassifications || []);
        setFrequencies(payload.frequencies || []);
        setOrganizations(payload.organizations || []);
        setMetaValues(payload.metaValues || []);
        setMdvLatest(payload.mdvLatest || {});

        // dynamic init from mdvLatest
        const dynamicMn = {};
        const dynamicEn = {};
        Object.values(META_ID).forEach((mid) => {
          const s = (payload.mdvLatest || {})[mid];
          if (s) {
            dynamicMn[mid] = normalizeInitById(mid, s.valuemn);
            dynamicEn[mid] = normalizeInitById(mid, s.valueen);
          }
        });

        // header/top-level
        const header = (payload.rows && payload.rows[0]) || {};
        const labelMn = header.labelmn || header.label || "";
        const labelEn = header.labelen || header.label_en || "";
        const active = header.active ?? false;
        const isSecure = header.is_secret ?? false;

        // data_catalogue ids from view (comma-separated)
        const dcIds = (header.data_catalogue_ids || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((x) => (isNaN(Number(x)) ? x : Number(x)));

        // Сонгогдсон байгууллагууд (API буцаадаг)
        const selectedOrgIds = (payload.selectedOrganizationIds || []).map((n) => Number(n));

        form.setFieldsValue({
          namemn: labelMn,
          nameen: labelEn,
          dynamicMn,
          dynamicEn,
          active: !!active,
          isSecure: !!isSecure,
          data_catalogue_ids: dcIds,
          organizations: selectedOrgIds,
        });
      } catch (e) {
        console.error(e);
        message.error("Ачаалах үед алдаа гарлаа");
      }
    };
    if (id) load();
  }, [id]);

  const onFinish = async (values) => {
    try {
      // Dynamic meta — бүх талбарууд ID-аар
      const dynMn = values.dynamicMn || {};
      const dynEn = values.dynamicEn || {};
      const allKeys = new Set([...Object.keys(dynMn || {}), ...Object.keys(dynEn || {})]);

      const metaValuesPayload = Array.from(allKeys).map((k) => ({
        meta_data_id: Number(k),
        valuemn: encodeVal(dynMn[k]),
        valueen: encodeVal(dynEn[k]),
      }));

      await axios.put(`/api/metadata-questionnaire/admin/${id}`, {
        id,
        namemn: values.namemn,
        nameen: values.nameen,
        type: values.type,
        active: values.active,
        isSecure: values.isSecure,
        organizations: (values.organizations || []).map((x) => Number(x)), // dynamic_object.organization_ids
        // data_catalogue_ids өөр endpoint-тэй бол тусад нь хийнэ. Одоогоор илгээхгүй.
        metaValues: metaValuesPayload,
        user: "admin",
      });

      message.success("Амжилттай хадгаллаа");
      router.push("/admin/metadata-questionnaire");
    } catch (e) {
      console.error(e);
      message.error("Хадгалах үед алдаа гарлаа");
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-medium">Мета өгөгдөл засах</h2>
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

        <Form.Item name={["dynamicMn", META_ID.OBS_PERIOD]} label="Ажиглалтын хугацаа">
          <Select mode="multiple" allowClear showSearch optionFilterProp="label" options={freqOptions} />
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
              <TextArea rows={2} />
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
          <Button onClick={() => window.history.back()}>Буцах</Button>
          <Button type="primary" htmlType="submit">
            Хадгалах
          </Button>
        </div>
      </Form>
    </div>
  );
}
