"use client";

import React, { useEffect, useState, useMemo } from "react";
import { message, Select } from "antd";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";
import Loader from "@/components/Loader";

const META_ID = {
  SHIFR: 3003,
  KEYWORDS: 9653,
  EXTRA_INFO: 35301,
  DEPT: 311803,
  PARTNER_ORG: 311804,
  FORM_CONFIRMED_DATE: 311806,
  ORDER_NO: 311807,
  CONTENT: 311808,
  INFORMANT: 311809,
  OBS_PERIOD: 311810,
  COLLECT_MODE: 2163756,
  SAMPLE_TYPE: 3235254,
  FORM_NAME: 3235261,
  EXPERT: 7092157,
  FREQ: 7487907,
  COLLECT_WORKER: 7487908,
  DATA_FLOW: 7487909,
  TX_TIME: 7487910,
  DISAGG: 7487911,
  CLASS_CODES: 7487912,
  PUB_TIME: 7487913,
  DERIVED_INDICATORS: 7487914,
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

const encodeVal = (v) => {
  if (v == null) return "";
  if (dayjs.isDayjs(v)) return v.format("YYYY-MM-DD");
  if (Array.isArray(v)) return v.join(",");
  return String(v).trim();
};

const toDateInputValue = (v) => {
  if (dayjs.isDayjs(v)) return v.format("YYYY-MM-DD");
  const s = String(v || "").trim();
  if (!s) return "";
  const d = dayjs(s);
  return d.isValid() ? d.format("YYYY-MM-DD") : "";
};

export default function MetadataEdit() {
  const params = useParams();
  const id = params?.id;

  const [catalogues, setCatalogues] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [metaValues, setMetaValues] = useState([]);
  const [rows, setRows] = useState([]);
  const [mdvLatest, setMdvLatest] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  // const [uploadFile2, setUploadFile2] = useState(null);

  const [oldUploadFile, setOldUploadFile] = useState(null);
  // const [oldUploadFile2, setOldUploadFile2] = useState(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [values, setValues] = useState({
    data_catalogue_ids: [],
    namemn: "",
    nameen: "",
    type: "",
    organizations: [],
    active: false,
    isSecure: false,
    dynamicMn: {},
    dynamicEn: {},
  });
  const [activeTab, setActiveTab] = useState("mn");

  // const getSelectedValues = (e) => Array.from(e.target.selectedOptions).map((o) => o.value);
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? !!checked : value }));
  };
  const handleMultiSelectChange = (name, arr, toNumber = false) => {
    const next = toNumber ? arr.map((v) => Number(v)) : arr;
    setValues((prev) => ({ ...prev, [name]: next }));
  };
  const handleDynamicChange = (langKey, metaKey, val) => {
    setValues((prev) => ({
      ...prev,
      [langKey]: {
        ...(prev[langKey] || {}),
        [metaKey]: val,
      },
    }));
  };

  const orgOptions = useMemo(() => {
    const list = Array.isArray(organizations) ? organizations : [];
    return list.reduce((acc, o) => {
      const id = String(o?.organization_id ?? o?.id ?? "");
      if (id) {
        const fullname = o?.fullname ?? "";
        const name = o?.name ?? "";
        acc.push({ value: id, label: `${fullname} (${name})` });
      }
      return acc;
    }, []);

  }, [organizations]);

  // const catalogueOptions = useMemo(() => {
  //   const byId = new Map();
  //   const list = Array.isArray(catalogues) ? catalogues : [];
  //   for (const c of list) {
  //     const idc = Number(c?.id);
  //     if (Number.isFinite(idc)) {
  //       const key = String(idc);
  //       byId.set(key, `${c?.namemn ?? ""} (${c?.nameen ?? ""})`);
  //     }
  //   }
  //   const selected = Array.isArray(values?.data_catalogue_ids) ? values.data_catalogue_ids : [];
  //   for (const v of selected) {
  //     const key = String(v);
  //     if (!byId.has(key)) {
  //       byId.set(key, key);
  //     }
  //   }
  //   return Array.from(byId, ([value, label]) => ({ value, label }));
  // }, [catalogues, values?.data_catalogue_ids]);

  const freqOptions = useMemo(() => {
    const list = Array.isArray(frequencies) ? frequencies : [];
    return list.reduce((acc, f) => {
      const id = Number(f?.id);
      if (Number.isFinite(id)) {
        acc.push({ value: id, label: `${f?.namemn ?? ""}${f?.nameen ? " (" + f.nameen + ")" : ""}` });
      }
      return acc;
    }, []);
  }, [frequencies]);

  const sectorOptions = useMemo(() => {
    const list = Array.isArray(sectors) ? sectors : [];
    return list.reduce((acc, s) => {
      const id = Number(s?.id);
      if (Number.isFinite(id)) {
        acc.push({ value: id, label: `${s?.namemn ?? ""}${s?.nameen ? " (" + s.nameen + ")" : ""}` });
      }
      return acc;
    }, []);
  }, [sectors]);

  const indicatorOptions = useMemo(() => {
    const list = Array.isArray(metaValues) ? metaValues : [];
    return list.reduce((acc, s) => {
      const id = Number(s?.id);
      if (Number.isFinite(id)) {
        acc.push({ value: id, label: `${s?.namemn ?? ""}${s?.nameen ? " (" + s.nameen + ")" : ""}` });
      }
      return acc;
    }, []);
  }, [metaValues]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: outer } = await axios.get(`/api/metadata-questionnaire/admin/${id}`);
        if (!outer?.status) throw new Error("Invalid response");
        const payload = outer.data || {};

        setRows(payload.rows || []);
        setCatalogues(payload.catalogues || []);
        setSectors(payload.subClassifications || []);
        setFrequencies(payload.frequencies || []);
        setOrganizations(payload.organizations || []);
        setMetaValues(payload.metaValues || []);
        setMdvLatest(payload.mdvLatest || {});
        const formRow = (payload.rows || []).find(r => String(r.meta_data_id) === String(META_ID.FORM_NAME));
        setOldUploadFile(formRow?.attachment_name || null);
        // console.log("aaaaaaaaaaaaaaaa3", payload.rows.dynamicMn[META_ID.MEDEE_TURUL]);
        // console.log("aaaaaaaaaaaaaaaa3", payload);
        // setOldUploadFile2(payload.rows[0].file2 || null);

        const dynamicMn = {};
        const dynamicEn = {};
        Object.values(META_ID).forEach((mid) => {
          const s = (payload.mdvLatest || {})[mid];
          if (s) {
            dynamicMn[mid] = normalizeInitById(mid, s.valuemn);
            dynamicEn[mid] = normalizeInitById(mid, s.valueen);
          }
        });

        const header = (payload.rows && payload.rows[0]) || {};
        const labelMn = header.labelmn || header.label || "";
        const labelEn = header.labelen || header.label_en || "";
        const active = header.active === 1 || header.active === true || String(header.active).trim() === '1';
        const isSecureRaw = header?.is_secret ?? header?.is_secure ?? 0;
        const isSecure = isSecureRaw === 1 || isSecureRaw === true || String(isSecureRaw).trim() === '1';

        const dcIds = (header.data_catalogue_ids || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((x) => (isNaN(Number(x)) ? x : Number(x)));

        setValues({
          namemn: labelMn,
          nameen: labelEn,
          dynamicMn,
          dynamicEn,
          active: active,
          isSecure: isSecure,
          data_catalogue_ids: dcIds,
          organizations: header.organization_id && typeof header.organization_id === 'string'
            ? header.organization_id.split(',').map(id => id.trim()).filter(id => id)
            : [],
          type: header?.type ?? "",
        });
      } catch (e) {
        console.error(e);
        message.error("Ачаалах үед алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      return data.filename;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onFinish = async (values) => {
    setSaving(true);
    try {
      let imageUrl = '';
      let imageUrl2 = '';
      let newName = uploadFile?.name || null;
      if (uploadFile) {
        imageUrl = await uploadImage(uploadFile);
      }

      // if (uploadFile2) {
      //   imageUrl2 = await uploadImage(uploadFile2);
      // }

      const dynMn = values.dynamicMn || {};
      const dynEn = values.dynamicEn || {};
      const allKeys = new Set([...Object.keys(dynMn || {}), ...Object.keys(dynEn || {})]);

      const metaValuesPayload = Array.from(allKeys).map((k) => ({
        meta_data_id: Number(k),
        valuemn: encodeVal(dynMn[k]),
        valueen: encodeVal(dynEn[k]),
      }));
      // return;
      const payload = {
        id,
        namemn: values.namemn,
        nameen: values.nameen,
        type: values.type,
        active: !!values.active,
        isSecure: !!values.isSecure,
        organizations: values.organizations,
        metaValues: metaValuesPayload,
        file: imageUrl,
        // file2: imageUrl2,
        originalUploadFile: newName || null,
        oldUploadFile: oldUploadFile || null,
        // oldUploadFile2: oldUploadFile2 || null,
      }
      // console.log("payload", payload);
      // message.success("Амжилттай хадгаллаа-TEST");
      // return;
      await axios.put(`/api/metadata-questionnaire/admin/${id}`, payload);

      message.success("Амжилттай хадгаллаа");
      // router.push("/admin/metadata-questionnaire");
    } catch (e) {
      console.error(e);
      message.error("Хадгалах үед алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Ачаалж байна..." />
  }
  if (saving) {
    return <Loader text="Хадгалж байна..." />
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
      <div className="mb-4 flex justify-between">
        <h2 className="text-2xl font-bold">Мета өгөгдөл засах</h2>
      </div>

      <form onSubmit={async (e) => { e.preventDefault(); await onFinish(values); }}>
        {/* <div className="mb-4">
          <label className="block mb-2 font-bold">Дата каталог</label>
          {console.log("values.data_catalogue_ids",values.data_catalogue_ids)
          }
          <Select
            mode="multiple"
            allowClear
            showSearch
            style={{ width: '100%' }}
            placeholder="Сонгоно уу"
            value={(values.data_catalogue_ids || []).map(String)}
            onChange={(arr) => handleMultiSelectChange("data_catalogue_ids", arr, true)}
            options={catalogueOptions.map(o => ({ value: String(o.value), label: o.label }))}
            optionFilterProp="label"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div> */}

        <div className="mb-4">
          <label className="block mb-2 font-bold">Нэр (MN)</label>
          <input name="namemn" className="block w-full border border-gray-300 rounded p-2" value={values.namemn} onChange={handleInputChange} required />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-bold">Нэр (EN)</label>
          <input name="nameen" className="block w-full border border-gray-300 rounded p-2" value={values.nameen} onChange={handleInputChange} />
        </div>
        {/* 
        <div className="mb-4">
          <label className="block mb-2 font-bold">Төрөл</label>
          <select name="type" className="block w-full border border-gray-300 rounded p-2" value={values.type || ""} onChange={handleInputChange}>
            <option value="">Сонгоно уу</option>
            <option value="indicator">Мэдээ</option>
            <option value="survey">Судалгаа</option>
          </select>
        </div> */}

        <div className="mb-4">
          <label className="block mb-2 font-bold">Төрийн байгууллага</label>
          <Select
            mode="multiple"
            allowClear
            showSearch
            style={{ width: '100%' }}
            placeholder="Сонгоно уу"
            value={Array.isArray(values.organizations) ? values.organizations : []}
            onChange={(arr) => handleMultiSelectChange("organizations", arr, false)}
            options={orgOptions.map(o => ({ value: String(o.value), label: o.label }))}
            optionFilterProp="label"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div>

        <div className="mb-2">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="active" checked={!!values.active} onChange={handleInputChange} />
            <span>Идэвхтэй эсэх</span>
          </label>
        </div>
        <div className="mb-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isSecure" checked={!!values.isSecure} onChange={handleInputChange} />
            <span>Нууцлалтай эсэх</span>
          </label>
        </div>

        <div className="mb-4 border-b border-gray-200">
          <nav className="flex gap-2">
            <button type="button" className={`px-3 py-2 ${activeTab === 'mn' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setActiveTab('mn')}>Монгол</button>
            <button type="button" className={`px-3 py-2 ${activeTab === 'en' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setActiveTab('en')}>English</button>
          </nav>
        </div>

        {activeTab === 'mn' && (
          <div>
            <div className='flex flex-wrap gap-3 mb-6'>
              <div className="w-full">
                <div className="relative">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-7 dark:text-white"
                    htmlFor="file_input_mn"
                  >
                    Файл оруулна уу
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        className="block w-full text-sm text-gray-7 border border-gray-3 rounded-lg cursor-pointer bg-gray-1 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-2 file:text-gray-7 hover:file:bg-gray-3 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        id="file_input_mn"
                        type="file"
                        accept="*/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setUploadFile(file);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 ml-2">Одоогийн файлын нэр: {oldUploadFile}</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Шифр</label>
              <input className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.SHIFR] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.SHIFR, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Хариуцах газар/хэлтэс</label>
              <textarea rows={3} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.DEPT] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.DEPT, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Статистик мэдээг хамтран гаргадаг байгууллага</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.PARTNER_ORG] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.PARTNER_ORG, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээ төрөл</label>
              <select className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.MEDEE_TURUL] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.MEDEE_TURUL, e.target.value)}>
                <option value="">Сонгоно уу</option>
                <option value="official">Албан ёсны статистикийн мэдээ</option>
                <option value="administrative">Захиргааны мэдээ</option>
                <option value="census">Тооллого</option>
                <option value="survey">Судалгаа</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Маягт батлагдсан огноо</label>
              <input
                type="date"
                className="block w-full border border-gray-300 rounded p-2"
                value={toDateInputValue(values.dynamicMn[META_ID.FORM_CONFIRMED_DATE])}
                onChange={(e) => handleDynamicChange('dynamicMn', META_ID.FORM_CONFIRMED_DATE, dayjs(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Тушаалын дугаар</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.ORDER_NO] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.ORDER_NO, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Агуулга</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.CONTENT] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.CONTENT, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Анхан шатны мэдээлэгч</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.INFORMANT] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.INFORMANT, e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Ажиглалтын хугацаа</label>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Сонгоно уу"
                value={(values.dynamicMn[META_ID.OBS_PERIOD] || []).map(String)}
                onChange={(arr) => handleDynamicChange('dynamicMn', META_ID.OBS_PERIOD, (arr || []).map((v) => Number(v)))}
                options={freqOptions.map(o => ({ value: String(o.value), label: o.label }))}
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Статистик ажиглалтын төрөл</label>
              <select className="block w-full border border-gray-300 rounded p-2"
                value={values.dynamicMn[META_ID.SAMPLE_TYPE] || ""}
                onChange={(e) => handleDynamicChange('dynamicMn', META_ID.SAMPLE_TYPE, e.target.value)}>
                <option value="">Сонгоно уу</option>
                <option value="70851">Түүвэр ажиглалт</option>
                <option value="70854">Түүвэр ажиглалт-2</option>
                <option value="8784217">Нэлэнхүй ажиглалт</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээлэл цуглуулах давтамж</label>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Сонгоно уу"
                value={(values.dynamicMn[META_ID.FREQ] || []).map(String)}
                onChange={(arr) => handleDynamicChange('dynamicMn', META_ID.FREQ, (arr || []).map((v) => Number(v)))}
                options={freqOptions.map(o => ({ value: String(o.value), label: o.label }))}
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээлэл цуглуулах хэлбэр</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.COLLECT_MODE] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.COLLECT_MODE, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээлэл цуглуулах ажилтан</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.COLLECT_WORKER] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.COLLECT_WORKER, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээлэл дамжуулах урсгал</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.DATA_FLOW] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.DATA_FLOW, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээлэл дамжуулах хугацаа</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.TX_TIME] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.TX_TIME, e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Үр дүнг тархаах түвшин буюу үзүүлэлтийн задаргаа</label>
              <textarea
                rows={3}
                className="block w-full border border-gray-300 rounded p-2"
                value={Array.isArray(values.dynamicMn[META_ID.DISAGG]) ? (values.dynamicMn[META_ID.DISAGG] || []).join(", ") : (values.dynamicMn[META_ID.DISAGG] || "")}
                onChange={(e) => handleDynamicChange('dynamicMn', META_ID.DISAGG, e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Ашиглагдсан ангилал, кодууд</label>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Сонгоно уу"
                value={(values.dynamicMn[META_ID.CLASS_CODES] || []).map(String)}
                onChange={(arr) => handleDynamicChange('dynamicMn', META_ID.CLASS_CODES, (arr || []).map((v) => Number(v)))}
                options={sectorOptions.map(o => ({ value: String(o.value), label: o.label }))}
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээлэл тархаах хугацаа</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.PUB_TIME] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.PUB_TIME, e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Тооцон гаргадаг үзүүлэлтүүд</label>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Сонгоно уу"
                value={(values.dynamicMn[META_ID.DERIVED_INDICATORS] || []).map(String)}
                onChange={(arr) => handleDynamicChange('dynamicMn', META_ID.DERIVED_INDICATORS, (arr || []).map((v) => Number(v)))}
                options={indicatorOptions.map(o => ({ value: String(o.value), label: o.label }))}
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Санхүүжүүлэгч байгууллага</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.FUNDER] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.FUNDER, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Нэмэлт мэдээлэл</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.EXTRA_INFO] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.EXTRA_INFO, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Түлхүүр үг</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.KEYWORDS] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.KEYWORDS, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Боловсруулсан мэргэжилтэн</label>
              <input className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.EXPERT] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.EXPERT, e.target.value)} />
            </div>
          </div>
        )}

        {activeTab === 'en' && (
          <div>
            {/* <div className='flex flex-wrap gap-3 mb-6'>
              <div className="w-full">
                <div className="relative">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-7 dark:text-white"
                    htmlFor="file_input_en"
                  >
                    Upload file
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        className="block w-full text-sm text-gray-7 border border-gray-3 rounded-lg cursor-pointer bg-gray-1 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-2 file:text-gray-7 hover:file:bg-gray-3 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        id="file_input_en"
                        type="file"
                        accept=""
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setUploadFile2(file);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">Cipher</label>
              <input className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.SHIFR] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.SHIFR, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Respondent organization</label>
              <textarea rows={3} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.DEPT] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.DEPT, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Partner organization</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.PARTNER_ORG] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.PARTNER_ORG, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Form confirmed date</label>
              <input
                type="date"
                className="block w-full border border-gray-300 rounded p-2"
                value={toDateInputValue(values.dynamicEn[META_ID.FORM_CONFIRMED_DATE])}
                onChange={(e) => handleDynamicChange('dynamicEn', META_ID.FORM_CONFIRMED_DATE, dayjs(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Order No.</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.ORDER_NO] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.ORDER_NO, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">About</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.CONTENT] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.CONTENT, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Informant</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.INFORMANT] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.INFORMANT, e.target.value)} />
            </div>

            {/* <div className="mb-4">
              <label className="block mb-2 font-bold">Observation period</label>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Select"
                value={(values.dynamicEn[META_ID.OBS_PERIOD] || []).map(String)}
                onChange={(arr) => handleDynamicChange('dynamicEn', META_ID.OBS_PERIOD, (arr || []).map((v) => Number(v)))}
                options={freqOptions.map(o => ({ value: String(o.value), label: (o.label.split(' (')[1] ? o.label.split(' (')[1].replace(')', '') : o.label) }))}
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div> */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">Sampling procedure</label>
              <select className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.SAMPLE_TYPE] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.SAMPLE_TYPE, e.target.value)}>
                <option value="">Select</option>
                <option value="70851">Sample survey</option>
                <option value="70854">Sample survey 2</option>
                <option value="8784217">Complete enumeration</option>
              </select>
            </div>
            {/* <div className="mb-4">
              <label className="block mb-2 font-bold">Frequency</label>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Select"
                value={(values.dynamicEn[META_ID.FREQ] || []).map(String)}
                onChange={(arr) => handleDynamicChange('dynamicEn', META_ID.FREQ, (arr || []).map((v) => Number(v)))}
                options={freqOptions.map(o => ({ value: String(o.value), label: (o.label.split(' (')[1] ? o.label.split(' (')[1].replace(')', '') : o.label) }))}
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div> */}

            <div className="mb-4">
              <label className="block mb-2 font-bold">Collection mode</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.COLLECT_MODE] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.COLLECT_MODE, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Enumerator</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.COLLECT_WORKER] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.COLLECT_WORKER, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Data flow</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.DATA_FLOW] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.DATA_FLOW, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Transmission time</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.TX_TIME] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.TX_TIME, e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Disaggregation</label>
              <textarea
                rows={3}
                className="block w-full border border-gray-300 rounded p-2"
                value={Array.isArray(values.dynamicEn[META_ID.DISAGG]) ? (values.dynamicEn[META_ID.DISAGG] || []).join(", ") : (values.dynamicEn[META_ID.DISAGG] || "")}
                onChange={(e) => handleDynamicChange('dynamicEn', META_ID.DISAGG, e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Classifications & codes</label>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Select"
                value={(values.dynamicMn[META_ID.CLASS_CODES] || []).map(String)}
                onChange={(arr) => handleDynamicChange('dynamicEn', META_ID.CLASS_CODES, (arr || []).map((v) => Number(v)))}
                options={sectorOptions.map(o => ({ value: String(o.value), label: o.label }))}
                //options={sectorOptions.map(o => ({ value: String(o.value), label: (o.label.split(' (')[1] ? o.label.split(' (')[1].replace(')', '') : o.label) }))}
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Publication time</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.PUB_TIME] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.PUB_TIME, e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Derived indicators</label>
              <Select
                mode="multiple"
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Select"
                value={(values.dynamicEn[META_ID.DERIVED_INDICATORS] || []).map(String)}
                onChange={(arr) => handleDynamicChange('dynamicEn', META_ID.DERIVED_INDICATORS, (arr || []).map((v) => Number(v)))}
                options={indicatorOptions.map(o => ({ value: String(o.value), label: (o.label.split(' (')[1] ? o.label.split(' (')[1].replace(')', '') : o.label) }))}
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Funding organization</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.FUNDER] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.FUNDER, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Additional information</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.EXTRA_INFO] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.EXTRA_INFO, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Keywords</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.KEYWORDS] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.KEYWORDS, e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Expert</label>
              <input className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.EXPERT] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.EXPERT, e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={() => window.history.back()} disabled={saving} className="px-4 py-2 border rounded">Буцах</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Хадгалж байна...' : 'Хадгалах'}</button>
        </div>
      </form>
    </div>
  );
}
