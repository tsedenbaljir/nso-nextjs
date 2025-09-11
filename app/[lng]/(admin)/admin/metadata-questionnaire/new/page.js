"use client";

import React, { useEffect, useState, useMemo } from "react";
import { message } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
// import Upload from "@/components/admin/Edits/UploadImages/Upload";
import Loader from "@/components/Loader";

// removed antd Input/TextArea; will use native inputs

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

// const DATE_META_IDS = new Set([META_ID.FORM_CONFIRMED_DATE]);
// const MULTI_ID_META_IDS = new Set([
//   META_ID.OBS_PERIOD,
//   META_ID.FREQ,
//   META_ID.DISAGG,
//   META_ID.CLASS_CODES,
//   META_ID.DERIVED_INDICATORS,
// ]);

const encodeVal = (v) => {
  if (v == null) return null;
  if (dayjs.isDayjs(v)) return v.format("YYYY-MM-DD");
  if (Array.isArray(v)) return v.join(",");
  return v;
};

export default function MetadataNew() {
  const router = useRouter();

  const [catalogues, setCatalogues] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [metaValues, setMetaValues] = useState([]); // indicators
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFile2, setUploadFile2] = useState(null);
  const [originalUploadFile, setOriginalUploadFile] = useState(null);
  const [originalUploadFile2, setOriginalUploadFile2] = useState(null);
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

  const getSelectedValues = (e) => Array.from(e.target.selectedOptions).map((o) => o.value);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? !!checked : value,
    }));
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

  // options (label/value)
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

  const freqOptions = useMemo(() => {
    const list = Array.isArray(frequencies) ? frequencies : [];
    return list.reduce((acc, f) => {
      const id = Number(f?.id);
      if (Number.isFinite(id)) {
        const mn = f?.namemn ?? "";
        const en = f?.nameen ?? "";
        acc.push({ value: id, label: `${mn}${en ? " (" + en + ")" : ""}` });
      }
      return acc;
    }, []);
  }, [frequencies]);

  const sectorOptions = useMemo(() => {
    const list = Array.isArray(sectors) ? sectors : [];
    return list.reduce((acc, s) => {
      const id = Number(s?.id);
      if (Number.isFinite(id)) {
        const mn = s?.namemn ?? "";
        const en = s?.nameen ?? "";
        acc.push({ value: id, label: `${mn}${en ? " (" + en + ")" : ""}` });
      }
      return acc;
    }, []);
  }, [sectors]);

  const indicatorOptions = useMemo(() => {
    const list = Array.isArray(metaValues) ? metaValues : [];
    return list.reduce((acc, s) => {
      const id = Number(s?.id);
      if (Number.isFinite(id)) {
        const mn = s?.namemn ?? "";
        const en = s?.nameen ?? "";
        acc.push({ value: id, label: `${mn}${en ? " (" + en + ")" : ""}` });
      }
      return acc;
    }, []);
  }, [metaValues]);

  // Options ачаалах
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, []);

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
      if (uploadFile) {
        imageUrl = await uploadImage(uploadFile);
      }

      if (uploadFile2) {
        imageUrl2 = await uploadImage(uploadFile2);
      }

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
        organizations: Array.isArray(values.organizations) ? values.organizations : [],
        metaValues: metaValuesPayload,
        file: imageUrl,
        file2: imageUrl2,
        originalUploadFile: originalUploadFile || null,
        originalUploadFile2: originalUploadFile2 || null,
      };

      const { data: res } = await axios.post(`/api/metadata-questionnaire/admin`, payload);
      if (!res?.status) throw new Error(res?.message || "Create failed");
      message.success("Амжилттай бүртгэлээ");
      router.push("/admin/metadata-questionnaire");
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
        <h2 className="text-2xl font-bold">Мета өгөгдөл — Шинээр нэмэх</h2>
      </div>

      <form onSubmit={async (e) => {
        e.preventDefault();
        // temporary bridge to reuse onFinish shape
        await onFinish(values);
      }}>
        {/* Data catalogue (IDs expected) */}
        <div className="mb-4">
          <label className="block mb-2 font-bold">Дата каталог</label>
          <select
            multiple
            name="data_catalogue_ids"
            className="block w-full border border-gray-300 rounded p-2"
            value={(values.data_catalogue_ids || []).map(String)}
            onChange={(e) => handleMultiSelectChange("data_catalogue_ids", Array.from(e.target.selectedOptions).map(o => o.value), true)}
          >
            {(Array.isArray(catalogues) ? catalogues : []).map((c) => {
              const id = Number(c?.id);
              if (!Number.isFinite(id)) return null;
              const mn = c?.namemn ?? "";
              const en = c?.nameen ?? "";
              return (
                <option key={id} value={String(id)}>{`${mn} (${en})`}</option>
              );
            })}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold">Нэр (MN)</label>
          <input
            name="namemn"
            className="block w-full border border-gray-300 rounded p-2"
            value={values.namemn}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-bold">Нэр (EN)</label>
          <input
            name="nameen"
            className="block w-full border border-gray-300 rounded p-2"
            value={values.nameen}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold">Төрөл</label>
          <select
            name="type"
            className="block w-full border border-gray-300 rounded p-2"
            value={values.type || ""}
            onChange={handleInputChange}
          >
            <option value="">Сонгоно уу</option>
            <option value="official">Албан ёсны статистикийн мэдээ</option>
            <option value="administrative">Захиргааны мэдээ</option>
            <option value="census">Тооллого</option>
            <option value="survey">Судалгаа</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold">Төрийн байгууллага</label>
          <select
            multiple
            name="organizations"
            className="block w-full border border-gray-300 rounded p-2"
            value={(values.organizations || []).map(String)}
            onChange={(e) => handleMultiSelectChange("organizations", Array.from(e.target.selectedOptions).map(o => o.value), false)}
          >
            {orgOptions.map((o) => (
              <option key={o.value} value={String(o.value)}>{o.label}</option>
            ))}
          </select>
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
                    htmlFor="file_input"
                  >
                    Файл оруулна уу
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        className="block w-full text-sm text-gray-7 border border-gray-3 rounded-lg cursor-pointer bg-gray-1 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-2 file:text-gray-7 hover:file:bg-gray-3 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        id="file_input"
                        type="file"
                        accept="*/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setUploadFile(file);
                          setOriginalUploadFile(file.name);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* file name kept in state; no hidden field */}
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
              <input type="date" className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.FORM_CONFIRMED_DATE] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.FORM_CONFIRMED_DATE, e.target.value)} />
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
              <select multiple className="block w-full border border-gray-300 rounded p-2" value={(values.dynamicMn[META_ID.OBS_PERIOD] || []).map(String)} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.OBS_PERIOD, Array.from(e.target.selectedOptions).map(o => Number(o.value)))}>
                {freqOptions.map((o) => (
                  <option key={o.value} value={String(o.value)}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Статистик ажиглалтын төрөл</label>
              <select className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.SAMPLE_TYPE] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.SAMPLE_TYPE, e.target.value)}>
                <option value="">Сонгоно уу</option>
                <option value="sample">Түүвэр ажиглалт</option>
                <option value="sample2">Түүвэр ажиглалт-2</option>
                <option value="complete">Нэлэнхүй ажиглалт</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээлэл цуглуулах давтамж</label>
              <select multiple className="block w-full border border-gray-300 rounded p-2" value={(values.dynamicMn[META_ID.FREQ] || []).map(String)} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.FREQ, Array.from(e.target.selectedOptions).map(o => Number(o.value)))}>
                {freqOptions.map((o) => (
                  <option key={o.value} value={String(o.value)}>{o.label}</option>
                ))}
              </select>
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
              <select multiple className="block w-full border border-gray-300 rounded p-2" value={(values.dynamicMn[META_ID.CLASS_CODES] || []).map(String)} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.CLASS_CODES, Array.from(e.target.selectedOptions).map(o => Number(o.value)))}>
                {sectorOptions.map((o) => (
                  <option key={o.value} value={String(o.value)}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Мэдээлэл тархаах хугацаа</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicMn[META_ID.PUB_TIME] || ""} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.PUB_TIME, e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Тооцон гаргадаг үзүүлэлтүүд</label>
              <select multiple className="block w-full border border-gray-300 rounded p-2" value={(values.dynamicMn[META_ID.DERIVED_INDICATORS] || []).map(String)} onChange={(e) => handleDynamicChange('dynamicMn', META_ID.DERIVED_INDICATORS, Array.from(e.target.selectedOptions).map(o => Number(o.value)))}>
                {indicatorOptions.map((o) => (
                  <option key={o.value} value={String(o.value)}>{o.label}</option>
                ))}
              </select>
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
                  <label className="block mb-2 text-sm font-medium text-gray-7 dark:text-white" htmlFor="file_input_en">Файл оруулна уу</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        className="block w-full text-sm text-gray-7 border border-gray-3 rounded-lg cursor-pointer bg-gray-1 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-2 file:text-gray-7 hover:file:bg-gray-3 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        id="file_input_en"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setUploadFile2(file || null);
                          setOriginalUploadFile2(file.name);
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
              <label className="block mb-2 font-bold">Form confirmed date</label>
              <input type="date" className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.FORM_CONFIRMED_DATE] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.FORM_CONFIRMED_DATE, e.target.value)} />
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

            <div className="mb-4">
              <label className="block mb-2 font-bold">Observation period</label>
              <select multiple className="block w-full border border-gray-300 rounded p-2" value={(values.dynamicEn[META_ID.OBS_PERIOD] || []).map(String)} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.OBS_PERIOD, Array.from(e.target.selectedOptions).map(o => Number(o.value)))}>
                {freqOptions.map((o) => {
                  const enLabel = o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label;
                  return <option key={o.value} value={String(o.value)}>{enLabel}</option>;
                })}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Sampling procedure</label>
              <select className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.SAMPLE_TYPE] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.SAMPLE_TYPE, e.target.value)}>
                <option value="">Select</option>
                <option value="sample">Sample survey</option>
                <option value="sample2">Sample survey 2</option>
                <option value="complete">Complete enumeration</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Frequency</label>
              <select multiple className="block w-full border border-gray-300 rounded p-2" value={(values.dynamicEn[META_ID.FREQ] || []).map(String)} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.FREQ, Array.from(e.target.selectedOptions).map(o => Number(o.value)))}>
                {freqOptions.map((o) => {
                  const enLabel = o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label;
                  return <option key={o.value} value={String(o.value)}>{enLabel}</option>;
                })}
              </select>
            </div>

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
              <select multiple className="block w-full border border-gray-300 rounded p-2" value={(values.dynamicEn[META_ID.CLASS_CODES] || []).map(String)} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.CLASS_CODES, Array.from(e.target.selectedOptions).map(o => Number(o.value)))}>
                {sectorOptions.map((o) => {
                  const enLabel = o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label;
                  return <option key={o.value} value={String(o.value)}>{enLabel}</option>;
                })}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Publication time</label>
              <textarea rows={2} className="block w-full border border-gray-300 rounded p-2" value={values.dynamicEn[META_ID.PUB_TIME] || ""} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.PUB_TIME, e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Derived indicators</label>
              <select multiple className="block w-full border border-gray-300 rounded p-2" value={(values.dynamicEn[META_ID.DERIVED_INDICATORS] || []).map(String)} onChange={(e) => handleDynamicChange('dynamicEn', META_ID.DERIVED_INDICATORS, Array.from(e.target.selectedOptions).map(o => Number(o.value)))}>
                {indicatorOptions.map((o) => {
                  const enLabel = o.label.split(" (")[1] ? o.label.split(" (")[1].replace(")", "") : o.label;
                  return <option key={o.value} value={String(o.value)}>{enLabel}</option>;
                })}
              </select>
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
          <button type="button" onClick={() => router.back()} disabled={saving} className="px-4 py-2 border rounded">Буцах</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Хадгалж байна...' : 'Хадгалах'}</button>
        </div>
      </form>
    </div>
  );
}
